import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

// Returns relative luminance for an RGB color.
// 返回 RGB 颜色的相对亮度。
function luminance(rgb) {
  return rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

test("newsletter copy stays readable over the brightest possible photo", () => {
  const overlays = [...css.matchAll(/\.home-newsletter-overlay\s*\{([^}]+)\}/g)];
  assert.equal(overlays.length, 2, "Mobile and desktop overlays are defined");
  const foregrounds = ["home-newsletter-copy", "home-newsletter-consent"].map((name) => {
    const hex = css.match(new RegExp(`\\.${name}\\s*\\{[^}]*color:\\s*#([a-f0-9]{6})`, "i"))?.[1];
    assert.ok(hex, `${name} has an opaque text color`);
    return hex.match(/../g).map((value) => Number.parseInt(value, 16));
  });
  for (const [, block] of overlays) {
    const stops = [...block.matchAll(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)(?:\s+(\d+)%)?/g)];
    const readingStops = stops.filter((stop) => stop[5] === undefined || Number(stop[5]) >= 48);
    assert.ok(readingStops.length > 0, "Overlay covers the text column");
    if (stops.length > 1) {
      assert.equal(Number(readingStops[0][5]), 48, "Desktop coverage starts at the text column");
      assert.equal(Number(readingStops.at(-1)[5]), 100, "Desktop coverage reaches the right edge");
    }
    for (const stop of readingStops) {
      const alpha = Number(stop[4]);
      const background = stop.slice(1, 4).map((value) => Number(value) * alpha + 255 * (1 - alpha));
      for (const foreground of foregrounds) {
        const ratio = (luminance(foreground) + 0.05) / (luminance(background) + 0.05);
        assert.ok(ratio >= 4.5, `Text contrast is ${ratio.toFixed(2)}:1`);
      }
    }
  }
});
