import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getCardPeekPosition } from "./card-peek-position.mjs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const peek = read("./card-peek.js");
const projects = read("./projects-carousel.js");
const news = read("./news-carousel.js");
const band = read("./scroll-band.js");
const card = read("./scroll-card.js");
const css = read("./globals.css");
const rule = (selector) => css.match(new RegExp(`${selector} \\{[\\s\\S]*?\\}`))?.[0] || "";
const panelRule = rule("\\.card-peek-panel");
const veilRule = rule("\\.card-peek-veil");

const viewport = { width: 1440, height: 900 };
const panel = { width: 440, height: 480 };
const rect = (left, top, width = 340, height = 350) => ({ left, top, width, height, right: left + width, bottom: top + height });

test("project cards open the complete details in a floating peek panel", () => {
  assert.match(projects, /<CardPeek renderPeek=\{\(index\) => <ProjectPeek item=\{PROJECTS\[index\]\} lang=\{lang\} \/>\}>/);
  assert.match(projects, /title=\{localize\(item\.title, lang\)\}\s*description=\{localize\(item\.excerpt, lang\)\}\s*badge=\{item\.board\}/);
  assert.match(band, /data-card-index=\{sourceIdx\}/);
});

test("news cards open the same peek panel with the full title and excerpt", () => {
  assert.match(news, /<CardPeek renderPeek=\{\(index\) => <NewsPeek item=\{items\[index\]\} \/>\}>/);
  assert.match(news, /title=\{item\.title\}\s*description=\{item\.excerpt\}/);
  assert.match(news, /data-card-index=\{itemIndex\}/);
});

test("the shared peek layout uses the Home subtitle and body type roles", () => {
  assert.match(peek, /<p className="home-type-subtitle card-peek-title">\{title\}<\/p>/);
  assert.match(peek, /<p className="home-type-body card-peek-body mt-2">\{description\}<\/p>/);
  assert.match(peek, /createPortal\(/);
});

test("the peek panel lets the wheel scroll the page and grows with its content", () => {
  for (const source of [peek, news, card]) {
    assert.doesNotMatch(source, /onWheel|preventDefault|scrollBy|HoverCardCopy/);
  }
  assert.doesNotMatch(css, /hover-card-copy|hover-copy-card/);
  assert.match(peek, /window\.addEventListener\("scroll", handleScroll, \{ passive: true \}\)/);
  assert.match(peek, /area\.addEventListener\("scroll", handleScroll, \{ capture: true, passive: true \}\)/);
  assert.match(panelRule, /pointer-events: none;/);
  assert.doesNotMatch(panelRule, /overflow|max-height/);
  assert.match(css, /\.card-peek-area\[data-peek-open\] \.marquee-track \{[\s\S]*?animation-play-state: paused;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.card-peek-panel,\s*\.card-peek-veil \{\s*animation: none;/);
});

test("the dark panel stands apart from the white cards and spotlights its source card", () => {
  assert.match(panelRule, /--peek-surface: #0f2739;/);
  assert.match(css, /\.card-peek-title \{\s*color: #fff;/);
  assert.match(css, /\.card-peek-panel\[data-side="right"\]::before \{\s*left: -8px;/);
  assert.match(css, /\.card-peek-panel\[data-side="left"\]::before \{\s*right: -8px;/);
  assert.match(veilRule, /position: fixed;[\s\S]*?overflow: hidden;[\s\S]*?pointer-events: none;/);
  assert.match(rule("\\.card-peek-spot"), /box-shadow: 0 0 0 200vmax/);
  assert.match(css, /\.card-peek-area \[data-peek-active\] \{\s*border-color: var\(--button-bg\);/);
  assert.match(peek, /card\.setAttribute\("data-peek-active", ""\);[\s\S]*?card\.removeAttribute\("data-peek-active"\)/);
  assert.match(peek, /setProperty\("--peek-notch", `\$\{notch\}px`\)/);
});

test("the panel opens on the roomier side of its card", () => {
  assert.deepEqual(getCardPeekPosition(rect(200, 300), panel, viewport), { side: "right", left: 552, top: 300, notch: 175 });
  assert.deepEqual(getCardPeekPosition(rect(1000, 300), panel, viewport), { side: "left", left: 548, top: 300, notch: 175 });
});

test("the panel covers its own card when neither side has room", () => {
  const narrow = { width: 768, height: 900 };
  assert.deepEqual(getCardPeekPosition(rect(214, 300), panel, narrow), { side: "over", left: 164, top: 300, notch: 175 });
  assert.equal(getCardPeekPosition(rect(24, 300), panel, narrow).left, 16);
});

test("the panel stays below the fixed header and inside the viewport", () => {
  const options = { topInset: 64 };
  assert.equal(getCardPeekPosition(rect(200, 20), panel, viewport, options).top, 80);
  assert.equal(getCardPeekPosition(rect(200, 700), panel, viewport, options).top, 404);
  assert.equal(getCardPeekPosition(rect(200, 300), { width: 440, height: 1200 }, viewport, options).top, 80);
});

test("the notch follows the card center and stays clear of the rounded corners", () => {
  const options = { topInset: 64 };
  assert.equal(getCardPeekPosition(rect(200, 500), panel, viewport, options).notch, 271);
  assert.equal(getCardPeekPosition(rect(200, 700), panel, viewport, options).notch, 452);
  assert.equal(getCardPeekPosition(rect(200, -300), panel, viewport, options).notch, 28);
});
