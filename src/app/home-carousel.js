"use client";

import { withBase } from "../lib/basePath";
import styles from "./home-carousel.module.css";

/* 首页主横幅：单张静态横幅图（Ken Burns 缓慢推近保留呼吸感） */
const SLIDE = { src: "/home-carousel/banner-1.webp", alt: "Seeed Studio XIAO featured banner" };

export function HomeCarousel() {
  return (
    <section
      id="hero"
      className={`${styles.carousel} mt-16`}
      aria-label="Featured banner"
    >
      <div className={styles.track}>
        <div className={`${styles.slide} ${styles.slideActive}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBase(SLIDE.src)}
            alt={SLIDE.alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
