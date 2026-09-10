import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./site-header.js", import.meta.url), "utf8");

test("language options share fixed dimensions and centered labels", () => {
  const toggle = source.slice(source.indexOf("function LangToggle()"), source.indexOf("const PLAYGROUND_ITEMS"));
  const options = [...toggle.matchAll(/<span\s+className=\{`([^$]+)\$\{/g)].map((match) => match[1].trim());
  assert.equal(options.length, 2);
  assert.equal(options[0], options[1]);
  for (const option of options) {
    for (const token of ["inline-flex", "h-6", "w-11", "shrink-0", "items-center", "justify-center"]) {
      assert.ok(option.split(/\s+/).includes(token), `Language option includes ${token}`);
    }
  }
});
