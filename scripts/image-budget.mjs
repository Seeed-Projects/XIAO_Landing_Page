/**
 * Image budget rules shared by the optimizer script and its tests.
 * 图片体积规则，供压缩脚本与测试共用。
 */

export const RASTER_BUDGET = 300 * 1024;
export const SVG_BUDGET = 400 * 1024;
export const MIN_SAVING = 0.15;
export const WEBP_RESIZE_SLACK = 1.5;
export const QUALITY = 82;
export const PALETTE_MAX_ERROR = 1.5;
export const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/**
 * maxEdge: longest edge in pixels for raster files.
 * svgScale: pixels per SVG user unit for photos embedded in SVG files.
 * maxEdge：位图最长边像素上限；svgScale：SVG 内嵌照片每个 SVG 单位对应的像素数。
 */
export const DEFAULT_RULE = { maxEdge: 2560, svgScale: 1.25 };

/**
 * Per-folder overrides matched by path prefix relative to public/; the first match wins.
 * 按相对 public/ 的路径前缀覆盖默认规则，先匹配者生效。
 */
export const FOLDER_RULES = [
  { prefix: "home/glimpse-", maxEdge: 1200 },
  { prefix: "co-create-projects/", maxEdge: 1200 },
  { prefix: "xiao-products/dev_boards/selector/", svgScale: 0.75 },
];

/** Resolve the rule for a public/ relative path. 返回某个 public/ 相对路径适用的规则。 */
export function ruleFor(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const { maxEdge, svgScale } = { ...DEFAULT_RULE, ...FOLDER_RULES.find((rule) => normalized.startsWith(rule.prefix)) };
  return { maxEdge, svgScale };
}

/** Whether a file is large enough to be optimized. 文件体积是否超出上限、需要压缩。 */
export function isOverBudget(bytes, isSvg) {
  return bytes > (isSvg ? SVG_BUDGET : RASTER_BUDGET);
}

/** Whether a re-encoded result is small enough to replace the original. 重新编码的结果是否足够小、可以替换原文件。 */
export function isWorthKeeping(before, after) {
  return after < before * (1 - MIN_SAVING);
}

/**
 * Pixel width for a photo embedded in SVG: display width times svgScale, capped at the natural width.
 * SVG 内嵌照片的目标像素宽度：显示宽度 × svgScale，不超过原始宽度。
 */
export function embeddedTargetWidth(displayWidth, naturalWidth, svgScale) {
  if (!(displayWidth > 0)) return naturalWidth;
  return Math.min(naturalWidth, Math.ceil(displayWidth * svgScale));
}

/**
 * Whether an embedded photo should be re-encoded: PNG and JPEG always,
 * WebP only when it is more than WEBP_RESIZE_SLACK times wider than needed.
 * 内嵌照片是否需要重新编码：PNG 与 JPEG 一律处理；WebP 仅在宽度超过所需的 WEBP_RESIZE_SLACK 倍时处理。
 */
export function shouldReencodeEmbedded(format, naturalWidth, targetWidth) {
  return format !== "webp" || naturalWidth > targetWidth * WEBP_RESIZE_SLACK;
}

/**
 * Find raster photos embedded as base64 data URIs in `<image>` elements.
 * Returns { start, end, format, base64, displayWidth } where start/end delimit the data URI.
 * 查找 `<image>` 元素中以 base64 data URI 内嵌的位图照片；
 * 返回 { start, end, format, base64, displayWidth }，start/end 为 data URI 在原文中的起止位置。
 */
export function findEmbeddedImages(svg) {
  const images = [];
  for (const tag of svg.matchAll(/<image\b[^>]*>/g)) {
    const href = /(data:image\/(png|jpe?g|webp);base64,([^"]+))"/.exec(tag[0]);
    if (!href) continue;
    const start = tag.index + href.index;
    images.push({
      start,
      end: start + href[1].length,
      format: href[2] === "jpg" ? "jpeg" : href[2],
      base64: href[3],
      displayWidth: Number(/\swidth="([\d.]+)"/.exec(tag[0])?.[1]),
    });
  }
  return images;
}
