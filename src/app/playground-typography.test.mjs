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
  assert.match(page, /page-hero-copy/);
  assert.match(page, /page-hero-description/);
  assert.match(page, /home-type-action home-filled-action/);
  assert.doesNotMatch(page, /Start with Pinout/);
  assert.doesNotMatch(page, /Open Web Flasher/);
  assert.match(page, /home-primary-cta/);
  assert.match(page, /XIAO ESP32 Series Web Flasher/);
});

test("Playground hero title stays on one line like Products", () => {
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(globals, /\.products-hero-title\s*{[^}]*white-space:\s*nowrap/s);
});

test("Playground hero copy starts at the Home hero copy edge", () => {
  assert.match(page, /page-hero-copy/);
  assert.match(globals, /\.page-hero-copy\s*{[^}]*padding-inline:\s*9\.75vw 24px/s);
  assert.doesNotMatch(css, /padding-left:\s*calc\(8\.85vw \+ 19\.75px\)/);
});

test("Playground CSS leaves shared text roles to the global type scale", () => {
  assert.doesNotMatch(css, /\.copy :global\(\.products-hero-title\)\s*{[^}]*font-size:/s);
  assert.doesNotMatch(css, /\.sectionHead :global\(\.home-type-title\)\s*{[^}]*font-size:/s);
  assert.doesNotMatch(css, /\.toolContent :global\(\.home-type-subtitle\)\s*{[^}]*font-size:/s);
  assert.doesNotMatch(css, /\.toolContent :global\(\.home-type-body\)\s*{[^}]*font-size:/s);
  assert.doesNotMatch(css, /font-size: clamp\(32px, 3\.4vw, 56px\)/);
  assert.match(globals, /\.home-type-hero-title\s*{[^}]*font-size:\s*var\(--home-hero-title-size\)/s);
  assert.match(globals, /\.home-type-title\s*{[^}]*font-size:\s*var\(--home-title-size\)/s);
  assert.match(globals, /\.home-type-subtitle\s*{[^}]*font-size:\s*var\(--home-subtitle-size\)/s);
  assert.match(globals, /\.home-type-body,\s*\.home-type-action\s*{[^}]*font-size:\s*var\(--home-body-size\)/s);
});

test("Playground hero rhythm and task buttons match the shared page patterns", () => {
  assert.match(css, /\.copy\s*{[^}]*transform:\s*translateY\(-1\.25rem\)/s);
  assert.match(css, /@media \(min-width: 640px\)[\s\S]*?\.copy\s*{[^}]*translateY\(-1\.75rem\)/);
  assert.match(css, /@media \(min-width: 1024px\)[\s\S]*?\.copy\s*{[^}]*translateY\(-2rem\)/);
  assert.match(css, /\.taskLink\s*{[^}]*min-height:\s*48px[^}]*padding:\s*0\.75rem 1\.5rem[^}]*border-radius:\s*9999px/s);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*min-height:\s*48px[^}]*padding:\s*0\.75rem 1\.5rem[^}]*border-radius:\s*9999px/s);
});

test("Playground hero shell matches Home / Products full-bleed frame", () => {
  assert.match(css, /\.hero\s*{[^}]*aspect-ratio:\s*1695\s*\/\s*632/s);
  assert.match(css, /\.hero\s*{[^}]*min-height:\s*420px/s);
  assert.match(hero, /aspect-\[1695\/632\]/);
  assert.match(hero, /min-h-\[420px\]/);
});
