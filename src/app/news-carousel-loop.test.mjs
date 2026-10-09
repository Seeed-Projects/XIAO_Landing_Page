import test from "node:test";
import assert from "node:assert/strict";
import {
  NEWS_LOOP_COPIES,
  centerNewsLoopIndex,
  createNewsLoop,
  getNewsLoopStart,
  shouldCenterNewsLoop,
} from "./news-carousel-loop.mjs";

test("news cards are repeated three times for seamless forward and reverse movement", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const loop = createNewsLoop(items);

  assert.equal(loop.length, items.length * NEWS_LOOP_COPIES);
  assert.deepEqual(loop.map(({ item }) => item.id), ["a", "b", "c", "a", "b", "c", "a", "b", "c"]);
  assert.equal(getNewsLoopStart(items.length), items.length);
});

test("outer copies return to the matching card in the center copy", () => {
  const itemCount = 4;

  assert.equal(shouldCenterNewsLoop(3, itemCount), true);
  assert.equal(centerNewsLoopIndex(3, itemCount), 7);
  assert.equal(shouldCenterNewsLoop(8, itemCount), true);
  assert.equal(centerNewsLoopIndex(8, itemCount), 4);
  assert.equal(shouldCenterNewsLoop(6, itemCount), false);
});

test("empty news data remains stationary", () => {
  assert.deepEqual(createNewsLoop([]), []);
  assert.equal(getNewsLoopStart(0), 0);
  assert.equal(shouldCenterNewsLoop(0, 0), false);
  assert.equal(centerNewsLoopIndex(3, 0), 0);
});
