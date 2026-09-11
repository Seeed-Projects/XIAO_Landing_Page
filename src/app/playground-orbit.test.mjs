import assert from "node:assert/strict";
import test from "node:test";
import { orbitPosition, orbitProgress } from "./playground-orbit.mjs";

test("scroll progress is bounded, advances downward and reverses upward", () => {
  assert.equal(orbitProgress(1500, 760, 900), 0);
  assert.equal(orbitProgress(-1000, 760, 900), 1);
  const values = [650, 400, 100, -200].map(top => orbitProgress(top, 760, 900));
  assert.deepEqual([...values].sort((a, b) => a - b), values);
  assert.equal(orbitProgress(400, 760, 900), values[1]);
});

test("desktop paths reserve the full reading area at every scroll position", () => {
  for (const width of [800, 832, 1088, 1312, 1680, 2460, 3712]) {
    const hubWidth = Math.min(560, width - 340);
    const size = { width, height: 920 };
    const hub = { left: (width - hubWidth) / 2, top: 180, width: hubWidth, height: 560 };
    for (let step = 0; step <= 100; step++) {
      for (let index = 0; index < 22; index++) {
        const point = orbitPosition(index, size, hub, step / 100, true);
        const x = point.x / 100 * width;
        const y = point.y / 100 * size.height;
        if (index < 16) assert.ok(index < 8 ? x + 72 < hub.left : x - 72 > hub.left + hub.width);
        else assert.ok(index < 19 ? y + 65 < hub.top : y - 115 > hub.top + hub.height);
        assert.ok(Number.isFinite(point.y));
      }
    }
  }
});

test("ultrawide layouts occupy the outer and inner side lanes", () => {
  const size = { width: 2460, height: 920 };
  const hub = { left: 950, top: 180, width: 560, height: 560 };
  const left = Array.from({ length: 8 }, (_, index) => orbitPosition(index, size, hub, 0.55, true).x / 100 * size.width);
  const right = Array.from({ length: 8 }, (_, index) => orbitPosition(index + 8, size, hub, 0.55, true).x / 100 * size.width);
  assert.ok(Math.min(...left) < size.width * 0.12);
  assert.ok(Math.max(...left) > size.width * 0.22);
  assert.ok(Math.max(...right) > size.width * 0.88);
  assert.ok(Math.min(...right) < size.width * 0.78);
});

test("narrow screens keep boards above and below the reading area", () => {
  for (const width of [272, 327, 560, 688]) {
    const size = { width, height: 1380 };
    const hub = { left: 0, top: 360, width, height: 660 };
    for (let step = 0; step <= 100; step++) {
      for (let index = 0; index < 22; index++) {
        const point = orbitPosition(index, size, hub, step / 100, false);
        const y = point.y / 100 * size.height;
        assert.ok(index < 11 ? y + 65 < hub.top : y - 115 > hub.top + hub.height);
        assert.ok(point.x >= 11.999 && point.x <= 88.001);
      }
    }
  }
});

test("reduced-motion endpoint and repeated positions are deterministic", () => {
  const size = { width: 1088, height: 760 };
  const hub = { left: 264, top: 100, width: 560, height: 560 };
  assert.deepEqual(orbitPosition(0, size, hub, 1, true), orbitPosition(0, size, hub, 2, true));
  const start = orbitPosition(0, size, hub, 0, true);
  const end = orbitPosition(0, size, hub, 1, true);
  assert.ok(end.x < start.x && end.y < start.y);
  assert.deepEqual(orbitPosition(0, size, hub, 0, true), start);
});
