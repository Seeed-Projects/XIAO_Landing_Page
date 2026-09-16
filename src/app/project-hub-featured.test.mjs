import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { pickFeaturedProjects } from "./project-hub/pick-featured-projects.mjs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const hub = read("./project-hub/projectHub.js");
const hubCss = read("./project-hub/project-hub.module.css");
const projectsData = read("./projects-data.js");
const content = JSON.parse(read("./home-content.generated.json"));

test("Project Hub featured section pulls from the Home PROJECTS catalog", () => {
  assert.match(projectsData, /export const PROJECTS/);
  assert.equal(content.projects.length, 48);
  assert.match(hub, /from "\.\.\/projects-data"/);
  assert.match(hub, /pickFeaturedProjects/);
  assert.match(hub, /FEATURED_COUNT = 7/);
  assert.match(hub, /Featured Projects/);
  assert.match(hub, /精选项目/);
  assert.doesNotMatch(hub, /SHOWCASE_PROJECTS/);
  assert.doesNotMatch(hub, /Recent Projects/);
});

test("pickFeaturedProjects returns seven unique items from the catalog", () => {
  const sequence = [0.1, 0.8, 0.3, 0.95, 0.2, 0.55, 0.4, 0.7, 0.15, 0.6];
  let index = 0;
  const random = () => sequence[index++ % sequence.length];
  const picked = pickFeaturedProjects(content.projects, 7, random);
  assert.equal(picked.length, 7);
  const urls = picked.map((item) => item.url);
  assert.equal(new Set(urls).size, 7);
  for (const item of picked) {
    assert.ok(content.projects.includes(item));
  }
});

test("Featured Projects layout uses a lead story and a three-column grid", () => {
  assert.match(hub, /styles\.featuredLead/);
  assert.match(hub, /styles\.featuredGrid/);
  assert.match(hub, /project\.board/);
  assert.match(hub, /project\.excerpt/);
  assert.match(hubCss, /\.featuredLead\s*{[^}]*grid-template-columns:\s*minmax\(0, 1\.15fr\) minmax\(0, 0\.85fr\)/s);
  assert.match(hubCss, /\.featuredGrid\s*{[^}]*grid-template-columns:\s*repeat\(3/s);
  assert.match(hubCss, /\.featuredCardExcerpt\s*{[^}]*-webkit-line-clamp:\s*4/s);
});
