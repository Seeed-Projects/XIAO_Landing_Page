/**
 * Detect the coloured label boxes on an official XIAO pinout diagram and
 * print them grouped into rows, ready for `diagram.rows` in a board file.
 * 识别官方 XIAO 引脚图上的彩色标签框，按行分组输出，可直接用于板数据文件的 `diagram.rows`。
 *
 * Usage / 用法:
 *   node scripts/pinout-diagram-scan.mjs samd21 front --write
 *   CHROME_BIN=/path/to/chrome node scripts/pinout-diagram-scan.mjs c3 back
 *
 * Reads `public/xiao-products/pinout/<id>-<face>.svg` when present and parses
 * its `<rect>` elements directly; otherwise rasters `<id>-<face>.png` in
 * headless Chrome and detects boxes by colour. Output (all numbers in
 * image / viewBox pixels):
 * 优先读取 `public/xiao-products/pinout/<id>-<face>.svg` 并直接解析其中的 `<rect>`；
 * 没有 SVG 时改用无头 Chrome 按颜色识别 `<id>-<face>.png`。输出单位为图片 / viewBox 像素：
 *   size            image width / height
 *   content         bounding box of pin labels and the colour key, for cropping
 *   legend          bottom legend swatches with their colours
 *   rows.left/right label rows on each side of the board, top to bottom;
 *                   each row lists its boxes from the board outward with a
 *                   colour category guessed from the legend palette
 * 读取 `public/xiao-products/pinout/<id>-<face>.png`，输出（单位均为图片像素）：
 * size 图片尺寸；content 引脚色块与底部图例外接矩形，用于裁切；legend 底部图例色块；
 * rows.left/right 板子两侧的标签行（自上而下），每行从靠板一侧向外列出框及其颜色分类。
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMAGE_DIR = path.join(ROOT, "public/xiao-products/pinout");
const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

/** Seeed diagram palette (SVG fills). Seeed 引脚图配色（SVG 填充色）。 */
export const DIAGRAM_PALETTE = {
  power: [211, 47, 47], // #D32F2F, 3V3 uses #EF5350
  power3v3: [239, 83, 80],
  gnd: [45, 45, 45], // #2D2D2D
  digital: [143, 195, 31], // #8FC31F
  analog: [255, 167, 38], // #FFA726
  arduino: [0, 151, 156], // #00979C
  pinname: [121, 85, 72], // #795548
  spi: [171, 71, 188], // #AB47BC
  uart: [38, 166, 154], // #26A69A
  i2c: [41, 182, 246], // #29B6F6
  system: [120, 144, 156], // #78909C
  peripheral: [0, 73, 102], // #004966
  ptc: [92, 107, 192], // #5C6BC0
};

const SCAN_PAGE = `<!doctype html><pre id="out"></pre><script>
const src = new URLSearchParams(location.search).get("src");
const img = new Image();
img.onload = () => {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const W = c.width, H = c.height, N = W * H;
  const px = (k) => [data[k * 4], data[k * 4 + 1], data[k * 4 + 2]];
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const isBackground = (p) => (p[0] > 235 && p[1] > 235 && p[2] > 235) || data[0] === undefined;
  const seen = new Uint8Array(N);
  const blobs = [];
  const scale = W / 1024;
  for (let k = 0; k < N; k++) {
    if (seen[k]) continue;
    const seed = px(k);
    if (isBackground(seed) || data[k * 4 + 3] < 200) { seen[k] = 1; continue; }
    const stack = [k]; seen[k] = 1;
    let n = 0, sr = 0, sg = 0, sb = 0, minx = W, maxx = 0, miny = H, maxy = 0;
    while (stack.length) {
      const p = stack.pop(); const x = p % W, y = (p - x) / W;
      const col = px(p);
      n++; sr += col[0]; sg += col[1]; sb += col[2];
      if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (q < 0 || q >= N || seen[q]) continue;
        if (Math.abs((q % W) - x) > 1) continue;
        if (dist(px(q), seed) < 60) { seen[q] = 1; stack.push(q); }
      }
    }
    const w = maxx - minx + 1, h = maxy - miny + 1;
    const fill = n / (w * h);
    if (w >= 30 * scale && w <= 240 * scale && h >= 10 * scale && h <= 34 * scale && fill > 0.5 && w / h > 1.6) {
      blobs.push({ x: minx, y: miny, w, h, color: [Math.round(sr / n), Math.round(sg / n), Math.round(sb / n)] });
    }
  }
  document.getElementById("out").textContent = JSON.stringify({ W, H, blobs });
};
img.src = src;
</script>`;

