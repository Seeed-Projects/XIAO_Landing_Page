/**
 * Pin / board builders and schema checks for the Playground pinout page.
 * Playground 引脚页的引脚、板级数据构造与校验。
 */

const TEXT = (en, zh) => ({ en, zh: zh || en });
const EMPTY_TEXT = { en: "", zh: "" };

export const PIN_STATUS = ["free", "conditional", "occupied"];
export const PIN_FN = ["power", "gnd", "rst", "digital", "analog", "i2c", "spi", "uart"];
/**
 * header: castellated edge pad with a label strip.
 * pad: extra pad on the photo (SWD, VIN, RST) labelled by a small tag.
 * onboard: chip pin wired to an onboard part (LED, button); no pad, listed in the onboard row.
 * header：板边焊盘，带标签带；pad：板上附加焊盘（SWD、VIN、RST），用小标签标注；
 * onboard：接到板载器件的芯片引脚，无焊盘，显示在板载行。
 */
export const PIN_KIND = ["header", "pad", "onboard"];

function gpioNumber(chip) {
  const match = String(chip || "").match(/GPIO\s*(\d+)/i);
  return match ? match[1] : "";
}

function inferFrameworkName(chip, series) {
  if (series === "esp32" || series === "rp") return gpioNumber(chip);
  return "";
}

export function createPin(spec) {
  const warning = spec.warning === "" || spec.warning == null
    ? EMPTY_TEXT
    : (typeof spec.warning === "string" ? TEXT(spec.warning, spec.warningZh || spec.warning) : spec.warning);
  const desc = typeof spec.desc === "string" ? TEXT(spec.desc, spec.descZh || spec.desc) : (spec.desc || EMPTY_TEXT);
  const silk = spec.silk ?? spec.id;
  const chip = spec.chip || "—";
  const series = spec.series || "";
  const names = {
    silk,
    arduino: spec.arduino ?? silk,
    chip,
    micropython: spec.micropython ?? inferFrameworkName(chip, series),
    zephyr: spec.zephyr ?? (series.startsWith("nrf") ? chip : ""),
  };
  return {
    id: spec.id,
    kind: spec.kind || "header",
    side: spec.side || "front",
    pad: spec.pad || null,
    pads: spec.pads || null,
    anchor: spec.anchor || null,
    lane: spec.lane || null,
    order: spec.order ?? 0,
    names,
    fn: spec.fn,
    caps: spec.caps || {},
    status: spec.status || "free",
    warning,
    desc,
    code: spec.code || "",
    occupiedBy: spec.occupiedBy || "",
  };
}

export function createMarker(spec) {
  return {
    id: spec.id,
    label: spec.label,
    fn: spec.fn || "digital",
    anchor: spec.anchor ?? null,
    desc: typeof spec.desc === "string" ? TEXT(spec.desc, spec.descZh || spec.desc) : (spec.desc || EMPTY_TEXT),
    chip: spec.chip || "",
    status: spec.status || "occupied",
  };
}

export function attachLayout(pin, layout) {
  if (!layout) return pin;
  const next = { ...pin };
  if (layout.x != null) next.pad = { x: layout.x, y: layout.y };
  if (layout.lane) next.lane = layout.lane;
  if (layout.order != null) next.order = layout.order;
  return next;
}

export function localize(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.en || "";
}

