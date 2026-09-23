import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DIAGRAM_IDS,
  FLAGSHIP_STORIES,
  MORE_OFFICIAL,
  officialRepoUrls,
} from "./official-stories.mjs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");

function bilingual(value, path) {
  assert.equal(typeof value?.en, "string", `${path}.en`);
  assert.equal(typeof value?.zh, "string", `${path}.zh`);
  assert.ok(value.en.trim(), `${path}.en empty`);
  assert.ok(value.zh.trim(), `${path}.zh empty`);
}

test("four flagship stories carry a complete bilingual narrative", () => {
  assert.equal(FLAGSHIP_STORIES.length, 4);
  const ids = new Set();
  const diagrams = new Set();
  for (const story of FLAGSHIP_STORIES) {
    assert.ok(story.id && !ids.has(story.id), story.id);
    ids.add(story.id);
    assert.ok(DIAGRAM_IDS.includes(story.diagram), story.id);
    assert.ok(!diagrams.has(story.diagram), story.diagram);
    diagrams.add(story.diagram);
    for (const key of ["eyebrow", "name", "lede", "problem", "what"]) {
      bilingual(story[key], `${story.id}.${key}`);
    }
    assert.notEqual(story.problem.en, story.problem.zh, story.id);
    assert.equal(story.steps.length, 3, story.id);
    for (const step of story.steps) bilingual(step, `${story.id}.step`);
    assert.ok(story.capabilities.length >= 1, story.id);
    for (const tag of story.capabilities) bilingual(tag, `${story.id}.capability`);
    assert.ok(story.boards.length >= 1, story.id);
    for (const board of story.boards) assert.ok(String(board).trim(), story.id);
    assert.ok(story.badges.length >= 1, story.id);
    for (const badge of story.badges) bilingual(badge, `${story.id}.badge`);
    assert.ok(story.links.length >= 1, story.id);
    for (const link of story.links) {
      bilingual(link.label, `${story.id}.link`);
      assert.match(link.href, /^https:\/\//, link.href);
    }
  }
  assert.equal(diagrams.size, DIAGRAM_IDS.length);
});

test("five more official rows cover nine GitHub repositories in total", () => {
  assert.equal(MORE_OFFICIAL.length, 5);
  for (const item of MORE_OFFICIAL) {
    bilingual(item.name, item.id);
    bilingual(item.summary, item.id);
    assert.ok(item.boards.length >= 1, item.id);
    assert.ok(item.links.length >= 1, item.id);
    for (const link of item.links) {
      bilingual(link.label, `${item.id}.link`);
      assert.match(link.href, /^https:\/\/github\.com\//, link.href);
    }
  }
  assert.equal(officialRepoUrls().length, 9);
});

test("the community wall drops official logos and counts boards", () => {
  const community = read("./CommunitySection.js");
  assert.match(community, /excludeCategory:\s*"official"/);
  assert.match(community, /item\.boards\.length/);
  assert.match(community, /home-type-title/);
  assert.match(community, /home-type-subtitle/);
  assert.match(community, /home-type-body/);
});
