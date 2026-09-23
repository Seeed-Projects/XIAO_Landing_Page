// Each loop half covers the viewport; duration maintains a fixed travel speed.
// 每半段循环覆盖整个可见区域，时长按固定移动速度计算。
export function logoLoopLayout(viewportWidth, sequenceWidth, pixelsPerSecond = 28) {
  if (!(viewportWidth > 0) || !(sequenceWidth > 0) || !(pixelsPerSecond > 0)) {
    return { repeats: 1, duration: 60, ready: false };
  }
  const repeats = Math.max(1, Math.ceil(viewportWidth / sequenceWidth));
  return { repeats, duration: (sequenceWidth * repeats) / pixelsPerSecond, ready: true };
}
