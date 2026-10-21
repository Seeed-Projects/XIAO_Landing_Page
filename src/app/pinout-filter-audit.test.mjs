import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BOARDS, BOARD_LIST, diagramBoxMatchesFilter } from "./playground/pinout/data/index.js";
import { auditPinoutFilters } from "../../scripts/pinout-filter-audit.mjs";
import { labelCategories } from "../../scripts/pinout-label-categories.mjs";
import { scanSvg } from "../../scripts/pinout-diagram-scan.mjs";
import { svgLabelReader } from "../../scripts/pinout-label-text.mjs";

const matches = (row, filter) => row.boxes.some((box) => diagramBoxMatchesFilter(box.cat, filter));

test("S3 Sense module SPI selects the camera bus and SD rows printed on the artwork", () => {
  const rows = BOARDS.s3sense.diagram.module.rows;
  assert.deepEqual(rows.filter((row) => matches(row, "spi")).map((row) => row.id), [
    "DVP_PCLK", "DVP_Y7", "DVP_Y8", "SD_MOSI", "SD_MISO", "SD_SCK", "SD_CS",
  ]);
  assert.equal(matches(rows.find((row) => row.id === "DVP_Y2"), "spi"), false);
  for (const id of ["SD_MOSI", "SD_MISO", "SD_SCK", "SD_CS"]) {
    const row = rows.find((row) => row.id === id);
    for (const filter of ["digital", "analog", "spi"]) assert.equal(matches(row, filter), true, `${id}/${filter}`);
  }
  for (const id of ["CAM_SCL", "CAM_SDA"]) {
    const row = rows.find((row) => row.id === id);
    assert.equal(matches(row, "i2c"), true);
    assert.equal(matches(row, "spi"), false);
  }
  const source = readFileSync(new URL("../../public/xiao-products/pinout/s3sense-module.svg", import.meta.url), "utf8");
  const readLabel = svgLabelReader(source, "s3sense-module");
  const spiRows = rows.filter((row) => matches(row, "spi"));
  for (const [id, gpio] of [["DVP_HREF", "GPIO47"], ["PDM_CLK", "GPIO42"]]) {
    const row = rows.find((row) => row.id === id);
    const gpioBox = row.boxes.find((box) => readLabel(box) === gpio);
    assert.ok(gpioBox, `${id} owns its ${gpio} box`);
    assert.equal(row.side, "left");
    assert.equal(matches(row, "spi"), false);
    assert.ok(spiRows.every((candidate) => candidate.boxes.every((box) => readLabel(box) !== gpio)));
    assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === id).names.chip, gpio);
  }
  const miso = rows.find((row) => row.id === "SD_MISO");
  assert.deepEqual(miso.boxes.map(readLabel), ["GPIO8", "D9/A9/SD_MISO"]);
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === miso.id).names.chip, "GPIO8");
  assert.deepEqual(rows.filter((row) => matches(row, "gnd")).map((row) => row.id), ["GND", "GND", "GND"]);
  assert.deepEqual(rows.filter((row) => matches(row, "power")).map((row) => `${row.side}/${row.id}`), ["left/3V3", "left/3V3", "left/VIN", "right/VIN"]);
});

test("printed label rules distinguish buses, indicators, pin names and combined functions", () => {
  for (const [text, expected] of [
    ["DVP_Y7/SPI1_MISO", ["peripheral", "spi"]],
    ["D10/A10/SD_MOSI", ["analog", "digital", "spi"]],
    ["GPIO15", ["pinname"]], ["DVP_Y2", ["peripheral"]],
    ["CAM_SCL/I2S_SCK", ["i2c", "peripheral"]],
    ["I2S_SCK", ["peripheral"]], ["QSPI_CSN", ["spi"]],
    ["CANFD1_RX", ["can"]], ["PTC-Y4", ["ptc"]],
    ["RX_LED", ["peripheral"]], ["POWER_LED", ["peripheral"]],
    ["BAT-", ["gnd"]], ["BAT+", ["power"]],
    ["GND / N/A", ["gnd", "nc"]],
    ["PH2-BOOT0", ["pinname", "system"]], ["U0RXD", ["uart"]],
    ["P0.09", ["pinname"]], ["AN019", ["analog"]],
  ]) assert.deepEqual(labelCategories(text), expected, text);
  assert.equal(diagramBoxMatchesFilter(["peripheral", "spi"], "spi"), true);
  assert.equal(diagramBoxMatchesFilter(["pinname", "system"], "rst"), true);
  assert.equal(diagramBoxMatchesFilter("can", "can"), true);
  assert.equal(diagramBoxMatchesFilter("ptc", "can"), false);
});

