import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { communityGroups, SOFTWARE_CATEGORIES, slugify, findSoftwareBySlug } from "./software-data.js";
import { logoLoopLayout } from "./logo-loop.mjs";

test("three task groups preserve every community entry and detail route once", () => {
  const original = SOFTWARE_CATEGORIES.filter(({ id }) => id !== "official" && id !== "guides").flatMap(({ items }) => items);
  const groups = communityGroups();
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map(({ items }) => items.length), [13, 10, 11]);
  const slugs = groups.flatMap(({ items }) => items.map(({ name }) => slugify(name)));
  assert.deepEqual([...slugs].sort(), original.map(({ name }) => slugify(name)).sort());
  assert.equal(new Set(slugs).size, original.length);
  for (const slug of slugs) assert.ok(findSoftwareBySlug(slug), slug);
  for (const group of groups) {
    for (const lang of ["en", "zh"]) {
      assert.ok(group.title[lang]);
      assert.ok(group.desc[lang]);
    }
  }
});

test("both directions cover the viewport throughout every loop with constant speed", () => {
  for (const width of [320, 390, 768, 1440, 1760, 1761, 2560, 3840, 5120]) {
    for (const sequence of [90, 1440, 1760]) {
      for (const speed of [25, 28]) {
        const { repeats, duration, ready } = logoLoopLayout(width, sequence, speed);
        const half = repeats * sequence;
        assert.equal(ready, true);
        assert.ok(half >= width);
        assert.ok(Math.abs(half / duration - speed) < 0.00001);
        for (const progress of [0, 0.25, 0.5, 0.99, 1]) {
          for (const offset of [-half * progress, -half * (1 - progress)]) {
            assert.ok(offset <= 0);
            assert.ok(offset + half * 2 >= width);
          }
        }
      }
    }
  }
});

test("unmeasured and empty rows have a stable initial layout", () => {
  for (const args of [[0, 0], [1440, 0], [0, 1760], [1440, 1760, 0]]) {
    assert.deepEqual(logoLoopLayout(...args), { repeats: 1, duration: 60, ready: false });
  }
});

test("the hero is introductory content without a numeric stat panel", () => {
  const page = readFileSync(new URL("./page.js", import.meta.url), "utf8");
  assert.match(page, /ToolPageIntro/);
  assert.doesNotMatch(page, /styles\.stat|<dl/);
});
