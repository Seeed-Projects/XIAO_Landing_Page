import assert from "node:assert/strict";
import { statSync } from "node:fs";
import test from "node:test";
import { createStoryPlayback } from "./story-playback.mjs";
import { DIAGRAM_IDS } from "./official-stories.mjs";

function fixture() {
  const video = {
    paused: true, currentTime: 0, readyState: 1, src: null, plays: 0,
    getAttribute() { return this.src; },
    setAttribute(name, value) { this[name] = value; },
    play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  const states = [];
  return { video, states, control: createStoryPlayback(video, "demo.mp4", (state) => states.push(state)) };
}

test("loads on entry, resets on exit and replays on return", async () => {
  const { video, control, states } = fixture();
  assert.equal(video.src, null);
  control.setVisible(true);
  await Promise.resolve();
  assert.equal(video.src, "demo.mp4");
  assert.equal(states.at(-1).playing, true);
  video.currentTime = 6;
  control.setVisible(false);
  assert.equal(video.paused, true);
  assert.equal(video.currentTime, 0);
  control.setVisible(true);
  assert.equal(video.plays, 2);
});

test("manual pause survives viewport re-entry", () => {
  const { video, control } = fixture();
  control.setVisible(true);
  control.toggle();
  control.setVisible(false);
  control.setVisible(true);
  assert.equal(video.paused, true);
  control.toggle();
  assert.equal(video.paused, false);
});

test("reduced motion uses a poster without downloading video", () => {
  const { video, control, states } = fixture();
  control.setReducedMotion(true);
  control.setVisible(true);
  assert.equal(video.src, null);
  assert.deepEqual(states.at(-1), { playing: false, still: true });
  control.setReducedMotion(false);
  assert.equal(video.paused, false);
});

test("hidden tabs pause and failed videos retain a static fallback", () => {
  const { video, control, states } = fixture();
  control.setVisible(true);
  video.currentTime = 3;
  control.setPageVisible(false);
  assert.equal(video.paused, true);
  assert.equal(video.currentTime, 3);
  control.setPageVisible(true);
  assert.equal(video.paused, false);
  control.fail();
  assert.deepEqual(states.at(-1), { playing: false, still: true });
  assert.equal(video.paused, true);
});

test("pending playback does not report after disposal", async () => {
  const { control, states } = fixture();
  control.setVisible(true);
  control.destroy();
  await Promise.resolve();
  assert.equal(states.length, 0);
});

test("autoplay rejection is handled and can be retried", async () => {
  const { video, control, states } = fixture();
  video.play = () => Promise.reject(new Error("Playback blocked"));
  control.setVisible(true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(states.at(-1).playing, false);
  video.play = () => { video.paused = false; return Promise.resolve(); };
  control.toggle();
  await Promise.resolve();
  assert.equal(states.at(-1).playing, true);
});

test("all six illustrations ship a lightweight video and poster", () => {
  for (const id of DIAGRAM_IDS) {
    for (const type of ["mp4", "webp"]) {
      const asset = new URL(`../../../public/software-animations/${id}.${type}`, import.meta.url);
      const size = statSync(asset).size;
      assert.ok(size > 1000, `${id}.${type}`);
      assert.ok(size < (type === "mp4" ? 4_000_000 : 150_000), `${id}.${type} size budget`);
    }
  }
});
