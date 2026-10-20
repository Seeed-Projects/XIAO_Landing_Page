import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  RASTER_BUDGET,
  SVG_BUDGET,
  embeddedTargetWidth,
  findEmbeddedImages,
  isOverBudget,
  isWorthKeeping,
  ruleFor,
  shouldReencodeEmbedded,
} from "./image-budget.mjs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("folder rules size images to how large they are displayed", () => {
  assert.deepEqual(ruleFor("home/xiao-newsletter-bg.jpeg"), { maxEdge: 2560, svgScale: 1.25 });
  assert.equal(ruleFor("home/glimpse-addons.jpeg").maxEdge, 1200);
  assert.equal(ruleFor("co-create-projects/keyboards.webp").maxEdge, 1200);
  assert.equal(ruleFor("xiao-products/dev_boards/selector/XIAO-RP2350.svg").svgScale, 0.75);
  assert.equal(ruleFor("xiao-products/pinout/c3-front.svg").svgScale, 1.25);
});

test("only files above the budget are optimized, and only real savings replace them", () => {
  assert.equal(isOverBudget(RASTER_BUDGET, false), false);
  assert.equal(isOverBudget(RASTER_BUDGET + 1, false), true);
  assert.equal(isOverBudget(SVG_BUDGET, true), false);
  assert.equal(isOverBudget(SVG_BUDGET + 1, true), true);
  assert.equal(isWorthKeeping(1000, 840), true);
  assert.equal(isWorthKeeping(1000, 860), false);
});

test("embedded SVG photos keep enough pixels for their display width", () => {
  assert.equal(embeddedTargetWidth(792.7, 1287, 1.25), 991);
  assert.equal(embeddedTargetWidth(792.7, 600, 1.25), 600);
  assert.equal(embeddedTargetWidth(Number.NaN, 1287, 1.25), 1287);
});

test("PNG and JPEG photos in SVG are always converted; WebP only when far too large", () => {
  assert.equal(shouldReencodeEmbedded("png", 800, 800), true);
  assert.equal(shouldReencodeEmbedded("jpeg", 800, 800), true);
  assert.equal(shouldReencodeEmbedded("webp", 800, 750), false);
  assert.equal(shouldReencodeEmbedded("webp", 1600, 750), true);
});

test("embedded photos are located precisely inside the SVG source", () => {
  const svg = '<svg><rect width="10"/><image x="0" width="120.5" height="40" xlink:href="data:image/png;base64,AAAA"/>'
    + '<image width="30" href="data:image/jpg;base64,BBBB"/><image href="logo.png"/></svg>';
  const images = findEmbeddedImages(svg);
  assert.equal(images.length, 2);
  assert.deepEqual(images.map(({ format, base64, displayWidth }) => ({ format, base64, displayWidth })), [
    { format: "png", base64: "AAAA", displayWidth: 120.5 },
    { format: "jpeg", base64: "BBBB", displayWidth: 30 },
  ]);
  assert.equal(svg.slice(images[0].start, images[0].end), "data:image/png;base64,AAAA");
});

test("every production build optimizes images first", () => {
  assert.match(pkg.scripts.prebuild, /&& npm run images:optimize$/);
  assert.equal(pkg.scripts["images:check"], "node scripts/optimize-images.mjs --check");
  assert.equal(pkg.devDependencies.sharp, "0.34.5");
});
