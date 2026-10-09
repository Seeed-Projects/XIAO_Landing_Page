import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./co-create-section.js", import.meta.url), "utf8");

test("co-create projects stay expanded after the first interaction", () => {
  assert.match(source, /const \[expanded, setExpanded\] = useState\(false\)/);
  assert.match(source, /const openProjects = \(\) => setExpanded\(true\)/);
  assert.match(source, /onMouseEnter=\{openProjects\}/);
  assert.match(source, /onFocusCapture=\{openProjects\}/);
  assert.doesNotMatch(source, /setExpanded\(false\)|onMouseLeave|onBlurCapture|closeTimer/);
});

test("scale-up projects follow the curated order and destinations", () => {
  const projects = [
    ["ESP-FLY DIY Micro Drone Kit by Max Imagination", "https://www.seeedstudio.com/ESP-FLY-co-create-p-6744.html"],
    ["OpenUC2 10x AI Microscope by OpenUC2", "https://www.seeedstudio.com/XIAO-Microscope-p-5971.html"],
    ["XIAO PowerBread Breadboard Power Supply and Meter by Nicho D", "https://www.seeedstudio.com/XIAO-PowerBread-p-6318.html"],
    ["XIAO Logger HAT for Temperature, Humidity and Light by Marcel", "https://www.seeedstudio.com/XIAO-LOG-p-6341.html"],
    ["Fusion DIY XIAO Mechanical Keyboards", "https://www.seeedstudio.com/blog/2022/12/02/seeed-fusion-diy-xiao-mechanical-keyboard-contest-is-closed-the-winners-are/"],
  ];

  let previousIndex = -1;
  for (const [title, href] of projects) {
    const index = source.indexOf(`title: "${title}", href: "${href}"`);
    assert.ok(index > previousIndex, `${title} should appear in the requested order`);
    previousIndex = index;
  }
});

test("scale-up project names use the section description type size", () => {
  assert.match(source, /<h4 className="home-type-body mt-4 font-semibold text-\[#18224f\]">/);
});

test("expanded projects fit one, two, and five-column layouts", () => {
  assert.match(source, /max-h-\[2600px\].*sm:max-h-\[1900px\].*lg:max-h-\[900px\]/);
});
