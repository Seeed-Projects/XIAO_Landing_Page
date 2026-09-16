import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const hub = read("./project-hub/projectHub.js");
const hubCss = read("./project-hub/project-hub.module.css");
const globals = read("./globals.css");

test("Project Hub reuses the shared typography roles", () => {
  assert.match(hub, /home-type-hero-title/);
  assert.match(hub, /home-type-title/);
  assert.match(hub, /home-type-subtitle/);
  assert.match(hub, /home-type-body/);
  assert.match(hub, /home-type-action home-filled-action/);
  assert.match(hub, /home-about-stat-value/);
  assert.match(hub, /page-hero-copy/);
  assert.match(hub, /page-hero-description/);
});

test("Project Hub hero copy starts at the Home hero copy edge", () => {
  assert.match(hubCss, /padding-inline:\s*9\.75vw 24px/);
  assert.match(hubCss, /padding-inline(?:-start)?:\s*calc\(8\.85vw \+ 19\.75px\)/);
  assert.match(globals, /\.page-hero-copy\s*{[^}]*padding-inline:\s*9\.75vw 24px/s);
});

test("Project Hub CSS defers typed text to Home tokens", () => {
  assert.match(hubCss, /font-size: var\(--home-hero-title-size\)/);
  assert.match(hubCss, /font-size: var\(--home-title-size\)/);
  assert.match(hubCss, /font-size: var\(--home-subtitle-size\)/);
  assert.match(hubCss, /font-size: var\(--home-body-size\)/);
  assert.match(hubCss, /font-size: clamp\(28px, 3vw, 42px\)/);
});
