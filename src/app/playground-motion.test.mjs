import assert from "node:assert/strict";
import test from "node:test";
import { boardNudge, boardWave, createPlaygroundMotion } from "./playground-motion.mjs";
import { playgroundBoards } from "./playground-boards.mjs";

function fixture() {
  const pending = new Map();
  const played = [];
  let nextFrame = 0;
  const nudges = playgroundBoards.map(() => ({ style: { transform: "", removeProperty() { this.transform = ""; } } }));
  const waves = playgroundBoards.map(() => ({ animate(frames, options) {
    const animation = { frames, options, canceled: false, cancel() { this.canceled = true; this.oncancel?.(); } };
    played.push(animation);
    return animation;
  } }));
  const scene = {
    querySelectorAll(selector) { return selector.endsWith("nudge") ? nudges : waves; },
    getBoundingClientRect() { return { left: 50, top: 100, width: 560, height: 475 }; },
  };
  const controller = createPlaygroundMotion(scene, playgroundBoards, {
    requestAnimationFrame(fn) { pending.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame(id) { pending.delete(id); },
  });
  const flush = () => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn()); };
  return { controller, pending, played, nudges, flush };
}

test("pointer influence is bounded, local and finite at the board center", () => {
  const board = { x: 50, y: 50 };
  const size = { width: 560, height: 475 };
  for (let x = -100; x <= 700; x += 10) {
    const result = boardNudge(board, { x, y: 200 }, size);
    assert.ok(Math.hypot(result.x, result.y) <= 14);
    assert.ok(Math.abs(result.angle) <= 5);
  }
  assert.deepEqual(boardNudge(board, { x: 280, y: 237.5 }, size), { x: 0, y: 0, angle: 0 });
  assert.equal(boardNudge(board, { x: -1000, y: -1000 }, size).x, 0);
});

test("wave starts at the clicked board and reaches farther boards later", () => {
  const source = playgroundBoards[0];
  assert.deepEqual(boardWave(source, source), { delay: 0, lift: 20 });
  const near = boardWave(playgroundBoards[1], source);
  const far = boardWave(playgroundBoards[7], source);
  assert.ok(near.delay < far.delay);
  assert.ok(near.lift > far.lift);
});

test("pointer events share one frame and return to rest on leave", () => {
  const f = fixture();
  f.controller.setEnabled(true);
  f.controller.move(180, 220, "mouse");
  f.controller.move(200, 240, "mouse");
  assert.equal(f.pending.size, 1);
  f.flush();
  assert.match(f.nudges[0].style.transform, /translate\(/);
  f.controller.move(180, 220, "mouse");
  f.controller.clearPointer();
  assert.equal(f.pending.size, 0);
  assert.ok(f.nudges.every(node => node.style.transform === ""));
  f.controller.move(180, 220, "touch");
  assert.equal(f.pending.size, 0);
});

test("rapid clicks replace the previous wave and completed waves are released", () => {
  const f = fixture();
  f.controller.setEnabled(true);
  f.controller.play(0);
  assert.equal(f.played.length, 8);
  f.controller.play(3);
  assert.ok(f.played.slice(0, 8).every(animation => animation.canceled));
  assert.equal(f.played.length, 16);
  f.played.slice(8).forEach(animation => animation.onfinish());
  f.controller.reset();
  assert.ok(f.played.slice(8).every(animation => !animation.canceled));
});

test("viewport exit and reduced motion cancel work; re-entry enables replay", () => {
  const f = fixture();
  f.controller.setEnabled(true);
  f.controller.move(180, 220, "mouse");
  f.controller.play(1);
  f.controller.setEnabled(false);
  assert.equal(f.pending.size, 0);
  assert.ok(f.played.every(animation => animation.canceled));
  f.controller.move(180, 220, "mouse");
  f.controller.play(0);
  assert.equal(f.pending.size, 0);
  assert.equal(f.played.length, 8);
  f.controller.setEnabled(true);
  f.controller.play(0);
  assert.equal(f.played.length, 16);
  f.controller.dispose();
  assert.ok(f.played.every(animation => animation.canceled));
  f.controller.play(0);
  assert.equal(f.played.length, 16);
});