/**
 * Read label boxes straight from an SVG diagram.
 * 直接从 SVG 引脚图读取标签框。
 *
 * Walks the tag stream, tracks `matrix()` transforms on enclosing `<g>`
 * (axis-aligned only) and keeps every filled `<rect>` shaped like a label.
 * Returns { W, H, blobs } in viewBox units, matching the raster scanner.
 * 顺序遍历标签，跟踪外层 `<g>` 的 `matrix()` 变换（仅处理无旋转的情况），
 * 保留形状像标签的实心 `<rect>`；返回与位图扫描相同结构的 { W, H, blobs }。
 */
export function scanSvg(source) {
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4) throw new Error("SVG has no viewBox");
  const [, , W, H] = viewBox;
  const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  const hexToRgb = (hex) => {
    const value = hex.replace("#", "");
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  // Transform stack: each entry is [a, d, e, f] of matrix(a,0,0,d,e,f). 变换栈。
  const stack = [];
  const apply = (x, y, w, h) => {
    let box = { x, y, w, h };
    for (let i = stack.length - 1; i >= 0; i--) {
      const [a, d, e, f] = stack[i];
      const x1 = a * box.x + e;
      const x2 = a * (box.x + box.w) + e;
      const y1 = d * box.y + f;
      const y2 = d * (box.y + box.h) + f;
      box = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
    }
    return box;
  };
  const blobs = [];
  const scale = W / 1024;
  const tags = source.matchAll(/<(\/?)(g|rect)\b([^>]*?)(\/?)>/g);
  for (const [tag, closing, name, , selfClose] of tags) {
    if (name === "g") {
      if (closing) { stack.pop(); continue; }
      const matrix = attr(tag, "transform")?.match(/matrix\(([^)]+)\)/)?.[1].split(/[\s,]+/).map(Number);
      stack.push(matrix && matrix[1] === 0 && matrix[2] === 0 ? [matrix[0], matrix[3], matrix[4], matrix[5]] : [1, 1, 0, 0]);
      if (selfClose) stack.pop();
      continue;
    }
    const fill = attr(tag, "fill");
    if (!fill || !fill.startsWith("#")) continue;
    const box = apply(Number(attr(tag, "x") || 0), Number(attr(tag, "y") || 0), Number(attr(tag, "width")), Number(attr(tag, "height")));
    if (box.w >= 30 * scale && box.w <= 240 * scale && box.h >= 10 * scale && box.h <= 34 * scale && box.w / box.h > 1.6) {
      blobs.push({ x: +box.x.toFixed(2), y: +box.y.toFixed(2), w: +box.w.toFixed(2), h: +box.h.toFixed(2), color: hexToRgb(fill) });
    }
  }
  return { W, H, blobs };
}

function chromeBinary() {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome not found; set CHROME_BIN to a Chrome or Chromium binary.");
  return found;
}

function category(color) {
  let best = "system";
  let bestDist = Infinity;
  for (const [name, ref] of Object.entries(DIAGRAM_PALETTE)) {
    const d = Math.abs(color[0] - ref[0]) + Math.abs(color[1] - ref[1]) + Math.abs(color[2] - ref[2]);
    if (d < bestDist) { bestDist = d; best = name; }
  }
  return best === "power3v3" ? "power" : best;
}

/**
 * Group boxes into legend / left rows / right rows.
 * 把框分成图例、左侧行、右侧行。
 */
