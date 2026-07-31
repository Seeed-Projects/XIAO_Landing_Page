// DXF 尺寸图 → SVG 缩略图
// fetch 文本 -> 解析 -> image/svg+xml
import { renderDxfSvg } from "../../../lib/parseDxf";

const cache = new Map();

export async function GET(request) {
  const url = request.nextUrl?.searchParams.get("url");
  if (!url) return new Response("missing url", { status: 400 });
  if (cache.has(url)) return svgResponse(cache.get(url));

  let target;
  try {
    target = new URL(url);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!target.hostname.endsWith("seeedstudio.com"))
    return new Response("host not allowed", { status: 403 });

  try {
    const up = await fetch(target.href, { redirect: "follow" });
    if (!up.ok) return new Response(`upstream ${up.status}`, { status: 502 });
    const text = await up.text();
    const svg = renderDxfSvg(text);
    if (!svg) return new Response("dxf render failed", { status: 500 });
    cache.set(url, svg);
    return svgResponse(svg);
  } catch (e) {
    return new Response(`dxf error: ${e.message}`, { status: 502 });
  }
}

function svgResponse(svg) {
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}
