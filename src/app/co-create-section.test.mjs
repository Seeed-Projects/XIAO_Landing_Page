import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./co-create-section.js", import.meta.url), "utf8");

test("co-create projects stay expanded after the first interaction", () => {
  assert.match(source, /const \[expanded, setExpanded\] = useState\(false\)/);
  assert.match(source, /const openProjects = \(\) => setExpanded\(true\)/);
  assert.match(source, /onMouseEnter=\{openProjects\}/);
  assert.match(source, /onFocusCapture=\{openProjects\}/);
  assert.doesNotMatch(source, /setExpanded\(false\)|onMouseLeave|onBlurCapture|closeTimer/);
});