export function groupBoxes({ W, H, blobs }) {
  const boxes = blobs.map((blob) => ({ ...blob, cx: blob.x + blob.w / 2, cy: blob.y + blob.h / 2, cat: category(blob.color) }));
  // Legend: the lowest band of boxes, separated from the body by a clear gap.
  // 图例：最下方的一条框，与主体之间有明显空隙。
  const sortedY = [...boxes].sort((a, b) => b.cy - a.cy);
  const legendBand = sortedY.length ? sortedY[0].cy : 0;
  const legend = boxes.filter((box) => Math.abs(box.cy - legendBand) < box.h);
  const body = boxes.filter((box) => !legend.includes(box));
  const xs = body.map((box) => box.cx).sort((a, b) => a - b);
  // Board centre: the widest horizontal gap between box centres. 板子中心：框中心之间最宽的横向空隙。
  let split = W / 2;
  let widest = 0;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] - xs[i - 1] > widest) { widest = xs[i] - xs[i - 1]; split = (xs[i] + xs[i - 1]) / 2; }
  }
  const rowsOf = (list, outward) => {
    const rows = [];
    for (const box of [...list].sort((a, b) => a.cy - b.cy)) {
      const row = rows.find((item) => Math.abs(item.cy - box.cy) < box.h * 0.6);
      if (row) { row.boxes.push(box); row.cy = (row.cy * (row.boxes.length - 1) + box.cy) / row.boxes.length; }
      else rows.push({ cy: box.cy, boxes: [box] });
    }
    return rows.map((row) => ({
      y: Math.round(row.cy),
      boxes: row.boxes
        .sort((a, b) => (outward === "left" ? b.cx - a.cx : a.cx - b.cx))
        .map(({ x, y, w, h, cat }) => ({ x, y, w, h, cat })),
    }));
  };
  const all = body.length || legend.length ? [...body, ...legend] : boxes;
  const content = {
    x: Math.min(...all.map((box) => box.x)),
    y: Math.min(...all.map((box) => box.y)),
    right: Math.max(...all.map((box) => box.x + box.w)),
    bottom: Math.max(...all.map((box) => box.y + box.h)),
  };
  return {
    size: { width: W, height: H },
    content: { x: content.x, y: content.y, w: content.right - content.x, h: content.bottom - content.y },
    split: Math.round(split),
    legend: legend.sort((a, b) => a.cx - b.cx).map(({ x, y, w, h, color, cat }) => ({ x, y, w, h, color, cat })),
    rows: {
      left: rowsOf(body.filter((box) => box.cx < split), "left"),
      right: rowsOf(body.filter((box) => box.cx >= split), "right"),
    },
  };
}

const LAYOUT_DIR = path.join(ROOT, "src/app/playground/pinout/data/diagrams");

/** Module source for a scanned layout. 扫描结果的模块源码。 */
function layoutModule(boardId, face, layout) {
  const compact = {
    size: layout.size,
    content: layout.content,
    rows: {
      left: layout.rows.left.map((row) => ({ y: row.y, boxes: row.boxes })),
      right: layout.rows.right.map((row) => ({ y: row.y, boxes: row.boxes })),
    },
  };
  return `/**
 * Label boxes on the ${boardId} ${face} diagram, in image pixels.
 * Generated by \`node scripts/pinout-diagram-scan.mjs ${boardId} ${face} --write\`.
 * ${boardId} ${face} 引脚图上的标签框（图片像素），由上述命令生成。
 */
const layout = ${JSON.stringify(compact, null, 2)};

export default layout;
`;
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const [boardId, face = "front"] = args.filter((arg) => !arg.startsWith("--"));
  if (!boardId) {
    console.error("Usage: node scripts/pinout-diagram-scan.mjs <boardId> [front|back] [--write]");
    process.exit(1);
  }
  const svgFile = path.join(IMAGE_DIR, `${boardId}-${face}.svg`);
  const pngFile = path.join(IMAGE_DIR, `${boardId}-${face}.png`);
  let raw;
  if (existsSync(svgFile)) {
    raw = scanSvg(await readFile(svgFile, "utf8"));
  } else if (existsSync(pngFile)) {
    const chrome = chromeBinary();
    const dir = await mkdtemp(path.join(tmpdir(), "pinout-diagram-"));
    const pageFile = path.join(dir, "scan.html");
    await writeFile(pageFile, SCAN_PAGE);
    const dom = execFileSync(chrome, [
      "--headless=new", "--disable-gpu", "--allow-file-access-from-files",
      "--virtual-time-budget=8000", "--dump-dom", `file://${pageFile}?src=file://${pngFile}`,
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
    const match = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
    if (!match || !match[1].trim()) throw new Error(`No scan output for ${boardId}-${face}`);
    raw = JSON.parse(match[1].replace(/&quot;/g, '"'));
  } else {
    throw new Error(`Diagram missing: ${svgFile} or ${pngFile}`);
  }
  const layout = groupBoxes(raw);
  if (write) {
    await mkdir(LAYOUT_DIR, { recursive: true });
    const target = path.join(LAYOUT_DIR, `${boardId}-${face}.js`);
    await writeFile(target, layoutModule(boardId, face, layout));
    console.log(`Wrote ${path.relative(ROOT, target)}: left ${layout.rows.left.length} rows, right ${layout.rows.right.length} rows`);
    return;
  }
  console.log(JSON.stringify(layout, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
