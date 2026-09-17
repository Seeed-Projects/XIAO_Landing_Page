import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./playground/page.js");
const css = read("./playground/playground.module.css");
const globals = read("./globals.css");
const hero = read("./hero-section.js");

test("Playground reuses the shared typography roles", () => {
  assert.match(page, /products-hero-title home-type-hero-title/);
  assert.match(page, /home-type-title/);
  assert.match(page, /home-type-subtitle/);
  assert.match(page, /home-type-body/);
  assert.match(page, /home-type-action home-filled-action/);
  assert.match(page, /home-type-action home-text-action/);
  assert.match(page, /page-hero-copy/);
  assert.match(page, /page-hero-description/);
  assert.match(page, /home-primary-cta/);
});

test("Playground hero title stays on one line like Products", () => {
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(globals, /\.products-hero-title\s*{[^}]*white-space:\s*nowrap/s);
});

test("Playground hero copy starts at the Home hero copy edge", () => {
  assert.match(page, /page-hero-copy/);
  assert.match(globals, /\.page-hero-copy\s*{[^}]*padding-inline:\s*9\.75vw 24px/s);
  assert.match(css, /padding-left:\s*calc\(8\.85vw \+ 19\.75px\)/);
});

test("Playground CSS defers typed text to Home tokens", () => {
  assert.match(css, /font-size: var\(--home-title-size\)/);
  assert.match(css, /font-size: var\(--home-subtitle-size\)/);
  assert.match(css, /font-size: var\(--home-body-size\)/);
  assert.match(css, /font-size: clamp\(18px, 3\.4vw, 56px\)/);
  assert.doesNotMatch(css, /\.copy h1\s*{[^}]*font-size:\s*clamp\(48px/s);
  assert.doesNotMatch(css, /\.actions a\s*{[^}]*font-size:\s*14px/s);
});

test("Playground hero shell matches Home / Products full-bleed frame", () => {
  assert.match(css, /\.hero\s*{[^}]*aspect-ratio:\s*1695\s*\/\s*632/s);
  assert.match(css, /\.hero\s*{[^}]*min-height:\s*420px/s);
  assert.match(hero, /aspect-\[1695\/632\]/);
  assert.match(hero, /min-h-\[420px\]/);
});

test("Playground primary CTA matches the Home hero primary button", () => {
  assert.match(page, /home-type-action home-filled-action home-primary-cta/);
  assert.match(page, /<svg\s+width="16"\s+height="16"/);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*min-height:\s*48px/s);
  assert.match(css, /\.actions :global\(\.home-primary-cta\)/);
});
