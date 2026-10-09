"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLang } from "../i18n";
import styles from "./res.module.css";
import { SheetPreview } from "./SheetPreview";
import { StepViewer } from "./StepViewer";

const subscribeNarrow = (onChange) => {
  const media = window.matchMedia("(max-width: 700px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readNarrow = () => window.matchMedia("(max-width: 700px)").matches;
const readNarrowServer = () => false;

/**
 * Near-fullscreen preview. PDF uses the browser viewer; drawings render on open.
 * 接近全屏的预览窗。PDF 用浏览器自带阅读器，图纸在打开时渲染。
 */
export function PreviewDialog({ item, onClose }) {
  const { lang } = useLang();
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, readNarrowServer);
  const [zoom, setZoom] = useState(false);
  const zh = lang === "zh";

  useEffect(() => {
    if (!item) return undefined;
    setZoom(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;
  const drawing = item.preview === "dxf" || item.preview === "dxf-zip" || item.preview === "kicad";

  return (
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHead}>
          <div className={styles.modalTitleWrap}>
            <span className={styles.format}>{item.format}</span>
            <h2 className={`${styles.modalTitle} home-type-subtitle`}>{item.name}</h2>
          </div>
          <div className={styles.modalActions}>
            {drawing && (
              <button type="button" className={`${styles.quiet} ${styles.zoomBtn}`} onClick={() => setZoom((value) => !value)} aria-pressed={zoom}>
                {zoom ? (zh ? "适应窗口" : "Fit") : (zh ? "放大 2×" : "Zoom 2×")}
              </button>
            )}
            <a className={styles.quiet} href={item.url} target="_blank" rel="noopener noreferrer">
              {zh ? "下载" : "Download"}
            </a>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={zh ? "关闭" : "Close"}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        <div className={styles.modalBody} data-zoom={zoom ? "1" : "0"}>
          {item.preview === "pdf" && (narrow ? <OpenInstead item={item} zh={zh} /> : (
            <object className={styles.pdfFrame} data={`${item.url}#view=FitH`} type="application/pdf" aria-label={item.name}>
              <OpenInstead item={item} zh={zh} />
            </object>
          ))}
          {drawing && <VectorPreview item={item} zh={zh} />}
          {item.preview === "xlsx" && <SheetPreview item={item} zh={zh} />}
          {item.preview === "step" && <StepViewer url={item.url} />}
        </div>
      </div>
    </div>
  );
}

function OpenInstead({ item, zh }) {
  return (
    <div className={styles.gate}>
      <p className="home-type-body">{zh ? "这份 PDF 用浏览器自带的阅读器打开。" : "This PDF opens in the browser's own viewer."}</p>
      <a className={`${styles.filled} home-type-action home-filled-action`} href={item.url} target="_blank" rel="noopener noreferrer">
        {zh ? "在新标签打开" : "Open in a new tab"}
      </a>
    </div>
  );
}

function VectorPreview({ item, zh }) {
  const [state, setState] = useState("loading");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setSvg("");
    loadPreviewSvg(item).then(
      (markup) => {
        if (cancelled) return;
        setSvg(markup);
        setState("done");
      },
      (error) => {
        console.error("PreviewDialog", error);
        if (!cancelled) setState("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [item]);

  if (state === "error") {
    return (
      <div className={styles.gate}>
        <p className="home-type-body">{zh ? "这份资料暂时无法在页面里画出来，可以直接下载。" : "This file cannot be drawn in the page right now. Download it instead."}</p>
      </div>
    );
  }
  if (state !== "done") {
    return (
      <div className={styles.gate}>
        <span className={styles.spinner} aria-hidden="true" />
        <p className="home-type-body">{zh ? "正在读取图纸…" : "Loading drawing…"}</p>
      </div>
    );
  }
  return <div className={styles.vectorPreview} dangerouslySetInnerHTML={{ __html: svg }} />;
}

async function loadPreviewSvg(item) {
  const response = await fetch(item.url);
  if (!response.ok) throw new Error(String(response.status));
  if (item.preview === "dxf") {
    const { renderDxfSvg } = await import("../../lib/parseDxf.js");
    return requireSvg(renderDxfSvg(await response.text()));
  }
  const { unzipSync, strFromU8 } = await import("fflate");
  const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
  if (item.preview === "dxf-zip") {
    const { renderDxfSvg } = await import("../../lib/parseDxf.js");
    return requireSvg(renderDxfSvg(strFromU8(largestEntry(archive, /\.dxf$/i))));
  }
  const { renderPcbSvg } = await import("../../lib/parseKicadPcb.js");
  return requireSvg(renderPcbSvg(strFromU8(largestEntry(archive, /\.kicad_pcb$/i))));
}

/**
 * Keep the viewBox and drop fixed pixel size so CSS controls the display size.
 * 保留 viewBox，去掉固定像素尺寸，交给样式控制显示大小。
 */
function requireSvg(svg) {
  if (!svg) throw new Error("empty");
  return svg.replace(/^<svg([^>]*)>/, (open, attrs) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")}>`);
}

function largestEntry(archive, pattern) {
  let best = null;
  let size = -1;
  for (const [name, data] of Object.entries(archive)) {
    if (!pattern.test(name) || data.length <= size) continue;
    best = data;
    size = data.length;
  }
  if (!best) throw new Error(`no file matching ${pattern}`);
  return best;
}
