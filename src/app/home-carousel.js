"use client";

import { useEffect, useState } from "react";
import { withBase } from "../lib/basePath";
import styles from "./home-carousel.module.css";

const SLIDES = [
  { src: "/home-carousel/banner-1.webp", alt: "Seeed Studio featured banner" },
  { src: "/home-carousel/banner-2.avif", alt: "Seeed Studio Wio banner" },
];

export function HomeCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    SLIDES.forEach(({ src }) => {
      const image = new Image();
      image.decoding = "async";
      image.src = withBase(src);
    });
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % SLIDES.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction) => setActive((index) => (index + direction + SLIDES.length) % SLIDES.length);

  return (
    <section
      id="hero"
      className={`${styles.carousel} mt-16`}
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.track} style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}>
        {SLIDES.map((slide, index) => (
          <div key={slide.src} className={`${styles.slide} ${index === active ? styles.slideActive : ""}`} aria-hidden={index !== active}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase(slide.src)}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={() => move(-1)} aria-label="Previous slide">
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => move(1)} aria-label="Next slide">
        <span aria-hidden="true">›</span>
      </button>

      <div className={styles.dots} aria-label="Choose slide">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={index === active ? styles.dotActive : ""}
            onClick={() => setActive(index)}
            aria-label={`Slide ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
