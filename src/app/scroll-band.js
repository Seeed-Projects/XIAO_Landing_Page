"use client";

/**
 * ScrollBand —— 通用横向跑马灯（CSS transform 动画，参考 partner-marquee）：
 * - 卡片横向排成一行，匀速无缝循环滚动（复制一份内容 + translateX -50%）
 * - 鼠标悬停在带上 → 暂停（方便阅读/点击），移开继续
 * - 点击卡片 → 跳转（hrefFor 决定链接）
 *
 * 不再用 rAF + scrollLeft：那种方式在 overflow-x:hidden 下不可靠、且依赖
 * IntersectionObserver 门控，实测会出现“不动”的 bug。CSS 动画稳定且零 JS。
 *
 * 各业务版块（资讯、热门项目…）复用同一套 CSS 与交互。
 */
export function ScrollBand({ items, hrefFor, renderCard, speed = 0.45, delayStep = 90, rows = 1 }) {
  // 两排时把单数列补成偶数，确保无缝循环的两份内容刚好各占一半宽度。
  const batch = rows === 2 && items.length % 2 ? [...items, items[0]] : items;
  // 复制一份实现无缝滚动
  const loop = [...batch, ...batch];

  // speed(px/帧@60fps) → 动画周期(秒)：speed 越大周期越短、滚动越快。
  // 取偏慢的周期，保证滚动舒缓；hover 由 group-hover 暂停。
  const duration = Math.max(50, Math.round(30 / speed));

  return (
    <div className="group relative w-full overflow-hidden">
      <div
        className={
          (rows === 2
            ? "grid w-max grid-flow-col grid-rows-2 gap-4 "
            : "flex w-max gap-5 ") +
          "marquee-track will-change-transform group-hover:[animation-play-state:paused]"
        }
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((item, i) => {
          const idx = i % batch.length;
          const sourceIdx = idx % items.length;
          const sourceItem = items[sourceIdx];
          return (
            <a
              key={i}
              href={hrefFor(sourceItem, sourceIdx)}
              target="_blank"
              rel="noopener noreferrer"
              className={
                rows === 2
                  ? "flex w-[280px] min-w-0 cursor-pointer flex-col rounded-xl border border-[var(--line-soft)] bg-white/90 p-3 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:w-[320px] lg:w-[340px]"
                  : "flex w-[300px] shrink-0 cursor-pointer flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-4 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:w-[340px] sm:p-5 lg:w-[380px] xl:w-[400px]"
              }
            >
              {renderCard(sourceItem, sourceIdx)}
            </a>
          );
        })}
      </div>
    </div>
  );
}
