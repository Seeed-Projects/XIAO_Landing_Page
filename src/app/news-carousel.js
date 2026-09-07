"use client";

import { useRef } from "react";
import { useLang } from "./i18n";

/**
 * 资讯滚动带 —— GitHub Pages 阶段只用静态快照，不运行时拉取。
 * 直连 Seeed WordPress wp-json 因重复 CORS 头失败；JSONP 取回后
 * re-render 会让卡片样式跳动（首屏对、几秒后变小）。为保持首屏
 * 样子稳定，这里不做 fetch，直接渲染静态数据。上到同源域名后再
 * 启用实时拉取。
 */

const BLOG_TAG_URL = "https://www.seeedstudio.com/blog/tag/seeed-studio-xiao/";

// 静态新闻快照：与 Seeed Blog XIAO 标签文章对齐，保证卡片有匹配的链接与配图。
const NEWS_FALLBACK = [
  {
    title: "Axiometa Genesis XIAO Shield: Build Real Devices Without the Wiring",
    excerpt:
      "Meet the Axiometa Genesis XIAO Shield, a board that turns compatible Seeed Studio XIAO boards into practical devices.",
    date: "2026-08-17",
    url: "https://www.seeedstudio.com/blog/2026/08/17/axiometa-genesis-xiao-shield/",
    media_url:
      "https://www.seeedstudio.com/blog/wp-content/uploads/2026/08/axiometa-xiao-shield-poster.png",
    source: "Kezang Loday",
    tag: "Seeed Blog",
  },
  {
    title: "Customize Your XIAO for Production: Firmware, Headers, Assembly & More",
    excerpt:
      "Seeed Fusion helps take a XIAO prototype toward a production-ready solution with customization and assembly services.",
    date: "2026-08-06",
    url:
      "https://www.seeedstudio.com/blog/2026/08/06/seeed-fusion-customize-your-xiao-for-production-firmware-headers-assembly-and-more/",
    media_url:
      "https://www.seeedstudio.com/blog/wp-content/uploads/2026/08/xiaoblog-%E5%A4%B4%E5%9B%BE-scaled.jpg",
    source: "Ginny Zhang",
    tag: "Seeed Blog",
  },
  {
    title: "Oli v1: A Fist-Grip Mouse That Gives Your Hand a Break",
    excerpt:
      "Meet Oli v1, a fist-grip computer mouse with tilt-layer functionality built with XIAO nRF52840 Sense.",
    date: "2026-08-04",
    url: "https://www.seeedstudio.com/blog/2026/08/04/oli-v1-fist-grip-mouse-xiao-nrf52840-sense/",
    media_url: "https://www.seeedstudio.com/blog/wp-content/uploads/2026/08/DSC01472_2.webp",
    source: "Kezang Loday",
    tag: "Seeed Blog",
  },
  {
    title: "Add Voice Interaction to LeKiwi Robot with reSpeaker Flex",
    excerpt:
      "A practical project combining robotics and voice interaction with reSpeaker Flex.",
    date: "2026-05-20",
    url:
      "https://www.seeedstudio.com/blog/2026/05/20/add-voice-interaction-to-lekiwi-robot-with-respeaker-flex/",
    media_url:
      "https://www.seeedstudio.com/blog/wp-content/uploads/2026/05/banner_javis-1.png",
    source: "Elena Tang",
    tag: "Seeed Blog",
  },
  {
    title: "ESP32-S31 vs. ESP32-S3: Should the XIAO Get an Upgrade?",
    excerpt:
      "A comparison of ESP32-S31 and ESP32-S3, and a discussion about the direction of the next XIAO.",
    date: "2026-04-14",
    url:
      "https://www.seeedstudio.com/blog/2026/04/14/esp32-s31-vs-esp32-s3-should-the-xiao-get-an-upgrade/",
    media_url:
      "https://www.seeedstudio.com/blog/wp-content/uploads/2026/04/ESP32-S31.png",
    source: "Josie",
    tag: "Seeed Blog",
  },
  {
    title: "Vision AI & Voice AI at Embedded World 2026",
    excerpt:
      "Seeed Studio showcased how edge AI sensing is moving rapidly from concept to real-world deployment.",
    date: "2026-03-20",
    url:
      "https://www.seeedstudio.com/blog/2026/03/20/vision-ai-voice-ai-at-embedded-world-2026-bringing-ai-sensing-from-concept-to-reality/",
    media_url: "https://www.seeedstudio.com/blog/wp-content/uploads/2026/03/EW1.jpg",
    source: "Elena Tang",
    tag: "Seeed Blog",
  },
];

export function NewsCarousel() {
  const { lang } = useLang();
  const isEn = lang === "en";
  const items = NEWS_FALLBACK;
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
