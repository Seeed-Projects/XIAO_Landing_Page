"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./thumb.module.css";

// 用 pdf.js 在浏览器渲染 PDF 第 1 页为缩略图。经 /api/proxy 绕过 CORS。
export default function PdfThumb({ url, alt }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | loading | done | error

  useEffect(() => {
    const el = wrapRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    let cancelled = false;
    let pdf = null;

    // 懒加载：进入视口再渲染
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        render();
      },
      { rootMargin: "200px" }
    );
    io.observe(el);

    async function render() {
      if (cancelled) return;
      setState("loading");
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/external/pdf.worker.min.mjs";
        const proxy = "/api/proxy?url=" + encodeURIComponent(url);
        const loadingTask = pdfjs.getDocument({
          url: proxy,
          // 关闭字体外部拉取，缩略图无需文字精确
          useSystemFonts: true,
          disableFontFace: true,
        });
        pdf = await loadingTask.promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        // 缩放到适合 ~480px 宽
        const targetW = 480;
        const scale = Math.min(1.5, targetW / viewport.width);
        const scaled = page.getViewport({ scale });
        const ctx = canvas.getContext("2d");
        canvas.width = Math.floor(scaled.width);
        canvas.height = Math.floor(scaled.height);
        await page.render({ canvasContext: ctx, viewport: scaled }).promise;
        if (!cancelled) setState("done");
      } catch (e) {
        console.error("PdfThumb", e);
        if (!cancelled) setState("error");
      }
    }

    return () => {
      cancelled = true;
      io.disconnect();
      try {
        pdf?.destroy?.();
      } catch {}
    };
  }, [url]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <canvas ref={canvasRef} className={state === "done" ? styles.show : ""} />
      {state !== "done" && (
        <div className={styles.loading}>
          {state === "error" ? "PDF 预览失败" : state === "loading" ? "渲染 PDF…" : "PDF"}
        </div>
      )}
    </div>
  );
}
