/** Board photo sizing for the pinout diagram frames. 引脚图板身统一尺寸计算。 */

/** Board photos render at this share of the workspace width on desktop. 桌面端板身照片占工作区宽度的比例。 */
export const BOARD_FRACTION = 0.15;

/**
 * Frame width for one diagram face so its board photo matches every other
 * board; null means the face can use the full workspace width.
 * 每面图框宽度，让各板板身渲染大小一致；返回 null 表示该面可用整幅工作区宽度。
 */
export function boardFrameWidth({ workWidth, figureWidth, imageWidth = 1920, fraction = BOARD_FRACTION }) {
  if (!workWidth || !figureWidth) return null;
  const target = fraction * workWidth * (imageWidth / figureWidth);
  if (target >= workWidth) return null;
  return Math.max(160, Math.round(target));
}
