"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";
import { withBase } from "../lib/basePath";

/**
 * HeroSection —— 首页第一板块：全屏底图 + 叠加的大字。
 * 底图（xiao-hero-photo.webp）铺满整屏，上覆渐变压暗保证白字可读；
 * 左侧叠放眉标 / 品牌行 / 超大标题 / 副文案 / 双 CTA。无卡片。
 */
export function HeroSection({ title, subtitle, titleClassName, kicker, brand }) {
  const { lang } = useLang();
  const isEn = lang === "en";

  const base = isEn
    ? {
        kicker: "Add AI to Almost Anything",
        brand: "Seeed Studio",
        title: "XIAO",
        subtitle:
          "The smallest Arduino-compatible dev boards for building your next AI gadgets",
        primary: "Shop Now",
        secondary: "Get Started",
      }
    : {
        kicker: "为万物加上 AI",
        brand: "Seeed Studio",
        title: "XIAO",
        subtitle:
          "最小的 Arduino 兼容开发板，助你打造下一个 AI 小装置",
        primary: "立即购买",
        secondary: "快速开始",
      };
  const copy = {
    ...base,
    kicker: kicker ?? base.kicker,
    brand: brand ?? base.brand,
    title: title ?? base.title,
    subtitle: subtitle ?? base.subtitle,
  };

  return (
    <section
      id="hero"
      className="relative flex aspect-[1695/632] min-h-[420px] w-full scroll-mt-24 items-center overflow-hidden max-md:min-h-[620px]"
    >
      {/* 底图：铺满全屏 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/xiao-hero-photo.webp")}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* 压暗渐变：保证白字可读 */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,20,30,0.72)_0%,rgba(0,20,30,0.45)_42%,rgba(0,20,30,0.20)_72%,rgba(0,20,30,0.45)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,transparent_30%,transparent_70%,rgba(0,0,0,0.35)_100%)]" />

      {/* 叠加内容 */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] -translate-y-5 px-5 py-16 sm:-translate-y-7 sm:px-10 lg:-translate-y-8 lg:px-16">
        <Reveal className="max-w-2xl space-y-6">
          {copy.kicker && (
            <p className="font-display text-sm font-semibold uppercase tracking-[0.34em] text-white/85">
              {copy.kicker}
            </p>
          )}
          {copy.brand && (
            <p className="font-display text-base font-medium tracking-[0.18em] text-white/70">
              {copy.brand}
            </p>
          )}
          <Glow
            as="h1"
            className={titleClassName ?? "font-display text-6xl font-semibold leading-[0.9] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-9xl lg:text-[11rem]"}
          >
            {copy.title}
          </Glow>
          <p className="max-w-xl text-lg leading-8 text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-xl sm:leading-9">
            {copy.subtitle}
          </p>
          <div className="grid grid-cols-1 gap-3 pt-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:items-center">
            <a
              href="https://www.seeedstudio.com/xiao-selector"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-blue)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-green)] hover:text-white"
            >
              {copy.primary}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://wiki.seeedstudio.com/xiao_topic_page/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/20"
            >
              {copy.secondary}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
