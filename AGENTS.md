<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 滚动动画与首屏连续性

1. **首屏内容连续性**:
   - 首屏主视觉约占可视区域的 3/4 时,屏幕下方 1/4 应呈现下一板块的实际内容,
     为读者提供明确的继续阅读提示。
   - 下一板块进入屏幕下方区域时开始播放入场动画,使内容在接近下方 1/4
     的阅读区域时已经清晰可见。

2. **滚动动画可重复触发**:
   - 滚动入场动画默认采用可重复模式:元素离开观察区域后恢复待播放状态,
     再次进入时重新播放。
   - 仅当具体交互明确需要一次性效果时,才为对应元素启用一次性播放配置。
   - 系统启用“减少动态效果”时,内容直接完整显示,保持连续阅读体验。

3. **动画验收路径**:
   - 每次调整滚动动画后,依次验证初次进入、向下离开、向上返回三个过程。
   - 验收时同时检查内容出现时机、可读性、重复触发和页面滚动连续性。
