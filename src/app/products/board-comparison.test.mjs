import assert from "node:assert/strict";
import test from "node:test";
import { BOARD_HARDWARE, BOARD_SPECS } from "./board-specs.mjs";
import { buildComparisonGroups } from "./board-comparison.mjs";

const board = (name) => ({ hardware: BOARD_HARDWARE[name], specs: BOARD_SPECS[name] });
const group = (groups, id) => groups.find((entry) => entry.id === id);

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
