"use client";

import { useEffect, useRef, useState } from "react";
import { createDigitReel, rollingTargetStep } from "./rolling-stat.mjs";

export function RollingStat({ value }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="rolling-stat" data-visible={visible} aria-label={value}>
      <span className="rolling-stat-content" aria-hidden="true">
        {[...value].map((character, index) => {
          if (!/\d/.test(character)) {
            return <span key={`${character}-${index}`} className="rolling-stat-symbol">{character}</span>;
          }
          const reel = createDigitReel(character);
          return (
            <span key={`${character}-${index}`} className="rolling-stat-digit">
              <span
                className="rolling-stat-reel"
                style={{
                  "--digit-step": rollingTargetStep(character),
                  "--digit-delay": `${index * 55}ms`,
                }}
              >
                {reel.map((digit, reelIndex) => (
                  <span key={`${digit}-${reelIndex}`}>{digit}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
