"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal fades and lifts content as soon as it enters the viewport.
 * Reveal 在内容进入视口时立即淡入上浮，并在再次进入时重新播放。
 * delay staggers nearby items while once keeps opt-in one-time reveals available.
 * delay 用于错开同组内容，once 保留明确的一次性播放能力。
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  once = false,
  threshold = 0.01,
  rootMargin = "0px",
  ...rest
}) {
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
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${className} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
