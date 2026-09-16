"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/basePath";
import styles from "./home-carousel.module.css";

/* 首页横幅轮播：保持轮播效果（自动切换/箭头/圆点），后续追加更多图。
   第 1 页：Seeed Studio XIAO featured banner（已裁去顶部黑边、对齐广告页标准比例）。 */
const SLIDES = [
  {
    src: "/home-carousel/xiao-banner.webp",
    alt: "Seeed Studio XIAO boards and accessories",
    title: "Seeed Studio XIAO",
    description: "The smallest dev platform. The biggest possibilities.",
    ctaLabel: "Explore",
    ctaHref: "/products/",
  },
];

export function HomeCarousel() {
  const heroRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    SLIDES.forEach(({ src }) => {
      const image = new Image();
      image.decoding = "async";
      image.src = withBase(src);
    });
  }, []);

  useEffect(() => {
    if (paused || SLIDES.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % SLIDES.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.18 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const move = (direction) => setActive((index) => (index + direction + SLIDES.length) % SLIDES.length);

  return (
    <section
      ref={heroRef}
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
            <h1
              className={`${styles.heroTitle} ${heroVisible ? styles.heroTitleVisible : ""} home-type-hero-title`}
              aria-label={slide.title}
            >
              <picture className={styles.heroTitleArtwork}>
                <source media="(max-width: 700px)" srcSet={withBase("/home-carousel/hero-title-cinematic-mobile.png")} />
                <img
                  src={withBase("/home-carousel/hero-title-cinematic.png")}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </h1>
            <div className={styles.heroContent}>
              <p className="home-type-subtitle">{slide.description}</p>
              <a className={`${styles.heroCta} home-type-action home-filled-action home-primary-cta`} href={withBase(slide.ctaHref)}>
                {slide.ctaLabel}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </a>
            </div>
            {/* The original photo's ruler silhouette forms the foreground layer. */}
            <svg className={styles.heroForeground} viewBox="0 0 2048 772" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
              <defs>
                <clipPath id={`hero-foreground-${index}`}>
                  <path d="M1262 378 L1268 110 Q1268 108 1272 103 L1288 83 Q1292 78 1296 83 L1311 105 L1308 378 Z" />
                </clipPath>
              </defs>
              <image href={withBase(slide.src)} width="2048" height="772" clipPath={`url(#hero-foreground-${index})`} />
            </svg>
          </div>
        ))}
      </div>

      {SLIDES.length > 1 && (
        <>
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
        </>
      )}
    </section>
  );
}
