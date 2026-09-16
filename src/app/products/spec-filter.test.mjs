import assert from "node:assert/strict";
import test from "node:test";
import { PRODUCT_CATALOG } from "./catalog.js";
import { BOARD_HARDWARE, BOARD_SPECS, FILTER_GROUPS, HARDWARE_FIELDS, emptySelection } from "./board-specs.mjs";
import {
  activeFilters,
  facetCounts,
  filterBoards,
  removalSuggestions,
  searchBoards,
  toggleSelection,
} from "./spec-filter.mjs";

const boards = Object.entries(BOARD_SPECS).map(([name, specs]) => ({
  name,
  specs,
  hardware: BOARD_HARDWARE[name],
}));
const names = (list) => list.map((b) => b.name).sort();
const groupById = (id) => FILTER_GROUPS.find((g) => g.id === id);

test("capability filters use AND within the connectivity group", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    connectivity: ["wifi", "ble"],
    sensors: ["camera"],
  });
  assert.deepEqual(names(result), ["XIAO ESP32-S3 Sense"]);
});

test("category filters use OR within the platform group", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    platform: ["espressif", "nordic"],
  });
  assert.ok(result.some((b) => b.specs.platform.includes("espressif")));
  assert.ok(result.some((b) => b.specs.platform.includes("nordic")));
  assert.equal(
    result.every((b) => b.specs.platform.includes("espressif") || b.specs.platform.includes("nordic")),
    true
  );
});

test("groups combine with AND across categories", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    platform: ["nordic"],
    sensors: ["imu"],
  });
  assert.equal(result.every((b) => b.specs.platform.includes("nordic")), true);
  assert.equal(result.every((b) => b.specs.sensors.includes("imu")), true);
  assert.ok(result.length >= 3);
});

test("No Onboard Sensor matches boards without sensors", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    sensors: ["none"],
  });
  assert.ok(result.length > 0);
  assert.equal(result.every((b) => b.specs.sensors.length === 0), true);
});

test("Plus + Microphone + IMU returns nRF52840 Sense Plus", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    variant: ["plus"],
    sensors: ["microphone", "imu"],
  });
  assert.deepEqual(names(result), ["XIAO nRF52840 Sense Plus"]);
});

test("Low Power includes Ultra-Low Power boards", () => {
  const result = filterBoards(boards, {
    ...emptySelection(),
    power: ["low-power"],
  });
  assert.ok(result.some((b) => b.specs.power.includes("ultra-low-power")));
  assert.ok(result.some((b) => b.name.includes("nRF54L15")));
});

test("facet counts report how many boards remain after adding each option", () => {
  const selection = { ...emptySelection(), platform: ["nordic"] };
  const counts = facetCounts(boards, selection);
  const nordic = boards.filter((b) => b.specs.platform.includes("nordic"));

  assert.equal(counts.platform.nordic, nordic.length);
  assert.equal(counts.platform.espressif, boards.filter((b) => b.specs.platform.includes("espressif")).length);
  assert.equal(counts.sensors.imu, nordic.filter((b) => b.specs.sensors.includes("imu")).length);
  assert.equal(counts.sensors.camera, 0);
  assert.equal(counts.connectivity.wifi, 0);
});

test("toggleSelection keeps No Onboard Sensor exclusive", () => {
  const group = groupById("sensors");
  let selection = toggleSelection(emptySelection(), group, "imu");
  selection = toggleSelection(selection, group, "none");
  assert.deepEqual(selection.sensors, ["none"]);
  selection = toggleSelection(selection, group, "camera");
  assert.deepEqual(selection.sensors, ["camera"]);
});

test("searchBoards matches board names and MCU ignoring case, spaces and dashes", () => {
  assert.ok(searchBoards(boards, "nrf54").every((b) => b.name.includes("nRF54")));
  assert.ok(searchBoards(boards, "esp32 s3").some((b) => b.name === "XIAO ESP32-S3 Plus"));
  assert.ok(searchBoards(boards, "samd21g18").some((b) => b.name === "XIAO SAMD21"));
  assert.equal(searchBoards(boards, "").length, boards.length);
});

test("removalSuggestions explains how to recover from an empty result", () => {
  const selection = { ...emptySelection(), platform: ["raspberry-pi"], connectivity: ["wifi"] };
  assert.equal(filterBoards(boards, selection).length, 0);
  const suggestions = removalSuggestions(boards, selection);
  assert.ok(suggestions.length >= 1);
  assert.ok(suggestions.every((s) => s.count > 0));
  assert.ok(suggestions.some((s) => s.groupId === "connectivity" && s.optionId === "wifi"));
});

test("activeFilters flattens the selection in group order", () => {
  const selection = { ...emptySelection(), variant: ["plus"], connectivity: ["ble"] };
  const chips = activeFilters(selection);
  assert.deepEqual(chips.map((c) => `${c.group.id}:${c.option.id}`), ["connectivity:ble", "variant:plus"]);
});

test("every board has hardware summary fields and a Wiki link", () => {
  for (const board of boards) {
    assert.ok(board.hardware, `missing BOARD_HARDWARE for ${board.name}`);
    for (const field of HARDWARE_FIELDS) {
      assert.ok(board.hardware[field.id] !== undefined && board.hardware[field.id] !== "", `${board.name}.${field.id} missing`);
    }
    assert.match(board.hardware.wiki, /^https:\/\/wiki\.seeedstudio\.com\//);
  }
});

test("every catalog development board has a BOARD_SPECS entry with valid option ids", () => {
  const validIds = Object.fromEntries(
    FILTER_GROUPS.map((group) => [group.id, new Set(group.options.map((o) => o.id))])
  );
  const catalogTitles = PRODUCT_CATALOG.find((c) => c.id === "dev-boards")
    .subcategories.flatMap((sub) => sub.items.map((item) => item.title));

  for (const title of catalogTitles) {
    assert.ok(BOARD_SPECS[title], `missing BOARD_SPECS for ${title}`);
    const specs = BOARD_SPECS[title];
    for (const group of FILTER_GROUPS) {
      assert.ok(Array.isArray(specs[group.id]), `${title}.${group.id} should be an array`);
      for (const value of specs[group.id]) {
        assert.ok(
          validIds[group.id].has(value),
          `${title}.${group.id} has unknown option ${value}`
        );
      }
    }
  }
});
