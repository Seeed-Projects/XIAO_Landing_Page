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

test("twenty-two distinct board assets cover the supplied XIAO series", () => {
  assert.equal(playgroundBoards.length, 22);
  assert.equal(new Set(playgroundBoards.map(board => board.id)).size, 22);
  for (const board of playgroundBoards) {
    assert.ok(existsSync(new URL(`../../public/home/playground-boards/${board.id}.webp`, import.meta.url)));
    assert.ok(board.x >= 20 && board.x <= 79);
    assert.ok(board.y >= 17 && board.y <= 79);
  }
  assert.doesNotMatch(preview, /Math.random|Date.now|playground_home.png/);
  assert.doesNotMatch(section, />\\u[0-9a-f]{4}</i);
  assert.match(section, /<PlaygroundToolIcon type=\{tool.icon\}/);
});

test("the tool hub stays centered while boards occupy a separate surrounding layer", () => {
  assert.match(section, /className="home-playground-hub"/);
  assert.match(css, /\.home-playground-panel \{[^}]*justify-content: center/s);
  assert.match(css, /\.home-playground-preview \{[^}]*position: absolute;[^}]*pointer-events: none/s);
  assert.match(css, /width: min\(560px, calc\(100% - 340px\)\)/);
  assert.match(css, /\.home-playground \{[^}]*width: 100vw;[^}]*max-width: none;[^}]*margin-inline: calc\(50% - 50vw\)/s);
  assert.match(css, /\.playground-board img \{[^}]*width: 100%;[^}]*height: auto;/s);
  assert.match(css, /width: clamp\(64px, 6.2vw, 90px\)/);
});

test("floating replays on entry and supports reduced motion", () => {
  assert.match(preview, /setVisible\(entry.isIntersecting\)/);
  assert.match(preview, /observer.disconnect\(\)/);
  assert.match(css, /data-visible="true"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.home-playground-preview/);
  assert.match(css, /\.playground-board-float \{ animation: none; \}/);
  assert.match(css, /\.playground-board-entry \{ animation: none; \}/);
  assert.match(preview, /preference.addEventListener\("change", updateMotion\)/);
  assert.match(preview, /inView && !preference.matches/);
  assert.match(preview, /controller.dispose\(\)/);
  assert.match(preview, /resize.disconnect\(\)/);
  assert.match(preview, /removeEventListener\("scroll", onScroll\)/);
  assert.match(preview, /preference.matches \? 1 : orbitProgress/);
});

test("board selection exposes keyboard and touch accessible state", () => {
  assert.match(preview, /type="button"/);
  assert.match(preview, /aria-pressed=\{selected === board.id\}/);
  assert.match(preview, /setSelected\(selected === board.id \? null : board.id\)/);
  assert.match(preview, /event.key === "Escape"/);
  assert.match(css, /\.playground-board:focus-visible/);
});

test("circuit texture stays decorative and preserves the navy surface", () => {
  const texture = css.match(/\.home-playground-section::before \{([^}]+)\}/)[1];
  assert.match(texture, /pointer-events: none/);
  assert.match(texture, /position: absolute/);
  assert.match(texture, /data:image\/svg\+xml/);
  assert.match(texture, /background-size: 280px 280px/);
  assert.match(texture, /opacity: 0\.65/);
  assert.match(css, /\.home-playground-section \{[^}]*#0b1c27/s);
});
