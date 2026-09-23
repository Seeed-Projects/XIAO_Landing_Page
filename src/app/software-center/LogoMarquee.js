"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoSrc, pick } from "./software-data";
import { logoLoopLayout } from "./logo-loop.mjs";
import styles from "./software-center.module.css";

export function LogoMarquee({ items, lang, reverse = false }) {
  const viewportRef = useRef(null);
  const sequenceRef = useRef(null);
  const [layout, setLayout] = useState(() => logoLoopLayout(0, 0));

  useEffect(() => {
    const viewport = viewportRef.current;
    const sequence = sequenceRef.current;
    if (!viewport || !sequence) return;

    const observer = new ResizeObserver(() => {
      const next = logoLoopLayout(viewport.clientWidth, sequence.getBoundingClientRect().width, reverse ? 25 : 28);
      setLayout((current) => current.repeats === next.repeats && current.duration === next.duration && current.ready === next.ready ? current : next);
    });
    observer.observe(viewport);
    observer.observe(sequence);
    return () => observer.disconnect();
  }, [reverse, items.length]);

  if (!items.length) return null;

  return (
    <div ref={viewportRef} className={styles.logoRow}>
      <div
        className={`${styles.track} ${reverse ? styles.trackReverse : ""}`}
        data-ready={layout.ready ? "1" : "0"}
        style={{ "--wall-duration": `${layout.duration}s` }}
      >
        {[0, 1].map((half) => (
          <div key={half} className={styles.loopHalf} data-clone={half} aria-hidden={half === 1 ? true : undefined}>
            {Array.from({ length: layout.repeats }, (_, repeat) => (
              <div
                key={repeat}
                ref={half === 0 && repeat === 0 ? sequenceRef : undefined}
                className={styles.logoSequence}
                data-clone={repeat > 0 ? "1" : "0"}
                aria-hidden={repeat > 0 ? true : undefined}
              >
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/software-center/${item.slug}`}
                    tabIndex={half === 0 && repeat === 0 ? 0 : -1}
                    aria-label={pick(item.name, lang)}
                    title={pick(item.name, lang)}
                    className={styles.logoTile}
                    prefetch={false}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc(item.logo)} alt="" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
