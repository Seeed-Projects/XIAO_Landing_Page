import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const page = read("./playground/page.js");
const css = read("./playground/playground.module.css");
const globals = read("./globals.css");
const intro = read("./tool-page-intro.js");
const introCss = read("./tool-page-intro.module.css");

test("Playground pinout preview ships a lightweight loop and matching poster", () => {
  const pinout = page.match(/key: "pinout",([\s\S]*?)key: "flash",/)?.[1];
  assert.ok(pinout, "Pinout tool is defined");
  const video = "/playground/pinout-preview.mp4";
  const poster = "/playground/pinout-preview.webp";
  assert.ok(pinout.includes(`video: "${video}"`));
  assert.ok(pinout.includes(`poster: "${poster}"`));
  for (const asset of [video, poster]) {
    assert.ok(existsSync(new URL(`../../public${asset}`, import.meta.url)), `Missing asset: ${asset}`);
  }
  const size = statSync(new URL(`../../public${video}`, import.meta.url)).size;
  assert.ok(size > 0 && size < 300_000, "Pinout loop fits the 300 KB budget");
});

test("Playground loop uses the shared playback controller and decorative video markup", () => {
  assert.match(page, /import \{ createStoryPlayback \} from "\.\.\/software-center\/story-playback\.mjs"/);
  const video = page.match(/<video\b[\s\S]*?\/>/)?.[0];
  assert.ok(video, "Loop video is rendered");
  for (const attribute of [/\bmuted\b/, /\bloop\b/, /\bplaysInline\b/, /preload="none"/, /aria-hidden="true"/]) {
    assert.match(video, attribute);
  }
  assert.doesNotMatch(video, /\bsrc=/);
  assert.match(video, /width="1280" height="800"/);
  assert.match(page, /tool\.video \? \(\s*<LoopPreview video=\{tool\.video\} poster=\{tool\.poster\}/);
});

test("Playground pinout loop fills its panel and keeps the full frame in stacked cards", () => {
  assert.match(css, /\.loopScreen\s*{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s);
  assert.match(css, /\.loopVideo\s*{[^}]*object-fit:\s*cover[^}]*object-position:\s*center 45%/s);
  assert.doesNotMatch(css, /min\(100%, 544px\)/);
  assert.match(css, /\.pinout \.toolPreview\s*{[^}]*min-height:\s*0[^}]*aspect-ratio:\s*1280 \/ 800/s);
});

test("Playground pinout preview uses its loop instead of the tool diagram", () => {
  assert.doesNotMatch(page, /s3-front\.svg/);
  assert.ok(existsSync(new URL("../../public/xiao-products/pinout/s3-front.svg", import.meta.url)));
});

