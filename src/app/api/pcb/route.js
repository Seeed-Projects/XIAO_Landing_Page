// KiCad 工程包 → PCB 渲染缩略图（SVG）
// fetch zip -> fflate 解包 -> 找 *.kicad_pcb -> 解析渲染 -> image/svg+xml

import { unzipSync, strFromU8 } from "fflate";
import { renderPcbSvg } from "../../../lib/parseKicadPcb";

const cache = new Map();

export async function GET(request) {
  const url = request.nextUrl?.searchParams.get("url");
  if (!url) return new Response("missing url", { status: 400 });
  if (cache.has(url)) {
    return svgResponse(cache.get(url));
  }

  let target;
  try {
    target = new URL(url);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (!target.hostname.endsWith("seeedstudio.com")) {
    return new Response("host not allowed", { status: 403 });
  }

  try {
    const up = await fetch(target.href, { redirect: "follow" });
    if (!up.ok) return new Response(`upstream ${up.status}`, { status: 502 });
    const buf = new Uint8Array(await up.arrayBuffer());
    let files;
    try {
      files = unzipSync(buf);
    } catch {
      return new Response("not a zip", { status: 422 });
    }
    const pcbName = Object.keys(files).find((n) => n.endsWith(".kicad_pcb"));
    if (!pcbName) return new Response("no .kicad_pcb in archive", { status: 422 });
    const src = strFromU8(files[pcbName]);
    const svg = renderPcbSvg(src);
    if (!svg) return new Response("pcb render failed", { status: 500 });
    cache.set(url, svg);
    return svgResponse(svg);
  } catch (e) {
    return new Response(`pcb error: ${e.message}`, { status: 502 });
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
