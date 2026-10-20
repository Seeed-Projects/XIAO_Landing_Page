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
  assert.match(panel, /home-type-action/);
  assert.match(panel, /SERIES_PRESENTATION/);
  assert.match(panel, /seriesGrid/);
  assert.match(selector, /home-type-title/);
  assert.match(selector, /home-type-subtitle/);
  assert.match(selector, /home-type-body/);
  assert.match(selector, /home-type-action home-filled-action/);
});

test("Product catalog presents three series as the primary stage", () => {
  const panelCss = read("./product-panel.module.css");
  const catalog = read("./products/catalog.js");
  assert.match(catalog, /SERIES_PRESENTATION/);
  assert.match(catalog, /"dev-boards"/);
  assert.match(catalog, /addons:/);
  assert.match(catalog, /gadgets:/);
  assert.match(panelCss, /\.seriesGrid\s*{[^}]*grid-template-columns: repeat\(3/s);
  assert.match(panelCss, /\.productListDense\s*{[^}]*repeat\(6/s);
  assert.match(panelCss, /\.productRow\s*{[^}]*grid-template-columns:\s*64px/s);
  assert.match(panelCss, /\.thumb\s*{[^}]*64px/s);
  assert.match(panelCss, /\.thumb > img\s*{[^}]*object-fit:\s*contain/s);
  assert.match(panel, /BOARD_HARDWARE/);
  assert.match(panel, /<CardPeek/);
});

test("Series link curves mirror below the active card and join the stage edge", () => {
  const panelCss = read("./product-panel.module.css");
  assert.match(panel, /id={`series-tab-\${category\.id}`}/);
  assert.match(panel, /aria-controls="series-stage"/);
  assert.match(panel, /role="tabpanel"[\s\S]*aria-labelledby={`series-tab-\${currentCategory\.id}`}/);
  assert.doesNotMatch(panel, /styles\.stageTitle|styles\.stageEyebrow/);
  assert.match(panel, /<h3 className={`home-type-subtitle \${styles\.productName}`}>/);
  assert.match(panel, /const LINK_LINE = "M100 0 C100 62 50 100 0 100"/);
  assert.match(panel, /className={styles\.seriesLink}[\s\S]*"--active-index": categories\.indexOf\(currentCategory\)[\s\S]*aria-hidden="true"/);
  assert.match(panel, /<radialGradient id={`\${linkId}-fill`} cx="1" cy="0" r="1">/);
  assert.match(panelCss, /\.seriesGrid\s*{[^}]*gap:\s*var\(--series-gap\)[^}]*margin-bottom:\s*0/s);
  assert.match(panelCss, /\.seriesLink\s*{[^}]*--link-x:\s*calc\([\s\S]*?var\(--active-index\)[^}]*height:\s*var\(--link-height\)/s);
  assert.match(panelCss, /\.seriesLinkLeft\s*{[^}]*left:\s*calc\(var\(--link-x\) - var\(--link-arc\)\)[^}]*width:\s*var\(--link-arc\)/s);
  assert.match(panelCss, /\.seriesLinkRight\s*{[^}]*left:\s*var\(--link-x\)[^}]*width:\s*var\(--link-arc\)[^}]*transform:\s*scaleX\(-1\)/s);
  assert.match(panelCss, /\.seriesLinkLine\s*{[^}]*vector-effect:\s*non-scaling-stroke/s);
  assert.match(panelCss, /\.stage\s*{[^}]*border:\s*1px solid var\(--stage-line\)[^}]*border-top-width:\s*0[^}]*border-radius:\s*var\(--stage-radius\)/s);
  assert.match(panelCss, /@media \(max-width: 1023px\)[\s\S]*?\.seriesCard\s*{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(panelCss, /@media \(max-width: 640px\)\s*{\s*\.panel\s*{[^}]*--link-height:\s*28px/);
  assert.match(panelCss, /@media \(max-width: 640px\)[\s\S]*?\.seriesEyebrow\s*{\s*display:\s*none/);
  assert.match(panel, /seriesTitle\(category\)\.split\(" "\)[\s\S]*styles\.seriesWord/);
  assert.match(panelCss, /\.seriesWord\s*{\s*white-space:\s*nowrap/);
});

test("Dev Boards use the supplied front-view assets and include STM32C5", () => {
  const catalog = read("./products/catalog.js");
  const boardSpecs = read("./products/board-specs.mjs");
  assert.match(catalog, /dev_boards\/front\/XIAO-ESP32-C3-front\.webp/);
  assert.match(catalog, /dev_boards\/front\/XIAO-ESP32-C6-front\.webp/);
  assert.match(catalog, /dev_boards\/front\/XIAO-nRF54LM20A-Sense-front\.webp/);
  assert.match(catalog, /group\("stm32", "STMicroelectronics STM32 Series"/);
  assert.match(catalog, /product\("XIAO STM32C5"[\s\S]*XIAO-STM32C5-front\.webp/);
  assert.match(boardSpecs, /"XIAO STM32C5"/);
  assert.match(boardSpecs, /id: "st"[\s\S]*STMicroelectronics/);
});

test("XIAO Selector uses its dedicated SVG artwork without changing Product cards", () => {
  const catalog = read("./products/catalog.js");
  assert.match(catalog, /export const SELECTOR_IMAGES/);
  assert.match(catalog, /"XIAO STM32C5": selectorImage\("XIAO-STM32C5"\)/);
  assert.match(catalog, /"XIAO ESP32-C6": selectorImage\("XIAO-ESP32-C6"\)/);
  assert.match(selector, /SELECTOR_IMAGES\[item\.title\] \?\? item\.img/);
  assert.match(panel, /withBase\(item\.img\)/);
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

test("Products page spaces the catalog below the hero and keeps a matching side rail", () => {
  const directory = read("./side-directory.js");
  const i18n = read("./i18n.js");
  assert.match(page, /id="top"/);
  assert.match(page, /id="products-catalog"[^>]*pt-20/);
  assert.match(directory, /pathname\.replace\(\/\\\/\+\$\/, ""\)/);
  assert.match(i18n, /products: \[[^\]]*id: "smart-selector"/s);
});

test("Products hero keeps the title on one line and the description within two lines", () => {
  assert.match(page, /titleClassName="products-hero-title home-type-hero-title/);
  assert.match(hero, /className="page-hero-description home-type-body/);
  assert.match(globals, /\.products-hero-title\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(globals, /\.page-hero-description\s*{[^}]*max-width:\s*920px[^}]*-webkit-line-clamp:\s*2/s);
});
