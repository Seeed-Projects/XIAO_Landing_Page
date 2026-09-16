import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shouldReleaseHoverWheel } from "./hover-card-scroll.mjs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const card = read("./scroll-card.js");
const projects = read("./projects-carousel.js");
const news = read("./news-carousel.js");
const css = read("./globals.css");

test("project and news cards reveal only their complete title and description", () => {
  assert.match(card, /export function HoverCardCopy\(\{ title, description \}\)/);
  assert.match(card, /<h3[^>]*>\{title\}<\/h3>/);
  assert.match(card, /<p[^>]*>\{description\}<\/p>/);
  assert.match(projects, /cardClassName="hover-copy-card"/);
  assert.match(projects, /showHoverCopy/);
  assert.match(news, /<HoverCardCopy title=\{item\.title\} description=\{item\.excerpt\} \/>/);
});

test("hover copy stays inside each card and remains readable", () => {
  assert.match(css, /\.hover-copy-card \{[\s\S]*?position: relative;[\s\S]*?overflow: hidden;/);
  assert.match(css, /\.hover-card-copy \{[\s\S]*?position: absolute;[\s\S]*?overflow-y: auto;/);
  assert.match(css, /\.hover-copy-card:hover \.hover-card-copy/);
  assert.match(css, /\.hover-copy-card:focus-within \.hover-card-copy/);
});

test("scrollable hover copy releases wheel input only at its edges", () => {
  assert.match(css, /\.hover-card-copy \{[\s\S]*?overflow-y: auto;/);
  assert.doesNotMatch(css, /\.hover-card-copy \{[\s\S]*?overscroll-behavior: contain;/);
  assert.match(card, /onWheel=\{handleHoverWheel\}/);
  assert.equal(shouldReleaseHoverWheel(-20, 0, 200, 500), true);
  assert.equal(shouldReleaseHoverWheel(20, 300, 200, 500), true);
  assert.equal(shouldReleaseHoverWheel(20, 120, 200, 500), false);
  assert.equal(shouldReleaseHoverWheel(-20, 120, 200, 500), false);
});
