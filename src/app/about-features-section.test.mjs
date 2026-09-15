import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./page.js");
const intro = read("./video-intro-section.js");
const sections = read("./home-ppt-sections.js");
const css = read("./globals.css");

test("About XIAO and its four features form one continuous section", () => {
  assert.doesNotMatch(page, /<FeaturesSection\s*\/>/);
  assert.doesNotMatch(page, /import \{[^}]*FeaturesSection/);
  assert.doesNotMatch(sections, /export function FeaturesSection/);
  assert.match(intro, /id="intro"[\s\S]*?id="features"/);
  assert.equal((intro.match(/className="home-feature"/g) || []).length, 1);
  assert.doesNotMatch(intro, />Features<|>特性一览</);
  assert.match(css, /\.home-about-section \{[\s\S]*?radial-gradient[\s\S]*?linear-gradient/);
});

test("the merged section keeps the original open layout without extra panels", () => {
  const statsRule = css.match(/\.home-about-stats \{([^}]+)\}/)?.[1] || "";
  const featureBridgeRule = css.match(/\.home-about-features \{([^}]+)\}/)?.[1] || "";
  const featureRule = css.match(/\.home-feature \{([^}]+)\}/)?.[1] || "";
  assert.doesNotMatch(statsRule, /border|background/);
  assert.doesNotMatch(featureBridgeRule, /border|background/);
  assert.doesNotMatch(featureRule, /border|background|box-shadow|backdrop-filter/);
  assert.doesNotMatch(intro, /home-feature-visual/);
});

test("the feature grid stays compact within the merged section", () => {
  assert.match(css, /\.home-about-features \{\s*margin-top: 28px;/);
  assert.match(css, /\.home-feature-grid \{[\s\S]*?gap: 39px 44px;/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*?\.home-feature \{ grid-template-columns: 84px minmax\(0, 1fr\); \}/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*?\.home-feature img \{[\s\S]*?width: 84px;[\s\S]*?height: 84px;/);
});

test("both About XIAO metrics use the rolling number treatment", () => {
  assert.match(intro, /<RollingStat value=\{value\} \/>/);
  assert.match(intro, /"21×17\.8"/);
  assert.match(intro, /"500,000\+"/);
});
