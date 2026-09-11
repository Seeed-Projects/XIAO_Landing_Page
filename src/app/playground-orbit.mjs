const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (start, end, progress) => start + (end - start) * progress;

// Converts the scene's viewport position into reversible scroll progress.
// 将场景相对视口的位置换算为可随滚动反向变化的进度。
export function orbitProgress(top, height, viewportHeight) {
  return clamp((viewportHeight * 0.7 - top) / Math.max(1, viewportHeight * 0.7 + height * 0.5), 0, 1);
}

// Places boards outside the measured reading area throughout their scroll paths.
// 根据文字区的实际边界计算板卡位置，让整条滚动路径保持在阅读区外围。
export function orbitPosition(index, size, hub, progress, wide) {
  const p = clamp(progress, 0, 1);
  const spread = wide ? clamp(0.24 + p * 1.15, 0, 1) : p;
  let x;
  let y;
  if (wide && index < 16) {
    const right = index >= 8;
    const local = index % 8;
    const doubleColumn = hub.left >= 240;
    const row = doubleColumn ? Math.floor(local / 2) : local;
    const column = doubleColumn ? local % 2 : 0;
    const near = hub.left - 84;
    const outer = Math.min(near, Math.max(54, hub.left * 0.14) + (row % 2) * Math.min(50, hub.left * 0.04));
    const inner = Math.min(near - 12, Math.max(outer + 110, hub.left * 0.62) + (row % 2) * Math.min(30, hub.left * 0.025));
    const target = doubleColumn && column ? inner : outer;
    const leftX = mix(near - column * 22, target, spread);
    x = right ? size.width - leftX : leftX;
    const spreadY = doubleColumn ? 0.12 + row * 0.245 + column * 0.045 : 0.08 + row * 0.12;
    const compactY = doubleColumn ? (row - 1.5) * 130 + column * 45 : (row - 3.5) * 66;
    y = mix(size.height / 2 + compactY, size.height * spreadY, spread);
  } else if (wide) {
    const bottom = index >= 19;
    const local = (index - 16) % 3;
    x = mix(size.width / 2 + (local - 1) * 80, size.width * [0.34, 0.5, 0.66][local], spread);
    y = bottom ? mix(hub.top + hub.height + 128, size.height - 52, spread) : mix(hub.top - 84, 78, spread);
  } else {
    const bottom = index >= 11;
    const local = index % 11;
    const row = Math.floor(local / 4);
    const column = local % 4;
    const endX = row === 2 ? [0.22, 0.5, 0.78][column] : [0.12, 0.37, 0.63, 0.88][column];
    x = size.width * mix(0.33 + column * 0.11, endX, p);
    y = bottom
      ? hub.top + hub.height + mix(128 + row * 55, 128 + row * 100, p)
      : mix(hub.top - 84 - (2 - row) * 54, 72 + row * 100, p);
  }
  return { x: x / size.width * 100, y: y / size.height * 100, angle: (index % 2 ? 1 : -1) * spread * (index % 3 ? 10 : 6) };
}
