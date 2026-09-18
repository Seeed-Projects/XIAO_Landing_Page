import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BOARD_CATEGORIES, BOARDS, laneOnSide, padOnSide, stripCells, validateAllBoards } from "./playground/pinout/data/index.js";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");

test("every official XIAO board is present with unique valid pins", () => {
  const ids = BOARD_CATEGORIES.flatMap((item) => item.boardIds);
  assert.equal(ids.length, 23);
  for (const id of ids) assert.ok(BOARDS[id], `missing ${id}`);
  const errors = validateAllBoards();
  assert.deepEqual(errors, []);
});

test("boards expose facts, sized images and legal pin kinds", () => {
  for (const board of Object.values(BOARDS)) {
    assert.ok(board.facts.logic);
    assert.equal(typeof board.facts.fiveVTolerant, "boolean");
    assert.ok(board.facts.vbus.en);
    for (const face of ["front", "back"]) {
      assert.ok(board.images[face].src, `${board.id} ${face} src`);
      assert.ok(board.images[face].width > 0 && board.images[face].height > 0, `${board.id} ${face} size`);
    }
    const ids = new Set();
    for (const pin of board.pins) {
      assert.ok(pin.id);
      assert.equal(ids.has(pin.id), false, `${board.id} duplicate ${pin.id}`);
      ids.add(pin.id);
      assert.match(pin.status, /^(free|conditional|occupied)$/);
      assert.match(pin.kind, /^(header|pad|onboard)$/);
      if (pin.kind === "onboard") assert.equal(pin.pads, null, `${board.id}/${pin.id} onboard pin carries a pad`);
      else assert.ok(pin.pad || pin.pads?.front || pin.pads?.back, `${board.id}/${pin.id} missing pad`);
    }
  }
});

test("SAMD21 reference layout: 14 header pads per face, mirrored lanes, measured extras", () => {
  const board = BOARDS.samd21;
  for (const face of ["front", "back"]) {
    const header = board.pins.filter((pin) => pin.kind === "header" && padOnSide(pin, face));
    assert.equal(header.length, 14, `${face} header count`);
    const lanes = header.map((pin) => laneOnSide(pin, face));
    assert.equal(lanes.filter((item) => item.lane === "left").length, 7);
    assert.equal(lanes.filter((item) => item.lane === "right").length, 7);
    for (const pin of header) {
      const pad = padOnSide(pin, face);
      assert.ok(pad.x > 5 && pad.x < 95 && pad.y > 15 && pad.y < 90, `${pin.id} ${face} pad inside the photo`);
    }
  }
  assert.equal(laneOnSide(BOARDS.samd21.pins.find((pin) => pin.id === "D0"), "front").lane, "left");
  assert.equal(laneOnSide(BOARDS.samd21.pins.find((pin) => pin.id === "D0"), "back").lane, "right");
  const extras = board.pins.filter((pin) => pin.kind === "pad").map((pin) => pin.id).sort();
  assert.deepEqual(extras, ["GND_SWD", "GND_VIN", "RST", "SWCLK", "SWDIO", "VIN"]);
  const rst = board.pins.find((pin) => pin.id === "RST");
  assert.ok(rst.pads.front && rst.pads.back, "RST pads exist on both faces");
  const onboard = board.pins.filter((pin) => pin.kind === "onboard");
  assert.equal(onboard.length, 4);
  assert.ok(onboard.every((pin) => pin.anchor?.side === "front"));
});

test("SAMD21 front diagram: every scanned label row maps to a real pin inside the crop", () => {
  const board = BOARDS.samd21;
  const diagram = board.diagram.front;
  assert.ok(diagram.src.endsWith(".svg"), "diagram is the vector file");
  assert.equal(diagram.width, 1920);
  assert.equal(diagram.rows.length, 19);
  assert.equal(diagram.rows.filter((row) => row.side === "left").length, 10);
  const ids = new Set(board.pins.map((pin) => pin.id));
  for (const row of diagram.rows) {
    assert.ok(ids.has(row.id), `${row.id} exists on the board`);
    assert.ok(row.boxes.length >= 1, `${row.id} has boxes`);
    for (const box of row.boxes) {
      assert.ok(box.x >= diagram.crop.x && box.x + box.w <= diagram.crop.x + diagram.crop.w, `${row.id} box inside crop (x)`);
      assert.ok(box.y >= diagram.crop.y && box.y + box.h <= diagram.crop.y + diagram.crop.h, `${row.id} box inside crop (y)`);
    }
  }
  // Header rows sit at the same height as the matching pad on the other side of the board.
  // 排针行与板子另一侧对应的引脚行处于同一高度。
  const rowY = (id) => diagram.rows.find((row) => row.id === id).y;
  assert.ok(Math.abs(rowY("D0") - rowY("5V")) <= 2);
  assert.ok(Math.abs(rowY("D6") - rowY("D7")) <= 2);
  assert.equal(board.diagram.back, undefined);
});

test("strip cells never repeat a name and collapse to capability labels", () => {
  const d4 = BOARDS.samd21.pins.find((pin) => pin.id === "D4");
  assert.deepEqual(stripCells(d4, "arduino"), {
    silk: "D4", code: "SDA", chip: "PA08", adc: "A4", i2c: "I²C", spi: "", uart: "", pwm: "PWM",
  });
  const d0 = BOARDS.samd21.pins.find((pin) => pin.id === "D0");
  assert.equal(stripCells(d0, "arduino").adc, "ADC");
  assert.equal(stripCells(d0, "arduino").pwm, "");
  const gnd = BOARDS.samd21.pins.find((pin) => pin.id === "GND");
  assert.equal(stripCells(gnd, "arduino").chip, "");
});

test("Pinout view uses shared Home type roles, photo-relative overlay and docked drawer", () => {
  const view = read("./playground/pinout/PinoutView.js");
  const page = read("./playground/pinout/page.js");
  const css = read("./playground/pinout/pinout.module.css");
  assert.match(page, /PinoutView/);
  assert.match(view, /home-type-subtitle/);
  assert.match(view, /home-type-body/);
  assert.match(view, /home-type-action home-filled-action home-primary-cta/);
  assert.match(view, /styles\.overlay/);
  assert.match(view, /styles\.onboardRow/);
  assert.match(view, /styles\.tag\b/);
  assert.match(view, /laneTemplate/);
  assert.match(view, /calibrate/);
  assert.match(css, /rotateY\(180deg\)/);
  assert.match(css, /--strip-scale/);
  assert.match(css, /\.bodyDocked/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 1023px\)/);
});
