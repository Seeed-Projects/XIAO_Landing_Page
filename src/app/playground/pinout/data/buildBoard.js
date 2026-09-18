import { createPin, createMarker } from "./schema.js";
import {
  DEFAULT_FACTS,
  STD_FRONT_PADS,
  backPadsFromColumns,
} from "./footprint.js";

const warn3v3 = {
  en: "Input voltage must not exceed 3.3V.",
  zh: "输入电压不得超过 3.3V。",
};

function note(en, zh) {
  return { en, zh: zh || en };
}

export function headerPin(id, spec, series) {
  return createPin({
    id,
    series,
    silk: spec.silk ?? id,
    arduino: spec.arduino ?? spec.silk ?? id,
    chip: spec.chip,
    fn: spec.fn,
    caps: spec.caps || {},
    status: spec.status || "free",
    warning: spec.warning || "",
    warningZh: spec.warningZh,
    desc: spec.desc,
    descZh: spec.descZh,
    code: spec.code || "",
    occupiedBy: spec.occupiedBy || "",
    side: spec.side || "front",
  });
}

export function analogHeader(id, silk, chip, series, extra = {}) {
  return headerPin(id, {
    silk,
    chip,
    fn: extra.fn || "analog",
    caps: { adc: silk.includes("A") ? silk : `A${id.replace("D", "")}`, pwm: true, ...extra.caps },
    warning: warn3v3,
    desc: extra.desc || `Digital / analog ${silk}`,
    descZh: extra.descZh || `数字 / 模拟 ${silk}`,
    code: extra.code || `int v = analogRead(${silk.split(" ")[0]});`,
    ...extra,
  }, series);
}

export function busPin(id, silk, fn, capKey, chip, series, extra = {}) {
  const caps = { [capKey]: silk, ...(extra.adc ? { adc: extra.adc === true ? silk : extra.adc } : {}), pwm: extra.pwm !== false, ...extra.caps };
  return headerPin(id, {
    silk,
    chip,
    fn,
    caps,
    warning: extra.warning || "",
    warningZh: extra.warningZh,
    desc: extra.desc,
    descZh: extra.descZh,
    code: extra.code,
    status: extra.status,
    ...extra,
  }, series);
}

export function powerPin(id, silk, chip, desc, descZh, warning, warningZh, extra = {}) {
  return headerPin(id, {
    silk,
    chip,
    fn: extra.fn || (id.includes("GND") || silk === "GND" || silk === "BAT-" ? "gnd" : "power"),
    caps: {},
    desc,
    descZh,
    warning: warning || "",
    warningZh,
    status: extra.status || "free",
    ...extra,
  }, extra.series);
}

export function applyPads(pins, frontPads, backLayout) {
  const backMap = backLayout
    ? backPadsFromColumns(backLayout.left, backLayout.right, backLayout.padY)
    : {};
  return pins.map((pin) => {
    const front = frontPads[pin.id];
    const back = backMap[pin.id];
    if (front && back) {
      return {
        ...pin,
        side: "both",
        pad: { x: front.x, y: front.y },
        pads: {
          front: { x: front.x, y: front.y },
          back: { x: back.x, y: back.y },
        },
        lane: front.lane,
        order: front.order,
      };
    }
    if (front) {
      return { ...pin, side: "front", pad: { x: front.x, y: front.y }, lane: front.lane, order: front.order };
    }
    if (back) {
      return { ...pin, side: "back", pad: { x: back.x, y: back.y }, lane: back.lane, order: back.order };
    }
    return pin;
  });
}

/** Pins without a measured pad become onboard entries. 没有量得焊盘的引脚归为板载项。 */
export function placeOrphans(pins) {
  return pins.map((pin) => {
    const hasPad = pin.pad || (pin.pads && (pin.pads.front || pin.pads.back));
    return hasPad ? pin : { ...pin, kind: "onboard", pad: null, pads: null, lane: null };
  });
}

export function markersFromPins(pins, ids, fallbackAnchor = { x: 50, y: 8 }) {
  return ids
    .map((id, index) => {
      const pin = pins.find((item) => item.id === id);
      if (!pin) return null;
      return createMarker({
        id: pin.id,
        label: pin.names.silk === "—" ? pin.id.replaceAll("_", " ") : pin.names.silk,
        fn: pin.fn,
        chip: pin.names.chip,
        status: pin.status,
        desc: pin.desc,
        anchor: { x: 18 + index * 16, y: fallbackAnchor.y },
      });
    })
    .filter(Boolean);
}

export function assembleBoard(meta, pins, backLayout, markerIds = []) {
  const laidOut = placeOrphans(applyPads(pins, meta.frontPads || STD_FRONT_PADS, backLayout));
  const headerIds = new Set([
    ...Object.keys(meta.frontPads || STD_FRONT_PADS),
    ...(backLayout?.left || []),
    ...(backLayout?.right || []),
  ]);
  const autoMarkers = laidOut
    .filter((pin) => pin.kind === "onboard" && (markerIds.includes(pin.id) || (!headerIds.has(pin.id) && (pin.status === "occupied" || /LED|BUTTON|Boot|KEY/i.test(pin.id)))))
    .map((pin) => createMarker({
      id: pin.id,
      label: pin.names.silk === "—" || pin.names.silk === pin.id ? pin.id.replaceAll("_", " ") : pin.names.silk,
      fn: pin.fn,
      chip: pin.names.chip,
      status: pin.status,
      desc: pin.desc,
      anchor: null,
    }));
  // Legacy coordinates were measured against a 0.62 stage box, kept here as the image ratio.
  // 旧坐标以 0.62 宽高比的舞台为基准，此处沿用为图片比例。
  return {
    id: meta.id,
    name: meta.name,
    series: meta.series,
    images: {
      front: { src: `/xiao-products/dev_boards/${meta.img}-front.webp`, width: 62, height: 100 },
      back: { src: `/xiao-products/dev_boards/${meta.img}-back.webp`, width: 62, height: 100 },
    },
    frontRotated: Boolean(meta.frontRotated),
    tagline: meta.tagline,
    facts: { ...DEFAULT_FACTS, ...(meta.facts || {}) },
    frameworks: meta.frameworks,
    pins: laidOut,
    markers: autoMarkers,
  };
}

export { note, warn3v3 };
