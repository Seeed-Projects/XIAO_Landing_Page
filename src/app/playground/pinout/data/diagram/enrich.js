import { buildDiagram } from "../defineBoard.js";
import { BOARD_DIAGRAMS } from "./boardDiagrams.js";
import { regroupDiagramLayout } from "./inferRows.js";
import { FAMILY_NOTES } from "../notes/index.js";
import { FAMILY_ALT } from "../alt/index.js";
import { GENERIC_GPIO } from "../notes/util.js";
import { ALT_KEYS } from "../schema.js";

function pushNotes(bucket, list) {
  for (const note of list || []) {
    if (!note?.en || !note?.zh) continue;
    if (bucket.some((item) => item.en === note.en)) continue;
    bucket.push({ level: note.level || "info", en: note.en, zh: note.zh });
  }
}

function notesFor(board, pin) {
  const family = FAMILY_NOTES[board.series] || {};
  const bucket = [];
  pushNotes(bucket, family.byId?.[pin.id]);
  pushNotes(bucket, family.byChip?.[pin.names.chip]);
  pushNotes(bucket, family.byBoard?.[board.id]?.[pin.id]);
  pushNotes(bucket, family.byBoard?.[board.id]?.[pin.names.chip]);
  if (pin.warning?.en) {
    pushNotes(bucket, [{
      level: pin.status === "free" ? "info" : "caution",
      en: pin.warning.en,
      zh: pin.warning.zh || pin.warning.en,
    }]);
  }
  if (!bucket.length && pin.kind === "header") bucket.push(GENERIC_GPIO);
  return bucket;
}

function altFromCaps(pin) {
  const out = {};
  if (pin.caps?.adc) out.adc = pin.caps.adc === true ? "ADC" : pin.caps.adc;
  if (pin.caps?.i2c) out.i2c = pin.caps.i2c === true ? "I²C" : pin.caps.i2c;
  if (pin.caps?.spi) out.spi = pin.caps.spi === true ? "SPI" : pin.caps.spi;
  if (pin.caps?.uart) out.uart = pin.caps.uart === true ? "UART" : pin.caps.uart;
  if (pin.caps?.pwm) out.pwm = pin.caps.pwm === true ? "PWM" : pin.caps.pwm;
  if (pin.caps?.dac) out.other = [pin.caps.dac === true ? "DAC" : pin.caps.dac];
  return out;
}

function altFor(board, pin) {
  const family = FAMILY_ALT[board.series] || {};
  const fromChip = family[pin.names.chip] || {};
  const fromCaps = altFromCaps(pin);
  const merged = { ...fromCaps, ...fromChip };
  if (Array.isArray(fromCaps.other) || Array.isArray(fromChip.other)) {
    merged.other = [...new Set([...(fromChip.other || []), ...(fromCaps.other || [])])];
  }
  const out = {};
  for (const key of ALT_KEYS) {
    if (merged[key] == null || merged[key] === "") continue;
    out[key] = merged[key];
  }
  return out;
}

function padIndexFor(diagram, pin) {
  for (const face of ["front", "back"]) {
    const rows = diagram?.[face]?.rows || [];
    const hit = rows.find((row) => row.id === pin.id);
    if (!hit) continue;
    const same = rows.filter((row) => row.side === hit.side);
    const index = same.findIndex((row) => row.id === pin.id);
    if (index >= 0) return index + 1;
  }
  return null;
}

function decoratePins(board, diagram) {
  return board.pins.map((pin) => ({
    ...pin,
    notes: notesFor(board, pin),
    alt: altFor(board, pin),
    padIndex: padIndexFor(diagram, pin),
  }));
}

/** Attach official diagrams and merge per-pin notes / alt functions. 挂上官方图，并按芯片合并注意事项与备用功能。 */
export function enrichBoard(board) {
  const spec = BOARD_DIAGRAMS[board.id];
  if (!spec) return { ...board, pins: decoratePins(board, board.diagram || null) };
  const grouped = {};
  for (const face of ["front", "back"]) {
    if (!spec[face]) continue;
    grouped[face] = { ...spec[face], layout: regroupDiagramLayout(spec[face].layout) };
  }
  const diagram = buildDiagram(grouped, board.id);
  if (!diagram) return { ...board, pins: decoratePins(board, null) };
  const images = { ...board.images };
  if (spec.front?.src) {
    const size = grouped.front.layout.size;
    images.front = { src: spec.front.src, width: size.width, height: size.height };
  }
  if (spec.back?.src) {
    const size = grouped.back.layout.size;
    images.back = { src: spec.back.src, width: size.width, height: size.height };
  }
  const next = { ...board, images, diagram };
  return { ...next, pins: decoratePins(next, diagram) };
}