test("Playground resource preview uses the five available file-type icons", () => {
  const files = page.match(/const RESOURCE_FILES = \[([\s\S]*?)\n\];/)?.[1];
  assert.ok(files, "RESOURCE_FILES is defined");
  const images = [...files.matchAll(/image:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(images, [
    "/res-generic/datasheet.webp",
    "/res-generic/schematic.webp",
    "/res-generic/pcb-source.webp",
    "/res-generic/dxf.webp",
    "/res-generic/3d-model.webp",
  ]);
  for (const image of images) {
    assert.match(image, /^\/res-generic\//);
    assert.ok(existsSync(new URL(`../../public${image}`, import.meta.url)), `Missing icon: ${image}`);
  }
  assert.doesNotMatch(page, /\/res-thumb\//);
});

test("Playground reuses the shared typography roles", () => {
  assert.match(page, /<ToolPageIntro\s+title="XIAO Playground"\s+description=/);
  assert.match(intro, /<Glow as="h1" className="home-type-hero-title">\{title\}<\/Glow>/);
  assert.match(page, /home-type-subtitle/);
  assert.match(page, /home-type-body/);
  assert.match(intro, /<p className="home-type-body">\{description\}<\/p>/);
  assert.match(page, /home-type-action home-filled-action/);
  assert.doesNotMatch(page, /Start with Pinout/);
  assert.doesNotMatch(page, /Open Web Flasher/);
  assert.match(page, /home-primary-cta/);
  assert.match(page, /XIAO ESP32 Series Web Flasher/);
});

test("Playground hero title stays on one line like Products", () => {
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(globals, /\.products-hero-title\s*{[^}]*white-space:\s*nowrap/s);
});

test("Playground intro centers its copy in the shared responsive container", () => {
  assert.match(page, /<ToolPageIntro\s+title="XIAO Playground"/);
  assert.match(intro, /<header className=\{styles\.intro\}/);
  assert.match(introCss, /\.intro\s*{[^}]*width:\s*min\(100% - 40px, 1280px\)[^}]*margin:\s*0 auto[^}]*text-align:\s*center/s);
  assert.match(introCss, /@media \(max-width: 640px\)\s*{\s*\.intro\s*{[^}]*width:\s*min\(100% - 32px, 900px\)/);
});

test("Playground CSS leaves shared text roles to the global type scale", () => {
  assert.doesNotMatch(introCss, /\.intro h1\s*{[^}]*font-size:/s);
  assert.doesNotMatch(introCss, /\.intro p\s*{[^}]*font-size:/s);
  assert.doesNotMatch(css, /\.toolContent :global\(\.home-type-subtitle\)\s*{[^}]*font-size:/s);
  assert.match(css, /@media \(min-width: 640px\)\s*{\s*\.toolContent :global\(\.home-type-body\)\s*{[^}]*font-size:\s*16px/s);
  assert.match(globals, /@media \(min-width: 640px\)\s*{\s*:root\s*{[^}]*--home-body-size:\s*16px/s);
  assert.doesNotMatch(css, /font-size: clamp\(32px, 3\.4vw, 56px\)/);
  assert.match(globals, /\.home-type-hero-title\s*{[^}]*font-size:\s*var\(--home-hero-title-size\)/s);
  assert.match(globals, /\.home-type-title\s*{[^}]*font-size:\s*var\(--home-title-size\)/s);
  assert.match(globals, /\.home-type-subtitle\s*{[^}]*font-size:\s*var\(--home-subtitle-size\)/s);
  assert.match(globals, /\.home-type-body,\s*\.home-type-action\s*{[^}]*font-size:\s*var\(--home-body-size\)/s);
});

test("Playground intro rhythm and tool buttons match the shared page patterns", () => {
  assert.match(introCss, /\.intro\s*{[^}]*padding:\s*clamp\(48px, 5vw, 64px\) 0 16px/s);
  assert.match(introCss, /\.intro p\s*{[^}]*margin:\s*16px auto 0/s);
  assert.match(introCss, /@media \(max-width: 640px\)\s*{\s*\.intro\s*{[^}]*padding-top:\s*32px/);
  assert.match(page, /<Link href=\{tool\.href\} className=\{`home-type-action home-filled-action home-primary-cta \$\{styles\.toolAction\}`\}/);
  assert.match(globals, /\.home-primary-cta\s*{[^}]*min-height:\s*48px[^}]*padding:\s*0\.75rem 1\.5rem[^}]*border-radius:\s*9999px/s);
});

test("Playground intro reserves the shared responsive height below the fixed header", () => {
  assert.match(css, /\.page\s*{[^}]*padding-top:\s*64px/s);
  assert.match(page, /<ToolPageIntro\s+title="XIAO Playground"/);
  assert.match(introCss, /\.intro\s*{[^}]*min-height:\s*var\(--page-intro-height\)/s);
  assert.match(globals, /:root\s*{[^}]*--page-intro-height:\s*296px/s);
  assert.match(globals, /@media \(min-width: 641px\) and \(max-width: 1023px\)\s*{\s*:root\s*{[^}]*--page-intro-height:\s*320px/);
  assert.match(globals, /@media \(max-width: 640px\)\s*{\s*:root\s*{[^}]*--page-intro-height:\s*400px/);
  assert.match(globals, /@media \(max-width: 374px\)\s*{\s*:root\s*{[^}]*--page-intro-height:\s*464px/);
});
