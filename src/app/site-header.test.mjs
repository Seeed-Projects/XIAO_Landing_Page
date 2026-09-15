import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./site-header.js", import.meta.url), "utf8");

test("language options share fixed dimensions and centered labels", () => {
  const toggle = source.slice(source.indexOf("function LangToggle()"), source.indexOf("const PLAYGROUND_ITEMS"));
  for (const token of ["grid", "h-8", "w-[100px]", "grid-cols-2"]) {
    assert.match(toggle, new RegExp(token.replace(/[\[\]]/g, "\\$&")));
  }
  assert.equal((toggle.match(/LANGUAGE_OPTION_CLASS/g) || []).length, 2);
  assert.match(source, /LANGUAGE_OPTION_CLASS\s*=\s*\n?\s*"[^"]*h-full[^"]*w-full[^"]*items-center[^"]*justify-center/);
  assert.doesNotMatch(toggle, /gap-[^\s"]+|\sp-[^\s"]+/);
});

test("desktop page navigation uses five equal columns and stable item geometry", () => {
  const desktopNav = source.match(/<nav className="([^"]*grid-cols-5[^"]*)">/)?.[1] || "";
  assert.match(desktopNav, /grid-cols-5/);
  assert.match(desktopNav, /max-w-\[660px\]/);
  assert.match(source, /DESKTOP_NAV_ITEM_CLASS\s*=\s*\n?\s*"[^"]*h-9[^"]*w-full[^"]*font-medium/);
  assert.doesNotMatch(source, /isActive\(item\.href\)[^\n]*font-(?:medium|semibold|bold)/);
});
