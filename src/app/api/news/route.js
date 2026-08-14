/**
 * /api/news —— 服务端代理 Seeed WordPress 博客的 XIAO 文章。
 *
 * 为什么走服务端代理：
 *  - 前端直连 wp-json 会撞浏览器跨域；
 *  - 服务端 fetch 无 CORS 限制，且可缓存，避免每次请求都打对方接口。
 *
 * 数据源：https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=3129
 *   tags=3129 即 "XIAO" 标签（共 100+ 篇），博客发新文即自动出现在这里。
 */

const WP_ENDPOINT =
  "https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=3129&per_page=6&_embed=1";

// 内存缓存：1 小时内复用，过期后重新拉取。
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

export async function GET() {
  const now = Date.now();
  if (cache.items && now - cache.at < TTL) {
    return Response.json(cache.items, {
      headers: { "cache-control": "public, max-age=3600" },
    });
  }

  try {
    const res = await fetch(WP_ENDPOINT, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`wp-json ${res.status}`);
    const posts = await res.json();
    const items = (Array.isArray(posts) ? posts : []).map(mapPost).filter((p) => p.title);
    if (items.length) cache = { at: now, items };
    return Response.json(items, {
      headers: { "cache-control": "public, max-age=3600" },
    });
  } catch (err) {
    // 拉取失败/超时：有旧缓存就返回旧的（stale），避免页面空图
    if (cache.items) {
      return Response.json(cache.items, {
        headers: { "cache-control": "public, max-age=60" },
      });
    }
    return Response.json(
      { error: "news fetch failed", message: String(err?.message || err) },
      { status: 502 }
    );
  }
}
