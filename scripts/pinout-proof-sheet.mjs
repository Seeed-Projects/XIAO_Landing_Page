/**
 * Render annotated proof sheets for every official pinout diagram face.
 * 为每张官方引脚图叠印 id / silk / chip，导出校对 PNG。
 *
 * Usage / 用法:
 *   node scripts/pinout-proof-sheet.mjs
 *   node scripts/pinout-proof-sheet.mjs samd21 back
 *
 * Output / 输出: /tmp/pinout-proof/<boardId>-<face>.png
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = process.env.PINOUT_PROOF_DIR || path.join(ROOT, ".trash/pinout-proof");
const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const manifest = JSON.parse(readFileSync(path.join(ROOT, "src/app/playground/pinout/data/diagrams/manifest.json"), "utf8"));
const { DIAGRAM_ROWS } = await import(pathToFileURL(path.join(ROOT, "src/app/playground/pinout/data/diagram/rows.js")).href);
const { BOARDS } = await import(pathToFileURL(path.join(ROOT, "src/app/playground/pinout/data/index.js")).href);
const { regroupDiagramLayout } = await import(pathToFileURL(path.join(ROOT, "src/app/playground/pinout/data/diagram/inferRows.js")).href);

function chromeBinary() {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome not found; set CHROME_BIN.");
  return found;
}

function pinOf(board, id) {
  return board?.pins.find((pin) => pin.id === id) || null;
}

function proofHtml(boardId, face, layout, mapping, board) {
  const svgHref = pathToFileURL(path.join(ROOT, `public/xiao-products/pinout/${boardId}-${face}.svg`)).href;
  const left = mapping?.left || layout.rows.left.map((_, i) => `L${i}`);
  const right = mapping?.right || layout.rows.right.map((_, i) => `R${i}`);
  const labels = [];
  for (const [side, ids] of [["left", left], ["right", right]]) {
    layout.rows[side].forEach((row, index) => {
      const id = ids[index] || `?${side[0]}${index}`;
      const pin = pinOf(board, id);
      const silk = pin?.names.silk || "";
      const chip = pin?.names.chip || "";
      const missing = !pin;
      const leftEdge = Math.min(...row.boxes.map((box) => box.x));
      const rightEdge = Math.max(...row.boxes.map((box) => box.x + box.w));
      const top = Math.min(...row.boxes.map((box) => box.y));
      const bottom = Math.max(...row.boxes.map((box) => box.y + box.h));
      const x = side === "left" ? leftEdge - 8 : rightEdge + 8;
      const anchor = side === "left" ? "end" : "start";
      labels.push({
        id, silk, chip, missing, side,
        x, y: (top + bottom) / 2,
        band: { x: leftEdge - 4, y: top - 2, w: rightEdge - leftEdge + 8, h: bottom - top + 4 },
        anchor,
      });
    });
  }
  const crop = layout.content;
  const pad = 80;
  const viewX = Math.max(0, crop.x - pad);
  const viewY = Math.max(0, crop.y - pad);
  const viewW = Math.min(layout.size.width - viewX, crop.w + pad * 2);
  const viewH = Math.min(layout.size.height - viewY, crop.h + pad * 2);
  const mismatch = (left.length !== layout.rows.left.length) || (right.length !== layout.rows.right.length);
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin: 0; background: #111; }
  svg { display: block; width: 1600px; height: auto; background: #fff; }
</style></head>
<body>
<svg viewBox="${viewX} ${viewY} ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg">
  <image href="${svgHref}" width="${layout.size.width}" height="${layout.size.height}" />
  ${labels.map((item) => `
    <rect x="${item.band.x}" y="${item.band.y}" width="${item.band.w}" height="${item.band.h}"
      fill="${item.missing ? "rgba(220,38,38,0.28)" : "rgba(22,163,74,0.18)"}"
      stroke="${item.missing ? "#dc2626" : "#15803d"}" stroke-width="1.4" />
    <text x="${item.x}" y="${item.y - 7}" text-anchor="${item.anchor}"
      font-family="ui-monospace, Menlo, monospace" font-size="13" font-weight="700"
      fill="${item.missing ? "#991b1b" : "#14532d"}">${item.id}</text>
    <text x="${item.x}" y="${item.y + 8}" text-anchor="${item.anchor}"
      font-family="ui-monospace, Menlo, monospace" font-size="11"
      fill="#334155">${item.silk}${item.chip && item.chip !== item.silk ? " · " + item.chip : ""}</text>
  `).join("")}
  <text x="${viewX + 16}" y="${viewY + 22}" font-family="ui-sans-serif, system-ui" font-size="16" font-weight="700" fill="#0f172a">
    ${boardId} ${face} · L${layout.rows.left.length} R${layout.rows.right.length}${mismatch ? " · MAPPING LENGTH MISMATCH" : ""}
  </text>
</svg>
</body></html>`;
}

function screenshot(chrome, htmlFile, pngFile) {
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1600,1100",
    `--screenshot=${pngFile}`,
    `file://${htmlFile}`,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (!existsSync(pngFile)) throw new Error(`Chrome did not write ${pngFile}`);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const onlyBoard = args[0] || "";
const onlyFace = args[1] || "";
mkdirSync(OUT_DIR, { recursive: true });
const chrome = chromeBinary();
const work = path.join(OUT_DIR, "html");
mkdirSync(work, { recursive: true });

const summary = [];
for (const boardId of manifest.boards) {
  if (onlyBoard && boardId !== onlyBoard) continue;
  const board = BOARDS[boardId];
  for (const face of ["front", "back"]) {
    if (onlyFace && face !== onlyFace) continue;
    const key = `${boardId}-${face}`;
    if (!manifest.assets[key]) continue;
    const layout = regroupDiagramLayout((await import(pathToFileURL(path.join(ROOT, `src/app/playground/pinout/data/diagrams/${key}.js`)).href)).default);
    const mapping = DIAGRAM_ROWS[boardId]?.[face] || null;
    const html = proofHtml(boardId, face, layout, mapping, board);
    const htmlFile = path.join(work, `${key}.html`);
    const pngFile = path.join(OUT_DIR, `${key}.png`);
    writeFileSync(htmlFile, html);
    screenshot(chrome, htmlFile, pngFile);
    const missing = mapping
      ? [...mapping.left, ...mapping.right].filter((id) => !pinOf(board, id)).length
      : layout.rows.left.length + layout.rows.right.length;
    summary.push({
      key,
      left: layout.rows.left.length,
      right: layout.rows.right.length,
      mapped: Boolean(mapping),
      mapL: mapping?.left.length ?? 0,
      mapR: mapping?.right.length ?? 0,
      missing,
      png: pngFile,
    });
    console.log(`${key}: L${layout.rows.left.length}/R${layout.rows.right.length} mapped=${Boolean(mapping)} missingPins=${missing}`);
  }
}

writeFileSync(path.join(OUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${summary.length} proof sheets to ${OUT_DIR}`);
