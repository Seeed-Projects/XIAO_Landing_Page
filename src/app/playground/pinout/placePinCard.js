/**
 * Place the floating pin card beside the clicked row and keep it on screen.
 * 把浮动卡片贴在被点的那一行旁边，并留在当前可视区域内。
 */

const PAD = 8;
const GAP = 16;
const MIN_WIDTH = 360;
const MAX_WIDTH = 560;
const MIN_HEIGHT = 280;
const MAX_HEIGHT = 780;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * @param {object} input
 * @returns {{ top: number, left: number, width: number, maxHeight: number }}
 */
export function placePinCard({
  workWidth,
  workHeight,
  workTop,
  frameLeft,
  frameTop,
  frameWidth,
  frameHeight,
  crop,
  row,
  side,
  viewportHeight,
  cardHeight,
}) {
  const xScale = frameWidth / crop.w;
  const yScale = frameHeight / crop.h;
  const rowLeft = Math.min(...row.boxes.map((box) => box.x));
  const rowRight = Math.max(...row.boxes.map((box) => box.x + box.w));
  const rowTop = Math.min(row.y, ...row.boxes.map((box) => box.y));
  const pinLeft = frameLeft + (rowLeft - crop.x) * xScale;
  const pinRight = frameLeft + (rowRight - crop.x) * xScale;
  const pinTop = frameTop + (rowTop - crop.y) * yScale;

  const viewTop = Math.max(PAD, PAD - workTop);
  const viewBottom = Math.min(workHeight - PAD, viewportHeight - workTop - PAD);

  let width = Math.min(MAX_WIDTH, Math.max(420, workWidth * 0.42));
  let left = side === "left" ? pinRight + GAP : pinLeft - GAP - width;
  if (side === "left") {
    const room = workWidth - PAD - left;
    if (room < width && room >= MIN_WIDTH) width = room;
  } else {
    const room = pinLeft - GAP - PAD;
    if (left < PAD && room >= MIN_WIDTH) {
      width = Math.min(width, room);
      left = PAD;
    }
  }
  left = clamp(left, PAD, workWidth - width - PAD);

  const estimated = Number.isFinite(cardHeight) && cardHeight > 0
    ? cardHeight
    : Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, viewBottom - viewTop));
  const height = clamp(estimated, MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, viewBottom - viewTop)));

  let top = pinTop - 12;
  if (top + height > viewBottom) top = viewBottom - height;
  top = clamp(top, viewTop, Math.max(viewTop, viewBottom - height));

  return {
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(width),
    maxHeight: Math.round(Math.max(MIN_HEIGHT, viewBottom - top)),
  };
}
