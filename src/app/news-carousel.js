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
  "https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=3129&per_page=6&_embed=1";

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
  const { t } = useLang();
  const [items, setItems] = useState(t.news.items);

  useEffect(() => {
    let alive = true;
    const now = Date.now();
    if (cache.items && now - cache.at < TTL) {
      setItems(cache.items);
      return;
    }
    fetch(WP_ENDPOINT, { headers: { Accept: "application/json" } })
      .then((r) => (r && r.ok ? r.json() : Promise.reject(r?.status || "no-resp")))
      .then((posts) => {
        if (!alive || !Array.isArray(posts)) return;
        const mapped = posts.map(mapPost).filter((p) => p.title);
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

  return (
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
              来源：{item.source}
            </p>
          </div>
        </>
      )}
    />
  );
}
