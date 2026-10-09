import assert from "node:assert/strict";
import test from "node:test";
import { readSectionDirectory, SECTION_TARGETS } from "./section-directory.mjs";

function heading(text, label = null) {
  return { textContent: text, matches: () => true, getAttribute: () => label };
}

function root(elements) {
  return { getElementById: (id) => elements[id] ?? null };
}

test("every configured anchor uses its exact current heading in both languages", () => {
  for (const [path, ids] of Object.entries(SECTION_TARGETS)) {
    assert.equal(new Set(ids).size, ids.length);
    for (const lang of ["en", "zh"]) {
      const elements = Object.fromEntries(ids.map((id) => [id, {
        matches: () => false,
        querySelector: () => heading(`${lang}: ${id}`),
      }]));
      assert.deepEqual(readSectionDirectory(`${path}/`, root(elements)), ids.map((id) => ({ id, label: `${lang}: ${id}` })));
    }
  }
});

test("hero artwork uses its accessible title and nested heading whitespace is normalized", () => {
  const elements = {
    hero: { matches: () => false, querySelector: () => heading("", "Seeed Studio XIAO") },
    intro: { matches: () => false, querySelector: () => heading(" About Seeed\n Studio XIAO ") },
  };
  assert.deepEqual(readSectionDirectory("/", root(elements)), [
    { id: "hero", label: "Seeed Studio XIAO" },
    { id: "intro", label: "About Seeed Studio XIAO" },
  ]);
});

test("missing and merged sections are omitted; existing pages keep their rail scope", () => {
  assert.deepEqual(readSectionDirectory("/", root({ intro: { matches: () => false, querySelector: () => null } })), []);
  assert.ok(!SECTION_TARGETS["/"].includes("features"));
  for (const path of ["/playground", "/playground/pinout", "/playground/esp-flasher", "/software-center/micropython"]) {
    assert.deepEqual(readSectionDirectory(path, root({})), []);
  }
});

test("board selection and translated titles are read fresh", () => {
  const board = heading("XIAO ESP32-S3");
  const elements = root({ resources: board });
  assert.equal(readSectionDirectory("/res", elements)[0].label, "XIAO ESP32-S3");
  board.textContent = "XIAO RP2350";
  assert.equal(readSectionDirectory("/res", elements)[0].label, "XIAO RP2350");
  const community = heading("Built by the community");
  const software = root({ community });
  assert.equal(readSectionDirectory("/software-center", software)[0].label, "Built by the community");
  community.textContent = "\u793e\u533a\u5171\u5efa\u7684\u751f\u6001\u5899";
  assert.equal(readSectionDirectory("/software-center", software)[0].label, community.textContent);
});
