import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("./home-carousel.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./home-carousel.module.css", import.meta.url), "utf8");
const page = readFileSync(new URL("./page.js", import.meta.url), "utf8");

test("home hero presents the requested message and Products action", () => {
  assert.match(component, /title: "Seeed Studio XIAO"/);
  assert.match(component, /The smallest dev platform\. The biggest/);
  assert.match(component, /possibilities\./);
  assert.match(component, /description: "The smallest dev platform\. The biggest possibilities\."/);
  assert.doesNotMatch(component, /description:\s*\([\s\S]*?<br \/>/);
  assert.match(component, /ctaLabel: "Explore"/);
  assert.match(component, /ctaHref: "\/products\/"/);
  assert.match(component, /href=\{withBase\(slide\.ctaHref\)\}/);
  assert.match(component, /styles\.heroTitleVisible/);
  assert.match(component, /<h1[\s\S]*?styles\.heroTitle[\s\S]*?home-type-hero-title/);
  assert.match(component, /aria-label=\{slide\.title\}/);
  assert.match(component, /hero-title-cinematic\.png/);
  assert.match(component, /hero-title-cinematic-mobile\.png/);
  assert.match(component, /<p className="home-type-subtitle">\{slide\.description\}<\/p>/);
  assert.doesNotMatch(page, /<h1 className="sr-only">Seeed Studio XIAO<\/h1>/);
});

test("home hero uses generated cinematic artwork while retaining an accessible heading", () => {
  assert.match(component, /<picture className=\{styles\.heroTitleArtwork\}>/);
  assert.match(component, /alt=""\s+aria-hidden="true"/);
  assert.match(css, /--hero-title-left: 4vw;/);
  assert.match(css, /--hero-title-width: 75vw;/);
  assert.match(css, /--hero-copy-left: 9\.75vw;/);
  assert.match(css, /\.heroContent \{[^}]*left: var\(--hero-copy-left\);[^}]*width: calc\(100% - var\(--hero-copy-left\)\);/);
  assert.match(css, /\.heroTitle \{[^}]*left: var\(--hero-title-left\);[^}]*width: var\(--hero-title-width\);[^}]*mix-blend-mode: screen;/);
});

test("home hero copy remains readable and responsive", () => {
  assert.match(css, /\.heroContent \{[\s\S]*?z-index: 2;[\s\S]*?color: #fff;/);
  assert.match(css, /\.slide::after \{[\s\S]*?background: linear-gradient/);
  assert.match(css, /\.heroCta \{[\s\S]*?border-radius: 999px;[\s\S]*?background: var\(--button-bg\);/);
  assert.match(css, /\.heroCta \{[\s\S]*?color: #fff;/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?height: max\(540px, calc\(75svh - 64px\)\);/);
  assert.match(css, /\.heroCta:focus-visible \{[\s\S]*?outline: 3px solid #fff;/);
});

test("home hero copy follows the title alignment with compact spacing", () => {
  assert.match(css, /\.heroContent \{[\s\S]*?left: var\(--hero-copy-left\);[\s\S]*?width: calc\(100% - var\(--hero-copy-left\)\);[\s\S]*?transform: none;/);
  assert.match(css, /\.heroContent p \{[\s\S]*?margin: 0;/);
  assert.match(css, /\.heroCta \{[\s\S]*?min-width: 180px;[\s\S]*?min-height: 52px;[\s\S]*?margin-top: 34px;/);
});

test("home hero title is oversized, fades into the image and replays on re-entry", () => {
  assert.match(component, /new IntersectionObserver/);
  assert.match(component, /setHeroVisible\(entry\.isIntersecting\)/);
  assert.match(css, /\.heroTitle \{[\s\S]*?linear-gradient\(\s*180deg/);
  assert.match(css, /\.heroTitle \{[\s\S]*?mask-image: linear-gradient/);
  assert.match(css, /mask-image: linear-gradient\([^;]*#000 66\.667%[^;]*transparent 100%/);
  assert.match(css, /\.heroTitleVisible \{[\s\S]*?opacity: 1;[\s\S]*?filter: blur\(0\);/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.heroTitle \{[\s\S]*?opacity: 1;/);
});
