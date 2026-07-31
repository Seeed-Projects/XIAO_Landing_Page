// XLSX Pinout → 表格 SVG 缩略图
// fetch zip -> fflate 解包 -> 读 sheet1.xml + sharedStrings -> image/svg+xml
import { unzipSync, strFromU8 } from "fflate";

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
    const files = unzipSync(new Uint8Array(await up.arrayBuffer()));

    const sstPath = Object.keys(files).find((n) => n.endsWith("sharedStrings.xml"));
    const sheetPath = Object.keys(files).find(
      (n) => n.includes("worksheets") && n.endsWith(".xml")
    );
    if (!sheetPath) return new Response("no sheet", { status: 422 });

    const strings = sstPath ? parseSharedStrings(strFromU8(files[sstPath])) : [];
    const rows = parseSheet(strFromU8(files[sheetPath]), strings);

    const svg = renderTableSvg(rows);
    if (!svg) return new Response("xlsx render failed", { status: 500 });
    cache.set(url, svg);
    return svgResponse(svg);
  } catch (e) {
    return new Response(`xlsx error: ${e.message}`, { status: 502 });
  }
}

function parseSharedStrings(xml) {
  const out = [];
  // 每个 <si>...</si> 内取所有 <t>...</t> 拼接（含 rich-text <r><t>）
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
  let m;
  while ((m = siRe.exec(xml))) {
    let s = "";
    let tm;
    while ((tm = tRe.exec(m[1]))) s += decodeXml(tm[1]);
    tRe.lastIndex = 0;
    out.push(s);
  }
  return out;
}

function parseSheet(xml, strings) {
  const rows = [];
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const cells = [];
    const cRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cm;
    while ((cm = cRe.exec(rm[1]))) {
      const attrs = cm[1];
      const inner = cm[2];
      const tMatch = /\bt="([^"]+)"/.exec(attrs);
      const t = tMatch ? tMatch[1] : "n";
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
      const isMatch = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
      let val = "";
      if (t === "s" && vMatch) val = strings[parseInt(vMatch[1], 10)] ?? "";
      else if (t === "inlineStr" && isMatch) val = decodeXml(isMatch[1]);
      else if (vMatch) val = vMatch[1];
      cells.push(val);
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function decodeXml(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function renderTableSvg(rows) {
  if (!rows.length) return null;
  const maxRows = 14;
  const maxCols = 8;
  const data = rows.slice(0, maxRows).map((r) => r.slice(0, maxCols));
  const cols = Math.max(...data.map((r) => r.length));
  const cw = 50;
  const rh = 24;
  const w = cols * cw;
  const h = data.length * rh + 4;
  const out = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
  );
  out.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>`);
  for (let r = 0; r < data.length; r++) {
    const y = r * rh;
    if (r === 0) out.push(`<rect x="0" y="${y}" width="${w}" height="${rh}" fill="#eef4df"/>`);
    out.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#d7dec4" stroke-width="0.5"/>`);
    for (let c = 0; c < data[r].length; c++) {
      const x = c * cw;
      const txt = clip(data[r][c], 9);
      const anchor = r === 0 ? "middle" : c === 0 ? "middle" : "start";
      const tx = r === 0 ? x + cw / 2 : c === 0 ? x + cw / 2 : x + 4;
      out.push(
        `<text x="${tx}" y="${y + 16}" font-family="monospace" font-size="12" fill="#243528" text-anchor="${anchor}">${escapeXml(
          txt
        )}</text>`
      );
    }
    out.push(`<line x1="0" y1="${y + rh}" x2="${w}" y2="${y + rh}" stroke="#d7dec4" stroke-width="0.5"/>`);
  }
  for (let c = 0; c <= cols; c++) {
    out.push(`<line x1="${c * cw}" y1="0" x2="${c * cw}" y2="${h}" stroke="#e3e8d2" stroke-width="0.5"/>`);
  }
  if (rows.length > maxRows) {
    out.push(`<text x="${w - 2}" y="${h - 2}" font-family="monospace" font-size="9" fill="#8a9277" text-anchor="end">+${rows.length - maxRows} rows</text>`);
  }
  out.push("</svg>");
  return out.join("");
}

function clip(s, n) {
  s = String(s ?? "").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
