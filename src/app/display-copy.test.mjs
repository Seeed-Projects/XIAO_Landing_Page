import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("development board catalog uses the concise category title", () => {
  const source = readSource("./products/catalog.js");
  assert.match(source, /label: "XIAO Dev Boards"/);
  assert.match(source, /labelEn: "XIAO Dev Boards"/);
});

test("pinout model labels use the complete nRF54LM20A name", () => {
  const source = readSource("./products/pinout.js");
  assert.equal((source.match(/name: "XIAO nRF54LM20A"/g) || []).length, 2);
  assert.match(source, /figureLabel: \["XIAO", "nRF54LM20A"\]/);
});

test("roadmap invitation invites developers to shape the next XIAO", () => {
  const source = readSource("./home-ppt-sections.js");
  assert.match(source, /Developers, join us and shape the next XIAO!/);
  assert.match(source, /<TypewriterText key=\{lang\}/);
});
