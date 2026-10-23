import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BOARDS, BOARD_LIST, diagramBoxMatchesFilter } from "./playground/pinout/data/index.js";
import { auditPinoutFilters } from "../../scripts/pinout-filter-audit.mjs";
import { labelCategories } from "../../scripts/pinout-label-categories.mjs";
import { scanSvg } from "../../scripts/pinout-diagram-scan.mjs";
import { svgLabelReader } from "../../scripts/pinout-label-text.mjs";

const matches = (row, filter) => row.boxes.some((box) => diagramBoxMatchesFilter(box.cat, filter));

test("S3 Sense module rows follow the module's own printed colour key", () => {
  const rows = BOARDS.s3sense.diagram.module.rows;
  // The module artwork prints its own key: camera/SD/PDM pills share the
  // SEEED USAGE green, GPIO pad names the SIGNAL PIN blue, and only the
  // USER LED keeps the PERIPHERAL dark blue.
  // 模块图自印色键：摄像头/SD/PDM 胶囊同属 SEEED USAGE 绿，GPIO 焊盘名属
  // SIGNAL PIN 蓝，仅 USER LED 保留 PERIPHERAL 深蓝。
  assert.deepEqual(rows.filter((row) => matches(row, "seeed")).map((row) => `${row.side}/${row.id}`), [
    "left/MTMS", "left/DVP_Y9", "left/DVP_HREF", "left/DVP_VSYNC", "left/CAM_SCL", "left/CAM_SDA",
    "left/PDM_DATA", "left/PDM_CLK", "right/MTDI", "right/DVP_Y4", "right/DVP_Y3", "right/DVP_Y5",
    "right/DVP_Y2", "right/DVP_Y6", "right/DVP_PCLK", "right/DVP_Y7", "right/DVP_Y8", "right/XMCLK",
    "right/SD_MOSI", "right/SD_MISO", "right/SD_SCK", "right/SD_CS",
  ]);
  assert.deepEqual(rows.filter((row) => matches(row, "signal")).map((row) => `${row.side}/${row.id}`), [
    "left/MTMS", "left/USER_LED", "left/DVP_Y9", "left/DVP_HREF", "left/DVP_VSYNC", "left/CAM_SCL",
    "left/CAM_SDA", "left/PDM_DATA", "left/PDM_CLK", "right/MTDI", "right/DVP_Y4", "right/DVP_Y3",
    "right/DVP_Y5", "right/DVP_Y2", "right/DVP_Y6", "right/DVP_PCLK", "right/DVP_Y7", "right/DVP_Y8",
    "right/XMCLK", "right/SD_MOSI", "right/SD_MISO", "right/SD_SCK", "right/SD_CS",
  ]);
  assert.deepEqual(rows.filter((row) => matches(row, "peripheral")).map((row) => row.id), ["USER_LED"]);
  assert.deepEqual(rows.filter((row) => matches(row, "rst")).map((row) => `${row.side}/${row.id}`), [
    "left/MTMS", "left/CAM_SCL", "left/CAM_SDA", "left/PDM_DATA", "left/PDM_CLK", "right/MTDI",
  ]);
  // The front-face classic keys no longer light anything on the module.
  // 正面的经典分类在模块面上不再命中任何行。
  for (const filter of ["spi", "i2c", "digital", "analog"]) {
    assert.equal(rows.some((row) => matches(row, filter)), false, filter);
  }
  const source = readFileSync(new URL("../../public/xiao-products/pinout/s3sense-module.svg", import.meta.url), "utf8");
  const readLabel = svgLabelReader(source, "s3sense-module");
  for (const [id, gpio] of [["DVP_HREF", "GPIO47"], ["PDM_CLK", "GPIO42"]]) {
    const row = rows.find((row) => row.id === id);
    const gpioBox = row.boxes.find((box) => readLabel(box) === gpio);
    assert.ok(gpioBox, `${id} owns its ${gpio} box`);
    assert.equal(row.side, "left");
    // The blue SIGNAL PIN pill names the GPIO pad the row maps to (the
    // banner and connector legitimately repeat GPIO42 for MTMS / PDM_CLK).
    // 蓝色 SIGNAL PIN 胶囊写明该行对应的 GPIO 焊盘号（横幅与连接器表中
    // GPIO42 因 MTMS / PDM_CLK 重复出现属正常）。
    assert.equal(gpioBox.cat, "signal");
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
  assert.equal(boxes.find((box) => box.text === "DVP_PCLK/SPI1_SCK").cat, "seeed");
  assert.equal(boxes.find((box) => box.text === "DVP_Y2").cat, "seeed");
  assert.equal(boxes.find((box) => box.text === "GPIO42").cat, "signal");
  assert.throws(() => svgLabelReader(`${source}\n`, "s3sense-module"), /artwork changed/);
  assert.throws(() => svgLabelReader(source, "s3sense-module")({ x: 0, y: 0, w: 10, h: 10 }), /Missing SVG label text/);
});

test("all 23 boards and 47 faces pass the printed-text filter audit", () => {
  const { summary, issues, exceptions } = auditPinoutFilters();
  assert.deepEqual(issues, []);
  assert.deepEqual({ boards: summary.boards, faces: summary.faces, rows: summary.rows, boxes: summary.boxes, filters: summary.filters }, {
    boards: 23, faces: 47, rows: 869, boxes: 1963, filters: 427,
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
  rows.find((row) => row.id === "DVP_Y2").boxes.forEach((box) => { box.cat = "nc"; });
  const bus = rows.find((row) => row.id === "DVP_PCLK");
  bus.boxes.find((box) => box.cat === "seeed").cat = "peripheral";
  const c3Front = boards.find((board) => board.id === "c3").diagram.front;
  c3Front.rows = c3Front.rows.filter((row) => row.id !== "RST");
  const href = rows.find((row) => row.id === "DVP_HREF");
  const gpio47 = href.boxes.splice(href.boxes.findIndex((box) => box.cat === "signal"), 1)[0];
  bus.boxes.unshift(gpio47);
  const clock = rows.find((row) => row.id === "PDM_CLK");
  const gpio42 = clock.boxes.splice(clock.boxes.findIndex((box) => box.cat === "signal"), 1)[0];
  rows.find((row) => row.id === "SD_MISO").boxes.unshift(gpio42);
  href.boxes.push(href.boxes[0]);
  const banner = rows.find((row) => row.id === "MTMS");
  banner.boxes.push(rows.find((row) => row.id === "MTDI").boxes.find((box) => box.cat === "seeed"));
  const { issues } = auditPinoutFilters(boards);
  assert.equal(issues.filter((issue) => issue.kind === "missingInteractiveBox").length, 2);
  assert.ok(issues.some((issue) => issue.kind === "boxCategory" && issue.text === "DVP_Y2"));
  assert.ok(issues.some((issue) => issue.kind === "unexpectedRowMatch" && issue.id === "DVP_Y2" && issue.filter === "nc"));
  assert.ok(issues.some((issue) => issue.kind === "missingRowMatch" && issue.id === "DVP_PCLK" && issue.filter === "seeed"));
  for (const id of ["DVP_PCLK", "SD_MISO"]) {
    assert.ok(issues.some((issue) => issue.kind === "crossColumnRow" && issue.id === id));
    assert.ok(issues.some((issue) => issue.kind === "multiplePinNames" && issue.id === id));
  }
  for (const id of ["DVP_HREF", "PDM_CLK"]) assert.ok(issues.some((issue) => issue.kind === "splitLabelRow" && issue.id === id));
  assert.ok(issues.some((issue) => issue.kind === "duplicateBoxAssignment" && issue.id === "DVP_HREF"));
  assert.ok(issues.some((issue) => issue.kind === "duplicateBoxAssignment" && issue.id === "MTDI"));
  assert.ok(issues.some((issue) => issue.kind === "multipleDigitalNames" && issue.id === "MTMS"));
});
