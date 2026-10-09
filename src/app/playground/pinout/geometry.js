/**
 * Rounded orthogonal leader-line path.
 * 带圆角的正交引出线路径。
 */
export function roundedOrthogonalPath(points, maxRadius = 12) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const incomingLength = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outgoingLength = Math.hypot(next.x - current.x, next.y - current.y);
    if (!incomingLength || !outgoingLength) continue;
    const radius = Math.min(maxRadius, incomingLength / 2, outgoingLength / 2);
    const before = {
      x: current.x - ((current.x - previous.x) / incomingLength) * radius,
      y: current.y - ((current.y - previous.y) / incomingLength) * radius,
    };
    const after = {
      x: current.x + ((next.x - current.x) / outgoingLength) * radius,
      y: current.y + ((next.y - current.y) / outgoingLength) * radius,
    };
    path += ` L ${before.x} ${before.y} Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

export function leaderPoints(from, to, lane) {
  const midX = lane === "left" ? from.x - Math.max(18, (from.x - to.x) * 0.45) : from.x + Math.max(18, (to.x - from.x) * 0.45);
  return [
    { x: from.x, y: from.y },
    { x: midX, y: from.y },
    { x: midX, y: to.y },
    { x: to.x, y: to.y },
  ];
}

export const FLIP_MS = 560;
export const RETRACT_MS = 150;
export const FLIP_DELAY_MS = 120;
export const REVEAL_MS = 200;
