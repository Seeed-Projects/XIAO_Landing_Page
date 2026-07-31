"use client";

import { useRef } from "react";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";

export function NewsCarousel() {
  const { t } = useLang();
  const items = t.news.items;
  const scrollRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.offsetWidth || el.clientWidth;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* 卡片滚动容器 */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <Reveal
            key={i}
            as="article"
            data-card
            delay={i * 90}
            className="flex snap-start shrink-0 flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-6 backdrop-blur-sm w-full sm:w-[calc(50%-0.625rem)]"
          >
            {/* 图片占位 */}
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,73,102,0.12), rgba(143,195,31,0.12))",
                }}
              />
            </div>
            {/* 文字 */}
            <div className="mt-4 flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--brand-green)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-green-deep)]">
                  {item.tag}
                </span>
                <span className="text-xs text-[var(--ink-muted)]">{item.date}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--ink-strong)]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-body)]">
                {item.excerpt}
              </p>
              <p className="mt-2 text-xs font-medium text-[var(--brand-blue-soft)]">
                来源：{item.source}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 左箭头 */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="向左滚动"
        className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white shadow-md transition hover:border-[var(--brand-blue)]/30 hover:shadow-lg sm:-left-5 sm:h-12 sm:w-12"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ink-strong)]">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* 右箭头 */}
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="向右滚动"
        className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white shadow-md transition hover:border-[var(--brand-blue)]/30 hover:shadow-lg sm:-right-5 sm:h-12 sm:w-12"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ink-strong)]">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}