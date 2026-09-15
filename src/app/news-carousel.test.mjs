import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./news-carousel.js", import.meta.url), "utf8");

test("news autoplay starts as soon as the news section enters the viewport", () => {
  assert.match(source, /viewport\.closest\("#news"\) \|\| viewport/);
  assert.match(source, /\{ threshold: 0 \}/);
  assert.match(source, /observer\.observe\(section\)/);
});
