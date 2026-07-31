"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal —— 滚动进入视口时，内容逐项淡入上浮。
 * 用 IntersectionObserver 触发，仅触发一次（unobserve）。
 * delay 控制同一段内多项的错开节奏（stagger）。
 */
export function Reveal({ children, as: Tag = "div", delay = 0, className = "", once = true, threshold = 0.15, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none ${className} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
