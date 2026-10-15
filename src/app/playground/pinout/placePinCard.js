/**
 * Place the floating pin card beside the clicked row and keep it on screen.
 * The card's top follows the clicked row's screen position (a touch above
 * it), clamped so a usable card height always stays inside the viewport.
 * 把浮动卡片放在被点的那一行旁边：卡片顶部跟随点击行的屏幕位置（略高一点），
 * 并钳制在可视区域内，保证始终留出可用的卡片高度。
 */

const PAD = 8;
/** Clearance between the card and the clicked pin boxes. 卡片与被点引脚色块之间的空隙。 */
export const PIN_CLEARANCE = Math.round((1.5 * 96) / 2.54);
const MIN_WIDTH = 420;
const MAX_WIDTH = 760;
/** Minimum visible card height when the clicked row sits low. 点击行靠下时至少保留的可见高度。 */
const MIN_VISIBLE_H = 320;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/**
 * @param {object} input
 * @param {number} input.pinTop viewport-space y of the clicked row's top
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
  pinTop,
  viewportHeight,
}) {
  const xScale = frameWidth / crop.w;
  const rowLeft = Math.min(...row.boxes.map((box) => box.x));
  const rowRight = Math.max(...row.boxes.map((box) => box.x + box.w));
  const pinLeft = frameLeft + (rowLeft - crop.x) * xScale;
  const pinRight = frameLeft + (rowRight - crop.x) * xScale;

  const viewTop = Math.max(PAD, PAD - workTop);
  const viewBottom = viewportHeight - workTop - PAD;
  // Anchor the card's top at the row (slightly above it); clamp so at least
  // MIN_VISIBLE_H of card stays visible when the row is near the bottom.
  // 卡片顶部锚定在点击行（略高一点）；行靠下时钳制，至少保留 MIN_VISIBLE_H。
  const top = clamp(pinTop - workTop - 20, viewTop, Math.max(viewTop, viewBottom - MIN_VISIBLE_H));
  const maxHeight = Math.max(320, viewBottom - top);

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
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(Math.max(240, width)),
    maxHeight: Math.round(maxHeight),
  };
}
