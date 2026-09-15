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

test("desktop page navigation keeps equal visual gaps and stable item geometry", () => {
  const desktopNav = source.match(/<nav className="([^"]*gap-\[clamp[^"]*)">/)?.[1] || "";
  assert.match(desktopNav, /min-\[860px\]:flex/);
  assert.match(desktopNav, /gap-\[clamp\(18px,2vw,32px\)\]/);
  assert.doesNotMatch(desktopNav, /grid-cols/);
  assert.match(source, /DESKTOP_NAV_ITEM_CLASS\s*=\s*\n?\s*"[^"]*h-10[^"]*shrink-0[^"]*font-medium/);
  assert.doesNotMatch(source, /isActive\(item\.href\)[^\n]*font-(?:medium|semibold|bold)/);
});

test("desktop active navigation uses a lightweight underline without a pill", () => {
  const activeClass = source.match(/DESKTOP_NAV_ACTIVE_CLASS\s*=\s*\n?\s*"([^"]+)"/)?.[1] || "";
  assert.match(activeClass, /after:w-7/);
  assert.match(activeClass, /after:bg-\[var\(--button-bg\)\]/);
  assert.doesNotMatch(activeClass, /bg-white|shadow/);
});

test("Playground label does not add extra leading space before its dropdown arrow", () => {
  const playgroundLink = source.match(/<Link href=\{item\.href\}[\s\S]*?className="([^"]+)" aria-current=\{isActive\(item\.href\)/)?.[1] || "";
  assert.doesNotMatch(playgroundLink, /\bpl-/);
  assert.match(playgroundLink, /\bpr-1\b/);
});
