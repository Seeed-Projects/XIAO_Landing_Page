import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const intro = read("./tool-page-intro.js");
const introCss = read("./tool-page-intro.module.css");
const pinoutCss = read("./playground/pinout/pinout.module.css");
const flasher = read("./products/esp-flasher.js");
const flasherCss = read("./products/esp-flasher.module.css");
const resources = read("./res/resHub.js");
const courseCard = read("./res/CourseCard.js");
const resourcesCss = read("./res/res.module.css");
const software = read("./software-center/page.js");

test("tool page introductions use the shared page typography", () => {
  assert.match(intro, /className="home-type-hero-title"/);
  assert.match(intro, /className="home-type-body"/);
  assert.doesNotMatch(introCss, /--type-section-title/);
  assert.doesNotMatch(introCss, /font-size:\s*18px/);
  assert.doesNotMatch(pinoutCss, /#pinout p\)[^{]*{[^}]*font-size:/s);
});

test("the flasher preserves shared title, description and action roles", () => {
  assert.match(flasher, /pageTitle} home-type-hero-title/);
  assert.match(flasher, /stepTitle} home-type-subtitle/);
  assert.match(flasher, /stepHint} home-type-body/);
  assert.match(flasher, /primaryBtn}[^`]*home-type-action/);
  assert.doesNotMatch(flasherCss, /\.shell button\s*{[^}]*font:\s*inherit/s);
  assert.doesNotMatch(flasherCss, /\.stepHint\s*{[^}]*font-size:/s);
  assert.match(flasherCss, /\.primaryBtn\s*{[^}]*min-height:\s*48px/s);
  assert.match(flasherCss, /\.secondaryBtn\s*{[^}]*min-height:\s*48px/s);
  assert.match(flasherCss, /\.haLink\s*{[^}]*min-height:\s*48px/s);
});

test("the flasher presents its actions as one connected readable flow", () => {
  assert.match(flasher, /data-current={connected \? "0" : "1"}/);
  assert.match(flasher, /data-current={connected && flashStarted && !flashComplete \? "1" : "0"}/);
  assert.match(flasherCss, /grid-template-columns:\s*minmax\(560px, 1\.08fr\) minmax\(500px, 0\.92fr\)/);
  assert.match(flasherCss, /\.step:not\(:last-child\)::after/);
  assert.match(flasherCss, /animation:\s*step-flow 4\.8s linear infinite/);
  assert.match(flasherCss, /\.stepHead\s*{\s*display:\s*contents/);
  assert.match(flasherCss, /\.stepBody\s*{[^}]*grid-column:\s*2/s);
  assert.match(flasherCss, /\.stepIndex\s*{[^}]*font-family:\s*var\(--font-display\)/s);
  assert.doesNotMatch(flasherCss, /\.stepIndex\s*{[^}]*ui-monospace/s);
  assert.match(flasherCss, /prefers-reduced-motion:[\s\S]*\.step::after, \.stepIndex\s*{\s*animation:\s*none !important/);
});

test("the flasher derives the board from the detected chip and advances a three-step flow", () => {
  assert.match(flasher, /const \[boardId, setBoardId\] = useState\(""\)/);
  assert.match(flasher, /const connected = Boolean\(device\) && !\["idle", "error"\]\.includes\(phase\)/);
  assert.match(flasher, /ESP_BOARDS\.find\(\(item\) => item\.chip === info\.chip\)/);
  assert.match(flasher, /factBoard:[\s\S]*board\.name/);
  assert.doesNotMatch(flasher, /function selectBoard/);
  assert.doesNotMatch(flasher, /className={styles\.boardGrid}/);
  assert.equal((flasher.match(/<article[\s\S]*?className={styles\.step}/g) || []).length, 3);
  assert.match(flasher, /data-current={connected && !flashStarted \? "1" : "0"}/);
  assert.match(flasher, /data-done={flashComplete \? "1" : "0"}/);
});

test("the flasher refreshes firmware metadata and applies C5/C6 compatibility on connect", () => {
  assert.match(flasher, /createCompatibleEspLoader\(ESPLoader/);
  assert.match(
    flasher,
    /setBoardId\(matched\.id\);[\s\S]*currentFirmwares = await loadCurrentFirmwareCatalog\(\);[\s\S]*setFirmwareId/,
  );
});

test("software center uses one shared hierarchy for sections and cards", () => {
  assert.equal((software.match(/home-type-title/g) || []).length, 2);
  assert.equal((software.match(/home-type-subtitle/g) || []).length, 2);
  assert.equal((software.match(/home-type-body/g) || []).length, 2);
  assert.doesNotMatch(software, /text-3xl font-bold/);
  assert.doesNotMatch(software, /text-xl font-bold/);
  assert.doesNotMatch(software, /line-clamp-3 text-sm/);
});

test("resource headings and course cards use the shared hierarchy", () => {
  assert.match(resources, /resGroupHead[\s\S]*home-type-subtitle/);
  assert.match(resources, /extrasHead[\s\S]*home-type-title/);
  assert.match(resources, /extrasHead[\s\S]*home-type-body/);
  assert.match(courseCard, /courseTitle} home-type-subtitle/);
  assert.match(courseCard, /courseIntro} home-type-body/);
  assert.match(courseCard, /courseLink} home-type-action home-text-action/);
  assert.doesNotMatch(resourcesCss, /\.courseTitle\s*{[^}]*font-size:/s);
  assert.doesNotMatch(resourcesCss, /\.courseIntro\s*{[^}]*font-size:/s);
  assert.doesNotMatch(resourcesCss, /\.courseLink\s*{[^}]*font-size:/s);
});
