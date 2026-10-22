import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOARD_LIST, FN_LABEL, LEGEND_ORDER, NEW_LEGEND_BOARDS, NEW_LEGEND_ORDER,
  PTC_LEGEND_BOARDS, CAN_LEGEND_BOARDS, NC_LEGEND_BOARDS, diagramBoxMatchesFilter,
} from "../src/app/playground/pinout/data/index.js";
import { labelCategories } from "./pinout-label-categories.mjs";
import { labelBoxKey, svgLabelReader } from "./pinout-label-text.mjs";
import { DIAGRAM_LEGENDS } from "../src/app/playground/pinout/data/diagram/legends.js";
import { scanSvg } from "./pinout-diagram-scan.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(new URL("../src/app/playground/pinout/data/diagrams/manifest.json", import.meta.url), "utf8"));
const categoriesOf = (cat) => Array.isArray(cat) ? cat : [cat];
const filterFor = (category) => category === "system" ? "rst" : category;

/** nRF54 artwork prints the pad name (P1.04) inside the green DIGITAL GPIO pill, so
 *  the colour key outranks the pad-name text rule on these boards.
 *  nRF54 原图把焊盘名（P1.04）直接印在 DIGITAL GPIO 绿色胶囊里，这些板按颜色标注优先于文字规则。 */
const DIGITAL_PAD_NAME_BOARDS = new Set(["nrf54l15", "nrf54l15sense", "nrf54lm20a", "nrf54lm20asense"]);
const expectedCategories = (boardId, text) => {
  const cats = labelCategories(text);
  if (DIGITAL_PAD_NAME_BOARDS.has(boardId) && cats.length === 1 && cats[0] === "pinname") return ["digital"];
  return cats;
};

/** Artwork pills printed in another category's colour: the colour key
 *  outranks the label-text rule at these positions (stm32c5 prints the
 *  USB_D± pills in the SYSTEM grey-blue, nRF54L15 prints its two RESET
 *  pills in DIGITAL green and PERIPHERAL blue, and the nRF54L15 back
 *  diagrams print their unbonded N/A pads in the GND dark band that the
 *  artwork key labels "GND / N/A").
 *  原图以他类颜色印制的胶囊：这些位置按颜色标注优先于文字规则
 *  （stm32c5 的 USB_D± 印成 SYSTEM 蓝灰，nRF54L15 的两枚 RESET 分别印成
 *  DIGITAL 绿与 PERIPHERAL 蓝，nRF54L15 背面的未键合 N/A 焊盘印在色标
 *  标注为 "GND / N/A" 的深色带里）。 */
const ARTWORK_COLOR_OVERRIDES = {
  "stm32c5-back": {
    "296,76,135,32.4": ["system"],
    "794,76,135,32.4": ["system"],
  },
  "nrf54l15-front": {
    "670,520,135,32.4": ["digital"],
    "370,520,135,32.4": ["peripheral"],
  },
  "nrf54l15sense-front": {
    "670,376,135,32.4": ["digital"],
    "370,376,135,32.4": ["peripheral"],
  },
  "nrf54l15-back": {
    "675,386,135,32.4": ["gnd"],
    "675,424,135,32.4": ["gnd"],
    "1111,387,135,32.4": ["gnd"],
  },
  "nrf54l15sense-back": {
    "675,386,135,32.4": ["gnd"],
    "675,424,135,32.4": ["gnd"],
    "1111,387,135,32.4": ["gnd"],
  },
  // The Sense variants print the 6-DoF IMU on I2C1 (D13/D14): the SCL row and
  // the "I2C Addr. 0x6A" row belong to that peripheral too, so their cats
  // carry i2c + peripheral and the colour key no longer decides alone.
  // Sense 变体把 6-DoF IMU 挂在 I2C1（D13/D14）上：SCL 行与 "I2C Addr. 0x6A"
  // 行同属该外设，cat 需带 i2c + peripheral，不再单由颜色决定。
  "mg24sense-front": {
    "158,573.6,121.5,29.16": ["i2c", "peripheral"],
    "158,608.7,121.5,29.16": ["i2c", "peripheral"],
  },
  // The SAMD21 artwork prints the D0 DAC pill in the SYSTEM grey-blue, so it
  // lights with the SYSTEM key, not PERIPHERAL, despite the DAC text rule.
  // SAMD21 原图把 D0 的 DAC 胶囊印成 SYSTEM 灰蓝：尽管文字规则归外设，
  // 它应随 SYSTEM 色键点亮，而非 PERIPHERAL。
  "samd21-front": {
    "153.5,332,121.5,29.16": ["system"],
  },
  "samd21plus-front": {
    "153.5,322,121.5,29.16": ["system"],
  },
};

