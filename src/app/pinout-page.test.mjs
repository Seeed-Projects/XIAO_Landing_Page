import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ALT_KEYS,
  BOARD_CATEGORIES,
  BOARD_LINKS,
  BOARDS,
  FN_COLOR,
  FN_LABEL,
  FUNCTION_KEYS,
  FUNCTIONS,
  LEGEND_ORDER,
  NEW_LEGEND_BOARDS,
  NEW_LEGEND_ORDER,
  PTC_LEGEND_BOARDS,
  CAN_LEGEND_BOARDS,
  diagramBoxMatchesFilter,
  laneOnSide,
  padOnSide,
  stripCells,
  validateAllBoards,
} from "./playground/pinout/data/index.js";
import { placePinCard, PIN_CLEARANCE } from "./playground/pinout/placePinCard.js";
import { BOARD_FRACTION, boardFrameWidth } from "./playground/pinout/diagramScale.js";

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

test("diagram crop keeps the s3 back board body and lower colour key", () => {
  for (const board of uniqueBoards) {
    for (const face of ["front", "back"]) {
      const diagram = board.diagram[face];
      assert.equal(diagram.legend, undefined, `${board.id} ${face} legend not surfaced as rows`);
      assert.ok(diagram.fitLegendRatio > 0, `${board.id} ${face} keeps its published sizing ratio`);
    }
  }
  // s3 back publishes the board photo (y≈230-613) below its label rows and
  // the baked-in colour key at the foot (y817-849); the layout's hand-annotated
  // legend boxes keep both inside the crop, and nothing exists below y849.
  const s3back = BOARDS.s3.diagram.back;
  assert.ok(s3back.crop.y <= 210, `s3 back crop keeps the board top (got top ${s3back.crop.y})`);
  assert.ok(s3back.crop.y + s3back.crop.h >= 610, `s3 back crop keeps the board bottom (got bottom ${s3back.crop.y + s3back.crop.h})`);
  assert.ok(
    s3back.crop.y + s3back.crop.h >= 849,
    `s3 back crop keeps the lower colour key (got bottom ${s3back.crop.y + s3back.crop.h})`,
  );
  assert.ok(s3back.crop.y + s3back.crop.h <= 880, `s3 back crop ends below the colour key (got bottom ${s3back.crop.y + s3back.crop.h})`);
  // s3sense front reuses the s3 main-board diagram (the official s3sense
  // front is the expansion board), so its crop matches the s3 front crop.
  assert.equal(BOARDS.s3sense.diagram.front.crop.y, BOARDS.s3.diagram.front.crop.y, "S3 Sense front crop follows the s3 main board");
  assert.equal(BOARDS.s3sense.diagram.front.crop.h, BOARDS.s3.diagram.front.crop.h, "S3 Sense front crop height matches the s3 main board");
  // c6 front publishes the RF Logic note (GPIO3 / GPIO14) below the board
  // photo, ending at y≈780; the baked-in legend only starts at 808.
  const c6front = BOARDS.c6.diagram.front;
  assert.ok(
    c6front.crop.y + c6front.crop.h >= 780,
    `c6 front keeps the RF Logic note (got bottom ${c6front.crop.y + c6front.crop.h})`,
  );
  assert.ok(c6front.crop.y + c6front.crop.h < 800, "c6 front omits the baked-in legend");
  // Both nRF52840 (Plus) backs publish Battery Management bullets below the
  // BAT pads, ending at y≈762; the baked-in legend only starts at 836.
  for (const id of ["nrf52840plus", "nrf52840senseplus"]) {
    const back = BOARDS[id].diagram.back;
    assert.ok(
      back.crop.y + back.crop.h >= 762,
      `${id} back keeps the Battery Management bullets (got bottom ${back.crop.y + back.crop.h})`,
    );
    assert.ok(back.crop.y + back.crop.h < 830, `${id} back omits the baked-in legend`);
  }
  // Faces whose note text below the board photo (battery divider / RF Logic)
  // extends past the row bounds; each bottom keeps the note and stops short
  // of the baked-in legend strip.
  const noteCropMinimums = {
    "rp2350/back": { bottom: 773, legend: 800 },
    "mg24/front": { bottom: 708, legend: 800 },
    "mg24/back": { bottom: 750, legend: 800 },
    "mg24sense/back": { bottom: 750, legend: 800 },
    "ra4/back": { bottom: 666, legend: 800 },
    "nrf54lm20a/back": { bottom: 890, legend: 994 },
    "nrf54lm20asense/back": { bottom: 890, legend: 994 },
    "nrf54l15/front": { bottom: 683, legend: 876 },
    "nrf54l15/back": { bottom: 812, legend: 867 },
    "nrf54l15sense/back": { bottom: 812, legend: 867 },
    // fix_1013 transparent back diagrams: Battery Management Logic notes end
    // at y≈840 (crop override 850), baked-in legends at 903 / 915.
    "samd21plus/back": { bottom: 840, legend: 903 },
    "rp2040plus/back": { bottom: 840, legend: 915 },
  };
  for (const [key, { bottom: minBottom, legend }] of Object.entries(noteCropMinimums)) {
    const [id, face] = key.split("/");
    const crop = BOARDS[id].diagram[face].crop;
    assert.ok(
      crop.y + crop.h >= minBottom,
      `${id} ${face} keeps its bottom note text (got bottom ${crop.y + crop.h}, note ends ${minBottom})`,
    );
    assert.ok(crop.y + crop.h < legend, `${id} ${face} omits the baked-in legend`);
  }
});

