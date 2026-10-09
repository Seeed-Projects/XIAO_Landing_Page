// XLSX (Office Open XML) → sheets of plain text cells, plus an SVG table thumbnail.
// XLSX（Office Open XML）→ 纯文本单元格表，以及一张 SVG 表格缩略图。
import { strFromU8, unzipSync } from "fflate";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code) => {
    if (code[0] === "#") {
      const value = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code] ?? match;
  });
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([\w:]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]);
  return out;
}

// Concatenate every <t> inside a string item so rich-text runs read as one value.
// 把一个字符串项里所有 <t> 拼起来，富文本分段也读成一个值。
function textOf(xml) {
  let out = "";
  for (const match of xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) out += decodeXml(match[1]);
  return out;
}

function columnIndex(ref) {
  let index = 0;
  for (const letter of ref.replace(/\d+$/, "")) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

function rowIndex(ref) {
  return parseInt(ref.replace(/^[A-Z]+/, ""), 10) - 1;
}

function readEntry(archive, name) {
  const data = archive[name];
  return data ? strFromU8(data) : "";
}

/**
 * Parse an XLSX file into sheets of text rows.
 * 把 XLSX 文件解析成按行排列的文本表。
 * @param {Uint8Array} bytes
 * @param {{ maxRows?: number }} options
 * @returns {{ sheets: Array<{ name: string, rows: string[][], merges: Array<{ r0: number, c0: number, r1: number, c1: number }> }> }}
 */
export function parseXlsx(bytes, { maxRows = 600 } = {}) {
  const archive = unzipSync(bytes);
  const shared = [];
  for (const match of readEntry(archive, "xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(textOf(match[1]));
  }

  const targets = {};
  for (const match of readEntry(archive, "xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*\/>/g)) {
    const rel = attrs(match[0]);
    if (rel.Target) targets[rel.Id] = rel.Target.replace(/^\/?(xl\/)?/, "xl/");
  }

  const sheets = [];
  for (const match of readEntry(archive, "xl/workbook.xml").matchAll(/<sheet\b[^>]*\/>/g)) {
    const sheet = attrs(match[0]);
    const file = targets[sheet["r:id"]] || `xl/worksheets/sheet${sheets.length + 1}.xml`;
    const xml = readEntry(archive, file);
    if (!xml) continue;
    sheets.push({ name: sheet.name || `Sheet ${sheets.length + 1}`, ...parseSheet(xml, shared, maxRows) });
  }
  return { sheets };
}

function parseSheet(xml, shared, maxRows) {
  const rows = [];
  let width = 0;
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    if (rows.length >= maxRows) break;
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const cell = attrs(cellMatch[1]);
      if (!cell.r) continue;
      const value = cellValue(cell.t, cellMatch[2] || "", shared);
      if (value === "") continue;
      const r = rowIndex(cell.r);
      const c = columnIndex(cell.r);
      if (r >= maxRows) continue;
      while (rows.length <= r) rows.push([]);
      rows[r][c] = value;
      width = Math.max(width, c + 1);
    }
  }
  for (const row of rows) {
    for (let c = 0; c < width; c += 1) if (row[c] === undefined) row[c] = "";
  }

  const merges = [];
  for (const match of xml.matchAll(/<mergeCell\b[^>]*ref="([A-Z]+\d+):([A-Z]+\d+)"/g)) {
    merges.push({
      r0: rowIndex(match[1]),
      c0: columnIndex(match[1]),
      r1: rowIndex(match[2]),
      c1: columnIndex(match[2]),
    });
  }
  return { rows, merges };
}

function cellValue(type, inner, shared) {
  if (type === "inlineStr") return textOf(inner).trim();
  const value = inner.match(/<v>([\s\S]*?)<\/v>/);
  if (!value) return "";
  const raw = decodeXml(value[1]).trim();
  if (type === "s") return shared[parseInt(raw, 10)] ?? "";
  if (type === "b") return raw === "1" ? "TRUE" : "FALSE";
  if (type === "str" || type === "e") return raw;
  const number = Number(raw);
  return Number.isFinite(number) ? String(Number(number.toPrecision(12))) : raw;
}

/**
 * Cells covered by a merge other than its top-left corner.
 * 合并区域里除左上角以外被覆盖的格子。
 */
export function coveredCells(merges) {
  const covered = new Set();
  for (const merge of merges) {
    for (let r = merge.r0; r <= merge.r1; r += 1) {
      for (let c = merge.c0; c <= merge.c1; c += 1) {
        if (r !== merge.r0 || c !== merge.c0) covered.add(`${r}:${c}`);
      }
    }
  }
  return covered;
}

function escapeXml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Draw the top-left corner of a sheet as an SVG table for card thumbnails.
 * 把工作表左上角画成 SVG 表格，用作卡片缩略图。
 */
export function renderSheetSvg(sheet, { cols = 6, rowsShown = 11 } = {}) {
  if (!sheet?.rows?.length) return null;
  const width = 720;
  const height = 540;
  const rowHeight = height / rowsShown;
  const colWidth = width / cols;
  const covered = coveredCells(sheet.merges);
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`];
  out.push(`<rect width="${width}" height="${height}" fill="#ffffff"/>`);
  out.push(`<rect width="${width}" height="${rowHeight.toFixed(1)}" fill="#e9e6f5"/>`);
  for (let r = 0; r < rowsShown; r += 1) {
    const y = r * rowHeight;
    out.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${width}" y2="${y.toFixed(1)}" stroke="#d9d6e6" stroke-width="1"/>`);
    const row = sheet.rows[r] || [];
    for (let c = 0; c < cols; c += 1) {
      if (covered.has(`${r}:${c}`)) continue;
      const text = row[c] ?? "";
      if (!text) continue;
      const shown = text.length > 14 ? `${text.slice(0, 13)}…` : text;
      out.push(
        `<text x="${(c * colWidth + 10).toFixed(1)}" y="${(y + rowHeight * 0.66).toFixed(1)}" font-family="Montserrat, Helvetica, Arial, sans-serif" font-size="${r === 0 ? 17 : 16}" font-weight="${r === 0 ? 700 : 500}" fill="${r === 0 ? "#3b2f78" : "#28303f"}">${escapeXml(shown)}</text>`,
      );
    }
  }
  for (let c = 1; c < cols; c += 1) {
    const x = c * colWidth;
    out.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${height}" stroke="#d9d6e6" stroke-width="1"/>`);
  }
  out.push("</svg>");
  return out.join("");
}
