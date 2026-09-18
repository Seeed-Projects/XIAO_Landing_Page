/**
 * Normalize official pinout SVGs, shrink embedded photos, and write diagram layouts.
 * 规范化官方引脚 SVG、压缩内嵌照片并生成 diagram layout 模块。
 *
 * Usage / 用法:
 *   node scripts/pinout-ingest.mjs
 *   node scripts/pinout-ingest.mjs --skip-optimize
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { groupBoxes, scanSvg } from "./pinout-diagram-scan.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PINOUT_DIR = path.join(ROOT, "public/xiao-products/pinout");
const TRASH_DIR = path.join(ROOT, ".trash/pinout-sources");
const LAYOUT_DIR = path.join(ROOT, "src/app/playground/pinout/data/diagrams");
const CHROME = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find((candidate) => candidate && existsSync(candidate));

/** Longest match first. 最长前缀优先匹配。 */
const SOURCE_MAP = [
  ["XIAO SAMD21 Plus 正面", "samd21plus", "front"],
  ["XIAO SAMD21 Plus 背面", "samd21plus", "back"],
  ["XIAO SAMD21 背面", "samd21", "back"],
  ["XIAO ESP32-S3 Sense Plus", "skip", "skip"],
  ["XIAO ESP32-S3 Sense 正面", "s3sense", "front"],
  ["XIAO ESP32-S3 Sense 背面", "s3sense", "back"],
  ["XIAO ESP32-S3 Plus 正面", "s3plus", "front"],
  ["XIAO ESP32-S3 Plus 背面", "s3plus", "back"],
  ["XIAO ESP32-S3 正面", "s3", "front"],
  ["XIAO ESP32-S3 背面", "s3", "back"],
  ["XIAO ESP32-C6 正面", "c6", "front"],
  ["XIAO ESP32-C6 背面", "c6", "back"],
  ["XIAO ESP32-C5 正面", "c5", "front"],
  ["XIAO ESP32-C5 背面", "c5", "back"],
  ["XIAO ESP32-C3 正面", "c3", "front"],
  ["XIAO ESP32-C3 背面", "c3", "back"],
  ["XIAO nRF52840 Sense Plus 正面", "nrf52840senseplus", "front"],
  ["XIAO nRF52840 Sense Plus 背面", "nrf52840senseplus", "back"],
  ["XIAO nRF52840 Sense 正面", "nrf52840sense", "front"],
  ["XIAO nRF52840 Sense 背面", "nrf52840sense", "back"],
  ["XIAO nRF52840 Plus 正面", "nrf52840plus", "front"],
  ["XIAO nRF52840 Plus 背面", "nrf52840plus", "back"],
  ["XIAO nRF52840 正面", "nrf52", "front"],
  ["XIAO nRF52840 背面", "nrf52", "back"],
  ["XIAO nRF54L15 Sense 正面", "nrf54l15sense", "front"],
  ["XIAO nRF54L15 Sense 背面", "nrf54l15sense", "back"],
  ["XIAO nRF54L15 正面", "nrf54l15", "front"],
  ["XIAO nRF54L15 背面", "nrf54l15", "back"],
  ["XIAO nRF54LM20A Sense 正面", "nrf54lm20asense", "front"],
  ["XIAO nRF54LM20A Sense 背面", "nrf54lm20asense", "back"],
  ["XIAO nRF54LM20A 正面", "nrf54lm20a", "front"],
  ["XIAO nRF54LM20A 背面", "nrf54lm20a", "back"],
  ["XIAO RP2040 Plus 正面", "rp2040plus", "front"],
  ["XIAO RP2040 Plus 背面", "rp2040plus", "back"],
  ["XIAO RP2040 正面", "rp2040", "front"],
  ["XIAO RP2040 背面", "rp2040", "back"],
  ["XIAO RP2350 正面", "rp2350", "front"],
  ["XIAO RP2350 背面", "rp2350", "back"],
  ["XIAO MG24 Sense 正面", "mg24sense", "front"],
  ["XIAO MG24 Sense 背面", "mg24sense", "back"],
  ["XIAO MG24 正面", "mg24", "front"],
  ["XIAO MG24 背面", "mg24", "back"],
  ["XIAO RA4M1 正面", "ra4", "front"],
  ["XIAO RA4M1 背面", "ra4", "back"],
  ["XIAO STM32C5 正面", "stm32c5", "front"],
  ["XIAO STM32C5 背面", "stm32c5", "back"],
];

const BOARD_IDS = [...new Set(SOURCE_MAP.map(([, id]) => id).filter((id) => id !== "skip"))];