test("SVG scans use the position-indexed text and detect changed artwork", () => {
  const source = readFileSync(new URL("../../public/xiao-products/pinout/s3sense-module.svg", import.meta.url), "utf8");
  const boxes = scanSvg(source, "s3sense-module").blobs;
  assert.deepEqual(boxes.find((box) => box.text === "DVP_PCLK/SPI1_SCK").cat, ["peripheral", "spi"]);
  assert.equal(boxes.find((box) => box.text === "DVP_Y2").cat, "peripheral");
  assert.throws(() => svgLabelReader(`${source}\n`, "s3sense-module"), /artwork changed/);
  assert.throws(() => svgLabelReader(source, "s3sense-module")({ x: 0, y: 0, w: 10, h: 10 }), /Missing SVG label text/);
});

test("all 23 boards and 47 faces pass the printed-text filter audit", () => {
  const { summary, issues, exceptions } = auditPinoutFilters();
  assert.deepEqual(issues, []);
  assert.deepEqual({ boards: summary.boards, faces: summary.faces, rows: summary.rows, boxes: summary.boxes, filters: summary.filters }, {
    boards: 23, faces: 47, rows: 869, boxes: 1963, filters: 429,
  });
  assert.deepEqual(summary.structuralIssues, {});
  assert.equal(exceptions.length, 15);
  assert.ok(exceptions.every((item) => item.board === "samd21plus" && item.face === "back" && item.reason));
  const battery = BOARDS.ra4.diagram.back.rows.filter((row) => row.id.startsWith("BAT"));
  assert.deepEqual(battery.map((row) => [row.side, row.id, row.boxes.length]), [["left", "BAT-", 1], ["right", "BAT+", 1]]);
});

test("the audit detects category mismatches, crossed columns, duplicate ownership and split rows", () => {
  const boards = structuredClone(BOARD_LIST);
  const rows = boards.find((board) => board.id === "s3sense").diagram.module.rows;
  rows.find((row) => row.id === "DVP_Y2").boxes.forEach((box) => { box.cat = "spi"; });
  const bus = rows.find((row) => row.id === "DVP_PCLK");
  bus.boxes.find((box) => Array.isArray(box.cat) && box.cat.includes("spi")).cat = "peripheral";
  const c3Front = boards.find((board) => board.id === "c3").diagram.front;
  c3Front.rows = c3Front.rows.filter((row) => row.id !== "RST");
  const href = rows.find((row) => row.id === "DVP_HREF");
  const gpio47 = href.boxes.splice(href.boxes.findIndex((box) => box.cat === "pinname"), 1)[0];
  bus.boxes.unshift(gpio47);
  const clock = rows.find((row) => row.id === "PDM_CLK");
  const gpio42 = clock.boxes.splice(clock.boxes.findIndex((box) => box.cat === "pinname"), 1)[0];
  rows.find((row) => row.id === "SD_MISO").boxes.unshift(gpio42);
  href.boxes.push(href.boxes[0]);
  const banner = rows.find((row) => row.id === "MTMS");
  banner.boxes.push(rows.find((row) => row.id === "MTDI").boxes.find((box) => box.cat === "digital"));
  const { issues } = auditPinoutFilters(boards);
  assert.equal(issues.filter((issue) => issue.kind === "missingInteractiveBox").length, 2);
  assert.ok(issues.some((issue) => issue.kind === "boxCategory" && issue.text === "DVP_Y2"));
  assert.ok(issues.some((issue) => issue.kind === "unexpectedRowMatch" && issue.id === "DVP_Y2" && issue.filter === "spi"));
  assert.ok(issues.some((issue) => issue.kind === "missingRowMatch" && issue.id === "DVP_PCLK" && issue.filter === "spi"));
  for (const id of ["DVP_PCLK", "SD_MISO"]) {
    assert.ok(issues.some((issue) => issue.kind === "crossColumnRow" && issue.id === id));
    assert.ok(issues.some((issue) => issue.kind === "multiplePinNames" && issue.id === id));
  }
  for (const id of ["DVP_HREF", "PDM_CLK"]) assert.ok(issues.some((issue) => issue.kind === "splitLabelRow" && issue.id === id));
  assert.ok(issues.some((issue) => issue.kind === "duplicateBoxAssignment" && issue.id === "DVP_HREF"));
  assert.ok(issues.some((issue) => issue.kind === "duplicateBoxAssignment" && issue.id === "MTDI"));
  assert.ok(issues.some((issue) => issue.kind === "multipleDigitalNames" && issue.id === "MTMS"));
});
