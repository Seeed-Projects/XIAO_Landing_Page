/**
 * Place the floating pin card beside the clicked row and keep it on screen.
 * 把浮动卡片放在被点的那一行旁边，并留在当前可视区域内。
 */

const PAD = 8;
/** Clearance between the card and the clicked pin boxes. 卡片与被点引脚色块之间的空隙。 */
export const PIN_CLEARANCE = Math.round((1.5 * 96) / 2.54);
const MIN_WIDTH = 420;
const MAX_WIDTH = 760;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * @param {object} input
 * @returns {{ top: number, left: number, width: number, maxHeight: number }}
 */
export function placePinCard({
  workWidth,
  workTop,
  frameLeft,
  frameWidth,
  crop,
  row,
  side,
  viewportHeight,
}) {
  const xScale = frameWidth / crop.w;
  const rowLeft = Math.min(...row.boxes.map((box) => box.x));
  const rowRight = Math.max(...row.boxes.map((box) => box.x + box.w));
  const pinLeft = frameLeft + (rowLeft - crop.x) * xScale;
  const pinRight = frameLeft + (rowRight - crop.x) * xScale;

  const viewTop = Math.max(PAD, PAD - workTop);
  const viewBottom = viewportHeight - workTop - PAD;
  const maxHeight = Math.max(320, viewBottom - viewTop);

  const inner = workWidth * 0.55;
  let width;
  let left;
  if (side === "right") {
    const limit = pinLeft - PIN_CLEARANCE;
    const room = Math.max(0, limit - PAD);
    width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, inner), room);
    if (width < 280) width = Math.max(240, room);
    left = limit - width;
    if (left < PAD) {
      left = PAD;
      width = Math.max(240, limit - left);
    }
  } else {
    const origin = pinRight + PIN_CLEARANCE;
    const room = Math.max(0, workWidth - PAD - origin);
    width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, inner), room);
    if (width < 280) width = Math.max(240, room);
    left = origin;
    if (left + width > workWidth - PAD) {
      width = Math.max(240, workWidth - PAD - left);
    }
  }

  left = clamp(left, PAD, Math.max(PAD, workWidth - width - PAD));
  if (side === "right") {
    const limit = pinLeft - PIN_CLEARANCE;
    left = Math.min(left, limit - width);
    left = Math.max(PAD, left);
    if (left + width > limit) width = Math.max(240, limit - left);
  } else {
    const origin = pinRight + PIN_CLEARANCE;
    left = Math.max(left, origin);
    if (left + width > workWidth - PAD) width = Math.max(240, workWidth - PAD - left);
  }

  return {
    top: Math.round(viewTop),
    left: Math.round(left),
    width: Math.round(Math.max(240, width)),
    maxHeight: Math.round(maxHeight),
  };
}