test("diagram crops keep every board photo whole", () => {
  for (const board of uniqueBoards) {
    for (const face of ["front", "back"]) {
      const figure = board.diagram[face].figure;
      if (!figure) continue;
      const crop = board.diagram[face].crop;
      assert.ok(crop.y <= figure.y, `${board.id} ${face} crop cuts the board photo top`);
      assert.ok(crop.y + crop.h >= figure.y + figure.h, `${board.id} ${face} crop cuts the board photo bottom`);
    }
  }
});

test("all diagram faces use a tight vertical crop except the stacked module faces", () => {
  for (const board of uniqueBoards) {
    for (const face of ["front", "back"]) {
      if (board.id === "nrf54l15sense" && face === "front") continue;
      const diagram = board.diagram[face];
      assert.ok(
        diagram.crop.h / diagram.height < 0.9,
        `${board.id} ${face} is not vertically cropped`,
      );
    }
  }
});

test("colour key follows the official palette and chip wording", () => {
  assert.deepEqual(FN_COLOR, {
    power: "#d32f2f",
    gnd: "#2d2d2d",
    rst: "#78909c",
    digital: "#8fc31f",
    analog: "#ffa726",
    i2c: "#29b6f6",
    spi: "#ab47bc",
    uart: "#26a69a",
    peripheral: "#004966",
    ptc: "#5c6bc0",
    can: "#5c6bc0",
    seeed: "#8fc31f",
    signal: "#0091ea",
    nc: "#bdbdbd",
  });
  assert.deepEqual(LEGEND_ORDER.map((fn) => FN_LABEL[fn]), [
    "POWER", "GND", "DIGITAL GPIO", "ADC INPUT", "I2C", "SPI", "UART", "SYSTEM", "PERIPHERAL",
  ]);
  // The #5c6bc0 chip colour is board-specific: PTC touch channels on the
  // samd21 series, CAN FD bus pins on stm32c5; other boards carry no such
  // chips and their legend stops at the shared keys.
  assert.deepEqual(PTC_LEGEND_BOARDS, ["samd21", "samd21plus"]);
  assert.deepEqual(CAN_LEGEND_BOARDS, ["stm32c5"]);
  assert.equal(FN_LABEL.ptc, "PTC");
  assert.equal(FN_LABEL.can, "CAN");
  assert.equal(BOARDS.samd21plus.pins.find((pin) => pin.fn === "can"), undefined);
  assert.equal(BOARDS.stm32c5.pins.find((pin) => pin.id === "CAN_H")?.fn, "can");
  assert.equal(diagramBoxMatchesFilter("ptc", "can"), true, "the CAN key highlights the same-colour chips");
  assert.equal(diagramBoxMatchesFilter("digital", "can"), false);
  assert.deepEqual(NEW_LEGEND_BOARDS, []);
  assert.deepEqual(NEW_LEGEND_ORDER.map((fn) => FN_LABEL[fn]), [
    "POWER", "GND", "SEEED USAGE", "SIGNAL PIN", "PERIPHERAL", "SYSTEM", "NC / SHIELD",
  ]);
  const css = read("./playground/pinout/pinout.module.css");
  assert.match(css, /\.legend \{\s*display: flex;\s*flex-wrap: wrap;/);
  assert.match(css, /\.legendBtn \{\s*min-width: 106px;/);
  assert.match(css, /\.page button \{ font-family: inherit;/);
});

test("s3sense front reuses the s3 main-board classic colour key", () => {
  // The official s3sense front diagram is the Sense expansion board (camera /
  // mic / SD); the playground shows the shared s3 main-board pin map instead,
  // so the front carries the classic key — same categories as the s3 front.
  const front = BOARDS.s3sense.diagram.front;
  const cats = new Set(front.rows.flatMap((row) => row.boxes.map((box) => box.cat)));
  for (const cat of ["power", "gnd", "digital", "peripheral", "system"]) {
    assert.ok(cats.has(cat), `s3sense front has ${cat} chips`);
  }
  for (const cat of ["seeed", "signal", "nc"]) {
    assert.equal(cats.has(cat), false, `s3sense front no longer carries the 2025 ${cat} wording`);
  }
  // Every front row maps to a real s3sense pin id (the rows and card content
  // must agree — the reason the expansion-board diagram was replaced).
  const pinIds = new Set(BOARDS.s3sense.pins.map((pin) => pin.id));
  for (const row of front.rows) {
    assert.ok(pinIds.has(row.id), `s3sense front row ${row.id} maps to a pin card`);
  }
  // The USER_LED (GPIO21) row keeps its deep-blue PERIPHERAL chip like s3.
  assert.ok(
    front.rows.find((row) => row.id === "USER_LED")?.boxes.some((box) => box.cat === "peripheral"),
    "s3sense USER_LED row carries a peripheral colour chip",
  );
  // Other boards keep the classic key.
  assert.ok(BOARDS.c6.diagram.front.rows.some((row) => row.boxes.some((box) => box.cat === "digital")));
});

test("s3sense stacks the Sense expansion board as a third interactive module face", () => {
  // The expansion board (camera / mic / SD) keeps its own official diagram as
  // a "module" face below front / back: rows map to the Sense signals the
  // connector table labels, and each row opens a pin card.
  // 扩展板（摄像头/麦克风/SD）以第三个“module”面叠在正面/背面之下：行按连接器表
  // 标注的 Sense 信号命名，点行可打开引脚卡。
  const module = BOARDS.s3sense.diagram.module;
  assert.ok(module, "s3sense module diagram exists");
  assert.ok(module.src.endsWith("s3sense-module.svg"));
  // regroup splits each connector band into left / right rows: 11 + 18.
  assert.equal(module.rows.filter((row) => row.side === "left").length, 11);
  assert.equal(module.rows.filter((row) => row.side === "right").length, 18);
  const pinIds = new Set(BOARDS.s3sense.pins.map((pin) => pin.id));
  for (const row of module.rows) {
    assert.ok(pinIds.has(row.id), `s3sense module row ${row.id} maps to a pin card`);
  }
  // Card titles must match the label the user clicks: the top banner bands
  // read JTAG_MTMS/GPIO42/D11 and D12/GPIO41/JTAG_MTDI, so they map to the
  // JTAG pins, and the connector's VIN rows map to the VIN pin.
  // 卡片标题必须与点击的图上文字一致：顶部横幅是 JTAG 引脚，VIN 行对应 VIN。
  const left = module.rows.filter((row) => row.side === "left").map((row) => row.id);
  const right = module.rows.filter((row) => row.side === "right").map((row) => row.id);
  assert.equal(left[0], "MTMS");
  assert.equal(right[0], "MTDI");
  assert.equal(right[2], "VIN");
  assert.equal(right[16], "VIN");
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === "MTMS").names.chip, "GPIO42");
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === "MTDI").names.chip, "GPIO41");
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === "VIN").names.chip, "VBUS");
  // The module-face onboard pins exist and carry chip names from the connector.
  for (const id of ["PDM_DATA", "DVP_Y4", "CAM_SCL", "SD_MOSI", "SHIELD"]) {
    const pin = BOARDS.s3sense.pins.find((item) => item.id === id);
    assert.ok(pin, `s3sense has the ${id} pin`);
    assert.equal(pin.kind, "onboard");
    assert.equal(pin.status, "occupied");
  }
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === "DVP_Y4").names.chip, "GPIO18");
  assert.equal(BOARDS.s3sense.pins.find((pin) => pin.id === "SD_MOSI").names.chip, "GPIO9");
  // Both expansion-board photos stay whole (union y 17-833.6) and the crop
  // stops above the baked-in legend strip (y 1016).
  assert.deepEqual(module.figure, { x: 207, y: 17, w: 816.4, h: 816.6, fw: 225.6 });
  assert.ok(module.crop.y <= 17 && module.crop.y + module.crop.h >= 833.6, "module crop keeps both board photos whole");
  assert.ok(module.crop.y + module.crop.h < 1016, "module crop omits the baked-in legend");
  assert.ok(module.fitLegendRatio > 0, "module face keeps its published sizing ratio");
  // The narrower camera-board photo renders inside the shared size window
  // (boardFrameWidth returns full width: the target would exceed the stage).
  assert.equal(boardFrameWidth({ workWidth: 1200, figureWidth: 225.6 }), null);
});

