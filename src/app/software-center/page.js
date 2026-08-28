"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import { SiteHeader } from "../components";
import { ToolPageIntro } from "../tool-page-intro";
import { Reveal } from "../reveal";
import {
  SOFTWARE_CATEGORIES,
  logoWallItems,
  logoSrc,
  slugify,
  pick,
} from "./software-data";
import SoftwareLogo from "./SoftwareLogo";

// 蓝色分类选择项 + 黄色内容卡片 —— 官方软件单独成区，这里只放第三方/社区平台（其他软件）
const GROUPS = SOFTWARE_CATEGORIES.filter(
  (c) => c.id !== "guides" && c.id !== "official"
);
const OFFICIAL = SOFTWARE_CATEGORIES.find((c) => c.id === "official");

export default function SoftwareCenterPage() {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState(GROUPS[0]?.id);
  const active = GROUPS.find((g) => g.id === activeId) ?? GROUPS[0];
  const logos = logoWallItems();
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)];

  const renderRow = (row, reverse) => (
    <div className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />
      <div
        className={
          "flex w-max gap-3 group-hover:[animation-play-state:paused] " +
          (reverse
            ? "animate-[marquee_45s_linear_infinite] [animation-direction:reverse]"
            : "animate-[marquee_45s_linear_infinite]")
        }
      >
        {/* 复制一份实现无缝滚动 */}
        {[...row, ...row].map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            href={`/software-center/${item.slug}`}
            title={pick(item.name, lang)}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line-soft)] bg-white/80 p-2 transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/30 hover:shadow-sm"
          >
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc(item.logo)}
                alt={pick(item.name, lang)}
                loading="lazy"
                className="h-full w-full object-contain opacity-80 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
              />
            ) : (
              <span className="text-sm font-bold text-[var(--brand-blue-soft)]">
                {pick(item.name, lang)[0]}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-16">
        <ToolPageIntro
          id="top"
          title={lang === "zh" ? "软件生态" : "Software Ecosystem"}
          description={lang === "zh"
            ? "集中浏览 XIAO 的官方软件、开发平台、协议工具和社区资源。"
            : "Explore official software, development platforms, protocol tools and community resources for XIAO."}
        />

        {/* Logo 墙：两排滚动（marquee），来源为下方各分类里的软件 logo */}
        <section className="w-full px-6 pb-4 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px] space-y-3">
            {renderRow(rows[0], false)}
            {renderRow(rows[1], true)}
          </div>
        </section>

        {/* 官方软件：入口卡片，点击进入二级页 */}
        {OFFICIAL && (
          <section id="official" className="w-full px-6 py-8 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-[1440px]">
              <Link
                href="/software-center/official"
                className="group relative block overflow-hidden rounded-[28px] border border-[var(--brand-blue)]/20 bg-[linear-gradient(118deg,rgba(0,73,102,0.96),rgba(29,103,132,0.92)_60%,rgba(22,182,106,0.85))] p-7 text-white shadow-[0_18px_40px_rgba(0,73,102,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,73,102,0.26)] sm:p-10"
              >
                <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 p-3 ring-1 ring-white/20 backdrop-blur-sm">
                      {OFFICIAL.items[0]?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoSrc(OFFICIAL.items[0].logo)}
                          alt="Seeed"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-bold">S</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {pick(OFFICIAL.title, lang)}
                      </h2>
                    </div>
                  </div>
                  <div className="sm:max-w-sm sm:text-right">
                    <p className="text-sm leading-6 text-white/85">
                      {pick(OFFICIAL.desc, lang)}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/15 pt-5">
                  <span className="text-sm font-medium text-white/80">
                    {OFFICIAL.items.length} {lang === "zh" ? "个官方组件" : "official components"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/35 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 group-hover:gap-3 group-hover:bg-white/45">
                    {lang === "zh" ? "进入官方软件" : "Enter Official Software"}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* 其他软件：第三方社区平台，按语言/OS/协议等分类 */}
        <section id="community" className="w-full scroll-mt-28 px-6 py-6 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <div className="mb-6 text-center">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-3xl">
                  {lang === "zh" ? "其他软件" : "More Software"}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
                  {lang === "zh"
                    ? "第三方社区平台与软件方案，按语言、操作系统、协议等通用分类切换。"
                    : "Third-party community platforms and software, grouped by language, OS, protocol and other common categories."}
                </p>
              </div>
            </Reveal>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {GROUPS.map((g) => {
                const isActive = g.id === active?.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveId(g.id)}
                    className={
                      "rounded-full px-4 py-2 text-sm font-semibold leading-none transition-all " +
                      (isActive
                        ? "bg-[var(--ink-strong)] text-white shadow-sm"
                        : "border border-[var(--brand-blue)]/30 bg-white/80 text-[var(--brand-blue)] hover:border-[var(--brand-blue)]/60 hover:bg-[var(--brand-blue)]/5")
                    }
                  >
                    {pick(g.title, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 黄色内容卡片：图标 + 详细信息，可点击进入详情页 */}
        <section className="w-full px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            {active && (
              <div
                key={active.id}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                style={{ animation: "panelSlide 220ms ease" }}
              >
                {active.items.map((item, i) => {
                  const slug = slugify(item.name);
                  const boardCount = item.boards?.length ?? 0;
                  return (
                    <Link
                      key={slug}
                      href={`/software-center/${slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-[var(--line-soft)] bg-white p-5 shadow-[0_6px_18px_rgba(0,73,102,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)]/30 hover:shadow-[0_14px_30px_rgba(0,73,102,0.12)]"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <SoftwareLogo item={item} lang={lang} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-base font-bold leading-snug text-[var(--ink-strong)]">
                              {pick(item.name, lang)}
                            </h3>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0 text-[var(--brand-blue-soft)]/70 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--brand-blue)]"
                            >
                              <path d="M7 17 17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </div>
                          {item.desc && (
                            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[var(--ink-body)]">
                              {pick(item.desc, lang)}
                            </p>
                          )}
                        </div>
                      </div>
                      {boardCount > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[var(--line-soft)] bg-[var(--surface-tint)]/50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                          <span className="rounded-md bg-[var(--brand-blue)]/10 px-2 py-1 text-xs font-medium leading-none text-[var(--brand-blue)]">
                            {boardCount} {lang === "zh" ? "块支持板卡" : "supported boards"}
                          </span>
                          <span className="text-xs font-medium text-[var(--ink-muted)]">
                            {lang === "zh" ? "点击查看详情 →" : "View details →"}
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
