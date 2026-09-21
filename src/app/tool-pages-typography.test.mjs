import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const intro = read("./tool-page-intro.js");
const introCss = read("./tool-page-intro.module.css");
const pinoutCss = read("./playground/pinout/pinout.module.css");
const flasher = read("./products/esp-flasher.js");
const flasherCss = read("./products/esp-flasher.module.css");
const resources = read("./res/resHub.js");
const courseCard = read("./res/CourseCard.js");
const resourcesCss = read("./res/res.module.css");
const software = read("./software-center/page.js");

test("tool page introductions use the shared page typography", () => {
  assert.match(intro, /className="home-type-hero-title"/);
  assert.match(intro, /className="home-type-body"/);
  assert.doesNotMatch(introCss, /--type-section-title/);
  assert.doesNotMatch(introCss, /font-size:\s*18px/);
  assert.doesNotMatch(pinoutCss, /#pinout p\)[^{]*{[^}]*font-size:/s);
});

test("the flasher preserves shared title, description and action roles", () => {
  assert.match(flasher, /pageTitle} home-type-hero-title/);
  assert.match(flasher, /stepTitle} home-type-subtitle/);
  assert.match(flasher, /stepHint} home-type-body/);
  assert.match(flasher, /primaryBtn}[^`]*home-type-action/);
  assert.doesNotMatch(flasherCss, /\.shell button\s*{[^}]*font:\s*inherit/s);
  assert.doesNotMatch(flasherCss, /\.stepHint\s*{[^}]*font-size:/s);
  assert.match(flasherCss, /\.primaryBtn\s*{[^}]*min-height:\s*48px/s);
  assert.match(flasherCss, /\.secondaryBtn\s*{[^}]*min-height:\s*48px/s);
  assert.match(flasherCss, /\.haLink\s*{[^}]*min-height:\s*48px/s);
});

test("software center uses one shared hierarchy for sections and cards", () => {
  assert.equal((software.match(/home-type-title/g) || []).length, 2);
  assert.equal((software.match(/home-type-subtitle/g) || []).length, 2);
  assert.equal((software.match(/home-type-body/g) || []).length, 2);
  assert.doesNotMatch(software, /text-3xl font-bold/);
  assert.doesNotMatch(software, /text-xl font-bold/);
  assert.doesNotMatch(software, /line-clamp-3 text-sm/);
});

test("resource headings and course cards use the shared hierarchy", () => {
  assert.match(resources, /resGroupHead[\s\S]*home-type-subtitle/);
  assert.match(resources, /extrasHead[\s\S]*home-type-title/);
  assert.match(resources, /extrasHead[\s\S]*home-type-body/);
  assert.match(courseCard, /courseTitle} home-type-subtitle/);
  assert.match(courseCard, /courseIntro} home-type-body/);
  assert.match(courseCard, /courseLink} home-type-action home-text-action/);
  assert.doesNotMatch(resourcesCss, /\.courseTitle\s*{[^}]*font-size:/s);
  assert.doesNotMatch(resourcesCss, /\.courseIntro\s*{[^}]*font-size:/s);
  assert.doesNotMatch(resourcesCss, /\.courseLink\s*{[^}]*font-size:/s);
});
