"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { HoverCardCopy } from "./scroll-card";
import content from "./home-content.generated.json";
import {
  centerNewsLoopIndex,
  createNewsLoop,
  getNewsLoopStart,
  shouldCenterNewsLoop,
} from "./news-carousel-loop.mjs";

/**
 * Render the build-time news snapshot so static hosting remains stable.
 * 渲染构建阶段生成的新闻快照，让静态托管保持稳定。
 */

const BLOG_TAG_URL = "https://www.seeedstudio.com/blog/tag/seeed-studio-xiao/";
const AUTO_ADVANCE_MS = 4800;
const SCROLL_SETTLE_MS = 180;

function formatNewsDate(date) {
  return date?.replaceAll("-", ".") || "";
}

export function NewsCarousel() {
  const { lang } = useLang();
  const isEn = lang === "en";
  const items = content.news;
  const itemCount = items.length;
  const loopItems = createNewsLoop(items);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardStepRef = useRef(0);
  const indexRef = useRef(getNewsLoopStart(itemCount));
  const settleTimerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  const moveToIndex = useCallback((index) => {
    const track = trackRef.current;
    const step = cardStepRef.current;
    if (!track || !step || !itemCount) return;

    indexRef.current = index;
    track.scrollTo({
      left: index * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [itemCount]);

  const moveByCard = useCallback((direction, manual = false) => {
    moveToIndex(indexRef.current + direction);
    if (manual) setCycleKey((current) => current + 1);
  }, [moveToIndex]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || itemCount < 1) return;

    // Measure one complete card step and begin on the center copy.
    // 测量单张卡片的完整步长，并从中间副本开始播放。
    const measure = () => {
      const first = track.children[0];
      const second = track.children[1];
      if (!first || !second) return;
      const step = second.offsetLeft - first.offsetLeft;
      if (step <= 0) return;
      cardStepRef.current = step;
      const centerIndex = centerNewsLoopIndex(indexRef.current, itemCount);
      indexRef.current = centerIndex;
      track.scrollLeft = centerIndex * step;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(track.children[0]);
    return () => observer.disconnect();
  }, [itemCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const section = viewport.closest("#news") || viewport;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || !itemCount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => moveByCard(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [cycleKey, itemCount, moveByCard, paused, visible]);

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    const step = cardStepRef.current;
    if (!track || !step || !itemCount) return;
    indexRef.current = Math.round(track.scrollLeft / step);
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const currentIndex = Math.round(track.scrollLeft / step);
      indexRef.current = currentIndex;
      if (!shouldCenterNewsLoop(currentIndex, itemCount)) return;

      // Jump to the identical center card after motion stops; the visual seam stays invisible.
      // 滚动结束后跳回中间的同一张卡片，视觉上不会出现接缝。
      const centerIndex = centerNewsLoopIndex(currentIndex, itemCount);
      track.scrollTo({ left: centerIndex * step, behavior: "auto" });
      indexRef.current = centerIndex;
    }, SCROLL_SETTLE_MS);
  };

  return (
    <div>
      <div
        ref={viewportRef}
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* 向左滑动 */}
        <button
          type="button"
          aria-label={isEn ? "Previous" : "上一个"}
          onClick={() => moveByCard(-1, true)}
          className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--button-bg)] text-lg text-white shadow-[0_4px_14px_rgba(143,195,31,.32)] transition hover:bg-[var(--button-bg-hover)] sm:left-6 lg:left-8"
        >
          ‹
        </button>
        {/* 卡片轨道：三组相同内容支持无缝循环，同时保留触屏滑动。 */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex w-full snap-x snap-mandatory scroll-px-14 flex-nowrap justify-start gap-4 overflow-x-auto px-14 sm:scroll-px-16 sm:px-16 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loopItems.map(({ item, itemIndex, copyIndex }) => {
            const accessible = copyIndex === 1;
            return (
              <a
                key={`${copyIndex}-${item.url || itemIndex}`}
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={accessible ? undefined : true}
                tabIndex={accessible ? undefined : -1}
                className="hover-copy-card flex w-[280px] shrink-0 snap-start cursor-pointer flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-3 no-underline shadow-[0_8px_24px_rgba(0,73,102,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(143,195,31,0.35)] hover:shadow-[0_14px_30px_rgba(0,73,102,0.11)] sm:w-[320px] lg:w-[340px]"
              >
                <div className="aspect-[1.55] w-full overflow-hidden rounded-lg bg-[#edf2eb]">
                  {item.media_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.media_url}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.025]"
                      onError={(event) => { event.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>
                <h3 className="home-type-subtitle mt-3 min-h-[3em] line-clamp-2 text-[#253946]">{item.title}</h3>
                {item.date && (
                  <time className="news-card-date mt-2" dateTime={item.date}>
                    {formatNewsDate(item.date)}
                  </time>
                )}
                {item.excerpt && <span className="sr-only">{item.excerpt}</span>}
                <span className="home-type-action home-text-action mt-auto pt-3 text-[#8fc93a]">
                  {isEn ? "Read More »" : "阅读更多 »"}
                </span>
                <HoverCardCopy title={item.title} description={item.excerpt} />
              </a>
            );
          })}
        </div>
        {/* 向右滑动 */}
        <button
          type="button"
          aria-label={isEn ? "Next" : "下一个"}
          onClick={() => moveByCard(1, true)}
          className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--button-bg)] text-lg text-white shadow-[0_4px_14px_rgba(143,195,31,.32)] transition hover:bg-[var(--button-bg-hover)] sm:right-6 lg:right-16"
        >
          ›
        </button>
      </div>
      {/* Explore More —— 进入 Seeed Blog XIAO 标签页，看更多文章 */}
      <div className="mt-10 flex justify-center">
        <a
          href={BLOG_TAG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="home-type-action home-filled-action group inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-12 py-3 text-white transition hover:-translate-y-0.5 hover:bg-[var(--button-bg-hover)]"
          style={{ color: "#fff" }}
        >
          {isEn ? "Explore more" : "探索更多"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
