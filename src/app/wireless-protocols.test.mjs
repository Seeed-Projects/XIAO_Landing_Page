import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BOARD_SPECS, FILTER_GROUPS } from "./products/board-specs.mjs";
import { getWirelessProtocols, WIRELESS_PROTOCOLS } from "./products/wireless-protocols.mjs";

test("icon-only wireless badges map every connectivity option to an accessible name and official logo in display order", () => {
  assert.deepEqual(
    WIRELESS_PROTOCOLS.map(({ id, label }) => [id, label]),
    [["wifi", "Wi-Fi"], ["ble", "Bluetooth LE"], ["thread", "Thread"], ["zigbee", "Zigbee"], ["matter", "Matter"], ["nfc", "NFC"]]
  );
  const connectivity = FILTER_GROUPS.find(({ id }) => id === "connectivity");
  assert.deepEqual(WIRELESS_PROTOCOLS.map(({ id }) => id).sort(), connectivity.options.map(({ id }) => id).sort());
  assert.equal(new Set(WIRELESS_PROTOCOLS.map(({ path }) => path)).size, 6);
  for (const { path, source } of WIRELESS_PROTOCOLS) {
    const svg = readFileSync(new URL(`../../design/wireless-logos/${source}`, import.meta.url), "utf8");
    const originalPaths = [...svg.matchAll(/\bd="([^"]+)"/g)].map(([, d]) => d.trim());
    if (source === "wifi.svg") {
      assert.equal(path, originalPaths.join(" "));
    } else if (source === "matter.svg") {
      const original = originalPaths[0];
      assert.equal(path, original.slice(original.indexOf("M65.715"), original.indexOf("M337.063")) + original.slice(original.indexOf("M37.161")));
    } else {
      assert.ok(originalPaths.includes(path), `${source} retains its original path geometry`);
    }
  }
});

test("wireless badges follow display order for boards and omit boards without connectivity", () => {
  const labels = (name) => getWirelessProtocols(BOARD_SPECS[name].connectivity).map(({ label }) => label);
  assert.deepEqual(labels("XIAO ESP32-C3"), ["Wi-Fi", "Bluetooth LE"]);
  assert.deepEqual(labels("XIAO ESP32-C6"), ["Wi-Fi", "Bluetooth LE", "Thread", "Zigbee", "Matter"]);
  assert.deepEqual(labels("XIAO nRF54L15 Sense"), ["Bluetooth LE", "Thread", "Zigbee", "Matter", "NFC"]);
  assert.deepEqual(labels("XIAO nRF52840 Plus"), ["Bluetooth LE", "NFC"]);
  assert.deepEqual(labels("XIAO SAMD21"), []);
  assert.deepEqual(getWirelessProtocols(), []);
  assert.deepEqual(getWirelessProtocols(["nfc", "wifi", "wifi", "unknown"]).map(({ id }) => id), ["wifi", "nfc"]);
});

test("white wireless logos retain the specified fills and at least 3:1 graphical contrast", () => {
  const luminance = (hex) => hex.slice(1).match(/../g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  for (const { label, color } of WIRELESS_PROTOCOLS) {
    assert.ok(1.05 / (luminance(color) + 0.05) >= 3, `${label} logo contrast`);
  }
  const colors = Object.fromEntries(WIRELESS_PROTOCOLS.map(({ id, color }) => [id, color]));
  assert.deepEqual(colors, { wifi: "#146B58", ble: "#0082FC", thread: "#865022", zigbee: "#EB0443", matter: "#7151A8", nfc: "#002E5F" });
  assert.equal(new Set(Object.values(colors)).size, 6);
});
