/**
 * Place a detail panel beside its card, on the roomier side, inside the viewport.
 * `notch` is the pointer offset from the panel top, aimed at the card center.
 * 将详情面板放在卡片空间更充裕的一侧，并限制在可视区域内；
 * `notch` 为指示尖角距面板顶部的偏移，对准卡片中心。
 */
export function getCardPeekPosition(card, panel, viewport, { gap = 12, margin = 16, topInset = 0, notchInset = 28 } = {}) {
  const roomRight = viewport.width - margin - card.right - gap;
  const roomLeft = card.left - gap - margin;
  let side = roomRight >= roomLeft ? "right" : "left";
  let left = side === "right" ? card.right + gap : card.left - gap - panel.width;

  // Neither side fits: center the panel over its own card.
  // 两侧都放不下时，面板居中覆盖在当前卡片上方。
  if (Math.max(roomRight, roomLeft) < panel.width) {
    side = "over";
    left = card.left + (card.width - panel.width) / 2;
  }

  const minTop = topInset + margin;
  const maxLeft = Math.max(margin, viewport.width - margin - panel.width);
  const maxTop = Math.max(minTop, viewport.height - margin - panel.height);
  const top = Math.min(Math.max(card.top, minTop), maxTop);
  const maxNotch = Math.max(notchInset, panel.height - notchInset);
  return {
    side,
    left: Math.min(Math.max(left, margin), maxLeft),
    top,
    notch: Math.min(Math.max(card.top + card.height / 2 - top, notchInset), maxNotch),
  };
}
