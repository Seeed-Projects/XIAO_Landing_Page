/**
 * Return whether vertical wheel input should move the page instead of the card.
 * 判断垂直滚轮是否应从卡片交还给页面。
 */
export function shouldReleaseHoverWheel(deltaY, scrollTop, clientHeight, scrollHeight) {
  const atTop = scrollTop <= 0;
  const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
  return (deltaY < 0 && atTop) || (deltaY > 0 && atBottom);
}
