import { createPin } from "./schema.js";
import { DEFAULT_FACTS } from "./footprint.js";
import { DIAGRAM_LEGENDS } from "./diagram/legends.js";

/**
 * Build a board from explicit, photo-measured layout.
 * 基于显式、按照片量出的布局构造一块板的数据。
 *
 * spec.images.front / back: { src, width, height } — pad coordinates are
 * percentages of this image, so the natural size is required.
 * spec.pins[]: createPin fields plus
 *   front / back: { x, y, lane?, order?, tag? }  pad centre on that face
 *   anchor: { side, x, y }                        onboard part position
 * spec.images.front / back：{ src, width, height }，焊盘坐标是该图片的百分比，因此需要原始尺寸。
 * spec.pins[]：createPin 字段之外，front / back 为该面焊盘圆心，anchor 为板载器件位置。
 */
export function defineBoard(spec) {
  const pins = spec.pins.map((raw) => {
    const { front, back, anchor, ...rest } = raw;
    const pads = {};
    if (front) pads.front = front;
    if (back) pads.back = back;
    const hasPads = Boolean(front || back);
    const pin = createPin({
      ...rest,
      kind: rest.kind || (anchor || !hasPads ? "onboard" : "header"),
      series: rest.series || spec.series,
      pads: hasPads ? pads : null,
      pad: front || back || null,
      side: front && back ? "both" : front ? "front" : back ? "back" : "front",
      lane: front?.lane || back?.lane || null,
      order: front?.order ?? back?.order ?? 0,
      anchor: anchor || null,
    });
    return pin;
  });

  return {
    id: spec.id,
    name: spec.name,
    series: spec.series,
    images: spec.images,
    frontRotated: Boolean(spec.frontRotated),
    tagline: spec.tagline,
    facts: { ...DEFAULT_FACTS, ...(spec.facts || {}) },
    frameworks: spec.frameworks,
    pins,
    diagram: buildDiagram(spec.diagram, spec.id),
    markers: pins
      .filter((pin) => pin.kind === "onboard")
      .map((pin) => ({
        id: pin.id,
        label: pin.names.silk === "—" ? pin.id.replaceAll("_", " ") : pin.names.silk,
        fn: pin.fn,
        anchor: pin.anchor,
        status: pin.status,
        desc: pin.desc,
      })),
  };
}

/** Padding around pin labels / colour keys when trimming empty canvas. 裁空白时，引脚标签和图例外再留的边距。 */
const DIAGRAM_CROP_PAD = 0.012;

function padPx(size) {
  return Math.round(size.width * DIAGRAM_CROP_PAD);
}

/**
 * Tight crop around pin colour blocks; drop empty canvas above and below.
 * 贴着引脚色块裁，上下空白去掉。
 */
function cropPins(size, rows) {
  const pad = padPx(size);
  const boxes = rows.flatMap((row) => row.boxes);
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxY = Math.max(...boxes.map((box) => box.y + box.h));
  const y = Math.max(0, Math.round(minY - pad));
  const bottom = Math.min(size.height, Math.round(maxY + pad));
  return { x: 0, y, w: size.width, h: bottom - y };
}

/**
 * Tight crop around the bottom colour key, including a short caption band.
 * 贴着底部图例裁，并留下一小条说明文字。
 */
function cropLegend(size, key) {
  if (!key) return null;
  const pad = padPx(size);
  const caption = Math.round(size.width * 0.03);
  const y = Math.max(0, Math.round(key.y - pad));
  const bottom = Math.min(size.height, Math.round(key.y + key.h + caption));
  return { x: 0, y, w: size.width, h: bottom - y };
}

/**
 * Pair scanned label rows with pin ids for each diagram face.
 * 把扫描出的标签行与引脚 id 逐面配对。
 *
 * Returns { front?: { src, width, height, crop, rows: [{ id, side, y, boxes }] } } or null.
 * 返回 { front?: { src, width, height, crop, rows: [{ id, side, y, boxes }] } } 或 null。
 */
export function buildDiagram(diagram, boardId) {
  if (!diagram) return null;
  const out = {};
  for (const [face, spec] of Object.entries(diagram)) {
    const { layout, rows: ids } = spec;
    const rows = [];
    for (const side of ["left", "right"]) {
      const scanned = layout.rows[side];
      const wanted = ids[side] || [];
      if (scanned.length !== wanted.length) {
        throw new Error(`${boardId} ${face} diagram: ${side} has ${scanned.length} scanned rows but ${wanted.length} ids`);
      }
      scanned.forEach((row, index) => rows.push({ id: wanted[index], side, y: row.y, boxes: row.boxes }));
    }
    const { size } = layout;
    out[face] = {
      src: spec.src,
      width: size.width,
      height: size.height,
      crop: cropPins(size, rows),
      legend: cropLegend(size, DIAGRAM_LEGENDS[boardId]?.[face]),
      rows,
    };
  }
  unifyDiagramCrops(out);
  return out;
}

/**
 * Match front and back crop width so both faces share one horizontal scale.
 * 正反面裁切宽度对齐，两张图同一水平比例。
 */
function fitCrop(crop, width, height, imageWidth, imageHeight) {
  const nextW = Math.min(Math.max(width, crop.w), imageWidth);
  const nextH = Math.min(Math.max(height, crop.h), imageHeight);
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + crop.h / 2;
  let x = Math.round(cx - nextW / 2);
  let y = Math.round(cy - nextH / 2);
  x = Math.max(0, Math.min(x, imageWidth - nextW));
  y = Math.max(0, Math.min(y, imageHeight - nextH));
  if (x > crop.x) x = crop.x;
  if (x + nextW < crop.x + crop.w) x = crop.x + crop.w - nextW;
  if (y > crop.y) y = crop.y;
  if (y + nextH < crop.y + crop.h) y = crop.y + crop.h - nextH;
  x = Math.max(0, Math.min(x, imageWidth - nextW));
  y = Math.max(0, Math.min(y, imageHeight - nextH));
  return { x, y, w: nextW, h: nextH };
}

function unifyDiagramCrops(diagram) {
  const front = diagram.front;
  const back = diagram.back;
  if (!front || !back) return;
  const width = Math.min(
    Math.round(Math.max(front.crop.w, back.crop.w)),
    front.width,
    back.width,
  );
  front.crop = fitCrop(front.crop, width, front.crop.h, front.width, front.height);
  back.crop = fitCrop(back.crop, width, back.crop.h, back.width, back.height);
}

/**
 * Pads for one castellated column. 一列板边焊盘的坐标。
 * ids are top-to-bottom on the photo; ys are the measured centres.
 * ids 按照片自上而下排列，ys 为量得的圆心 Y%。
 */
export function column(ids, x, ys, lane) {
  const out = {};
  ids.forEach((id, index) => {
    out[id] = { x, y: ys[index], lane, order: index };
  });
  return out;
}
