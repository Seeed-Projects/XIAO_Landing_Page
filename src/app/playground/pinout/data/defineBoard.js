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
 * Tight crop around the board body and pin colour blocks; drop empty canvas above and below.
 * 贴着板身与引脚色块裁，上下空白去掉。
 */
function cropPins(size, rows, content) {
  const pad = padPx(size);
  const boxes = rows.flatMap((row) => row.boxes);
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxY = Math.max(...boxes.map((box) => box.y + box.h));
  let top = minY;
  let bottom = maxY;
  if (content) {
    top = Math.min(top, content.y);
    bottom = Math.max(bottom, content.y + content.h);
  }
  const y = Math.max(0, Math.round(top - pad));
  const end = Math.min(size.height, Math.round(bottom + pad));
  return { x: 0, y, w: size.width, h: end - y };
}

// Some official diagrams publish content below the last scanned row.
// Keep those parts inside the interactive crop instead of trimming them away.
const DIAGRAM_CROP_OVERRIDES = {
  // The RF Logic note (GPIO3 / GPIO14, y≈718-780) sits below the board photo;
  // the row bounds stop at 654 and clip it. Ends before the baked-in legend at 808.
  c6: { front: { bottom: 790 } },
  // The last Battery Management bullet (y≈746-762) is clipped by the row
  // bounds at 740; the baked-in legend only starts at 836.
  nrf52840plus: { back: { bottom: 785 } },
  nrf52840senseplus: { back: { bottom: 785 } },
  // Battery Management bullets (voltage-divider note etc., y≈713-773) sit
  // below the BAT pads; the baked-in legend starts at 807.
  rp2350: { back: { bottom: 790 } },
  // The RF Logic line (y≈691-708) sits below the board photo; the baked-in
  // legend starts at 824.
  mg24: { front: { bottom: 731 }, back: { bottom: 773 } },
  // Same Battery Management block as the plain mg24 back (bullets to y≈750,
  // baked-in legend at 822).
  mg24sense: { back: { bottom: 773 } },
  // The voltage-divider note (y≈628-666) is clipped by the row bounds at 631;
  // the baked-in legend starts at 813.
  ra4: { back: { bottom: 689 } },
  // The nPM1300 battery note ends at y≈890 (I²C SDA/SCL bullets below the
  // crop at 779); the baked-in legend starts at 994.
  nrf54lm20a: { back: { bottom: 895 } },
  // Same back canvas as the plain nrf54lm20a (note to y≈890, legend at 994).
  nrf54lm20asense: { back: { bottom: 895 } },
  // RF Logic lines (P2.03 / P2.05, y≈629-683) sit below the row bounds;
  // the baked-in legend starts at 876.
  nrf54l15: { front: { bottom: 690 }, back: { bottom: 818 } },
  // Same Battery Management block as the plain nrf54l15 back (bullets to
  // y≈812, baked-in legend at 867).
  nrf54l15sense: { back: { bottom: 818 } },
  // Battery Management Logic notes (y≈792-840) sit below the BAT pads on the
  // 2025 transparent back diagrams; the baked-in legends start at 903 / 915.
  samd21plus: { back: { bottom: 850 } },
  // These diagrams sit off-centre in the 1920 canvas (long empty margins on
  // one side, notes pushed far right), so the board photo looked shifted.
  // `center` trims the horizontal crop to the label rows + board and widens
  // the tighter side until the board photo sits mid-frame.
  // 这几块图在 1920 画布里整体偏一侧（一侧大片留白、备注贴右），板身看起来
  // 偏移；`center` 把水平裁剪收到标签行+板身，再放宽较窄的一侧让板子居中。
  rp2040plus: { front: { center: true }, back: { bottom: 850, center: true } },
  // The CAN_L pad's second explanation line (y≈540-558) sits below the row
  // bounds at 537; the baked-in legend only starts at 682.
  // CAN_L 焊盘的第二行说明（y≈540-558）在行边界 537 之下；内置图例 682 才开始。
  stm32c5: { front: { center: true }, back: { bottom: 580, center: true } },
};

function applyCropOverride(crop, size, override) {
  if (!override) return crop;
  const top = override.top ?? crop.y;
  const bottom = override.bottom ?? crop.y + crop.h;
  return {
    ...crop,
    y: Math.max(0, top),
    h: Math.min(size.height, bottom) - Math.max(0, top),
  };
}

// Preserve the original per-face colour-key height in sizing calculations so
// every board keeps the same scale as the published page, without rendering
// the duplicate key below the diagram.
function legendFitRatio(size, key) {
  if (!key) return 0;
  const pad = padPx(size);
  const caption = Math.round(size.width * 0.03);
  const y = Math.max(0, Math.round(key.y - pad));
  const bottom = Math.min(size.height, Math.round(key.y + key.h + caption));
  return (bottom - y) / size.width;
}

/**
 * Horizontal crop for the `center` override faces: bound to the label rows and
 * board photo, then widened on the tighter side so the board photo sits in the
 * middle of the frame. Vertical bounds (rows, notes, crop overrides) stay put.
 * `center` 覆盖面的水平裁剪：贴着标签行与板身取边界，再把较窄的一侧放宽，
 * 让板身位于画面正中。纵向范围（行、备注、裁剪覆盖）保持不变。
 */
function centerCropHorizontally(out, layout, size) {
  const xs = [];
  for (const row of out.rows) {
    for (const box of row.boxes) xs.push(box.x, box.x + box.w);
  }
  if (!xs.length) return out.crop;
  const pad = padPx(size);
  let left = Math.max(0, Math.min(...xs) - pad);
  let right = Math.min(size.width, Math.max(...xs) + pad);
  const board = layout.board;
  if (board) {
    const bcx = board.x + board.w / 2;
    const dl = bcx - left;
    const dr = right - bcx;
    if (dl > dr) right = Math.min(size.width, bcx + dl);
    else left = Math.max(0, bcx - dr);
  }
  return { ...out.crop, x: Math.round(left), w: Math.round(right - left) };
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
    const crop = cropPins(size, rows, layout.content);
    out[face] = {
      src: spec.src,
      width: size.width,
      height: size.height,
      crop: applyCropOverride(crop, size, DIAGRAM_CROP_OVERRIDES[boardId]?.[face]),
      fitLegendRatio: legendFitRatio(size, DIAGRAM_LEGENDS[boardId]?.[face]),
      rows,
    };
  }
  // Centering first, unify last: fitCrop then widens every face to the shared
  // front/back width around its own centre, and a board-centred crop keeps the
  // board centred while it widens (only canvas edges can clamp it slightly).
  // 先居中、后统一：fitCrop 再把每面围绕自身中心放宽到统一的正反面宽度，
  // 以板身为心的裁剪放宽后依然居中（只有画布边缘会带来轻微钳位）。
  for (const face of Object.keys(out)) {
    const override = DIAGRAM_CROP_OVERRIDES[boardId]?.[face];
    if (!override?.center) continue;
    out[face].crop = centerCropHorizontally(out[face], diagram[face].layout, { width: out[face].width, height: out[face].height });
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
