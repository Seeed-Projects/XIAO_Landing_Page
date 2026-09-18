/**
 * Measure gold pad centres on a XIAO board photo and print them as image
 * percentages, ready to paste into `src/app/playground/pinout/data/boards/<id>.js`.
 * 量出 XIAO 板图上金色焊盘的圆心，以图片百分比输出，可直接粘贴到板数据文件。
 *
 * Usage / 用法:
 *   node scripts/pinout-pad-scan.mjs samd21           # front and back 正反面
 *   node scripts/pinout-pad-scan.mjs samd21 back      # one face 单面
 *   CHROME_BIN=/path/to/chrome node scripts/pinout-pad-scan.mjs c3
 *
 * Output per face: image size, then blobs sorted into `edge` (castellated
 * header pads, grouped into left / right columns) and `inner` (everything
 * else: SWD, battery, reset). Each blob has cx / cy in percent and w / h in px.
 * 每面输出：图片尺寸，然后是分成 edge（板边焊盘，按左右列分组）和 inner
 * （其他：SWD、电池、复位）的色块；每个色块含百分比圆心 cx / cy 与像素宽高 w / h。
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMAGE_DIR = path.join(ROOT, "public/xiao-products/dev_boards");
const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const SCAN_PAGE = `<!doctype html><pre id="out"></pre><script>
const src = new URLSearchParams(location.search).get("src");
const img = new Image();
img.onload = () => {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const W = c.width, H = c.height;
  const gold = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    return a > 200 && r > 150 && g > 105 && b < 120 && r - b > 60 && g - b > 20;
  };
  const mask = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) if (gold(k * 4)) mask[k] = 1;
  const seen = new Uint8Array(W * H);
  const blobs = [];
  for (let k = 0; k < W * H; k++) {
    if (!mask[k] || seen[k]) continue;
    const stack = [k]; seen[k] = 1;
    let n = 0, sx = 0, sy = 0, minx = W, maxx = 0, miny = H, maxy = 0;
    while (stack.length) {
      const p = stack.pop(); const px = p % W, py = (p - px) / W;
      n++; sx += px; sy += py;
      minx = Math.min(minx, px); maxx = Math.max(maxx, px); miny = Math.min(miny, py); maxy = Math.max(maxy, py);
      for (const q of [p - 1, p + 1, p - W, p + W]) if (q >= 0 && q < W * H && mask[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
    if (n > 400 * (W / 720) * (W / 720)) blobs.push({ n, cx: +(sx / n / W * 100).toFixed(2), cy: +(sy / n / H * 100).toFixed(2), w: maxx - minx + 1, h: maxy - miny + 1 });
  }
  document.getElementById("out").textContent = JSON.stringify({ W, H, blobs });
};
img.src = src;
</script>`;

function chromeBinary() {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome not found; set CHROME_BIN to a Chrome or Chromium binary.");
  return found;
}

async function scanFace(boardId, face, pageFile, chrome) {
  const image = path.join(IMAGE_DIR, `${boardId}-${face}.webp`);
  if (!existsSync(image)) throw new Error(`Image missing: ${image}`);
  const url = `file://${pageFile}?src=file://${image}`;
  const dom = execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--allow-file-access-from-files",
    "--virtual-time-budget=5000", "--dump-dom", url,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const match = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
  if (!match || !match[1].trim()) throw new Error(`No scan output for ${boardId}-${face}`);
  return JSON.parse(match[1].replace(/&quot;/g, '"'));
}

/** Split blobs into edge columns and inner pads. 把色块分成板边两列与板内焊盘。 */
function group(result) {
  const edge = result.blobs.filter((blob) => blob.cx < 25 || blob.cx > 75);
  const inner = result.blobs.filter((blob) => blob.cx >= 25 && blob.cx <= 75);
  const byY = (a, b) => a.cy - b.cy;
  // Keep the largest blob when two sit within 3% vertically (trace fragments next to a pad).
  // 竖向相距 3% 以内的色块只保留最大者（焊盘旁的走线碎片）。
  const dedupe = (list) => list.sort(byY).filter((blob, index, all) => {
    const twin = all.find((other) => other !== blob && Math.abs(other.cy - blob.cy) < 3);
    return !twin || twin.n < blob.n || (twin.n === blob.n && all.indexOf(twin) > index);
  });
  const left = dedupe(edge.filter((blob) => blob.cx < 50));
  const right = dedupe(edge.filter((blob) => blob.cx >= 50));
  const avg = (list) => (list.length ? +(list.reduce((sum, blob) => sum + blob.cx, 0) / list.length).toFixed(2) : null);
  return {
    width: result.W,
    height: result.H,
    edge: {
      left: { x: avg(left), ys: left.map((blob) => blob.cy) },
      right: { x: avg(right), ys: right.map((blob) => blob.cy) },
    },
    inner: inner.sort((a, b) => a.cy - b.cy || a.cx - b.cx).map(({ cx, cy, w, h }) => ({ x: cx, y: cy, w, h })),
  };
}

async function main() {
  const [boardId, onlyFace] = process.argv.slice(2);
  if (!boardId) {
    console.error("Usage: node scripts/pinout-pad-scan.mjs <boardId> [front|back]");
    process.exit(1);
  }
  const chrome = chromeBinary();
  const dir = await mkdtemp(path.join(tmpdir(), "pinout-scan-"));
  const pageFile = path.join(dir, "scan.html");
  await writeFile(pageFile, SCAN_PAGE);
  const faces = onlyFace ? [onlyFace] : ["front", "back"];
  const out = {};
  for (const face of faces) out[face] = group(await scanFace(boardId, face, pageFile, chrome));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
