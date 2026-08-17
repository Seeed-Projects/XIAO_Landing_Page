"use client";
import { useEffect, useLayoutEffect, useRef } from "react";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Glow —— 标题随滚动「逐字」由淡渐亮到清晰。
 * full 取标题 CSS 已定的颜色（自适应深/浅背景：深底白字、浅底墨字）；
 * dim = full 的淡化版（color-mix transparent）。逐字按滚动进度提亮，相邻字带重叠。
 * 用 useLayoutEffect 在首帧前定色避免闪烁；触屏/减少动效保持原色不动。
 */
export function Glow({
  children,
  as: Tag = "h2",
  className = "",
  full: fullProp,
  start: startProp = 0.85,
  end: endProp = 0.28,
  ...rest
}) {
  const ref = useRef(null);
  const text = typeof children === "string" ? children : "";
  const chars = Array.from(text);
  const transition = 1.6;

  useIso(() => {
    const el = ref.current;
    if (!el || !chars.length) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // full：优先用传入值，否则取标题 CSS 已有颜色
    const full = fullProp || getComputedStyle(el).color || "var(--ink-strong)";
    const dim = `color-mix(in srgb, transparent, ${full} 28%)`;

    const colorFor = (cp) => {
      const e = cp * cp * (3 - 2 * cp);
      return `color-mix(in srgb, ${dim}, ${full} ${(e * 100) | 0}%)`;
    };

    if (coarse || reduce) {
      for (const c of el.children) c.style.color = full;
      return;
    }

    let raf = 0;
    const apply = () => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const start = vh * startProp;
      const end = vh * endProp;
      let p = (start - r.top) / (start - end);
      p = Math.max(0, Math.min(1, p));
      const front = p * (chars.length - 1 + transition);
      for (let i = 0; i < chars.length; i++) {
        let cp = (front - i) / transition;
        cp = Math.max(0, Math.min(1, cp));
        el.children[i].style.color = colorFor(cp);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startProp, endProp]);

  if (!text) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} aria-label={text} {...rest}>
      {chars.map((ch, i) => (
        <span key={i} aria-hidden="true">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
}
