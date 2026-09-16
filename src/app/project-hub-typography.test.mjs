import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const hub = read("./project-hub/projectHub.js");
const hubCss = read("./project-hub/project-hub.module.css");
const globals = read("./globals.css");
const hero = read("./hero-section.js");

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

test("Project Hub hero shell matches Home / Products full-bleed frame", () => {
  assert.match(hubCss, /\.projectIntro\s*{[^}]*width:\s*100%/s);
  assert.match(hubCss, /\.projectIntro\s*{[^}]*aspect-ratio:\s*1695\s*\/\s*632/s);
  assert.match(hubCss, /\.projectIntro\s*{[^}]*min-height:\s*420px/s);
  assert.match(hubCss, /@media \(max-width: 767px\)[\s\S]*?\.projectIntro\s*{[^}]*min-height:\s*620px/);
  assert.match(hubCss, /\.introMetrics\s*{[^}]*position:\s*relative/s);
  assert.match(hub, /<\/Reveal>\s*<div className=\{styles\.introMetrics\}/);
  assert.match(hero, /aspect-\[1695\/632\]/);
  assert.match(hero, /min-h-\[420px\]/);
  assert.match(hero, /max-md:min-h-\[620px\]/);
});

test("Project Hub contribute CTA matches the Home hero primary button", () => {
  assert.match(hub, /Contribute your project"/);
  assert.match(hub, /提交你的项目"/);
  assert.doesNotMatch(hub, /Contribute your project →/);
  assert.match(
    hub,
    /home-type-action home-filled-action inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-\[var\(--button-bg\)\] px-6 py-3/
  );
  assert.match(hub, /<svg width="16" height="16"/);
  assert.match(hubCss, /\.introAction :global\(\.home-type-action\)\s*{[^}]*background: var\(--button-bg\) !important/s);
  assert.match(hubCss, /\.introAction :global\(\.home-type-action\):hover\s*{[^}]*background: var\(--button-bg-hover\) !important/s);
});
