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
  assert.match(css, /--home-title-size: clamp\(28px, 3\.6vw, 44px\)/);
  assert.match(css, /--home-title-weight: 700/);
  assert.match(css, /--home-title-leading: 1\.12/);
  assert.match(css, /--home-title-tracking: -0\.035em/);
  assert.match(css, /--home-subtitle-size: 20px/);
  assert.match(css, /--home-subtitle-weight: 700/);
  assert.match(css, /--home-subtitle-leading: 1\.5/);
  assert.match(css, /--home-body-size: 15px/);
  assert.match(css, /--home-body-weight: 400/);
  assert.match(css, /--home-body-leading: 1\.65/);
  assert.match(css, /@media \(min-width: 640px\) \{\s*:root \{ --home-body-size: 16px; \}/);
});

test("every Home content family opts into one semantic type role", () => {
  for (const name of ["carousel", "components", "intro", "sections", "page", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-title/, `${name} has a section title role`);
  }
  assert.match(sources.carousel, /<h1 className="home-type-title">/);
  assert.match(sources.carousel, /<p className="home-type-subtitle">/);
  for (const name of ["sections", "partners", "cards", "news", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-subtitle/, `${name} has a subtitle role`);
  }
  for (const name of ["components", "intro", "sections", "page", "cards", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-body/, `${name} has a body role`);
  }
  for (const name of ["carousel", "intro", "sections", "page", "news", "cocreate", "newsletter"]) {
    assert.match(sources[name], /home-type-action/, `${name} has an action role`);
  }
  assert.match(carouselCss, /font-size: var\(--home-body-size\)/);
  assert.match(carouselCss, /font-weight: var\(--home-body-weight\)/);
});

test("project rules record the Home typography hierarchy", () => {
  assert.match(agents, /## 首页字体层级规范/);
  assert.match(agents, /`home-type-title`、`home-type-subtitle`、\s*`home-type-body` 和 `home-type-action`/);
  assert.match(agents, /`XIAO Playground` 为基准/);
  assert.match(agents, /`Popular SoCs Integrated` 为基准/);
  assert.match(agents, /About XIAO 的介绍正文为基准/);
});