function matchSource(name) {
  if (name === "samd21-front.svg") return ["samd21", "front"];
  if (name.includes(" (1)")) return null;
  const hit = SOURCE_MAP.find(([prefix]) => name.startsWith(prefix));
  return hit ? [hit[1], hit[2]] : null;
}

function pngToWebpDataUri(pngPath) {
  if (!CHROME) return null;
  const page = `<!doctype html><pre id="out"></pre><script>
const img = new Image();
img.onload = () => {
  const w = 800, h = Math.round(img.naturalHeight * w / img.naturalWidth);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  document.getElementById("out").textContent = c.toDataURL("image/webp", 0.86);
};
img.src = "file://${pngPath}";
</script>`;
  const pageFile = path.join(PINOUT_DIR, ".optimize.html");
  writeFileSync(pageFile, page);
  const dom = execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=8000", "--dump-dom", `file://${pageFile}`,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  unlinkSync(pageFile);
  const uri = dom.match(/<pre id="out">([^<]+)</)?.[1]?.trim();
  return uri || null;
}

function optimizeSvg(source) {
  const match = source.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!match) return source;
  const pngPath = path.join(PINOUT_DIR, ".tmp-embed.png");
  writeFileSync(pngPath, Buffer.from(match[1], "base64"));
  const uri = pngToWebpDataUri(pngPath);
  unlinkSync(pngPath);
  if (!uri) return source;
  return source.replace(/xlink:href="data:image\/png;base64,[^"]+"/, `xlink:href="${uri}"`);
}

function layoutModule(boardId, face, layout) {
  const compact = {
    size: layout.size,
    content: layout.content,
    rows: {
      left: layout.rows.left.map((row) => ({ y: row.y, boxes: row.boxes })),
      right: layout.rows.right.map((row) => ({ y: row.y, boxes: row.boxes })),
    },
  };
  return `/** Generated by pinout-ingest.mjs — ${boardId} ${face} */
const layout = ${JSON.stringify(compact, null, 2)};
export default layout;
`;
}

async function main() {
  const skipOptimize = process.argv.includes("--skip-optimize");
  await mkdir(TRASH_DIR, { recursive: true });
  await mkdir(LAYOUT_DIR, { recursive: true });

  const files = readdirSync(PINOUT_DIR).filter((name) => name.endsWith(".svg") && !name.startsWith("."));
  const manifest = {};
  const scanReport = [];

  for (const name of files) {
    const mapped = matchSource(name);
    if (!mapped) {
      console.warn(`skip unmapped: ${name}`);
      continue;
    }
    const [boardId, face] = mapped;
    const target = `${boardId}-${face}.svg`;
    const srcPath = path.join(PINOUT_DIR, name);
    const destPath = path.join(PINOUT_DIR, target);

    let svg = readFileSync(srcPath, "utf8");
    const before = svg.length;
    if (!skipOptimize) svg = optimizeSvg(svg);

    if (name !== target) {
      if (existsSync(destPath) && path.resolve(destPath) !== path.resolve(srcPath)) {
        renameSync(destPath, path.join(TRASH_DIR, `${Date.now()}-${target}`));
      }
      writeFileSync(destPath, svg);
      if (path.resolve(srcPath) !== path.resolve(destPath)) {
        renameSync(srcPath, path.join(TRASH_DIR, name));
      }
    } else {
      writeFileSync(destPath, svg);
    }

    const raw = scanSvg(svg);
    const layout = groupBoxes(raw);
    const layoutPath = path.join(LAYOUT_DIR, `${boardId}-${face}.js`);
    await writeFile(layoutPath, layoutModule(boardId, face, layout));

    const rects = (svg.match(/<rect\b/g) || []).length;
    const rows = layout.rows.left.length + layout.rows.right.length;
    scanReport.push({ boardId, face, rows, rects, mb: (svg.length / 1024 / 1024).toFixed(2), beforeMb: (before / 1024 / 1024).toFixed(2) });
    manifest[`${boardId}-${face}`] = `/xiao-products/pinout/${target}`;
  }

  await writeFile(
    path.join(LAYOUT_DIR, "manifest.json"),
    `${JSON.stringify({ boards: BOARD_IDS, assets: manifest, scan: scanReport }, null, 2)}\n`,
  );

  console.log(`Ingested ${scanReport.length} faces for ${BOARD_IDS.length} boards`);
  for (const row of scanReport.sort((a, b) => a.boardId.localeCompare(b.boardId) || a.face.localeCompare(b.face))) {
    console.log(`  ${row.boardId}-${row.face}: ${row.rows} rows, ${row.rects} rects, ${row.beforeMb}MB -> ${row.mb}MB`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
