import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const globals = read("./globals.css");
const hero = read("./hero-section.js");
const carouselCss = read("./home-carousel.module.css");
const carousel = read("./home-carousel.js");
const selectorCss = read("./products/xiao-selector.module.css");
const selector = read("./products/xiao-selector.js");
const panelCss = read("./product-panel.module.css");
const panel = read("./product-panel.js");
const hub = read("./project-hub/projectHub.js");

test("shared home-primary-cta token matches the HeroSection recipe", () => {
  assert.match(globals, /\.home-primary-cta\s*{[^}]*min-height:\s*48px/s);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*padding:\s*0\.75rem 1\.5rem/s);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*border-radius:\s*9999px/s);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*background:\s*var\(--button-bg\)/s);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*box-shadow:\s*0 8px 24px rgba\(0, 0, 0, 0\.25\)/s);
  assert.match(globals, /\.home-primary-cta:hover\s*{[^}]*translateY\(-2px\)/s);
});

test("page primary CTAs opt into home-primary-cta", () => {
  assert.match(hero, /home-primary-cta/);
  assert.match(carousel, /home-primary-cta/);
  assert.match(hub, /home-primary-cta/);
  assert.match(panel, /home-primary-cta/);
  assert.match(selector, /home-primary-cta/);
});

test("module primary buttons reuse the shared CTA metrics", () => {
  assert.match(carouselCss, /\.heroCta\s*{[^}]*min-height:\s*48px/s);
  assert.match(carouselCss, /\.heroCta\s*{[^}]*padding:\s*0\.75rem 1\.5rem/s);
  assert.match(selectorCss, /\.primaryBtn\s*{[^}]*min-height:\s*48px/s);
  assert.match(selectorCss, /\.primaryBtn\s*{[^}]*padding:\s*0\.75rem 1\.5rem/s);
  assert.match(panelCss, /\.selectorLink\s*{[^}]*min-height:\s*48px/s);
  assert.match(panelCss, /\.selectorLink\s*{[^}]*padding:\s*0\.75rem 1\.5rem/s);
});

test("catalog row buy stays compact while using brand fill", () => {
  assert.match(panelCss, /\.buy\s*{[^}]*padding:\s*3px 8px/s);
  assert.match(panelCss, /\.buy\s*{[^}]*background:\s*var\(--button-bg\)/s);
  assert.match(panelCss, /\.wiki,\s*\.buy\s*{[^}]*border-radius:\s*9999px/s);
  assert.match(panel, /styles\.buy\} home-type-action home-filled-action/);
});