test("diagram filters highlight label colours instead of whole pin rows", () => {
  assert.equal(diagramBoxMatchesFilter("digital", "digital"), true);
  assert.equal(diagramBoxMatchesFilter("system", "digital"), false);
  assert.equal(diagramBoxMatchesFilter("system", "rst"), true);
  assert.equal(diagramBoxMatchesFilter("digital", "rst"), false);
  assert.equal(diagramBoxMatchesFilter("peripheral", "peripheral"), true);
  assert.equal(diagramBoxMatchesFilter("peripheral", "digital"), false);

  assert.equal(BOARDS.s3.pins.find((pin) => pin.id === "USER_LED")?.fn, "peripheral");
  assert.equal(BOARDS.s3plus.pins.find((pin) => pin.id === "USER_LED")?.fn, "peripheral");

  // The official s3 front diagram places the GPIO21/USER_LED chips on the
  // right column with a deep-blue PERIPHERAL chip; the scanned row must cover
  // them so filtering dims every other row.
  const s3FrontRight = BOARDS.s3.diagram.front.rows.filter((row) => row.side === "right");
  assert.equal(s3FrontRight.length, 9, "s3 front right column has nine label rows");
  const userLedRow = s3FrontRight.find((row) => row.id === "USER_LED");
  assert.ok(userLedRow, "s3 front maps the USER_LED label row on the right");
  assert.ok(
    userLedRow.boxes.some((box) => box.cat === "peripheral"),
    "USER_LED row carries a peripheral colour chip",
  );

  for (const board of uniqueBoards) {
    for (const diagram of Object.values(board.diagram)) {
      for (const row of diagram.rows) {
        for (const box of row.boxes) {
          if (box.cat === "digital") assert.equal(diagramBoxMatchesFilter(box.cat, "digital"), true);
          if (box.cat === "system") assert.equal(diagramBoxMatchesFilter(box.cat, "rst"), true);
        }
      }
    }
  }
});

