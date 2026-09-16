import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./products/page.js");
const hero = read("./hero-section.js");
const panel = read("./product-panel.js");
const selector = read("./products/xiao-selector.js");
const selectorCss = read("./products/xiao-selector.module.css");
const globals = read("./globals.css");
const agents = read("../../AGENTS.md");

test("Products reuses the shared typography roles", () => {
  assert.match(page, /titleClassName="[^"]*home-type-hero-title/);
  assert.match(hero, /home-type-body[^\n]*text-white/);
  assert.match(hero, /home-type-action home-filled-action/g);
  assert.match(panel, /home-type-title/);
  assert.match(panel, /home-type-subtitle/);
  assert.match(panel, /home-type-body/);
  assert.match(selector, /home-type-title/);
  assert.match(selector, /home-type-subtitle/);
  assert.match(selector, /home-type-body/);
  assert.match(selector, /home-type-action home-filled-action/);
});

test("Products component CSS points to the shared typography tokens", () => {
  assert.match(selectorCss, /\.intro h2[^}]*font-size: var\(--home-title-size\)/s);
  assert.match(selectorCss, /\.intro p[^}]*font-size: var\(--home-body-size\)/s);
  assert.match(selectorCss, /\.cardBody h3[^}]*font-size: var\(--home-subtitle-size\)/s);
  assert.match(selectorCss, /\.resultsTitle[^}]*font-size: var\(--home-body-size\)/s);
});

test("XIAO Selector exposes the faceted workbench structure", () => {
  assert.match(page, /<XiaoSelector \/>/);
  assert.match(selector, /tabFilter: "Filter by Specs"/);
  assert.match(selector, /tabHelp: "Help Me Choose"/);
  assert.match(selector, /moreFilters: "More Filters"/);
  assert.match(selector, /purchase: "Purchase Options"/);
  assert.match(selector, /facetCounts\(/);
  assert.match(selector, /removalSuggestions\(/);
  assert.match(selector, /diffOnly/);
  assert.match(selectorCss, /\.sidebar\s*{[^}]*position: sticky/s);
  assert.match(selectorCss, /@media \(max-width: 1023px\)[\s\S]*\.sidebar\s*{[^}]*position: fixed/);
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

test("Products hero keeps the title on one line and the description within two lines", () => {
  assert.match(page, /titleClassName="products-hero-title home-type-hero-title/);
  assert.match(hero, /className="page-hero-description home-type-body/);
  assert.match(globals, /\.products-hero-title\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(globals, /\.page-hero-description\s*{[^}]*max-width:\s*920px[^}]*-webkit-line-clamp:\s*2/s);
});
