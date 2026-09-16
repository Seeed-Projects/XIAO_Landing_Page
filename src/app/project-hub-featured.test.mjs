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

test("Featured Projects renders one card recipe with one identical CTA per card", () => {
  assert.match(hub, /function ProjectCard\(/);
  assert.match(hub, /featured\.map\(\(project, index\) => \(\s*<ProjectCard/s);
  assert.match(hub, /lead=\{index === 0\}/);
  assert.match(hub, /project\.board/);
  assert.match(hub, /project\.excerpt/);
  // Every card carries the shared filled CTA; no text-only variant remains.
  assert.equal((hub.match(/home-primary-cta/g) || []).length, 2);
  assert.doesNotMatch(hub, /home-text-action/);
  assert.doesNotMatch(hub, /styles\.featuredLead\b/);
});

test("Featured Projects shows whole images and spans four columns on desktop", () => {
  assert.match(hubCss, /\.projectMediaImage\s*{[^}]*object-fit:\s*contain/s);
  assert.match(hubCss, /\.projectMediaBackdrop\s*{[^}]*filter:\s*blur/s);
  assert.match(hubCss, /\.projectMedia\s*{[^}]*aspect-ratio:\s*16 \/ 10/s);
  assert.match(hubCss, /\.featuredGrid\s*{[^}]*grid-template-columns:\s*repeat\(4/s);
  assert.match(hubCss, /\.projectCardLead\s*{[^}]*grid-column:\s*span 2/s);
  assert.match(hubCss, /\.projectExcerpt\s*{[^}]*-webkit-line-clamp:\s*2/s);
  assert.match(hubCss, /\.featuredSection\s*{[^}]*width:\s*min\(100% - 48px, 1695px\)/s);
});
