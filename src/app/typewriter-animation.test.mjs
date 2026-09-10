import assert from "node:assert/strict";
import test from "node:test";
import { createTypewriter } from "./typewriter-animation.mjs";

function fixture(text) {
  const pending = new Map();
  let id = 0;
  let output;
  const animation = createTypewriter(text, (value, typing) => { output = { value, typing }; }, {
    duration: 1000,
    requestFrame: (callback) => { pending.set(++id, callback); return id; },
    cancelFrame: (frame) => pending.delete(frame),
  });
  return {
    animation,
    read: () => output,
    pending: () => pending.size,
    tick(now) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(now));
    },
  };
}

test("types progressively and stops after the complete sentence", () => {
  const run = fixture("Developers");
  run.animation.play();
  run.tick(0);
  assert.deepEqual(run.read(), { value: "", typing: true });
  run.tick(500);
  assert.deepEqual(run.read(), { value: "Devel", typing: true });
  run.tick(1000);
  assert.deepEqual(run.read(), { value: "Developers", typing: false });
  assert.equal(run.pending(), 0);
});

test("leaving resets typing and returning starts a fresh animation", () => {
  const run = fixture("Developers");
  run.animation.play();
  run.tick(0);
  run.tick(500);
  run.animation.reset();
  assert.equal(run.pending(), 0);
  assert.deepEqual(run.read(), { value: "", typing: false });
  run.animation.play();
  run.tick(2000);
  assert.deepEqual(run.read(), { value: "", typing: true });
  run.tick(3000);
  assert.deepEqual(run.read(), { value: "Developers", typing: false });
});

test("reduced motion finishes immediately and cleanup cancels pending work", () => {
  const run = fixture("Join us");
  run.animation.play();
  run.animation.finish();
  assert.deepEqual(run.read(), { value: "Join us", typing: false });
  assert.equal(run.pending(), 0);
  run.animation.play();
  run.animation.stop();
  assert.equal(run.pending(), 0);
});

test("empty text completes and Unicode characters remain whole", () => {
  const empty = fixture("");
  empty.animation.play();
  empty.tick(0);
  assert.equal(empty.pending(), 0);
  const unicode = fixture("\u{1F680}\u5F00\u53D1\u8005");
  unicode.animation.play();
  unicode.tick(0);
  unicode.tick(250);
  assert.deepEqual(unicode.read(), { value: "\u{1F680}", typing: true });
});
