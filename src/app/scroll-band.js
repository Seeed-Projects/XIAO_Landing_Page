"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "./reveal";

/**
 * ScrollBand —— 通用横向自动滚动带（参考 esp32-s31 官网 spot-band）：
 * - 卡片横向排成一行，进入视口后自动匀速滚动（无缝循环）
 * - 鼠标悬停在列表上 → 停止滚动（方便阅读/点击）
 * - 鼠标移开 → 继续滚动
 * - 点击卡片 → 跳转（hrefFor 决定链接）
 *
 * 各业务版块（资讯、热门项目…）复用同一套 CSS 与交互。
 */
export function ScrollBand({ items, hrefFor, renderCard, speed = 0.45, delayStep = 90, rows = 1 }) {
  // 两排时把单数列补成偶数，确保无缝循环的两份内容刚好各占一半宽度。
  const batch = rows === 2 && items.length % 2 ? [...items, items[0]] : items;
  const loop = [...batch, ...batch];

  const trackRef = useRef(null);
  const playingRef = useRef(true); // 是否自动播放（rAF 读，不触发重渲染）
  const inViewRef = useRef(false); // 是否在视口内

  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let raf;
    const step = () => {
      if (playingRef.current && inViewRef.current) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2; // 两份中的第一份末尾
        if (el.scrollLeft >= half) el.scrollLeft -= half; // 无缝回退
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onMouseEnter={() => {
          playingRef.current = false;
        }}
        onMouseLeave={() => {
          playingRef.current = true;
        }}
        className={
          rows === 2
            ? "grid grid-flow-col grid-rows-2 auto-cols-[72%] select-none gap-4 overflow-x-hidden pb-2 [mask-image:linear-gradient(to_right,transparent_0,#000_3%,#000_97%,transparent_100%)] sm:auto-cols-[42%] lg:auto-cols-[27%] xl:auto-cols-[22%]"
            : "flex select-none gap-5 overflow-x-hidden pb-2 [mask-image:linear-gradient(to_right,transparent_0,#000_3%,#000_97%,transparent_100%)]"
        }
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loop.map((item, i) => {
          const idx = i % batch.length;
          const sourceIdx = idx % items.length;
          const sourceItem = items[sourceIdx];
          return (
            <Reveal
              key={i}
              as="a"
              href={hrefFor(sourceItem, sourceIdx)}
              target="_blank"
              rel="noopener noreferrer"
              data-card
              delay={sourceIdx * delayStep}
              className={
                rows === 2
                  ? "flex min-w-0 cursor-pointer flex-col rounded-xl border border-[var(--line-soft)] bg-white/90 p-3 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md"
                  : "flex w-[85%] shrink-0 cursor-pointer flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-5 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.875rem)] xl:w-[calc(25%-0.9375rem)]"
              }
            >
              {renderCard(sourceItem, sourceIdx)}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
