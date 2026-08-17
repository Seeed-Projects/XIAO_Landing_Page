"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";
import { withBase } from "../lib/basePath";

/**
 * HeroSection —— 首页第一板块，复刻参考稿首屏。
 * 左：眉标 + 超大显示字标题 + 副文案 + 双 CTA；
 * 右：产品大图（圆角框，object-cover）。
 * 文案按参考图复刻，如与参考稿有出入请告知具体文字。
 */
export function HeroSection() {
  const { lang } = useLang();
  const isEn = lang === "en";

  const copy = isEn
    ? {
        kicker: "Seeed XIAO Series",
        title: "XIAO",
        subtitle:
          "A thumb-sized board that grew a whole ecosystem — hardware, software, docs and a community that builds together.",
        primary: "Browse Products",
        secondary: "Explore Ecosystem",
      }
    : {
        kicker: "Seeed XIAO 系列",
        title: "XIAO",
        subtitle:
          "一块拇指大的板子，长出了一整片生态——硬件、软件、资料与共建社区，从这里开始。",
        primary: "浏览产品",
        secondary: "探索生态",
      };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] w-full scroll-mt-24 items-center overflow-hidden bg-[linear-gradient(135deg,rgba(143,195,31,0.10),rgba(0,73,102,0.06))] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
        {/* 左：文字 */}
        <Reveal className="space-y-6">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.34em] text-[var(--brand-blue-soft)]">
            {copy.kicker}
          </p>
          <Glow
            as="h1"
            className="font-display text-balance text-7xl font-semibold leading-[0.92] tracking-tight text-[var(--ink-strong)] sm:text-8xl lg:text-[8.5rem]"
          >
            {copy.title}
          </Glow>
          <p className="max-w-xl text-lg leading-8 text-[var(--ink-body)]">
            {copy.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,73,102,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-soft)]"
            >
              {copy.primary}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/#ecosystem"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ink-strong)]/15 bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--ink-strong)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/40 hover:text-[var(--brand-blue)]"
            >
              {copy.secondary}
            </Link>
          </div>
        </Reveal>

        {/* 右：产品大图 */}
        <Reveal delay={150} className="relative">
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-white/60 shadow-[0_24px_60px_rgba(0,73,102,0.18)] backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase("/xiao-hero-photo.jpg")}
              alt="XIAO 开发板"
              className="aspect-[5/3] h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
          {/* 装饰光斑 */}
          <div className="pointer-events-none absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(143,195,31,0.35),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,73,102,0.28),transparent_70%)] blur-2xl" />
        </Reveal>
      </div>
    </section>
  );
}