export function pinMatchesQuery(pin, query) {
  if (!query) return false;
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const hay = [
    pin.id,
    pin.names.silk,
    pin.names.arduino,
    pin.names.chip,
    pin.names.micropython,
    pin.names.zephyr,
    pin.caps.adc,
    pin.caps.i2c,
    pin.caps.spi,
    pin.caps.uart,
    pin.fn,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function pinHasFilter(pin, filter) {
  if (!filter) return true;
  if (pin.fn === filter) return true;
  if (filter === "analog" && pin.caps.adc) return true;
  if (filter === "i2c" && pin.caps.i2c) return true;
  if (filter === "spi" && pin.caps.spi) return true;
  if (filter === "uart" && pin.caps.uart) return true;
  if (filter === "power" && (pin.fn === "power" || pin.fn === "gnd")) return true;
  return false;
}

export function visibleOnSide(pin, side) {
  if (pin.side === "both") return true;
  if (pin.pads && pin.pads[side]) return true;
  return pin.side === side && Boolean(pin.pad || (pin.pads && pin.pads[side]));
}

export function padOnSide(pin, side) {
  if (pin.pads && pin.pads[side]) return pin.pads[side];
  if (pin.side === side || pin.side === "both") return pin.pad;
  return null;
}

/** Lane / order of a pin on one face; falls back to the pin-level values. 某一面的标签带侧与顺序。 */
export function laneOnSide(pin, side) {
  const pad = padOnSide(pin, side);
  return { lane: pad?.lane ?? pin.lane ?? null, order: pad?.order ?? pin.order ?? 0 };
}

/** Onboard marker visible on a face. 该面可见的板载标记。 */
export function anchorOnSide(pin, side) {
  if (pin.kind !== "onboard" || !pin.anchor) return null;
  return pin.anchor.side === side || pin.anchor.side === "both" ? pin.anchor : null;
}

export function codeName(pin, framework) {
  if (framework === "micropython" && pin.names.micropython) return pin.names.micropython;
  if (framework === "zephyr" && pin.names.zephyr) return pin.names.zephyr;
  if (framework === "espidf" && pin.names.chip) return pin.names.chip;
  return pin.names.arduino;
}

export function extraCapLabel(pin) {
  const bits = [];
  if (pin.caps.dac) bits.push(typeof pin.caps.dac === "string" ? pin.caps.dac : "DAC");
  if (pin.caps.pwm) bits.push("PWM");
  if (pin.caps.wake) bits.push("WAKE");
  if (pin.caps.touch) bits.push("TOUCH");
  return bits.join(" · ");
}

const BUS_SHORT = { i2c: "I²C", spi: "SPI", uart: "UART" };

/**
 * Strip cell text. Names already shown in an earlier cell collapse to the
 * capability label so each column reads as "has this function".
 * 标签带各格文字。前面格子已显示过的名字，改为显示能力标签，保证每列都表示「有此功能」。
 */
export function stripCells(pin, framework) {
  const silk = pin.names.silk;
  const code = codeName(pin, framework);
  const shown = new Set([silk, code].filter(Boolean));
  const cell = (value, fallback) => {
    if (!value) return "";
    if (shown.has(value)) return fallback;
    shown.add(value);
    return value;
  };
  return {
    silk,
    code: code && code !== silk ? code : "",
    chip: pin.names.chip && pin.names.chip !== "—" && pin.names.chip !== silk ? pin.names.chip : "",
    adc: cell(pin.caps.adc, "ADC"),
    i2c: cell(pin.caps.i2c, BUS_SHORT.i2c),
    spi: cell(pin.caps.spi, BUS_SHORT.spi),
    uart: cell(pin.caps.uart, BUS_SHORT.uart),
    pwm: pin.caps.pwm ? "PWM" : "",
  };
}

export function validateBoard(board) {
  const errors = [];
  if (!board.id) errors.push("missing id");
  if (!board.name) errors.push(`${board.id || "board"}: missing name`);
  if (!board.images?.front || !board.images?.back) errors.push(`${board.id}: missing images`);
  if (!board.facts?.logic) errors.push(`${board.id}: missing facts.logic`);
  if (typeof board.facts?.fiveVTolerant !== "boolean") errors.push(`${board.id}: facts.fiveVTolerant`);
  if (!board.facts?.vbus) errors.push(`${board.id}: missing facts.vbus`);
  if (!board.pins?.length) errors.push(`${board.id}: no pins`);
  const ids = new Set();
  for (const pin of board.pins || []) {
    if (!pin.id) errors.push(`${board.id}: pin without id`);
    if (ids.has(pin.id)) errors.push(`${board.id}: duplicate pin ${pin.id}`);
    ids.add(pin.id);
    if (!PIN_FN.includes(pin.fn)) errors.push(`${board.id}/${pin.id}: bad fn ${pin.fn}`);
    if (!PIN_STATUS.includes(pin.status)) errors.push(`${board.id}/${pin.id}: bad status`);
    if (!PIN_KIND.includes(pin.kind)) errors.push(`${board.id}/${pin.id}: bad kind ${pin.kind}`);
    const hasPad = Boolean(pin.pad) || Boolean(pin.pads && (pin.pads.front || pin.pads.back));
    if (pin.kind !== "onboard" && !hasPad) errors.push(`${board.id}/${pin.id}: missing pad coordinate`);
    if (pin.kind === "onboard" && hasPad) errors.push(`${board.id}/${pin.id}: onboard pin must not carry a pad`);
    for (const face of ["front", "back"]) {
      const pad = pin.pads?.[face];
      if (!pad) continue;
      if (!(pad.x >= 0 && pad.x <= 100 && pad.y >= 0 && pad.y <= 100)) errors.push(`${board.id}/${pin.id}: ${face} pad out of range`);
      if (pin.kind === "header" && !pad.lane && !pin.lane) errors.push(`${board.id}/${pin.id}: ${face} header pad without lane`);
    }
  }
  return errors;
}

export { TEXT, EMPTY_TEXT };
