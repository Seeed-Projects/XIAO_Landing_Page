/**
 * Compute copy count and travel distance from measured pixel widths.
 * 根据实测像素宽度计算重复份数和单轮位移。
 */
export function getScrollBandLayout(viewportWidth, cycleWidth, gap) {
  if (viewportWidth <= 0 || cycleWidth <= 0) {
    return { copies: 2, distance: 0 };
  }

  return {
    copies: Math.max(2, Math.ceil((viewportWidth + gap) / cycleWidth) + 1),
    distance: cycleWidth,
  };
}
