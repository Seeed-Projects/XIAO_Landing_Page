import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const section = readFileSync(new URL("./home-ppt-sections.js", import.meta.url), "utf8").split("const PLAYGROUND_TOOLS")[1];
const preview = readFileSync(new URL("./playground-preview.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

test("all four tools target existing routes", () => {
  for (const route of ["/playground/pinout", "/res", "/software-center", "/playground/esp-flasher"]) {
    assert.ok(section.includes(`href: "${route}"`));
    assert.ok(existsSync(new URL(`.${route}/page.js`, import.meta.url)));
  }
  assert.match(section, /<Link key=\{tool.key\} href=\{tool.href\}/);
});

test("the preview caption is descriptive and tools provide direct navigation", () => {
  const caption = section.match(/<div className="home-playground-caption">([\s\S]*?)<\/div>/)[1];
  assert.doesNotMatch(caption, /<Link|<a\b/);
  assert.match(section, /<Link href="\/playground"/);
});

test("uses original artwork and renders arrows as string expressions", () => {
  assert.match(preview, /withBase\("\/home\/playground_home.png"\)/);
  assert.match(preview, /width="1774" height="887"/);
  assert.doesNotMatch(section, />\\u[0-9a-f]{4}</i);
  assert.match(section, /<PlaygroundToolIcon type=\{tool.icon\}/);
});

test("the main visual receives the wide column with normal document flow", () => {
  assert.match(css, /grid-template-columns: minmax\(0, 2.1fr\) minmax\(300px, 1fr\)/);
  assert.doesNotMatch(css, /grid-template-columns: minmax\(0, 0.8fr\) minmax\(0, 1.8fr\)/);
  assert.match(css, /\.home-playground-image \{[^}]*width: 100%;[^}]*height: auto;/s);
});

test("lighting replays on entry and supports reduced motion", () => {
  assert.match(preview, /setVisible\(entry.isIntersecting\)/);
  assert.match(preview, /observer.disconnect\(\)/);
  assert.match(css, /data-visible="true"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.home-playground-preview/);
  assert.match(css, /\.home-playground-pin-lights \{[^}]*pointer-events: none;/s);
});
