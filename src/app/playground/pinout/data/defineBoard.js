import { createPin } from "./schema.js";
import { DEFAULT_FACTS } from "./footprint.js";

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

/** Padding around pin labels when trimming empty side/top margins. 裁左右和上方空白时，引脚标签外再留的边距。 */
const DIAGRAM_CROP_PAD = 0.012;

/**
 * Crop empty canvas around the artwork, keeping every colour block.
 * 只裁掉画布空白，引脚色块和底部图例都留下。
 */
function cropArt(size, rows) {
  const pad = Math.round(size.width * DIAGRAM_CROP_PAD);
  const minY = Math.min(...rows.flatMap((row) => row.boxes.map((box) => box.y)));
  const y = Math.max(0, Math.round(minY - pad));
  return {
    x: 0,
    y,
    w: size.width,
    h: size.height - y,
  };
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
      crop: cropArt(size, rows),
      rows,
    };
  }
  unifyDiagramCrops(out);
  return out;
}

/**
 * Expand each face crop to the same pixel size so front and back render
 * at one shared scale inside identical frames.
 * 把正反面裁切扩成同一像素尺寸，两张图在同样大的框里、同一比例显示。
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
  const height = Math.min(
    Math.round(Math.max(front.crop.h, back.crop.h)),
    front.height,
    back.height,
  );
  front.crop = fitCrop(front.crop, width, height, front.width, front.height);
  back.crop = fitCrop(back.crop, width, height, back.width, back.height);
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
