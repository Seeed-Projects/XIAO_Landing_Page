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

const HEIGHT_BRIDGE = `<script>
(() => {
  let frame = 0;
  const report = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = Math.max(
        document.body?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0
      );
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
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${HUB_URL}">`);
    html = html.replace(/<\/body>/i, `${HEIGHT_BRIDGE}</body>`);
    fs.writeFileSync(OUT, html, "utf8");
    console.log(`[bake-project-hub-embed] baked ${OUT} (${html.length} bytes)`);
  } catch (e) {
    fs.writeFileSync(OUT, FALLBACK, "utf8");
    console.warn(
      `[bake-project-hub-embed] fetch failed, wrote fallback: ${e?.message || e}`
    );
  }
})();
