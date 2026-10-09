"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getScrollBandLayout } from "./scroll-band-layout.mjs";

/**
 * Repeat linked cards across the viewport and animate one measured batch.
 * 按可视宽度重复链接卡片，每轮滚动一组实测宽度；悬停或聚焦时暂停。
 */
export function ScrollBand({ items, hrefFor, renderCard, speed = 0.45, delayStep = 90, rows = 1, cardClassName = "" }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [layout, setLayout] = useState({ copies: 2, distance: 0 });
  // Complete the final column of each two-row batch.
  // 补齐双排内容组的最后一列。
  const batch = rows === 2 && items.length % 2 ? [...items, items[0]] : items;
  const batchSize = batch.length;
  const loop = Array.from({ length: layout.copies }, () => batch).flat();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!batchSize) return;

    // Measure the start-to-start distance of adjacent batches, including gaps.
    // 测量相邻两组起点之间的距离，包含组间间距。
    const measure = () => {
      const first = track.children[0].getBoundingClientRect();
      const next = track.children[batchSize].getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).columnGap);
      const nextLayout = getScrollBandLayout(
        viewport.getBoundingClientRect().width,
        next.left - first.left,
        gap,
      );
      setLayout((current) => current.copies === nextLayout.copies && current.distance === nextLayout.distance
        ? current
        : nextLayout);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [batchSize, rows]);

  // speed(px/帧@60fps) → 动画周期(秒)：speed 越大周期越短、滚动越快。
  // 取偏慢的周期，保证滚动舒缓；hover 由 group-hover 暂停。
  const duration = Math.max(50, Math.round(30 / speed));

  return (
    <div ref={viewportRef} className="group relative w-full overflow-hidden">
      <div
        ref={trackRef}
        className={
          (rows === 2
            ? "grid w-max grid-flow-col grid-rows-2 gap-4 "
            : "flex w-max gap-5 ") +
          "marquee-track will-change-transform group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        }
        style={{
          animationName: layout.distance ? "scroll-band-loop" : "none",
          animationDuration: `${duration}s`,
          "--scroll-band-distance": `${-layout.distance}px`,
        }}
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
                (rows === 2
                  ? "flex w-[280px] min-w-0 cursor-pointer flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-3 no-underline shadow-[0_8px_24px_rgba(0,73,102,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(143,195,31,0.35)] hover:shadow-[0_14px_30px_rgba(0,73,102,0.11)] sm:w-[320px] lg:w-[340px]"
                  : "flex w-[300px] shrink-0 cursor-pointer flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-5 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:w-[340px] sm:p-6 lg:w-[380px] xl:w-[400px]") + ` ${cardClassName}`
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
