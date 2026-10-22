/**
 * Stamp every diagram box with the fill colour of its artwork pill, so the
 * filter highlight can repaint a matched pill in its own colour (artwork
 * unchanged) and print the label in a uniform ink.
 * 为每个图框标注其原图胶囊的填充色，筛选高亮时用原色重绘匹配胶囊（图面不变），
 * 并以统一墨色重印标签文字。
 *
 * Usage / 用法:
 *   node scripts/pinout-box-fills.mjs
 *
 * Reads each face's SVG via scanSvg (handles <g transform>, keeps solid
 * fills) and rewrites data/diagrams/<key>.js with a "fill" field on every
 * box. Verified by pinout-filter-audit.mjs (boxFill issues).
 * 读取每面的 SVG（scanSvg 处理 <g transform>，仅取实色填充），把每个 box 的
 * "fill" 字段写回 data/diagrams/<key>.js；pinout-filter-audit.mjs 会校验 boxFill。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { labelBoxKey } from "./pinout-label-text.mjs";
import { scanSvg } from "./pinout-diagram-scan.mjs";

const ROOT = new URL("../", import.meta.url).href;
const manifest = JSON.parse(readFileSync(new URL("src/app/playground/pinout/data/diagrams/manifest.json", ROOT), "utf8"));
const hex = (rgb) => `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;

let boxes = 0, faces = 0;
const failures = [];
for (const key of Object.keys(manifest.assets)) {
  const file = new URL(`src/app/playground/pinout/data/diagrams/${key}.js`, ROOT);
  const source = readFileSync(file, "utf8");
  const layout = (await import(file.href)).default;
  const svg = readFileSync(new URL(`public${manifest.assets[key]}`, ROOT), "utf8");
  const colorOf = new Map(scanSvg(svg, key).blobs.map((blob) => [labelBoxKey(blob), hex(blob.color)]));
  for (const side of ["left", "right"]) {
    for (const row of layout.rows[side] ?? []) {
      for (const box of row.boxes) {
        boxes++;
        const fill = colorOf.get(labelBoxKey(box));
        if (!fill) { failures.push(`${key} ${box.text}@${labelBoxKey(box)}`); continue; }
        box.fill = fill;
      }
    }
  }
  faces++;
  writeFileSync(file, `${source.split("*/")[0]}*/\nconst layout = ${JSON.stringify(layout, null, 2)};\nexport default layout;\n`);
}

if (failures.length) {
  console.error(`pinout-box-fills: ${failures.length} boxes without an artwork pill colour:`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`pinout-box-fills: ${faces} faces, ${boxes} boxes stamped with artwork fills`);
}
