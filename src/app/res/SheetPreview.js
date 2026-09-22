"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./res.module.css";

/**
 * Spreadsheet preview: fetches the XLSX, parses it in the browser and renders a table per sheet.
 * 表格预览：下载 XLSX，在浏览器里解析，每个工作表渲染成一张表。
 */
export function SheetPreview({ item, zh }) {
  const [state, setState] = useState("loading");
  const [workbook, setWorkbook] = useState(null);
  const [sheetIndex, setSheetIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setWorkbook(null);
    setSheetIndex(0);
    (async () => {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error(String(response.status));
      const { parseXlsx } = await import("../../lib/parseXlsx.js");
      return parseXlsx(new Uint8Array(await response.arrayBuffer()));
    })().then(
      (parsed) => {
        if (cancelled) return;
        setWorkbook(parsed);
        setState(parsed.sheets.length ? "done" : "error");
      },
      (error) => {
        console.error("SheetPreview", error);
        if (!cancelled) setState("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [item]);

  const sheet = workbook?.sheets[sheetIndex];
  const layout = useMemo(() => (sheet ? buildLayout(sheet) : null), [sheet]);

  if (state === "error") {
    return (
      <div className={styles.gate}>
        <p className="home-type-body">{zh ? "这份表格暂时无法在页面里显示，可以直接下载。" : "This spreadsheet cannot be shown in the page right now. Download it instead."}</p>
      </div>
    );
  }
  if (state !== "done" || !layout) {
    return (
      <div className={styles.gate}>
        <span className={styles.spinner} aria-hidden="true" />
        <p className="home-type-body">{zh ? "正在读取表格…" : "Loading spreadsheet…"}</p>
      </div>
    );
  }

  return (
    <div className={styles.sheet}>
      {workbook.sheets.length > 1 && (
        <div className={styles.sheetTabs} role="tablist">
          {workbook.sheets.map((entry, index) => (
            <button
              key={entry.name}
              type="button"
              role="tab"
              aria-selected={index === sheetIndex}
              data-active={index === sheetIndex ? "1" : "0"}
              onClick={() => setSheetIndex(index)}
            >
              {entry.name}
            </button>
          ))}
        </div>
      )}
      <div className={styles.sheetScroll}>
        <table className={styles.sheetTable}>
          {layout.header && (
            <thead>
              <tr>{layout.header.map((cell) => <th key={cell.key} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>{cell.text}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {layout.body.map((row, index) => (
              <tr key={index}>
                {row.map((cell) => <td key={cell.key} colSpan={cell.colSpan} rowSpan={cell.rowSpan}>{cell.text}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.sheetNote}>
        {zh
          ? `${sheet.name} · ${sheet.rows.length} 行`
          : `${sheet.name} · ${sheet.rows.length} rows`}
      </p>
    </div>
  );
}

/**
 * Turn rows plus merge ranges into table cells with colSpan and rowSpan.
 * 把行数据和合并区域转成带 colSpan、rowSpan 的表格单元格。
 */
function buildLayout(sheet) {
  const spans = new Map();
  const covered = new Set();
  for (const merge of sheet.merges) {
    spans.set(`${merge.r0}:${merge.c0}`, { colSpan: merge.c1 - merge.c0 + 1, rowSpan: merge.r1 - merge.r0 + 1 });
    for (let r = merge.r0; r <= merge.r1; r += 1) {
      for (let c = merge.c0; c <= merge.c1; c += 1) {
        if (r !== merge.r0 || c !== merge.c0) covered.add(`${r}:${c}`);
      }
    }
  }
  const toCells = (row, r) => row
    .map((text, c) => ({ key: `${r}:${c}`, text, ...(spans.get(`${r}:${c}`) || {}) }))
    .filter((cell) => !covered.has(cell.key));
  const rows = sheet.rows.map(toCells);
  const headerIsSingleRow = !sheet.merges.some((merge) => merge.r0 === 0 && merge.r1 > 0);
  return headerIsSingleRow
    ? { header: rows[0] || null, body: rows.slice(1) }
    : { header: null, body: rows };
}
