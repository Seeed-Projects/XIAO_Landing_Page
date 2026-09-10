import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { homepageSections } from "./site-data.js";
import { partnerLogoSizes, partnerLoop } from "./partner-marquee-layout.mjs";

const component = readFileSync(new URL("./partner-marquee.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

test("all three categories retain their partners and calibrated logo bounds", () => {
  assert.deepEqual(homepageSections.partnerGroups.map(group => group.partners.length), [6, 8, 7]);
  for (const group of homepageSections.partnerGroups) {
    for (const partner of group.partners) {
      const [width, height] = partnerLogoSizes[partner.name];
      assert.ok(width > 0 && width <= partnerLoop.slotWidth - 32, partner.name);
      assert.ok(height > 0 && height <= 64, partner.name);
      assert.equal(new URL(partner.url).protocol, "https:");
    }
  }
});

test("partner identities use the reviewed public brand names and destinations", () => {
  const names = homepageSections.partnerGroups.map(group => group.partners.map(partner => partner.name));
  assert.deepEqual(names, [
    ["Nordic Semiconductor", "Espressif Systems", "Raspberry Pi", "Microchip Technology", "Silicon Labs", "STMicroelectronics"],
    ["Arduino", "PlatformIO", "MicroPython", "CircuitPython", "Zephyr", "Matter", "EDGE AI FOUNDATION", "Edge Impulse"],
    ["Hackster.io", "CNX Software", "Instructables", "Hackaday", "Adafruit Industries", "SparkFun Electronics", "DigiKey"],
  ]);
  const foundation = homepageSections.partnerGroups[1].partners[6];
  assert.equal(foundation.url, "https://www.edgeaifoundation.org");
  assert.equal(new URL(foundation.logo).hostname, "www.edgeaifoundation.org");
  assert.deepEqual(Object.keys(partnerLogoSizes).sort(), names.flat().sort());
  assert.match(component, /data-long-name=\{partner.name.length > 15\}/);
  assert.match(css, /\.partner-brand\[data-long-name="true"\] \{ flex-direction: column;/);
});

test("identical track halves cover the widest rail throughout the seam", () => {
  for (const group of homepageSections.partnerGroups) {
    const cycle = group.partners.map(partner => partner.name);
    const half = Array.from({ length: partnerLoop.copiesPerHalf }, () => cycle).flat();
    const track = [...half, ...half];
    const halfWidth = half.length * partnerLoop.slotWidth;
    const maxRailWidth = 1808 - 96 - 208 - 24;
    assert.ok(halfWidth >= maxRailWidth);
    assert.deepEqual(track.slice(0, half.length), track.slice(half.length));
    assert.equal(track[half.length], cycle[0]);
    assert.equal(track[half.length - 1], cycle.at(-1));
    for (const progress of [0, 0.25, 0.99, 1]) {
      assert.ok(halfWidth * 2 - halfWidth * progress >= maxRailWidth);
    }
  }
});

test("motion and accessibility states preserve the original list", () => {
  assert.match(component, /new IntersectionObserver/);
  assert.match(component, /observer.disconnect\(\)/);
  assert.match(component, /loading="eager"/);
  assert.match(component, /aria-hidden=/);
  assert.match(component, /tabIndex=\{half !== 0 \|\| copy !== 0 \? -1/);
  assert.match(css, /\.partner-row\[data-visible="false"\] \.partner-track \{ animation-name: none; \}/);
  assert.match(css, /\.partner-window:hover \.partner-track \{ animation-play-state: paused; \}/);
  assert.match(css, /\.partner-window:has\(:focus-visible\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.partner-window/);
  assert.match(css, /\.partner-cycle\[data-copy="true"\] \{ display: none; \}/);
});
