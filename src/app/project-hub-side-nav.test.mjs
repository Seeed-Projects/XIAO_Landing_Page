import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./project-hub/page.js");
const hub = read("./project-hub/projectHub.js");
const side = read("./side-directory.js");
const directory = read("./section-directory.mjs");
const bake = readFileSync(new URL("../../scripts/bake-project-hub-embed.js", import.meta.url), "utf8");

test("Project Hub top anchor sits on the hero, not a page-wide wrapper", () => {
  assert.doesNotMatch(page, /id="top"/);
  assert.match(hub, /className=\{`\$\{styles\.projectIntro\} scroll-mt-24`\} id="top"/);
  assert.match(hub, /id="featured-projects"/);
  assert.match(hub, /id="collection"/);
});

test("Side rail reads current section headings from the rendered page", () => {
  assert.match(side, /readSectionDirectory\(pathname, document\)/);
  assert.match(directory, /heading\?\.textContent/);
  assert.match(directory, /getAttribute\("aria-label"\)/);
});

test("Side rail labels match the Project Hub section titles", () => {
  assert.match(directory, /"\/project-hub": \["top", "featured-projects", "collection"\]/);
  assert.match(hub, /featuredTitle: "Featured Projects"/);
  assert.match(hub, /collectionTitle: "Explore every project"/);
  assert.match(hub, /featuredTitle: "精选项目"/);
  assert.match(hub, /collectionTitle: "浏览全部项目"/);
});

test("Side directory prefers the section nearest the focus band", () => {
  assert.match(side, /innerHeight \* 0\.45/);
  assert.match(side, /boundingClientRect\.top/);
});

test("Explore every project embeds the baked OSHW XIAO Series hub", () => {
  assert.match(hub, /HUB_EMBED = "\/project-hub-embed\.html"/);
  assert.match(hub, /xiao-project-hub-height/);
  assert.match(bake, /seeed-studio\.github\.io\/OSHW-XIAO-Series\//);
  assert.match(bake, /xiao-project-hub-height/);
  assert.match(bake, /#like-status\{display:none/);
  assert.match(bake, /submission-config\.json',\s*'\$\{HUB_URL\}'/);
});
