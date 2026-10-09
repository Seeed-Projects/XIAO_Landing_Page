import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("./site-footer.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

test("footer navigation uses a balanced ultrawide content bound", () => {
  const main = component.match(/<div className="site-footer-content([^\"]*)">/);
  assert.ok(main);
  assert.doesNotMatch(main[0], /max-w-/);
  assert.match(main[0], /py-16 lg:py-20/);
  assert.match(css, /\.site-footer-content \{\s*max-width: 1800px;\s*padding-inline: 24px;/);
  assert.match(css, /@media \(min-width: 1024px\)[\s\S]*?\.site-footer-content \{\s*padding-inline: clamp\(64px, 5vw, 128px\);/);
  assert.match(component, /lg:grid-cols-\[1\.5fr_1fr_1fr_0\.7fr_1\.3fr\]/);
});
