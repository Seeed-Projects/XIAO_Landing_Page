import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BOARD_LIST, FN_LABEL, LEGEND_ORDER, NEW_LEGEND_BOARDS, NEW_LEGEND_ORDER,
  PTC_LEGEND_BOARDS, CAN_LEGEND_BOARDS, diagramBoxMatchesFilter,
} from "../src/app/playground/pinout/data/index.js";
import { labelCategories } from "./pinout-label-categories.mjs";
import { labelBoxKey, svgLabelReader } from "./pinout-label-text.mjs";
import { DIAGRAM_LEGENDS } from "../src/app/playground/pinout/data/diagram/legends.js";
import { scanSvg } from "./pinout-diagram-scan.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(new URL("../src/app/playground/pinout/data/diagrams/manifest.json", import.meta.url), "utf8"));
const categoriesOf = (cat) => Array.isArray(cat) ? cat : [cat];
const filterFor = (category) => category === "system" ? "rst" : category;

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

export function legendFiltersFor(boardId) {
  return [
    ...(NEW_LEGEND_BOARDS.includes(boardId) ? NEW_LEGEND_ORDER : LEGEND_ORDER),
    ...(PTC_LEGEND_BOARDS.includes(boardId) ? ["ptc"] : []),
    ...(CAN_LEGEND_BOARDS.includes(boardId) ? ["can"] : []),
  ];
}

/** Compare every displayed row against the text at its SVG box positions.
 * 对照 SVG 标签框位置的文字，检查全部显示行。 */
export function auditPinoutFilters(boards = BOARD_LIST) {
  const faces = [], issues = [], exceptions = [];
  const structuralIssues = {};
  let boxes = 0, rows = 0, filters = 0;
  const problemBoxes = { wrongCategory: 0, missingCategory: 0, combinedLabel: 0, missingText: 0 };
  for (const board of boards) {
    for (const [face, diagram] of Object.entries(board.diagram)) {
      const sourceId = `${board.id}-${face}`;
      const source = readFileSync(path.join(ROOT, "public", diagram.src), "utf8");
      const readLabel = svgLabelReader(source, sourceId);
      const scanned = scanSvg(source, sourceId);
      const svgBoxes = new Set(scanned.blobs.map(labelBoxKey));
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
          const text = readLabel(box);
          if (typeof box.text !== "string" || !box.text.trim()) {
            problemBoxes.missingText++;
            issues.push({ kind: "missingBoxText", ...location });
          } else if (box.text !== text) {
            issues.push({ kind: "boxText", ...location, text: box.text, expected: text });
          }
          const expected = labelCategories(text);
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
      const selections = legendFiltersFor(board.id).map((filter) => {
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
