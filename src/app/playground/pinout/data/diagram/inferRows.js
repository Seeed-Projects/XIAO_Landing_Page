import { laneOnSide, padOnSide } from "../schema.js";

/**
 * Re-group scanned boxes by height, then split into left / right columns
 * with 2-means on box centres so paired pads at the same Y become two rows.
 * 按高度重新分组，再用框中心的 2 均值切开左右列，让同一高度的左右焊盘各成一行。
 */
export function regroupDiagramLayout(layout) {
  const all = [...layout.rows.left, ...layout.rows.right].flatMap((row) => row.boxes.map((box) => ({
    ...box,
    cy: box.y + box.h / 2,
    cx: box.x + box.w / 2,
  })));
  const xs = all.map((box) => box.cx);
  let leftMean = Math.min(...xs);
  let rightMean = Math.max(...xs);
  if (rightMean - leftMean < 80) {
    leftMean = layout.content.x;
    rightMean = layout.content.x + layout.content.w;
  } else {
    for (let i = 0; i < 8; i += 1) {
      const leftXs = xs.filter((x) => Math.abs(x - leftMean) <= Math.abs(x - rightMean));
      const rightXs = xs.filter((x) => Math.abs(x - leftMean) > Math.abs(x - rightMean));
      if (!leftXs.length || !rightXs.length) break;
      leftMean = leftXs.reduce((sum, x) => sum + x, 0) / leftXs.length;
      rightMean = rightXs.reduce((sum, x) => sum + x, 0) / rightXs.length;
    }
  }
  const center = (leftMean + rightMean) / 2;
  const bands = [];
  for (const box of [...all].sort((a, b) => a.cy - b.cy)) {
    const band = bands.find((item) => Math.abs(item.cy - box.cy) < Math.max(box.h, 20) * 0.7);
    if (band) {
      band.boxes.push(box);
      band.cy = (band.cy * (band.boxes.length - 1) + box.cy) / band.boxes.length;
    } else {
      bands.push({ cy: box.cy, boxes: [box] });
    }
  }
  const toRow = (boxes) => ({
    y: Math.round(boxes.reduce((sum, box) => sum + box.cy, 0) / boxes.length),
    boxes: boxes.map(({ x, y, w, h, cat }) => ({ x, y, w, h, cat })),
  });
  const left = [];
  const right = [];
  for (const band of bands) {
    const leftBoxes = band.boxes.filter((box) => box.cx < center);
    const rightBoxes = band.boxes.filter((box) => box.cx >= center);
    if (leftBoxes.length) left.push(toRow(leftBoxes));
    if (rightBoxes.length) right.push(toRow(rightBoxes));
  }
  const used = [...left, ...right].flatMap((row) => row.boxes);
  const content = used.length ? {
    x: Math.min(...used.map((box) => box.x)),
    y: Math.min(...used.map((box) => box.y)),
    w: Math.max(...used.map((box) => box.x + box.w)) - Math.min(...used.map((box) => box.x)),
    h: Math.max(...used.map((box) => box.y + box.h)) - Math.min(...used.map((box) => box.y)),
  } : layout.content;
  return { ...layout, content, rows: { left, right } };
}

/** A diagram row that maps to a castellated / power header pin. 对应排针或电源行的标签行。 */
export function isHeaderDiagramRow(row) {
  const cats = new Set(row.boxes.map((box) => box.cat));
  if (cats.has("pinname") && (cats.has("system") || cats.has("peripheral")) && !cats.has("digital") && !cats.has("power") && !cats.has("gnd")) {
    return false;
  }
  if (cats.has("power") || cats.has("gnd")) return true;
  if (cats.has("digital") && (cats.has("pinname") || cats.has("analog") || cats.has("i2c") || cats.has("spi") || cats.has("uart") || cats.has("arduino"))) return true;
  if (cats.has("analog") && cats.has("pinname")) return true;
  return false;
}

function sidePadIds(board, face, side) {
  return board.pins
    .filter((pin) => (pin.kind === "header" || pin.kind === "pad") && padOnSide(pin, face))
    .filter((pin) => laneOnSide(pin, face)?.lane === side)
    .sort((a, b) => (laneOnSide(a, face)?.order ?? 0) - (laneOnSide(b, face)?.order ?? 0))
    .map((pin) => pin.id);
}

