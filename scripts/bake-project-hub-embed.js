// 构建期把远程 OSHW XIAO Series 页面烘焙成同源静态 HTML，
// 注入 <base> 让相对资源仍从远程加载，并注入高度桥接脚本，
// 供 project-hub 页面 iframe 同源加载并测高（postMessage 给父页）。
//
// 为什么需要：项目用 output:"export" 静态导出部署到 GitHub Pages，
// 运行时没有服务器，route handler 无法做运行时代理远程 HTML。
// 故改为此预构建脚本：构建期 fetch 一次、烘焙成静态文件放进 public/，
// iframe 直接指向该同源静态文件，桥接脚本在客户端测高，行为与代理等价。
// 每次 npm run build（含 CI）都会重新烘焙，内容随远程更新而刷新。
// fetch 失败时写入兜底页，绝不中断构建。

const fs = require("node:fs");

const HUB_URL = "https://seeed-studio.github.io/OSHW-XIAO-Series/";
const OUT = "public/project-hub-embed.html";

// 内嵌页顶部的 "XIAO Project Hub" 大标题与 landing 页重复，隐藏整个 <header>
// （含标题、副标题、Contribute、语言按钮），让内嵌直接从搜索框 + 筛选器开始。
// 用 display:none 而非删除节点：页面 JS 依赖 #title/#subtitle/#langBtn/#contributeBtn，
// 删除会令 updateLang() 等抛错。元素保留在 DOM 中，仅视觉隐藏。
//
// 同时把 body 的 min-height:100vh 覆盖为 0：在 iframe 中 100vh = iframe 当前高度，
// 若保留，body 永远不短于当前 iframe 高度，导致高度桥接量的 scrollHeight 钉死、
// 筛选后内容变短时 iframe 无法收缩、下方留出大片空白。置 0 后 body 随内容收缩，
// 桥接脚本（MutationObserver/ResizeObserver）即可量到真实高度并回传父页自动缩小。
//
// #like-status is the hub's yellow "Likes are temporarily unavailable" banner.
// Hide it in the embed: browsing is the job of this section; on localhost the
// likes API also rejects our origin, so the banner would always look broken.
const EMBED_OVERRIDES = `<style>
header{display:none !important;}
body{min-height:0 !important;}
#like-status{display:none !important;}
</style>`;

// Remote likes.mjs treats localhost as a local Worker (127.0.0.1:8787). When this
// embed is served from the landing page origin, rewrite that host to the real API
// so production github.io embeds can still load counts. Localhost still needs the
// Worker to allow the landing origin for toggles to succeed.
const LIKES_BRIDGE = (apiBaseUrl) => `<script>
(() => {
  const apiBase = ${JSON.stringify(apiBaseUrl.replace(/\/$/, ""))};
  if (!apiBase) return;
  const local = "http://127.0.0.1:8787";
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input && input.url;
    if (typeof raw === "string" && raw.startsWith(local)) {
      const next = apiBase + raw.slice(local.length);
      if (typeof input === "string") return nativeFetch(next, init);
      if (input instanceof URL) return nativeFetch(new URL(next), init);
      return nativeFetch(new Request(next, input), init);
    }
    return nativeFetch(input, init);
  };
})();
</script>`;

const HEIGHT_BRIDGE = `<script>
(() => {
  let frame = 0;
  const report = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = document.body?.scrollHeight || document.documentElement?.scrollHeight || 0;
      parent.postMessage({ type: "xiao-project-hub-height", height }, location.origin);
    });
  };
  addEventListener("load", report);
  addEventListener("resize", report);
  new ResizeObserver(report).observe(document.documentElement);
  new MutationObserver(report).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true
  });
  report();
})();
</script>`;

const FALLBACK =
  '<!doctype html><html><body style="margin:0;padding:32px;font:14px sans-serif">Unable to load Project Hub.</body></html>';

(async () => {
  try {
    const res = await fetch(HUB_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Project Hub responded with ${res.status}`);
    let html = await res.text();

    // new URL(..., location.href) ignores <base> and would fetch submission-config
    // from the landing origin. Pin it to the remote hub so likes config resolves.
    html = html.replace(
      /configUrl:\s*new URL\(\s*['"]\.\/submission-config\.json['"]\s*,\s*location\.href\s*\)/g,
      `configUrl: new URL('./submission-config.json', '${HUB_URL}')`
    );

    let apiBaseUrl = "";
    try {
      const configRes = await fetch(new URL("submission-config.json", HUB_URL), {
        cache: "no-store",
      });
      if (configRes.ok) {
        const config = await configRes.json();
        apiBaseUrl = String(config.apiBaseUrl || "");
      }
    } catch {
      apiBaseUrl = "";
    }

    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${HUB_URL}">${EMBED_OVERRIDES}${LIKES_BRIDGE(apiBaseUrl)}`
    );
    html = html.replace(/<\/body>/i, `${HEIGHT_BRIDGE}</body>`);
    fs.writeFileSync(OUT, html, "utf8");
    console.log(
      `[bake-project-hub-embed] baked ${OUT} (${html.length} bytes, likes api=${apiBaseUrl || "none"})`
    );
  } catch (e) {
    fs.writeFileSync(OUT, FALLBACK, "utf8");
    console.warn(
      `[bake-project-hub-embed] fetch failed, wrote fallback: ${e?.message || e}`
    );
  }
})();
