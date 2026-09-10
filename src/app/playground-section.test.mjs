import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { playgroundBoards } from "./playground-boards.mjs";

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

test("eight distinct board assets are available and keep stable positions", () => {
  assert.equal(playgroundBoards.length, 8);
  assert.equal(new Set(playgroundBoards.map(board => board.id)).size, 8);
  for (const board of playgroundBoards) {
    assert.ok(existsSync(new URL(`../../public/home/playground-boards/${board.id}.webp`, import.meta.url)));
    assert.ok(board.x >= 20 && board.x <= 79);
    assert.ok(board.y >= 17 && board.y <= 79);
  }
  assert.doesNotMatch(preview, /Math.random|Date.now|playground_home.png/);
  assert.doesNotMatch(section, />\\u[0-9a-f]{4}</i);
  assert.match(section, /<PlaygroundToolIcon type=\{tool.icon\}/);
});

test("the main visual receives the wide column with normal document flow", () => {
  assert.match(css, /grid-template-columns: minmax\(0, 2.1fr\) minmax\(300px, 1fr\)/);
  assert.doesNotMatch(css, /grid-template-columns: minmax\(0, 0.8fr\) minmax\(0, 1.8fr\)/);
  assert.match(css, /\.playground-board img \{[^}]*width: 100%;[^}]*height: auto;/s);
  assert.match(css, /width: clamp\(80px, 9vw, 120px\)/);
});

test("floating replays on entry and supports reduced motion", () => {
  assert.match(preview, /setVisible\(entry.isIntersecting\)/);
  assert.match(preview, /observer.disconnect\(\)/);
  assert.match(css, /data-visible="true"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.home-playground-preview/);
  assert.match(css, /\.playground-board-float \{ animation: none; \}/);
});

test("board selection exposes keyboard and touch accessible state", () => {
  assert.match(preview, /type="button"/);
  assert.match(preview, /aria-pressed=\{selected === board.id\}/);
  assert.match(preview, /setSelected\(selected === board.id \? null : board.id\)/);
  assert.match(preview, /event.key === "Escape"/);
  assert.match(css, /\.playground-board:focus-visible/);
});
