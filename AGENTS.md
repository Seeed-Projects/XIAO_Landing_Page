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

## 首页字体层级规范

1. **适用范围**:
   - Home 页统一使用 `home-type-hero-title`、`home-type-title`、
     `home-type-subtitle`、`home-type-body` 和 `home-type-action` 五类语义字阶。
   - 首图展示标题使用 `home-type-hero-title`，首图解释文案归入子标题；导航、页脚、
     数据数字、标签、眉标、表单提示等辅助信息使用各自的紧凑字阶。

2. **章节大标题**:
   - 以 `XIAO Playground` 为基准，使用 Montserrat、700 字重、1.12 行高、
     `-0.035em` 字距和 `clamp(28px, 3.6vw, 44px)` 响应式字号。
   - 首图展示标题延续相同字体、字重、行高和字距，使用
     `clamp(36px, 4vw, 64px)` 建立首屏层级。

3. **子标题**:
   - 以 `Popular SoCs Integrated` 为基准，使用 Montserrat、20px、700 字重、
     1.5 行高和标准字距。

4. **正文描述与操作文字**:
   - 以 About XIAO 的介绍正文为基准，使用 Montserrat、400 字重、1.65 行高和
     标准字距；手机端为 15px，640px 及以上为 16px。
   - 页面内文字按钮和操作链接使用 `home-type-action`，与正文保持同一字体、
     字号、字重、行高和字距，通过颜色、底色和形状表达可点击状态。

5. **新增内容与验收**:
   - 新增 Home 页模块时，为每段文字按章节标题、子标题、正文、操作文字或辅助信息
     明确分类，并复用对应语义字阶。
   - 每次调整后在中英文、桌面端和手机端核对计算后的字体、字重、字号、行高、
     换行和按钮尺寸；同一语义类别应保持相同结果。