/** The s3sense module artwork prints its own 7-entry key, so its cats come
 *  from the artwork colour at each position (green = SEEED USAGE, blue =
 *  SIGNAL PIN, dark blue = PERIPHERAL …) rather than the front-face text
 *  rules; only a pill in an unlisted colour falls back to the text rules
 *  and gets flagged.
 *  s3sense 模块图自印 7 项色键：cat 按各位置的原画颜色归类（绿 = SEEED
 *  USAGE、蓝 = SIGNAL PIN、深蓝 = PERIPHERAL……），不再套用正面的文字
 *  规则；只有颜色不在色键里的胶囊才回退文字规则并被标记。 */
const MODULE_FACE_KEY = "s3sense-module";
const MODULE_COLOR_CATEGORIES = {
  "#8FC31F": ["seeed"],
  "#0091EA": ["signal"],
  "#004966": ["peripheral"],
  "#78909C": ["system"],
  "#2D2D2D": ["gnd"],
  "#BDBDBD": ["nc"],
  "#D32F2F": ["power"],
};

const ARTWORK_OVERPRINTS = {
  "samd21plus-back": {
    reason: "The SVG paints the D19-D24 labels twice at identical coordinates; each physical label has one interactive box.",
    positions: [
      "1013,376,121.5,29.16", "1147,376,121.5,29.16", "1281,376,121.5,29.16",
      "1013,416,121.5,29.16", "1147,416,121.5,29.16", "1281,416,121.5,29.16",
      "1013,456,121.5,29.16", "1147,456,121.5,29.16", "1281,460,121.5,29.16",
      "1013,496,121.5,29.16", "1147,496,121.5,29.16",
      "1013,535,121.5,29.16", "1147,535,121.5,29.16",
      "1013,574,121.5,29.16", "1147,574,121.5,29.16",
    ],
  },
};

/** Check physical ownership, column boundaries and complete horizontal label bands.
 * 检查实体标签的归属、列分界和水平标签带的完整性。 */
function auditStructure(board, face, diagram, scanned, readLabel, legendTop) {
  const issues = [], exceptions = [], byKind = {};
  const add = (kind, details) => {
    byKind[kind] = (byKind[kind] || 0) + 1;
    issues.push({ kind, board: board.id, face, ...details });
  };
  const sourceId = `${board.id}-${face}`;
  const body = scanned.blobs.filter((box) => box.y < legendTop - 0.5);
  const owners = new Map();
  const splitAt = (y) => scanned.columnSplits?.findLast((band) => y >= band.y)?.x
    ?? diagram.figure.x + diagram.figure.w / 2;
  const sideOf = (box) => box.x + box.w / 2 < splitAt(box.y + box.h / 2) ? "left" : "right";
  diagram.rows.forEach((row, index) => {
    const location = { side: row.side, row: index, id: row.id };
    const keys = new Set(row.boxes.map(labelBoxKey));
    const labels = row.boxes.map((box) => ({ box, text: readLabel(box) }));
    for (const box of row.boxes) {
      const position = labelBoxKey(box);
      if (owners.has(position)) add("duplicateBoxAssignment", { ...location, position, previousRow: owners.get(position) });
      else owners.set(position, index);
    }
    for (const [kind, pattern] of [
      ["multiplePinNames", /\b(?:GPIO\d+|P[A-Z]?\d+(?:\.\d+)?)\b/i],
      ["multipleDigitalNames", /\bD\d+\b/i],
    ]) {
      const matches = labels.filter(({ text }) => pattern.test(text));
      if (matches.length > 1) add(kind, { ...location, labels: matches.map(({ text }) => text) });
    }
    const wrongSide = labels.filter(({ box }) => row.side === "left"
      ? box.x + box.w > splitAt(box.y + box.h / 2) + 0.5
      : box.x < splitAt(box.y + box.h / 2) - 0.5);
    if (wrongSide.length) add("crossColumnRow", { ...location, labels: wrongSide.map(({ text }) => text) });
    const centers = row.boxes.map((box) => box.y + box.h / 2);
    if (Math.max(...centers) - Math.min(...centers) > Math.min(...row.boxes.map((box) => box.h)) * 0.5) {
      add("misalignedRow", location);
    }
    const missing = body.filter((box) => sideOf(box) === row.side
      && Math.abs(box.y + box.h / 2 - row.y) < box.h * 0.35 && !keys.has(labelBoxKey(box)));
    if (missing.length) add("splitLabelRow", { ...location, positions: missing.map(labelBoxKey), labels: missing.map(readLabel) });
  });
  for (const box of body) {
    if (!owners.has(labelBoxKey(box))) add("missingInteractiveBox", { position: labelBoxKey(box), text: readLabel(box) });
  }
  const approved = ARTWORK_OVERPRINTS[sourceId];
  const remaining = new Set(approved?.positions);
  for (const box of scanned.overprints) {
    const position = labelBoxKey(box);
    if (remaining.delete(position)) exceptions.push({ board: board.id, face, kind: "artworkOverprint", position, reason: approved.reason });
    else add("unreviewedArtworkOverprint", { position, text: readLabel(box) });
  }
  for (const position of remaining) add("staleArtworkException", { position });
  return { issues, exceptions, summary: { mismatches: issues.length, byKind, artworkOverprints: exceptions.length } };
}