test("function primers exist in English and Chinese for every key", () => {
  assert.deepEqual(FUNCTION_KEYS, [
    "i2c", "spi", "uart", "adc", "pwm", "dac", "power", "gnd", "rst", "debug", "battery", "wireless", "touch",
    "ptc", "can", "i2s",
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

test("pin card opens beside the clicked row and anchors to its height", () => {
  const board = BOARDS.samd21;
  const row = board.diagram.front.rows.find((item) => item.id === "D8");
  const pinTop = 400;
  const pos = placePinCard({
    workWidth: 1100,
    workTop: 180,
    frameLeft: 12,
    frameWidth: 1068,
    crop: board.diagram.front.crop,
    row,
    side: "right",
    pinTop,
    viewportHeight: 900,
  });
  const pinLeft = 12 + ((Math.min(...row.boxes.map((box) => box.x)) - board.diagram.front.crop.x) / board.diagram.front.crop.w) * 1068;
  assert.ok(pos.width >= 500, "card uses the free width beside the pin");
  assert.ok(pos.left + pos.width + PIN_CLEARANCE <= pinLeft + 1, "card leaves the clicked pin visible");
  assert.ok(pinLeft - (pos.left + pos.width) >= PIN_CLEARANCE - 1);
  // The card's top sits slightly above the clicked row's screen position…
  assert.equal(pos.top, pinTop - 180 - 20);
  // …clamped up when the row is near the viewport top.
  const high = placePinCard({
    workWidth: 1100, workTop: 180, frameLeft: 12, frameWidth: 1068,
    crop: board.diagram.front.crop, row, side: "right", pinTop: 120, viewportHeight: 900,
  });
  assert.equal(high.top, 8);
  assert.ok(pos.maxHeight >= 480, "card uses the visible viewport height");
  assert.ok(pos.top + pos.maxHeight <= 900 - 180 - 8);
});

test("pin card clamps above the viewport bottom when the pin is low on the diagram", () => {
  const pos = placePinCard({
    workWidth: 1100,
    workTop: 200,
    frameLeft: 12,
    frameWidth: 1068,
    crop: { x: 0, y: 200, w: 1920, h: 395 },
    row: { y: 560, boxes: [{ x: 1600, y: 540, w: 280, h: 28 }] },
    side: "right",
    pinTop: 680,
    viewportHeight: 900,
  });
  // Row near the bottom: the card top is clamped so ≥320px stay visible.
  assert.equal(pos.top, 900 - 200 - 8 - 320);
  assert.ok(pos.left > 200);
  assert.ok(pos.left + pos.width + PIN_CLEARANCE <= 12 + (1600 / 1920) * 1068 + 1);
  assert.ok(pos.top + pos.maxHeight <= 700);
});

test("desktop frame widths render every board photo at one shared size", () => {
  const workW = 1060;
  // fw is the visible board width (photo rect minus background margins), which
  // clusters at ~250-300 user units: most faces use the full width and render
  // their board at that width; wider photos get narrowed frames.
  assert.equal(boardFrameWidth({ workWidth: workW, figureWidth: 279.7 }), null, "c6 front uses the full width");
  // The fix_1013 transparent stm32c5 front (275.1) fits the shared board size
  // and keeps the full width, while the wider re-laid-out back (327.3, with
  // tighter photo margins on the 1681-wide canvas) is narrowed to the shared
  // board size.
  assert.equal(boardFrameWidth({ workWidth: workW, figureWidth: 275.1 }), null, "stm32c5 front uses the full width");
  const stm = boardFrameWidth({ workWidth: workW, figureWidth: 327.3 });
  assert.ok(Math.abs(stm - BOARD_FRACTION * workW * 1920 / 327.3) <= 1, "stm32c5 back is narrowed by its board width");
  assert.ok(stm < workW);
  // Photos with the same visible board (tight c6 crop vs margined c5 photo,
  // plus vs sense plus) must render at one shared size.
  assert.ok(
    Math.abs(BOARDS.c6.diagram.front.figure.fw - BOARDS.c5.diagram.front.figure.fw) <= 5,
    "c6 and c5 fronts have matching visible board widths",
  );
  assert.ok(
    Math.abs(BOARDS.nrf52840plus.diagram.front.figure.fw - BOARDS.nrf52840senseplus.diagram.front.figure.fw) <= 5,
    "nrf52840plus renders as large as nrf52840senseplus",
  );
  for (const board of uniqueBoards) {
    for (const face of ["front", "back"]) {
      const figure = board.diagram[face].figure;
      if (!figure?.fw) continue;
      const frame = boardFrameWidth({ workWidth: workW, figureWidth: figure.fw });
      const rendered = (figure.fw / 1920) * (frame ?? workW);
      assert.ok(
        // Faces whose board is narrower than the target share get the full
        // workspace width; the smallest photo (ra4 back, 208.9) sets the floor.
        rendered >= 0.105 * workW && rendered <= 0.16 * workW,
        `${board.id} ${face} board renders at ${rendered.toFixed(0)}px (${(rendered / workW).toFixed(3)} of workspace)`,
      );
    }
  }
  assert.equal(boardFrameWidth({ workWidth: 0, figureWidth: 300 }), null);
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
  assert.match(view, /\[\"front\", \"back\", \"module\"\]/);
  assert.match(view, /searchParams\.delete\(\"side\"\)/);
  assert.match(view, /cardSheet/);
  // The floating card is draggable by its header (pointer capture + grab
  // cursor); once dragged it pins to the viewport so it can park in the page
  // margins outside the diagram column.
  // 浮动卡片可按住标题栏拖动（指针捕获 + 抓取光标）；拖动后固定于视口，
  // 可停靠在图列之外的页面留白处。
  assert.match(view, /onCardDragStart/);
  assert.match(view, /setPointerCapture/);
  assert.match(view, /cardFixed/);
  assert.match(css, /cursor: grab/);
  assert.match(css, /cardPinned/);
  assert.match(css, /position: fixed/);
  assert.match(view, /summaryRows/);
  assert.match(view, /style=\{\{ top: cardPos\.top, left: cardPos\.left, width: cardPos\.width, maxHeight: cardPos\.maxHeight \}\}/);
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
  assert.doesNotMatch(css, /legendStrip/);
  assert.doesNotMatch(view, /legendStrip/);
  assert.match(css, /diagram-max-w/);
  assert.match(view, /diagramMaxW/);
  assert.doesNotMatch(view, /stageName/);
  assert.match(css, /letter-spacing:\s*0\.18em/);
  assert.match(css, /mix-blend-mode:\s*multiply/);
  assert.doesNotMatch(css, /\.padRight/);
  assert.doesNotMatch(view, /padRight/);
  assert.doesNotMatch(view, /diagramRowDim/);
  assert.match(view, /diagramBoxMatchesFilter/);
  assert.match(css, /@media \(max-width: 899px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("card closes on any outside click, primers start collapsed, table starts open", () => {
  const view = read("./playground/pinout/PinoutView.js");
  const css = read("./playground/pinout/pinout.module.css");
  assert.match(view, /document\.addEventListener\("click", onOutside\)/);
  assert.doesNotMatch(view, /onPointerDown=\{\(event\) =>/);
  assert.match(view, /const \[tableOpen, setTableOpen\] = useState\(true\)/);
  assert.match(view, /const \[openGuides, setOpenGuides\] = useState\(\(\) => new Set\(\)\)/);
  assert.match(view, /const open = openGuides\.has\(key\)/);
  assert.match(view, /stageRule/);
  assert.match(css, /\.stageRule/);
  assert.match(css, /data-filtered/);
  assert.match(css, /background: var\(--fn-color\)/);
  assert.doesNotMatch(css, /\.fact::before/);
});

test("board table rows only read out, long notes carry a hover tooltip", () => {
  const view = read("./playground/pinout/PinoutView.js");
  const css = read("./playground/pinout/pinout.module.css");
  assert.doesNotMatch(view, /onClick=\{\(\) => jumpTo\(pin\.id\)\}/);
  assert.match(view, /<td title=\{note\}>\{note\}<\/td>/);
  assert.match(css, /\.summary tbody tr \{ transition/);
  assert.doesNotMatch(css, /\.summary tbody tr \{ cursor: pointer/);
});
