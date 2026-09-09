import assert from "node:assert/strict";
import test from "node:test";
import { getScrollBandLayout } from "./scroll-band-layout.mjs";

test("a wide viewport stays covered through two complete cycles", () => {
  const viewportWidth = 2533;
  const cycleWidth = 1780;
  const gap = 16;
  const { copies, distance } = getScrollBandLayout(viewportWidth, cycleWidth, gap);
  const trackWidth = copies * cycleWidth - gap;

  for (let frame = 0; frame <= 200; frame += 1) {
    const progress = (frame % 100) / 100;
    assert.ok(trackWidth - distance * progress >= viewportWidth);
  }
});

test("the seam matches the next copy including the column gap", () => {
  assert.equal(getScrollBandLayout(2533, 1780, 16).distance, 1780);
});

test("short lists and resized viewports get enough copies", () => {
  for (const viewportWidth of [390, 768, 1440, 2533, 3840]) {
    for (const cycleWidth of [296, 592, 1780, 4200]) {
      const { copies, distance } = getScrollBandLayout(viewportWidth, cycleWidth, 16);
      assert.ok((copies - 1) * cycleWidth - 16 >= viewportWidth);
      assert.equal(distance, cycleWidth);
    }
  }
});

test("a viewport exactly one cycle wide includes the trailing gap", () => {
  assert.equal(getScrollBandLayout(1780, 1780, 16).copies, 3);
});

test("unmeasured or empty content stays stationary", () => {
  assert.deepEqual(getScrollBandLayout(2533, 0, 16), { copies: 2, distance: 0 });
  assert.deepEqual(getScrollBandLayout(0, 1780, 16), { copies: 2, distance: 0 });
});
