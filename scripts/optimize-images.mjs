/**
 * Shrink oversized images in public/ in place: same path, same name, smaller file.
 * 原地压缩 public/ 中的超标图片：路径和文件名不变，体积变小。
 *
 * - JPEG / PNG / WebP / GIF above the budget are resized to the folder's longest-edge
 *   limit and re-encoded in the same format.
 * - SVG files above the budget have their embedded photos resized to display size and
 *   re-embedded as WebP; vector content stays unchanged.
 * - Processed files are recorded by content hash in scripts/optimized-images.json and
 *   skipped until their content changes.
 * - JPEG / PNG / WebP / GIF 超出上限时，按所在目录的最长边上限缩放，并以原格式重新编码。
 * - SVG 超出上限时，将内嵌照片缩放到显示尺寸并改为 WebP 重新内嵌，矢量内容保持不变。
 * - 处理过的文件按内容哈希记录在 scripts/optimized-images.json，内容变化前直接跳过。
 *
 * Rules live in scripts/image-budget.mjs. 规则定义见 scripts/image-budget.mjs。
 *
 * Usage / 用法:
 *   npm run images:optimize   # optimize public/ in place (also runs before every build)
 *   npm run images:check      # list images still over budget; exits with 1 when any remain
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  PALETTE_MAX_ERROR,
  QUALITY,
  RASTER_EXTENSIONS,
  embeddedTargetWidth,
  findEmbeddedImages,
  isOverBudget,
  isWorthKeeping,
  ruleFor,
  shouldReencodeEmbedded,
} from "./image-budget.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const CACHE_FILE = path.join(ROOT, "scripts", "optimized-images.json");

const sha1 = (buffer) => createHash("sha1").update(buffer).digest("hex");
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)])));
  return nested.flat();
}

/** Mean absolute RGBA difference between two images of equal size (0–255). 两张同尺寸图片的平均 RGBA 差值（0–255）。 */
async function meanError(a, b) {
  const [x, y] = await Promise.all([a, b].map((buffer) => sharp(buffer).ensureAlpha().blur(1).raw().toBuffer()));
  let total = 0;
  for (let i = 0; i < x.length; i += 1) total += Math.abs(x[i] - y[i]);
  return total / x.length;
}

/** Resize a raster image to the rule's longest edge and re-encode it in its own format. 按规则缩放位图，并以原格式重新编码。 */
async function optimizeRaster(buffer, rule) {
  const meta = await sharp(buffer).metadata();
  const animated = (meta.pages || 1) > 1;
  const resized = () => {
    const image = sharp(buffer, { animated });
    if (meta.format === "jpeg") image.rotate();
    return image.resize({ width: rule.maxEdge, height: rule.maxEdge, fit: "inside", withoutEnlargement: true });
  };

  switch (meta.format) {
    case "jpeg":
      return resized().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    case "webp":
      return resized().webp({ quality: QUALITY, effort: 5 }).toBuffer();
    case "gif":
      return resized().gif({ effort: 10 }).toBuffer();
    case "png": {
      const reference = await resized().png().toBuffer();
      const palette = await sharp(reference).png({ palette: true, quality: 90, dither: 1, effort: 10, compressionLevel: 9 }).toBuffer();
      if (await meanError(reference, palette) <= PALETTE_MAX_ERROR) return palette;
      return sharp(reference).png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 }).toBuffer();
    }
    default:
      return null;
  }
}

/** Re-embed each base64 photo of an SVG as display-sized WebP. 将 SVG 中每张 base64 照片按显示尺寸重新内嵌为 WebP。 */
async function optimizeSvg(buffer, rule) {
  let svg = buffer.toString("utf8");
  let changed = false;
  for (const image of findEmbeddedImages(svg).reverse()) {
    const source = Buffer.from(image.base64, "base64");
    const { width } = await sharp(source).metadata();
    const target = embeddedTargetWidth(image.displayWidth, width, rule.svgScale);
    if (!shouldReencodeEmbedded(image.format, width, target)) continue;
    const webp = await sharp(source)
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: QUALITY, alphaQuality: 90, effort: 5 })
      .toBuffer();
    if (!isWorthKeeping(source.length, webp.length)) continue;
    svg = `${svg.slice(0, image.start)}data:image/webp;base64,${webp.toString("base64")}${svg.slice(image.end)}`;
    changed = true;
  }
  return changed ? Buffer.from(svg) : null;
}

async function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  return JSON.parse(await readFile(CACHE_FILE, "utf8"));
}

async function saveCache(cache) {
  const sorted = Object.fromEntries(Object.keys(cache).sort().map((key) => [key, cache[key]]));
  await writeFile(CACHE_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const cache = await loadCache();
  const files = await walk(PUBLIC_DIR);
  const relative = (file) => path.relative(PUBLIC_DIR, file).split(path.sep).join("/");
  const lines = [];
  let before = 0;
  let after = 0;
  let pending = 0;

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    const isSvg = extension === ".svg";
    if (!isSvg && !RASTER_EXTENSIONS.has(extension)) continue;
    const { size } = await stat(file);
    if (!isOverBudget(size, isSvg)) continue;

    const key = relative(file);
    const buffer = await readFile(file);
    const digest = sha1(buffer);
    if (cache[key] === digest) continue;
    if (isSvg && findEmbeddedImages(buffer.toString("utf8")).length === 0) continue;

    if (checkOnly) {
      pending += 1;
      lines.push(`  over budget  ${key} (${kb(size)})`);
      continue;
    }

    const rule = ruleFor(key);
    const output = isSvg ? await optimizeSvg(buffer, rule) : await optimizeRaster(buffer, rule);
    if (output && isWorthKeeping(size, output.length)) {
      await writeFile(`${file}.tmp`, output);
      await rename(`${file}.tmp`, file);
      cache[key] = sha1(output);
      before += size;
      after += output.length;
      lines.push(`  optimized    ${key}: ${kb(size)} -> ${kb(output.length)}`);
    } else {
      cache[key] = digest;
      lines.push(`  kept         ${key} (${kb(size)}, already efficient)`);
    }
  }

  if (!checkOnly) {
    for (const key of Object.keys(cache)) {
      if (!existsSync(path.join(PUBLIC_DIR, key))) delete cache[key];
    }
    await saveCache(cache);
  }

  console.log(lines.length ? lines.join("\n") : "  all images are within budget");
  if (before) console.log(`images: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
  if (checkOnly && pending) {
    console.log(`${pending} image(s) over budget. Run: npm run images:optimize`);
    process.exitCode = 1;
  }
}

await main();
