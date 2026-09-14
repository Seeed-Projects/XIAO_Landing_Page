"use client";

import { useRef } from "react";
import { useLang } from "./i18n";
import content from "./home-content.generated.json";

/**
 * Render the build-time news snapshot so static hosting remains stable.
 * 渲染构建阶段生成的新闻快照，让静态托管保持稳定。
 */

const BLOG_TAG_URL = "https://www.seeedstudio.com/blog/tag/seeed-studio-xiao/";

export function NewsCarousel() {
  const { lang } = useLang();
  const isEn = lang === "en";
  const items = content.news;
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const delta = Math.max(el.clientWidth * 0.85, 240) * dir;
    if (typeof el.scrollBy === "function") {
      el.scrollBy({ left: delta, behavior: "smooth" });
    } else {
      el.scrollLeft += delta;
    }
  };

  return (
    <div>
      <div className="relative">
        {/* 左缘渐变 fade：提示仍有更多可滑，箭头浮其上，允许覆盖卡片边缘 */}
        <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[5] h-full w-16 bg-gradient-to-r from-white via-white/85 to-transparent sm:w-20" />
        {/* 向左滑动 */}
        <button
          type="button"
          aria-label={isEn ? "Previous" : "上一个"}
          onClick={() => scrollByCard(-1)}
          className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--button-bg)] text-lg text-white shadow-[0_4px_14px_rgba(143,195,31,.32)] transition hover:bg-[var(--button-bg-hover)] sm:left-2"
        >
          ‹
        </button>
        {/* 卡片轨道：单行，横向可滚动，隐藏滚动条 */}
        <div
          ref={trackRef}
          className="flex w-full snap-x flex-nowrap justify-start gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
        {items.map((item, i) => (
          <a
            key={item.url || i}
            href={item.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[280px] shrink-0 cursor-pointer flex-col rounded-xl border border-[var(--line-soft)] bg-white/90 p-3 no-underline backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:w-[320px] lg:w-[340px]"
          >
            <div className="aspect-[1.55] w-full overflow-hidden rounded-lg bg-[#edf2eb]">
              {item.media_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.media_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.025]" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              )}
            </div>
            <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-[1.45] text-[#253946]">{item.title}</h3>
            <span className="mt-2 text-sm font-medium text-[#8fc93a]">{isEn ? "Read More »" : "阅读更多 »"}</span>
          </a>
        ))}
        </div>
        {/* 向右滑动 */}
        <button
          type="button"
          aria-label={isEn ? "Next" : "下一个"}
          onClick={() => scrollByCard(1)}
          className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[var(--button-bg)] text-lg text-white shadow-[0_4px_14px_rgba(143,195,31,.32)] transition hover:bg-[var(--button-bg-hover)] sm:right-2"
        >
          ›
        </button>
        {/* 右缘渐变 fade */}
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-[5] h-full w-16 bg-gradient-to-l from-white via-white/85 to-transparent sm:w-20" />
      </div>
      {/* Explore More —— 进入 Seeed Blog XIAO 标签页，看更多文章 */}
      <div className="mt-14 flex justify-center">
        <a
          href={BLOG_TAG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-12 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--button-bg-hover)]"
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
