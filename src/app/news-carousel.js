"use client";

import { useEffect, useState } from "react";
import { useLang } from "./i18n";
import { ScrollBand } from "./scroll-band";

/**
 * 资讯滚动带 —— 数据自动更新：
 * 直连 Seeed WordPress wp-json 拉取 XIAO 标签文章。
 * ⚠️ GitHub Pages 阶段拉不到：wp-json 同时返回「反射 Origin」+「*」两个
 *    Access-Control-Allow-Origin 头，浏览器判 CORS 失败。上到
 *    www.seeedstudio.com 域名后与博客同源，直连即生效。期间回退 i18n
 *    静态数据，保证不空。要恢复实时新闻，最干净的做法是让 seeed 修掉
 *    wp-json 的重复 CORS 头（或上同源域名）。
 */

const WP_ENDPOINT =
  "https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=3129&per_page=6&_embed=1&orderby=date&order=desc";

const BLOG_TAG_URL = "https://www.seeedstudio.com/blog/tag/seeed-studio-xiao/";

// GitHub Pages cannot read the WordPress response because the blog currently
// returns conflicting CORS headers. Keep a recent, fully populated snapshot so
// the news cards still have matching links and featured images there.
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

// 内存缓存：1 小时内复用，避免重复请求。
const TTL = 60 * 60 * 1000;
let cache = { at: 0, items: null };

function strip(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function mapPost(p) {
  const emb = p?._embedded || {};
  const media = emb["wp:featuredmedia"]?.[0];
  const author = emb.author?.[0];
  return {
    title: strip(p?.title?.rendered),
    excerpt: strip(p?.excerpt?.rendered),
    date: (p?.date || "").slice(0, 10),
    url: p?.link || "#",
    media_url: media?.source_url || "",
    source: author?.name || "Seeed Blog",
    tag: "Seeed Blog",
  };
}

export function NewsCarousel() {
  const { lang } = useLang();
  const [items, setItems] = useState(NEWS_FALLBACK);

  useEffect(() => {
    let alive = true;
    const now = Date.now();
    if (cache.items && now - cache.at < TTL) {
      const cachedItems = cache.items;
      queueMicrotask(() => {
        if (alive) setItems(cachedItems);
      });
      return;
    }
    fetch(WP_ENDPOINT, { headers: { Accept: "application/json" } })
      .then((r) => (r && r.ok ? r.json() : Promise.reject(r?.status || "no-resp")))
      .then((posts) => {
        if (!alive || !Array.isArray(posts)) return;
        const mapped = posts
          .map(mapPost)
          .filter((p) => p.title)
          // 按日期倒序，优先显示近期
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        if (mapped.length) {
          cache = { at: Date.now(), items: mapped };
          setItems(mapped);
        }
      })
      .catch(() => {
        if (alive && cache.items) setItems(cache.items);
      });
    return () => {
      alive = false;
    };
  }, []);

  const isEn = lang === "en";

  return (
    <div>
      <ScrollBand
        items={items}
        hrefFor={(item) => item.url || "#"}
        renderCard={(item) => (
          <>
            {/* 封面图：加载成功显示真图，失败/无图回退渐变占位 */}
            <div
              className="aspect-[16/9] w-full overflow-hidden rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,73,102,0.12), rgba(143,195,31,0.12))",
              }}
            >
              {item.media_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.media_url}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              )}
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
                {isEn ? "Source: " : "来源："}
                {item.source}
              </p>
            </div>
          </>
        )}
      />
      {/* Explore More —— 进入 Seeed Blog XIAO 标签页，看更多文章 */}
      <div className="mt-8 flex justify-center">
        <a
          href={BLOG_TAG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--brand-blue)]/20 bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-blue)] shadow-[0_8px_24px_rgba(0,73,102,0.10)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/45 hover:bg-[var(--brand-blue)]/5"
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
