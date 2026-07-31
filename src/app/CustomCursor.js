"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 自定义光标：参考 reterminal_sticky 的 DotNavigator dot 风格 ——
 * 干净的 lime(#B3CE16) 小点（即时跟随，悬停弹性放大+发光） + lime 拖尾环（lerp 跟随）。
 * 无文字。触屏 / 减少动效自动回退原生光标；canvas/输入框区域隐藏让位。
 */
export default function CustomCursor() {
  const anchorRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let visible = false;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        dotRef.current && dotRef.current.classList.remove("cc-hidden");
        ringRef.current && ringRef.current.classList.remove("cc-hidden");
      }
    };
    const onOver = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const native = t.closest("canvas, input, textarea, select, [data-native-cursor]");
      const interactive = t.closest(
        "a, button, [role='button'], .courseCard, .resItemCard, .iconBtn, [data-cursor]"
      );
      const on = !!interactive && !native;
      dotRef.current && dotRef.current.classList.toggle("cc-active", on);
      ringRef.current && ringRef.current.classList.toggle("cc-active", on);
      const hide = !!native;
      dotRef.current && dotRef.current.classList.toggle("cc-hidden", hide);
      ringRef.current && ringRef.current.classList.toggle("cc-hidden", hide);
    };
    const onLeave = () => {
      dotRef.current && dotRef.current.classList.add("cc-hidden");
      ringRef.current && ringRef.current.classList.add("cc-hidden");
      visible = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (anchorRef.current)
        anchorRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={anchorRef} className="cc-cursor">
        <div ref={dotRef} className="cc-dot cc-hidden" />
      </div>
      <div ref={ringRef} className="cc-ring cc-hidden" />
    </>
  );
}
