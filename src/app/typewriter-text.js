"use client";

import { useEffect, useRef, useState } from "react";
import { createTypewriter } from "./typewriter-animation.mjs";

// Replays text on viewport entry and reserves the full sentence's layout space.
// 进入视口时重播文字，并为完整句子预留排版空间。
export function TypewriterText({ text }) {
  const ref = useRef(null);
  const [frame, setFrame] = useState({ text, typing: false });

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animation = createTypewriter(text, (value, typing) => setFrame({ text: value, typing }));
    let visible = false;
    const update = () => {
      if (preference.matches) animation.finish();
      else if (visible) animation.play();
      else animation.reset();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible && !preference.matches) return;
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0, rootMargin: "0px" });
    observer.observe(ref.current);
    preference.addEventListener("change", update);
    return () => {
      animation.stop();
      observer.disconnect();
      preference.removeEventListener("change", update);
    };
  }, [text]);

  return <span ref={ref} className="relative grid">
    <span aria-hidden="true" className="invisible col-start-1 row-start-1">{text}</span>
    <span aria-hidden="true" className="col-start-1 row-start-1">
      <span data-typewriter-text>{frame.text}</span><span className={`ml-0.5 inline-block h-[1em] w-px translate-y-0.5 bg-[#68834e] motion-reduce:hidden ${frame.typing ? "opacity-100" : "opacity-0"}`} />
    </span>
    <span className="sr-only">{text}</span>
  </span>;
}
