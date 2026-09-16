import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./products/page.js");
const hero = read("./hero-section.js");
const panel = read("./product-panel.js");
const selector = read("./products/smart-selector.js");
const selectorCss = read("./products/smart-selector.module.css");
const globals = read("./globals.css");
const agents = read("../../AGENTS.md");

test("Products reuses the shared typography roles", () => {
  assert.match(page, /titleClassName="home-type-hero-title/);
  assert.match(hero, /home-type-body[^\n]*text-white/);
  assert.match(hero, /home-type-action home-filled-action/g);
  assert.match(panel, /home-type-title/);
  assert.match(panel, /home-type-subtitle/);
  assert.match(panel, /home-type-body/);
  assert.match(selector, /home-type-title/);
  assert.match(selector, /home-type-subtitle/);
  assert.match(selector, /home-type-body/);
});

test("Products component CSS points to the shared typography tokens", () => {
  assert.match(selectorCss, /\.introBlock h2[^}]*font-size: var\(--home-title-size\)/s);
  assert.match(selectorCss, /\.introBlock p[^}]*font-size: var\(--home-body-size\)/s);
  assert.match(selectorCss, /\.filterHead h2[^}]*font-size: var\(--home-subtitle-size\)/s);
  assert.match(selectorCss, /\.filterHead p[^}]*font-size: var\(--home-body-size\)/s);
  assert.match(selectorCss, /\.catalogCard h3[^}]*font-size: var\(--home-subtitle-size\)/s);
  assert.match(selectorCss, /\.catalogCard p[^}]*font-size: var\(--home-body-size\)/s);
  assert.match(selectorCss, /\.miniBtn[^}]*font-size: var\(--home-body-size\)/s);
});

test("project rules apply the shared typography hierarchy to every page", () => {
  assert.match(agents, /## 全站字体层级规范/);
  assert.match(agents, /Products/);
  assert.match(agents, /所有核心内容页面/);
});

test("Products hero copy starts at the Home hero copy edge", () => {
  assert.match(hero, /className="page-hero-copy/);
  assert.match(globals, /\.page-hero-copy\s*{[^}]*padding-inline:\s*9\.75vw 24px/s);
  assert.match(globals, /@media \(max-width: 700px\)[\s\S]*?\.page-hero-copy\s*{[^}]*padding-left:\s*calc\(8\.85vw \+ 19\.75px\)/);
});
