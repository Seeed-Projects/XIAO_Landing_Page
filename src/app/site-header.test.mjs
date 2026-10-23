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
  const underlineClass = source.match(/DESKTOP_NAV_UNDERLINE_CLASS\s*=\s*\n?\s*"([^"]+)"/)?.[1] || "";
  for (const token of ["after:absolute", "after:bottom-0.5", "after:left-1/2", "after:h-0.5", "after:w-7", "after:-translate-x-1/2", "after:rounded-full", "after:bg-[var(--button-bg)]", "after:content-['']"]) {
    assert.ok(underlineClass.split(" ").includes(token), `Missing underline style: ${token}`);
  }
  assert.doesNotMatch(underlineClass, /bg-white|shadow/);
});

test("Playground label does not add extra leading space before its dropdown arrow", () => {
  const playgroundLink = source.match(/<Link href=\{item\.href\}[^\n]*className=\{`([^`]+)`\} aria-current=\{isActive\(item\.href\)/)?.[1] || "";
  const playgroundButton = source.match(/<button[^\n]*aria-label="Open Playground menu"[^\n]*className="([^"]+)"/)?.[1] || "";
  assert.match(playgroundLink, /\brelative\b/);
  assert.doesNotMatch(playgroundLink, /\bp[lr]-/);
  assert.match(playgroundButton, /\bml-1\b/);
  assert.match(playgroundButton, /\bw-8\b/);
});

test("Playground underlines its label while the wrapper colors both label and arrow", () => {
  const playground = source.slice(source.indexOf('item.key === "playground"'), source.indexOf("{pgOpen &&"));
  const wrapperClass = playground.match(/<div className=\{`([^`]+)`\}/)?.[1] || "";
  const linkClass = playground.match(/<Link[^\n]*className=\{`([^`]+)`\}/)?.[1] || "";
  const activeClass = source.match(/DESKTOP_NAV_ACTIVE_CLASS\s*=\s*\n?\s*"([^"]+)"/)?.[1] || "";
  assert.equal(activeClass, "text-[var(--brand-blue)]");
  assert.match(wrapperClass, /DESKTOP_NAV_ACTIVE_CLASS/);
  assert.doesNotMatch(wrapperClass, /DESKTOP_NAV_UNDERLINE_CLASS|after:/);
  assert.match(linkClass, /isActive\(item\.href\) \? DESKTOP_NAV_UNDERLINE_CLASS : ""/);
  assert.match(source, /\$\{DESKTOP_NAV_ACTIVE_CLASS\} \$\{DESKTOP_NAV_UNDERLINE_CLASS\}/);
});
