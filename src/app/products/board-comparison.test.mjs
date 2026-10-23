import assert from "node:assert/strict";
import test from "node:test";
import { BOARD_HARDWARE, BOARD_SPECS } from "./board-specs.mjs";
import { buildComparisonGroups } from "./board-comparison.mjs";

const board = (name) => ({ hardware: BOARD_HARDWARE[name], specs: BOARD_SPECS[name] });
const group = (groups, id) => groups.find((entry) => entry.id === id);

test("price is the first comparison group and follows the selected language", () => {
  const boards = [
    { price: { price: 4.99, currency: "USD" } },
    { price: { price: 5.2, currency: "USD" } },
  ];
  for (const [lang, label, values] of [
    ["en", "Price", ["$4.99", "$5.20"]],
    ["zh", "\u4ef7\u683c", ["US$4.99", "US$5.20"]],
  ]) {
    const [price] = buildComparisonGroups(boards, lang);
    assert.equal(price.id, "price");
    assert.equal(price.label, label);
    assert.equal(price.rows.length, 1);
    assert.equal(price.rows[0].label, label);
    assert.equal(price.rows[0].differs, true);
    assert.deepEqual(price.rows[0].cells, [
      { value: values[0], changed: false },
      { value: values[1], changed: true },
    ]);
  }
});

test("differences-only hides equal prices and retains prices that differ from the reference", () => {
  const a = { price: { price: 4.99, currency: "USD" } };
  const b = { price: { price: 7.99, currency: "USD" } };
  for (const lang of ["en", "zh"]) {
    assert.equal(group(buildComparisonGroups([a, a], lang, true), "price"), undefined);
    assert.equal(group(buildComparisonGroups([a, a], lang), "price").rows[0].differs, false);
    const [price] = buildComparisonGroups([a, b, a], lang, true);
    assert.equal(price.id, "price");
    assert.equal(price.rows[0].differs, true);
    assert.deepEqual(price.rows[0].cells.map((cell) => cell.changed), [false, true, false]);
  }
});

test("missing prices produce null cells and participate in reference differences", () => {
  const priced = { price: { price: 4.99, currency: "USD" } };
  const missing = { price: null };
  const [price] = buildComparisonGroups([priced, missing, {}], "en", true);
  assert.deepEqual(price.rows[0].cells, [
    { value: "$4.99", changed: false },
    { value: null, changed: true },
    { value: null, changed: true },
  ]);
  const [missingReference] = buildComparisonGroups([missing, priced], "en", true);
  assert.deepEqual(missingReference.rows[0].cells, [
    { value: null, changed: false },
    { value: "$4.99", changed: true },
  ]);
  assert.equal(group(buildComparisonGroups([missing, {}], "en", true), "price"), undefined);
});

test("hardware differences use the first selected board as the reference", () => {
  const groups = buildComparisonGroups([
    board("XIAO ESP32-C3"), board("XIAO ESP32-S3 Sense"), board("XIAO ESP32-C6"),
  ], "en", true);
  assert.deepEqual(group(groups, "flash").rows[0].cells, [
    { value: "4 MB", changed: false },
    { value: "8 MB", changed: true },
    { value: "4 MB", changed: false },
  ]);
  assert.equal(group(groups, "gpio"), undefined);
});

test("capabilities occupy aligned rows with explicit missing values", () => {
  const groups = buildComparisonGroups([
    board("XIAO ESP32-C3"), board("XIAO ESP32-S3 Sense"), board("XIAO ESP32-C6"),
  ], "en", true);
  const wireless = group(groups, "connectivity").rows;
  assert.deepEqual(wireless.map((row) => row.id), ["connectivity:matter", "connectivity:thread", "connectivity:zigbee"]);
  assert.deepEqual(wireless[0].cells.map((cell) => cell.value), [null, null, "Matter"]);
  const camera = group(groups, "sensors").rows.find((row) => row.id === "sensors:camera");
  assert.deepEqual(camera.cells.map((cell) => cell.value), [null, "Camera", null]);
});

test("a capability missing from a comparison board is also marked as changed", () => {
  const groups = buildComparisonGroups([board("XIAO ESP32-S3 Sense"), board("XIAO ESP32-C3")], "zh", true);
  const camera = group(groups, "sensors").rows.find((row) => row.id === "sensors:camera");
  assert.equal(camera.cells[0].value, "摄像头");
  assert.deepEqual(camera.cells[1], { value: null, changed: true });
});

test("capability ordering does not create differences and full view retains shared entries", () => {
  const a = { hardware: { gpio: 0 }, specs: { connectivity: ["wifi", "ble"] } };
  const b = { hardware: { gpio: 0 }, specs: { connectivity: ["ble", "wifi"] } };
  assert.deepEqual(buildComparisonGroups([a, b], "en", true), []);
  const full = buildComparisonGroups([a, b]);
  assert.deepEqual(group(full, "connectivity").rows.map((row) => row.label), ["Wi-Fi", "Bluetooth LE"]);
  assert.equal(group(full, "gpio").rows[0].cells[0].value, "0");
  assert.deepEqual(group(full, "sensors").rows[0].cells.map((cell) => cell.value), [null, null]);
});

test("empty comparisons have no rows and every catalog board can be compared", () => {
  assert.deepEqual(buildComparisonGroups([]), []);
  for (const name of Object.keys(BOARD_SPECS)) {
    const groups = buildComparisonGroups([board("XIAO ESP32-C3"), board(name)]);
    for (const entry of groups) {
      for (const row of entry.rows) assert.equal(row.cells.length, 2);
    }
  }
});
