"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/basePath";

// Replays display-only lighting over the original artwork on viewport entry.
// 进入视口时，在原始素材上重播展示性光效。
export function PlaygroundPreview() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="home-playground-preview" data-visible={visible}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase("/home/playground_home.png")} alt="Seeed Studio XIAO Playground pinout preview" width="1774" height="887" className="home-playground-image" />
      <div className="home-playground-pin-lights" aria-hidden="true">
        {[0, 1, 2].map((pin) => <span key={pin} style={{ "--pin-y": `${35.96 + pin * 6.7}%`, "--pin-delay": `${pin * 0.65}s` }} />)}
      </div>
    </div>
  );
}
