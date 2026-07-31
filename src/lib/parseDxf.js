// DXF（ASCII）→ SVG 渲染器
// 扫描 LINE / POLYLINE(VERTEX) / CIRCLE / ARC / TEXT 实体，渲染尺寸图缩略图。

// group-code 对的流式扫描，避免一次性深度解析 28 万行。
export function renderDxfSvg(src) {
  const lines = src.split(/\r?\n/);
  const n = lines.length;
  let i = 0;

  const segs = []; // 直线段 {x1,y1,x2,y2}
  const polys = []; // 多段线 [[x,y],...]
  const arcs = []; // {cx,cy,r,a0,a1}
  const texts = []; // {x,y,s}
  let bounds = null;

  function grow(x, y) {
    if (x === undefined) return;
    if (!bounds) bounds = { minx: x, maxx: x, miny: y, maxy: y };
    else {
      if (x < bounds.minx) bounds.minx = x;
      if (x > bounds.maxx) bounds.maxx = x;
      if (y < bounds.miny) bounds.miny = y;
      if (y > bounds.maxy) bounds.maxy = y;
    }
  }

  let inEnt = false;
  let ent = null;
  let cur = null; // 当前多段线顶点容器

  // 读取一个 (code,value) 对
  function readPair() {
    if (i + 1 >= n) return null;
    const code = parseInt(lines[i], 10);
    const value = lines[i + 1].trim();
    i += 2;
    return { code, value };
  }

  // 实体值收集：读实体直到下一个 code==0
  function readEntity(firstPair) {
    const fields = {};
    let pair = firstPair;
    let vx = [];
    while (pair && pair.code !== 0) {
      fields[pair.code] = (fields[pair.code] ?? []);
      fields[pair.code].push(pair.value);
      pair = readPair();
    }
    // 若遇到 code==0 的 VERTEX，处理之并继续（旧式 POLYLINE）
    return { type: firstPair.value, fields, next: pair };
  }

  // 简化：逐对扫描，按 code==0 切分实体
  let type = null;
  let f = {};
  let polyPts = null;

  while (i + 1 < n) {
    const code = parseInt(lines[i], 10);
    const value = lines[i + 1].trim();
    i += 2;

    if (code === 0) {
      // 上一实体处理
      flush(type, f, polyPts);
      type = value;
      f = {};
      if (type === "POLYLINE") polyPts = [];
      continue;
    }

    if (type === "VERTEX" && polyPts !== null) {
      if (code === 10) polyPts.push([parseFloat(value), 0]);
      if (code === 20 && polyPts.length) polyPts[polyPts.length - 1][1] = parseFloat(value);
      continue;
    }

    // 普通实体：只记需要字段
    if (code === 10 || code === 11 || code === 20 || code === 21 || code === 40 || code === 50 || code === 51 || code === 1) {
      f[code] = value;
    }
  }
  flush(type, f, polyPts);

  function flush(t, ff, pp) {
    if (!t) return;
    const num = (v) => (v === undefined ? undefined : parseFloat(v));
    if (t === "LINE") {
      const x1 = num(ff[10]);
      const y1 = num(ff[20]);
      const x2 = num(ff[11]);
      const y2 = num(ff[21]);
      if (x1 !== undefined) {
        segs.push({ x1, y1, x2, y2 });
        grow(x1, y1);
        grow(x2, y2);
      }
    } else if (t === "CIRCLE") {
      const cx = num(ff[10]);
      const cy = num(ff[20]);
      const r = num(ff[40]);
      if (cx !== undefined && r) {
        arcs.push({ cx, cy, r, a0: 0, a1: 360 });
        grow(cx - r, cy - r);
        grow(cx + r, cy + r);
      }
    } else if (t === "ARC") {
      const cx = num(ff[10]);
      const cy = num(ff[20]);
      const r = num(ff[40]);
      if (cx !== undefined && r) {
        arcs.push({ cx, cy, r, a0: num(ff[50]) || 0, a1: num(ff[51]) || 360 });
        grow(cx - r, cy - r);
        grow(cx + r, cy + r);
      }
    } else if (t === "TEXT") {
      const x = num(ff[10]);
      const y = num(ff[20]);
      texts.push({ x, y, s: ff[1] || "" });
      grow(x, y);
    } else if (t === "SEQEND" || t === "ENDSEC" || t === "ENDBLK") {
      if (polyPts && polyPts.length) {
        polys.push(polyPts);
        for (const [px, py] of polyPts) grow(px, py);
      }
      polyPts = null;
    }
  }
  // 收尾未闭合的 polyline
  if (polyPts && polyPts.length) {
    polys.push(polyPts);
    for (const [px, py] of polyPts) grow(px, py);
  }

  // 降采样：实体过多时只取一部分，避免缩略图变成噪点 + 减小 SVG 体积
  const cap = (arr, max) => {
    if (arr.length <= max) return arr;
    const k = Math.ceil(arr.length / max);
    const out = [];
    for (let i = 0; i < arr.length; i += k) out.push(arr[i]);
    return out;
  };
  let rSegs = cap(segs, 1500);
  let rPolys = cap(polys, 2000);
  let rArcs = cap(arcs, 500);

  if (!bounds) return null;
  // 离群点会撑爆边界（标题栏/远端尺寸线）。用"包含 80% 点的最小区间"找主簇。
  const pxs = [];
  const pys = [];
  for (const s of segs) { pxs.push(s.x1, s.x2); pys.push(s.y1, s.y2); }
  for (const p of polys) for (const [x, y] of p) { pxs.push(x); pys.push(y); }
  for (const a of arcs) { pxs.push(a.cx - a.r, a.cx + a.r); pys.push(a.cy - a.r, a.cy + a.r); }
  for (const t of texts) { pxs.push(t.x); pys.push(t.y); }
  if (!pxs.length) return null;
  // 排序后滑动窗口，找包含 80% 点的最窄区间
  const dense = (arr) => {
    const a = arr.slice().sort((m, n) => m - n);
    const n = a.length;
    const win = Math.max(2, Math.floor(n * 0.6));
    let bestLo = a[0],
      bestHi = a[n - 1],
      bestRange = bestHi - bestLo;
    for (let i = 0; i + win < n; i++) {
      const rng = a[i + win] - a[i];
      if (rng < bestRange) {
        bestRange = rng;
        bestLo = a[i];
        bestHi = a[i + win];
      }
    }
    return [bestLo, bestHi];
  };
  const [minx0, maxx0] = dense(pxs);
  const [miny0, maxy0] = dense(pys);
  const spanX = Math.max(maxx0 - minx0, 1);
  const spanY = Math.max(maxy0 - miny0, 1);
  const m = Math.max(spanX, spanY) * 0.06;
  const ox = minx0 - m;
  const oy = miny0 - m;
  const W = spanX + 2 * m;
  const H = spanY + 2 * m;
  const sc = 8;
  const sw = W * sc;
  const sh = H * sc;
  const tx = (x) => (x - ox) * sc;
  const ty = (y) => H * sc - (y - oy) * sc; // DXF y 朝上，翻转

  const out = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw.toFixed(1)} ${sh.toFixed(
      1
    )}" width="${Math.round(sw)}" height="${Math.round(sh)}" overflow="hidden">`
  );
  out.push(`<rect x="0" y="0" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="#fafbf6"/>`);

  const stroke = `stroke="#1f3b2c" stroke-width="${Math.max(1.0, sc * 0.14).toFixed(
    2
  )}" fill="none" stroke-linejoin="round" stroke-linecap="round"`;
  for (const s of rSegs) {
    out.push(
      `<line x1="${tx(s.x1).toFixed(1)}" y1="${ty(s.y1).toFixed(1)}" x2="${tx(s.x2).toFixed(
        1
      )}" y2="${ty(s.y2).toFixed(1)}" ${stroke}/>`
    );
  }
  for (const p of rPolys) {
    const pts = p.map(([x, y]) => `${tx(x).toFixed(1)},${ty(y).toFixed(1)}`).join(" ");
    out.push(`<polyline points="${pts}" ${stroke}/>`);
  }
  for (const a of rArcs) {
    const cx = tx(a.cx);
    const cy = ty(a.cy);
    const r = a.r * sc;
    if (a.a0 === 0 && a.a1 === 360) {
      out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" ${stroke}/>`);
    } else {
      // SVG 起点是 3 点钟，逆时针；DXF 角度逆时针，y 翻转后方向需处理
      const a0r = (a.a0 * Math.PI) / 180;
      const a1r = (a.a1 * Math.PI) / 180;
      const x0 = cx + r * Math.cos(a0r);
      const y0 = cy - r * Math.sin(a0r); // 翻转
      const x1 = cx + r * Math.cos(a1r);
      const y1 = cy - r * Math.sin(a1r);
      const large = Math.abs(a.a1 - a.a0) > 180 ? 1 : 0;
      out.push(
        `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 0 ${x1.toFixed(
          1
        )} ${y1.toFixed(1)}" ${stroke}/>`
      );
    }
  }
  for (const t of texts) {
    out.push(
      `<text x="${tx(t.x).toFixed(1)}" y="${ty(t.y).toFixed(1)}" font-family="monospace" font-size="${(
        sc * 1.1
      ).toFixed(1)}" fill="#2a4a38">${escapeXml(t.s)}</text>`
    );
  }
  out.push("</svg>");
  return out.join("");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
