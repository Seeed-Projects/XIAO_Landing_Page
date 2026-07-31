// 同源 CORS 代理：把远程 CDN 文件以带 CORS 头的形式透传给浏览器，
// 供 pdf.js / occt-import-js 这类客户端渲染器取字节（CDN 本身不发 CORS 头）。

const ALLOWED_HOSTS = ["files.seeedstudio.com", "files-secure.seeedstudio.com"];

export async function GET(request) {
  const url = request.nextUrl?.searchParams.get("url");
  if (!url) return new Response("missing url", { status: 400 });

  let target;
  try {
    target = new URL(url);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!ALLOWED_HOSTS.includes(target.hostname)) {
    return new Response("host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(target.href, { redirect: "follow" });
    if (!upstream.ok) return new Response(`upstream ${upstream.status}`, { status: 502 });

    const body = await upstream.arrayBuffer();
    const ctype = upstream.headers.get("content-type") || "application/octet-stream";
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": ctype,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response(`proxy error: ${e.message}`, { status: 502 });
  }
}
