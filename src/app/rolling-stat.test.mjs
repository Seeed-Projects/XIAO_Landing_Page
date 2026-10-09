import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDigitReel, rollingTargetStep } from "./rolling-stat.mjs";

test("digit reels complete two cycles and stop on the requested digit", () => {
  for (const digit of ["0", "2", "5", "8"]) {
    const reel = createDigitReel(digit);
    assert.equal(reel.at(-1), Number(digit));
    assert.equal(reel.length - 1, rollingTargetStep(digit));
    assert.deepEqual(reel.slice(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepEqual(reel.slice(10, 20), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
});

test("rolling stats replay on viewport re-entry and keep reduced-motion support", () => {
  const component = readFileSync(new URL("./rolling-stat.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
  assert.match(component, /setVisible\(entry\.isIntersecting\)/);
  assert.match(component, /rootMargin: "0px 0px -20% 0px"/);
  assert.match(css, /\.rolling-stat\[data-visible="true"\] \.rolling-stat-reel/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.rolling-stat-reel/);
});