/** The chip set the UI shows for a given face: front/back use the classic
 *  key (plus PTC/CAN where printed), while a module face carries its own
 *  NEW_LEGEND_ORDER key, and the NC chip moves to the module face on boards
 *  that have one.
 * 图例胶囊按面取用：正/背面沿用经典色键（含 PTC/CAN），模块面使用自身的
 * NEW_LEGEND_ORDER 色键；带模块面的板，NC 胶囊移到模块面。 */
export function legendFiltersFor(board, face = "front") {
  if (face === "module") return NEW_LEGEND_ORDER;
  return [
    ...(NEW_LEGEND_BOARDS.includes(board.id) ? NEW_LEGEND_ORDER : LEGEND_ORDER),
    ...(PTC_LEGEND_BOARDS.includes(board.id) ? ["ptc"] : []),
    ...(CAN_LEGEND_BOARDS.includes(board.id) ? ["can"] : []),
    ...(NC_LEGEND_BOARDS.includes(board.id) && !board.diagram?.module ? ["nc"] : []),
  ];
}

/** Compare every displayed row against the text at its SVG box positions.
 * 对照 SVG 标签框位置的文字，检查全部显示行。 */
export function auditPinoutFilters(boards = BOARD_LIST) {
  const faces = [], issues = [], exceptions = [];
  const structuralIssues = {};
  let boxes = 0, rows = 0, filters = 0;
  const problemBoxes = { wrongCategory: 0, missingCategory: 0, combinedLabel: 0, missingText: 0, missingFill: 0, wrongFill: 0 };
  for (const board of boards) {
    for (const [face, diagram] of Object.entries(board.diagram)) {
      const sourceId = `${board.id}-${face}`;
      const source = readFileSync(path.join(ROOT, "public", diagram.src), "utf8");
      const readLabel = svgLabelReader(source, sourceId);
      const scanned = scanSvg(source, sourceId);
      const svgBoxes = new Set(scanned.blobs.map(labelBoxKey));
      const boxFills = new Map(scanned.blobs.map((blob) => [
        labelBoxKey(blob),
        `#${blob.color.map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`,
      ]));
      const legendTop = DIAGRAM_LEGENDS[board.id][face].y;
      const structure = auditStructure(board, face, diagram, scanned, readLabel, legendTop);
      issues.push(...structure.issues);
      exceptions.push(...structure.exceptions);
      for (const [kind, count] of Object.entries(structure.summary.byKind)) structuralIssues[kind] = (structuralIssues[kind] || 0) + count;
      const rowDetails = diagram.rows.map((row, index) => {
        const details = row.boxes.map((box) => {
          boxes++;
          const location = { board: board.id, face, side: row.side, row: index, id: row.id, position: labelBoxKey(box) };
          if (!svgBoxes.has(location.position)) issues.push({ kind: "missingSvgBox", ...location });
          // Highlight repaints a matched pill with box.fill, so it must carry
          // the artwork colour at that position.
          // 高亮用 box.fill 重绘匹配胶囊，必须与该位置的原图颜色一致。
          const expectedFill = boxFills.get(location.position);
          if (typeof box.fill !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(box.fill)) {
            problemBoxes.missingFill++;
            issues.push({ kind: "missingBoxFill", ...location, fill: box.fill });
          } else if (expectedFill && box.fill.toUpperCase() !== expectedFill) {
            problemBoxes.wrongFill++;
            issues.push({ kind: "boxFillMismatch", ...location, fill: box.fill, expected: expectedFill });
          }
          const text = readLabel(box);
          if (typeof box.text !== "string" || !box.text.trim()) {
            problemBoxes.missingText++;
            issues.push({ kind: "missingBoxText", ...location });
          } else if (box.text !== text) {
            issues.push({ kind: "boxText", ...location, text: box.text, expected: text });
          }
          // Artwork pills printed in another category's colour outrank the
          // label-text rule, like the pad-name pills on nRF54; on the s3sense
          // module face the artwork colour is the whole key.
          // 以他类颜色印制的胶囊同样按颜色优先于文字规则，同 nRF54 焊盘名胶囊；
          // s3sense 模块面上原画颜色本身就是色键。
          const override = sourceId === MODULE_FACE_KEY
            ? MODULE_COLOR_CATEGORIES[boxFills.get(location.position)]
            : ARTWORK_COLOR_OVERRIDES[sourceId]?.[location.position];
          const expected = override || expectedCategories(board.id, text);
          const actual = categoriesOf(box.cat);
          const missing = expected.filter((cat) => !actual.includes(cat));
          const extra = actual.filter((cat) => !expected.includes(cat));
          if (!expected.length) issues.push({ kind: "unclassifiedText", ...location, text });
          if (extra.length) problemBoxes.wrongCategory++;
          if (missing.length) problemBoxes.missingCategory++;
          if (expected.length > 1 && missing.length) problemBoxes.combinedLabel++;
          if (missing.length || extra.length) issues.push({ kind: "boxCategory", ...location, text, cat: box.cat, expected, missing, extra });
          return { position: location.position, text, cat: box.cat, expected };
        });
        return { id: row.id, side: row.side, index, boxes: details };
      });
      rows += rowDetails.length;
      const selections = legendFiltersFor(board, face).map((filter) => {
        filters++;
        const highlighted = [];
        rowDetails.forEach((row) => {
          const actual = diagram.rows[row.index].boxes.some((box) => diagramBoxMatchesFilter(box.cat, filter));
          const expected = row.boxes.some((box) => box.expected.some((cat) => filterFor(cat) === filter));
          if (actual) highlighted.push(row);
          if (actual !== expected) issues.push({
            kind: expected ? "missingRowMatch" : "unexpectedRowMatch",
            board: board.id, face, filter, id: row.id, side: row.side, row: row.index,
            labels: row.boxes.map((box) => box.text),
          });
        });
        return { filter, label: FN_LABEL[filter], highlighted };
      });
      faces.push({ board: board.id, face, structure: structure.summary, rows: rowDetails, selections });
    }
  }
  const expectedFaces = Object.keys(manifest.assets);
  const seen = new Set(faces.map(({ board, face }) => `${board}-${face}`));
  for (const face of expectedFaces) if (!seen.has(face)) issues.push({ kind: "missingFace", face });
  if (boards.length !== manifest.boards.length) issues.push({ kind: "boardCoverage", expected: manifest.boards.length, actual: boards.length });
  return { summary: { boards: boards.length, faces: faces.length, rows, boxes, filters, mismatches: issues.length, problemBoxes, structuralIssues, artworkOverprints: exceptions.length }, faces, issues, exceptions };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const report = auditPinoutFilters();
    if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
    else {
      if (!process.argv.includes("--summary")) {
        for (const face of report.faces) {
          for (const selection of face.selections) {
            console.log(`\n${face.board}/${face.face} ${selection.label}: ${selection.highlighted.length} rows`);
            for (const row of selection.highlighted) {
              console.log(`  ${row.side}[${row.index}] ${row.id}: ${row.boxes.map((box) => `${JSON.stringify(box.text)} (${JSON.stringify(box.cat)})`).join(" | ")}`);
            }
          }
        }
      }
      for (const issue of report.issues) console.log(`MISMATCH ${JSON.stringify(issue)}`);
      for (const face of report.faces) {
        if (face.structure.mismatches || face.structure.artworkOverprints) console.log(`STRUCTURE ${face.board}/${face.face}: ${JSON.stringify(face.structure)}`);
      }
      for (const sourceId of Object.keys(ARTWORK_OVERPRINTS)) {
        console.log(`ARTWORK ${sourceId}: ${ARTWORK_OVERPRINTS[sourceId].reason}`);
      }
      console.log(`\nPinout filter audit: ${JSON.stringify(report.summary)}`);
    }
    process.exitCode = report.issues.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
