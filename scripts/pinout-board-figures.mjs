/**
 * Extract the board photo bounds from every official pinout SVG into a
 * generated module. Each face gets the union bbox of its board photo rects
 * (for crop coverage) plus the visible board width of the first photo (for
 * sizing).
 *
 * Board photos are the <rect fill="url(#pattern)"> shapes with square corners
 * and real photo proportions; legend chips use rounded corners and are ~135px
 * wide, so they are filtered out. The first photo in document order is the
 * main XIAO board; expansion modules (camera etc.) follow.
 * 从每张官方引脚图 SVG 提取板身照片边界，生成模块。每面记录照片联合包围盒
 * （用于裁剪覆盖）与文档顺序第一张照片（主 XIAO 板）的宽度（用于统一渲染尺寸）。
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SVG_DIR = "public/xiao-products/pinout";
const OUT_PATH = "src/app/playground/pinout/data/diagram/boardFigures.js";
const MIN_BOARD_W = 200;

function parseRects(svg) {
  return [...svg.matchAll(/<rect\s+([^>]*?)\/?>/g)].map((match) => {
    const attrs = {};
    for (const pair of match[1].matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[pair[1]] = pair[2];
    return attrs;
  });
}

function visualBox(attrs) {
  const x = Number(attrs.x || 0);
  const y = Number(attrs.y || 0);
  const w = Number(attrs.width || 0);
  const h = Number(attrs.height || 0);
  if (!attrs.transform || !attrs.transform.startsWith("matrix")) return { x, y, w, h };
  const [a, b, c, d, e, f] = attrs.transform.slice(7, -1).split(",").map(Number);
  const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([px, py]) => [px * a + py * c + e, px * b + py * d + f]);
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * Visible board width per face, normalised to a 1920-wide canvas, measured
 * from the embedded photo inside the first photo rect's <pattern> (see /tmp
 * tooling: decode the image, take the structured column range — p85-p15 > 40
 * for photo-background canvases, the alpha>0 column range for the
 * transparent fix_1013 photos — then map through pattern origin + image x +
 * image scale, clamped to the rect). The photo rect includes background
 * margins around the PCB, so the rect width overstates the visible board on
 * photos with margins (c5) and understates tight crops (c6); sizing on the
 * visible width keeps every board rendering at one shared size. Most
 * canvases are 1920 wide; older stm32c5 sources used 1489 / 2342 and
 * rp2040plus-back 1940, so fw is scaled by 1920/viewBox width to keep the
 * shared-size formula comparable across boards.
 * 各面照片内可见板身的宽度（换算成 1920 宽画布的等效单位）。照片矩形含背景留白，
 * 直接用矩形宽会让留白多的板（c5）显小、裁得紧的板（c6）显大；按可见宽度统一
 * 渲染尺寸。多数画布为 1920 宽，旧版 stm32c5 为 1489/2342、rp2040plus-back 为
 * 1940：fw 乘以 1920/viewBox 宽度归一，公式才跨板可比。
 */
const PHOTO_BOARD_W = {
  c3: { front: 275.8, back: 272.2 },
  c5: { front: 279.4, back: 272.0 },
  c6: { front: 279.7, back: 278.8 },
  mg24: { front: 276.8, back: 258.0 },
  mg24sense: { front: 251.7, back: 258.0 },
  nrf52: { front: 281.4, back: 272.1 },
  nrf52840plus: { front: 280.9, back: 298.1 },
  nrf52840sense: { front: 278.7, back: 272.1 },
  nrf52840senseplus: { front: 278.9, back: 298.1 },
  nrf54l15: { front: 278.1, back: 264.9 },
  nrf54l15sense: { front: 278.9, back: 264.9 },
  nrf54lm20a: { front: 264.0, back: 286.2 },
  nrf54lm20asense: { front: 266.9, back: 286.2 },
  ra4: { front: 252.5, back: 208.9 },
  rp2040: { front: 274.7, back: 275.2 },
  rp2040plus: { front: 268.3, back: 265.6 },
  rp2350: { front: 278.2, back: 273.2 },
  s3: { front: 278.9, back: 269.2 },
  s3plus: { front: 277.8, back: 266.7 },
  s3sense: { front: 278.9, back: 269.2, module: 225.6 },
  samd21: { front: 250.3, back: 250.9 },
  samd21plus: { front: 240.4, back: 269.0 },
  stm32c5: { front: 275.1, back: 291.3 },
};

const figures = {};
const files = readdirSync(SVG_DIR).filter((name) => name.endsWith(".svg")).sort();
for (const name of files) {
  const svg = readFileSync(join(SVG_DIR, name), "utf8");
  // Canvases are mostly 1920 wide; stm32c5 (1489/2342) and rp2040plus-back
  // (1940) differ, so normalise fw to 1920-width equivalents for sizing.
  const viewBoxW = Number(svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/)?.[1] || 1920);
  const photos = parseRects(svg).filter((attrs) => (
    attrs.fill?.startsWith("url(")
    && Math.round(Number(attrs.rx || 0)) === 0
    && Number(attrs.width || 0) >= MIN_BOARD_W
  )).map(visualBox);
  if (!photos.length) {
    console.warn(`no board photo found in ${name}`);
    continue;
  }
  const [board, face] = name.replace(/\.svg$/, "").split("-");
  const x = Math.min(...photos.map((p) => p.x));
  const y = Math.min(...photos.map((p) => p.y));
  const right = Math.max(...photos.map((p) => p.x + p.w));
  const bottom = Math.max(...photos.map((p) => p.y + p.h));
  const visible = PHOTO_BOARD_W[board]?.[face];
  if (!visible) console.warn(`no measured visible width for ${name}; falling back to the rect width`);
  figures[board] = figures[board] || {};
  figures[board][face] = {
    x: +x.toFixed(1),
    y: +y.toFixed(1),
    w: +(right - x).toFixed(1),
    h: +(bottom - y).toFixed(1),
    fw: +((visible ?? photos[0].w) * 1920 / viewBoxW).toFixed(1),
  };
}

const body = Object.keys(figures).sort().map((board) => {
  // "module" is s3sense-only today (the Sense expansion board face).
  // module 面目前仅 s3sense 有（Sense 扩展板）。
  const faces = ["front", "back", "module"].filter((face) => figures[board][face])
    .map((face) => `    ${face}: ${JSON.stringify(figures[board][face])},`);
  return `  "${board}": {\n${faces.join("\n")}\n  },`;
}).join("\n");

writeFileSync(OUT_PATH, `/** Generated by pinout-board-figures.mjs — board photo bounds per diagram face */
export const BOARD_FIGURES = {
${body}
};
`);

for (const [board, faces] of Object.entries(figures)) {
  for (const [face, fig] of Object.entries(faces)) {
    console.log(`${board}-${face}: union y ${fig.y}-${fig.y + fig.h} (h ${fig.h}), widest ${fig.fw}, ${fig.w}x${fig.h}`);
  }
}