/**
 * Pins that can appear as non-header rows on a diagram face.
 * 引脚图中可能以非排针行出现的引脚。
 */
function extraPinPool(board, face, markerIds = []) {
  const seen = new Set();
  const out = [];
  const push = (pin) => {
    if (!pin || seen.has(pin.id)) return;
    seen.add(pin.id);
    out.push(pin.id);
  };
  for (const id of markerIds) push(board.pins.find((pin) => pin.id === id));
  for (const pin of board.pins) {
    if (pin.kind === "onboard" && (face === "front" || pin.anchor?.side === face || (!pin.anchor && face === "front"))) push(pin);
  }
  for (const pin of board.pins) {
    if (pin.kind === "pad" && padOnSide(pin, face)) push(pin);
  }
  return out;
}

function headerIds(board, face, side) {
  return board.pins
    .filter((pin) => pin.kind === "header" && padOnSide(pin, face) && laneOnSide(pin, face)?.lane === side)
    .sort((a, b) => a.order - b.order)
    .map((pin) => pin.id);
}

function splitBackIds(ids, leftCount, rightCount) {
  const total = leftCount + rightCount;
  if (ids.length === total) {
    return { left: ids.slice(0, leftCount), right: ids.slice(leftCount) };
  }
  if (ids.length > total) {
    return { left: ids.slice(0, leftCount), right: ids.slice(leftCount, total) };
  }
  return null;
}

function assignBackRows(board, layout, backLeft = [], backRight = []) {
  const leftCount = layout.rows.left.length;
  const rightCount = layout.rows.right.length;
  const fromBoard = [...sidePadIds(board, "back", "left"), ...sidePadIds(board, "back", "right")];
  const fromMeta = [...backLeft, ...backRight];

  if (backLeft.length === leftCount && backRight.length === rightCount) {
    return { left: backLeft, right: backRight };
  }
  return splitBackIds(fromBoard, leftCount, rightCount)
    || splitBackIds(fromMeta, leftCount, rightCount)
    || (() => { throw new Error(`${board.id} back: ${leftCount}+${rightCount} rows vs ${fromBoard.length} pads (${fromMeta.length} meta ids)`); })();
}

/**
 * Infer left/right row ids from a scanned layout and board pin data.
 * 根据扫描布局与板数据推断左右侧行 id。
 */
export function inferDiagramRows(board, face, layout, options = {}) {
  const { markerIds = [], backLeft = [], backRight = [] } = options;

  if (face === "back") {
    return assignBackRows(board, layout, backLeft, backRight);
  }

  const rowsBySide = {
    left: [...layout.rows.left].sort((a, b) => a.y - b.y),
    right: [...layout.rows.right].sort((a, b) => a.y - b.y),
  };
  const nonHeaderCount = {
    left: rowsBySide.left.filter((row) => !isHeaderDiagramRow(row)).length,
    right: rowsBySide.right.filter((row) => !isHeaderDiagramRow(row)).length,
  };
  const pool = extraPinPool(board, face, markerIds);
  const leftExtras = pool.slice(0, nonHeaderCount.left);
  const rightExtras = pool.slice(nonHeaderCount.left, nonHeaderCount.left + nonHeaderCount.right);

  const result = { left: [], right: [] };
  for (const side of ["left", "right"]) {
    const rows = rowsBySide[side];
    const headers = headerIds(board, face, side);
    const headerRows = rows.filter(isHeaderDiagramRow);
    const sideExtras = side === "left" ? leftExtras : rightExtras;

    if (headers.length !== headerRows.length) {
      throw new Error(`${board.id} ${face} ${side}: ${headerRows.length} header rows vs ${headers.length} header pins`);
    }
    if (sideExtras.length !== nonHeaderCount[side]) {
      throw new Error(`${board.id} ${face} ${side}: ${nonHeaderCount[side]} top rows vs ${sideExtras.length} extra pins`);
    }

    let hi = 0;
    let ei = 0;
    for (const row of rows) {
      if (isHeaderDiagramRow(row)) result[side].push(headers[hi++]);
      else result[side].push(sideExtras[ei++]);
    }
  }

  return result;
}
