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
  "https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=3129&per_page=10&_embed=1&orderby=date&order=desc";

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

// WordPress REST supports JSONP. Loading it as a script avoids the invalid
// duplicate CORS response headers returned by the blog/CDN on GitHub Pages.
function loadPostsWithJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `xiaoNews_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("News JSONP request timed out"));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (posts) => {
      cleanup();
      resolve(posts);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("News JSONP request failed"));
    };
    script.src = `${WP_ENDPOINT}&_jsonp=${callbackName}`;
    document.head.appendChild(script);
  });
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
      .catch(() => loadPostsWithJsonp())
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
        rows={2}
        speed={0.52}
        hrefFor={(item) => item.url || "#"}
        cardClassName="bg-white shadow-[0_8px_24px_rgba(18,43,56,.06)]"
        renderCard={(item) => <>
          <div className="aspect-[1.55] w-full overflow-hidden rounded-lg bg-[#edf2eb]">
            {item.media_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.media_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.025]" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            )}
          </div>
          <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-[1.45] text-[#253946]">{item.title}</h3>
          <span className="mt-2 text-sm font-medium text-[#8fc93a]">{isEn ? "Read More »" : "阅读更多 »"}</span>
        </>}
      />
      {/* Explore More —— 进入 Seeed Blog XIAO 标签页，看更多文章 */}
      <div className="mt-14 flex justify-center">
        <a
          href={BLOG_TAG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-[#8fc31f] px-12 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#79ad12]"
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
