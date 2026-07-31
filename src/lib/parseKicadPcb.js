// KiCad .kicad_pcb → SVG 渲染器
// 解析 S-expression，提取板框(Edge.Cuts) + 焊盘(footprint/pad，含旋转变换)，
// 渲染成"能认出是块 PCB"的缩略图。Python 原型已验证。

// ---- S-expression 解析 ----
function parseSexpr(s) {
  let i = 0;
  const n = s.length;
  function rec() {
    while (i < n && " \t\r\n".includes(s[i])) i++;
    if (i >= n) return "";
    if (s[i] !== "(") {
      if (s[i] === '"') {
        let j = i + 1;
        while (j < n && s[j] !== '"') j++;
        const t = s.slice(i + 1, j);
        i = j + 1;
        return t;
      }
      let j = i;
      while (j < n && !" \t\r\n()".includes(s[j])) j++;
      const t = s.slice(i, j);
      i = j;
      return t;
    }
    i++; // 吃掉 '('
    const lst = [];
    while (i < n) {
      while (i < n && " \t\r\n".includes(s[i])) i++;
      if (i >= n) return lst;
      if (s[i] === ")") {
        i++;
        return lst;
      }
      lst.push(rec());
    }
    return lst;
  }
  return rec();
}

function isNode(x) {
  return Array.isArray(x) && x.length > 0;
}
function findTag(node, tag) {
  if (!Array.isArray(node)) return null;
  for (const c of node) if (isNode(c) && c[0] === tag) return c;
  return null;
}
function findAll(node, tag, out = []) {
  if (isNode(node) && node[0] === tag) out.push(node);
  if (Array.isArray(node)) for (const c of node) findAll(c, tag, out);
  return out;
}
function childTag(node, tag) {
  if (!Array.isArray(node)) return null;
  for (const c of node) if (isNode(c) && c[0] === tag) return c;
  return null;
}
function num(node, idx) {
  return parseFloat(node[idx]);
}

// 渲染 .kicad_pcb 文本 → SVG 字符串
export function renderPcbSvg(src) {
  const tree = parseSexpr(src);

  // ---- 板框 Edge.Cuts ----
  const edgeX = [];
  const edgeY = [];
  for (const gl of findAll(tree, "gr_line")) {
    let layer = "";
    for (const c of gl) {
      if (isNode(c) && c[0] === "layer" && c.length > 1) layer = c[1];
    }
    if (layer !== "Edge.Cuts") continue;
    const st = childTag(gl, "start");
    const en = childTag(gl, "end");
    if (st && en) {
      edgeX.push(num(st, 1), num(en, 1));
      edgeY.push(num(st, 2), num(en, 2));
    }
  }
  // gr_arc 的端点也纳入边界
  for (const ga of findAll(tree, "gr_arc")) {
    let layer = "";
    for (const c of ga) if (isNode(c) && c[0] === "layer" && c.length > 1) layer = c[1];
    if (layer !== "Edge.Cuts") continue;
    const st = childTag(ga, "start");
    const md = childTag(ga, "mid");
    const en = childTag(ga, "end");
    for (const p of [st, md, en]) if (p) { edgeX.push(num(p, 1)); edgeY.push(num(p, 2)); }
  }

  // ---- 焊盘 ----
  const pads = [];
  for (const fp of findAll(tree, "footprint")) {
    const fat = childTag(fp, "at");
    if (!fat || fat.length < 3) continue;
    const fx = num(fat, 1);
    const fy = num(fat, 2);
    const frot = fat.length > 3 ? num(fat, 3) : 0;
    const rad = (frot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    for (const c of fp) {
      if (!isNode(c) || c[0] !== "pad") continue;
      const pa = childTag(c, "at");
      const ps = childTag(c, "size");
      if (!pa || !ps) continue;
      const px = num(pa, 1);
      const py = num(pa, 2);
      const prot = pa.length > 3 ? num(pa, 3) : 0;
      const w = num(ps, 1);
      const h = num(ps, 2);
      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;
      const shape = typeof c[3] === "string" ? c[3] : "rect";
      pads.push({ x: fx + rx, y: fy + ry, w, h, rot: prot + frot, shape });
    }
  }

  // ---- 边界 ----
  const xs = edgeX.concat(pads.map((p) => p.x));
  const ys = edgeY.concat(pads.map((p) => p.y));
  if (!xs.length) return null;
  const minx = Math.min(...xs);
  const maxx = Math.max(...xs);
  const miny = Math.min(...ys);
  const maxy = Math.max(...ys);
  const m = 0.4;
  const ox = minx - m;
  const oy = miny - m;
  const W = maxx - minx + 2 * m;
  const H = maxy - miny + 2 * m;
  const sc = 24;
  const sw = W * sc;
  const sh = H * sc;
  const tx = (x) => (x - ox) * sc;
  const ty = (y) => (y - oy) * sc;

  const out = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw.toFixed(1)} ${sh.toFixed(
      1
    )}" width="${Math.round(sw)}" height="${Math.round(sh)}">`
  );

  // 板体（用板框包围盒画圆角矩形 + 内层铜区底色）
  if (edgeX.length) {
    const bx = tx(Math.min(...edgeX));
    const by = ty(Math.min(...edgeY));
    const bw = (Math.max(...edgeX) - Math.min(...edgeX)) * sc;
    const bh = (Math.max(...edgeY) - Math.min(...edgeY)) * sc;
    out.push(
      `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(
        1
      )}" height="${bh.toFixed(1)}" rx="6" fill="#13392a" stroke="#070707" stroke-width="1.5"/>`
    );
    out.push(
      `<rect x="${(bx + 2).toFixed(1)}" y="${(by + 2).toFixed(1)}" width="${(bw - 4).toFixed(
        1
      )}" height="${(bh - 4).toFixed(1)}" rx="4" fill="#1b4a34" opacity="0.55"/>`
    );
  }

  // 焊盘
  for (const p of pads) {
    const cx = tx(p.x);
    const cy = ty(p.y);
    const w = p.w * sc;
    const h = p.h * sc;
    const isCircle =
      String(p.shape).includes("circle") || (Math.abs(w - h) < 1e-6 && w < 0.9);
    if (isCircle) {
      out.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(Math.max(w, h) / 2).toFixed(
          1
        )}" fill="#d9b34a"/>`
      );
    } else {
      out.push(
        `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(
          2
        )}" height="${h.toFixed(2)}" rx="0.5" fill="#d9b34a" transform="rotate(${p.rot.toFixed(
          1
        )} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`
      );
    }
  }
  out.push("</svg>");
  return out.join("");
}
