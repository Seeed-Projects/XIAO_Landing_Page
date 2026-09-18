import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ALT_KEYS,
  BOARD_CATEGORIES,
  BOARD_LINKS,
  BOARDS,
  FUNCTION_KEYS,
  FUNCTIONS,
  laneOnSide,
  padOnSide,
  stripCells,
  validateAllBoards,
} from "./playground/pinout/data/index.js";
import { placePinCard, PIN_CLEARANCE } from "./playground/pinout/placePinCard.js";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const uniqueBoards = BOARD_CATEGORIES.flatMap((item) => item.boardIds).map((id) => BOARDS[id]);

test("every official XIAO board is present with unique valid pins", () => {
  const ids = BOARD_CATEGORIES.flatMap((item) => item.boardIds);
  assert.equal(ids.length, 23);
  for (const id of ids) assert.ok(BOARDS[id], `missing ${id}`);
  const errors = validateAllBoards();
  assert.deepEqual(errors, []);
});

test("boards expose facts, sized images and legal pin kinds", () => {
  for (const board of uniqueBoards) {
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

test("SAMD21 diagrams: every scanned label row maps to a real pin inside the crop", () => {
  const board = BOARDS.samd21;
  for (const face of ["front", "back"]) {
    const diagram = board.diagram[face];
    assert.ok(diagram, `${face} diagram`);
    assert.ok(diagram.src.endsWith(".svg"), `${face} is the vector file`);
    const ids = new Set(board.pins.map((pin) => pin.id));
    for (const row of diagram.rows) {
      assert.ok(ids.has(row.id), `${face} ${row.id} exists on the board`);
      assert.ok(row.boxes.length >= 1, `${row.id} has boxes`);
      for (const box of row.boxes) {
        assert.ok(box.x >= diagram.crop.x && box.x + box.w <= diagram.crop.x + diagram.crop.w, `${row.id} box inside crop (x)`);
        assert.ok(box.y >= diagram.crop.y && box.y + box.h <= diagram.crop.y + diagram.crop.h, `${row.id} box inside crop (y)`);
      }
    }
  }
  const front = board.diagram.front;
  assert.equal(front.width, 1920);
  assert.equal(front.rows.length, 19);
  assert.equal(front.rows.filter((row) => row.side === "left").length, 10);
  const rowY = (id) => front.rows.find((row) => row.id === id).y;
  assert.ok(Math.abs(rowY("D0") - rowY("5V")) <= 2);
  assert.ok(Math.abs(rowY("D6") - rowY("D7")) <= 2);
});

test("every board face has a diagram whose rows resolve to pins", () => {
  for (const board of uniqueBoards) {
    const pinIds = new Set(board.pins.map((pin) => pin.id));
    for (const face of ["front", "back"]) {
      const diagram = board.diagram?.[face];
      assert.ok(diagram, `${board.id} missing ${face} diagram`);
      assert.ok(diagram.rows.length > 0, `${board.id} ${face} has rows`);
      for (const row of diagram.rows) {
        assert.ok(pinIds.has(row.id), `${board.id} ${face} unknown row ${row.id}`);
      }
    }
  }
});

test("front and back diagram crops share one frame width", () => {
  for (const board of uniqueBoards) {
    const front = board.diagram.front;
    const back = board.diagram.back;
    if (front.width !== back.width) continue;
    assert.equal(front.crop.w, back.crop.w, `${board.id} crop width`);
  }
});

test("diagram crop keeps the lower colour key", () => {
  for (const board of uniqueBoards) {
    for (const face of ["front", "back"]) {
      const diagram = board.diagram[face];
      assert.ok(diagram.legend, `${board.id} ${face} missing colour key`);
      assert.ok(
        diagram.legend.y >= diagram.crop.y + diagram.crop.h - 8,
        `${board.id} ${face} colour key stays below the pin crop`,
      );
    }
  }
  assert.ok(BOARDS.samd21.diagram.front.crop.h < 520);
});

test("function primers exist in English and Chinese for every key", () => {
  assert.deepEqual(FUNCTION_KEYS, [
    "i2c", "spi", "uart", "adc", "pwm", "dac", "power", "gnd", "rst", "debug", "battery", "wireless", "touch",
  ]);
  for (const key of FUNCTION_KEYS) {
    const primer = FUNCTIONS[key];
    assert.ok(primer, key);
    assert.ok(primer.title.en && primer.title.zh, `${key} title`);
    assert.ok(primer.intro.en && primer.intro.zh, `${key} intro`);
    assert.ok(primer.wiring.en && primer.wiring.zh, `${key} wiring`);
    assert.ok(primer.code.arduino, `${key} arduino sample`);
  }
});

test("every header pin has notes and legal alt keys", () => {
  for (const board of uniqueBoards) {
    assert.ok(BOARD_LINKS[board.id]?.wiki, `${board.id} wiki link`);
    for (const pin of board.pins) {
      if (pin.kind === "header") {
        assert.ok(pin.notes?.length >= 1, `${board.id}/${pin.id} missing notes`);
        for (const note of pin.notes) {
          assert.ok(note.en && note.zh, `${board.id}/${pin.id} note bilingual`);
        }
      }
      for (const key of Object.keys(pin.alt || {})) {
        assert.ok(ALT_KEYS.includes(key), `${board.id}/${pin.id} bad alt ${key}`);
      }
    }
  }
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

test("pin card sits beside a right-edge pin and stays in the viewport", () => {
  const board = BOARDS.samd21;
  const row = board.diagram.front.rows.find((item) => item.id === "D8");
  const pos = placePinCard({
    workWidth: 1100,
    workTop: 180,
    frameLeft: 12,
    frameWidth: 1068,
    crop: board.diagram.front.crop,
    row,
    side: "right",
    viewportHeight: 900,
  });
  const pinLeft = 12 + ((Math.min(...row.boxes.map((box) => box.x)) - board.diagram.front.crop.x) / board.diagram.front.crop.w) * 1068;
  assert.ok(pos.width >= 500, "card uses the free width beside the pin");
  assert.ok(pos.left + pos.width + PIN_CLEARANCE <= pinLeft + 1, "card leaves the clicked pin visible");
  assert.ok(pinLeft - (pos.left + pos.width) >= PIN_CLEARANCE - 1);
  assert.equal(pos.top, 8);
  assert.ok(pos.maxHeight >= 600, "card uses the visible viewport height");
  assert.ok(pos.top + pos.maxHeight <= 900 - 180 - 8);
});

test("pin card slides up into free space when the pin is low on the diagram", () => {
  const pos = placePinCard({
    workWidth: 1100,
    workTop: 200,
    frameLeft: 12,
    frameWidth: 1068,
    crop: { x: 0, y: 200, w: 1920, h: 395 },
    row: { y: 560, boxes: [{ x: 1600, y: 540, w: 280, h: 28 }] },
    side: "right",
    viewportHeight: 900,
  });
  assert.equal(pos.top, 8);
  assert.ok(pos.left > 200);
  assert.ok(pos.left + pos.width + PIN_CLEARANCE <= 12 + (1600 / 1920) * 1068 + 1);
  assert.ok(pos.top + pos.maxHeight <= 700);
});

test("Pinout view stacks both faces, floats a pin card and drops the flip/side URL", () => {
  const view = read("./playground/pinout/PinoutView.js");
  const page = read("./playground/pinout/page.js");
  const css = read("./playground/pinout/pinout.module.css");
  assert.match(page, /PinoutView/);
  assert.match(view, /home-type-subtitle/);
  assert.match(view, /home-type-body/);
  assert.match(view, /home-type-action home-filled-action home-primary-cta/);
  assert.match(view, /function PinCard/);
  assert.match(view, /\[\"front\", \"back\"\]/);
  assert.match(view, /searchParams\.delete\(\"side\"\)/);
  assert.match(view, /cardSheet/);
  assert.match(view, /summaryRows/);
  assert.doesNotMatch(view, /flipTo/);
  assert.doesNotMatch(view, /function Strip/);
  assert.match(css, /cardFloat/);
  assert.match(css, /cardSheet/);
  assert.match(css, /z-index: 30/);
  assert.match(css, /padding: 28px 34px 36px/);
  assert.doesNotMatch(css, /min\(84vh, 780px\)/);
  assert.match(view, /placePinCard/);
  assert.match(view, /data-board-trigger/);
  assert.doesNotMatch(view, /workBox\.height - 240/);
  assert.match(css, /5cm/);
  assert.match(css, /legendStrip/);
  assert.match(view, /legendStrip/);
  assert.match(css, /diagram-max-w/);
  assert.match(view, /diagramMaxW/);
  assert.doesNotMatch(view, /stageName/);
  assert.match(css, /letter-spacing:\s*0\.18em/);
  assert.match(css, /mix-blend-mode:\s*multiply/);
  assert.doesNotMatch(css, /\.padRight/);
  assert.doesNotMatch(view, /padRight/);
  assert.match(css, /@media \(max-width: 899px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
