import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const css = read("./globals.css");
const carouselCss = read("./home-carousel.module.css");
const agents = read("../../AGENTS.md");

const sources = {
  carousel: read("./home-carousel.js"),
  components: read("./components.js"),
  intro: read("./video-intro-section.js"),
  sections: read("./home-ppt-sections.js"),
  page: read("./page.js"),
  partners: read("./partner-marquee.js"),
  cards: read("./scroll-card.js"),
  news: read("./news-carousel.js"),
  cocreate: read("./co-create-section.js"),
  newsletter: read("./edm-subscribe.js"),
};

test("home typography tokens match the selected reference elements", () => {
  assert.match(css, /--home-hero-title-size: clamp\(36px, 4vw, 64px\)/);
  assert.match(css, /--home-title-size: clamp\(28px, 3\.6vw, 44px\)/);
  assert.match(css, /--home-title-weight: 700/);
  assert.match(css, /--home-title-leading: 1\.12/);
  assert.match(css, /--home-title-tracking: -0\.035em/);
  assert.match(css, /--home-subtitle-size: 20px/);
  assert.match(css, /--home-subtitle-weight: 700/);
  assert.match(css, /--home-subtitle-leading: 1\.5/);
  assert.match(css, /--home-body-size: 15px/);
  assert.match(css, /--home-body-weight: 400/);
  assert.match(css, /--home-action-weight: 700/);
  assert.match(css, /--home-body-leading: 1\.65/);
  assert.match(css, /@media \(min-width: 640px\) \{\s*:root \{ --home-body-size: 16px; \}/);
});

test("every Home content family opts into one semantic type role", () => {
  for (const name of ["components", "intro", "sections", "page", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-title/, `${name} has a section title role`);
  }
  assert.match(sources.carousel, /<h1[\s\S]*?home-type-hero-title/);
  assert.match(sources.carousel, /<p className="home-type-subtitle">/);
  for (const name of ["sections", "partners", "cards", "news", "newsletter"]) {
    assert.match(sources[name], /home-type-subtitle/, `${name} has a subtitle role`);
  }
  for (const name of ["components", "intro", "sections", "page", "cards", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-body/, `${name} has a body role`);
  }
  for (const name of ["carousel", "intro", "sections", "page", "news", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-action/, `${name} has an action role`);
  }
  assert.match(carouselCss, /font-size: var\(--home-body-size\)/);
  assert.match(carouselCss, /font-weight: var\(--home-action-weight\)/);
  assert.match(css, /\.home-type-action \{[\s\S]*?font-weight: var\(--home-action-weight\);/);
  assert.match(css, /\.home-type-action\.home-filled-action \{\s*color: #fff;\s*\}/);
  assert.match(css, /\.home-type-action\.home-text-action \{\s*color: #8fc93a;\s*\}/);
  assert.match(css, /\.home-playground-cta \{ background: #a3d337; color: #fff; \}/);
  assert.doesNotMatch(sources.sections, /style=\{\{ color: "#182b0c" \}\}/);
  assert.doesNotMatch(sources.newsletter, /text-\[#13230c\]/);
  assert.doesNotMatch(sources.intro, /text-\[var\(--button-text\)\]/);
  for (const name of ["carousel", "intro", "sections", "page", "news", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-filled-action/, `${name} identifies filled actions`);
  }
  assert.match(sources.news, /home-text-action/);
});

test("project rules record the site typography hierarchy", () => {
  assert.match(agents, /## 全站字体层级规范/);
  assert.match(agents, /`home-type-hero-title`、`home-type-title`、\s*`home-type-subtitle`、\s*`home-type-body` 和 `home-type-action`/);
  assert.match(agents, /`XIAO Playground` 为基准/);
  assert.match(agents, /`Popular SoCs Integrated` 为基准/);
  assert.match(agents, /About XIAO 的介绍正文为基准/);
  assert.match(agents, /首图展示标题.*`home-type-hero-title`/);
  assert.match(agents, /操作文字[\s\S]*?700 字重/);
  assert.match(agents, /实心操作按钮.*白色文字/);
});
