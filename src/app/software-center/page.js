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
const OFFICIAL_FEATURED = [
  {
    name: "Home Assistant Discovery",
    url: "https://github.com/Seeed-Projects/Seeed-Homeassistant-Discovery",
    desc: {
      en: "A Seeed-maintained solution for connecting XIAO ESP32 and nRF52840 devices to Home Assistant.",
      zh: "由 Seeed 维护的 Home Assistant 接入方案，让 XIAO ESP32 与 nRF52840 设备轻松接入智能家居。",
    },
    logo: "https://raw.githubusercontent.com/Seeed-Projects/Seeed-Homeassistant-Discovery/main/custom_components/seeed_ha_discovery/icon.png",
    boards: [{ name: "XIAO ESP32 / nRF52840" }],
  },
  {
    name: "Seeed Zephyr Base",
    url: "https://github.com/limengdu/Seeed-Zephyr-Project",
    desc: {
      en: "The XIAO and Grove example library, capability catalog and command-line workflow for Zephyr RTOS.",
      zh: "面向 XIAO 与 Grove 的 Zephyr RTOS 示例库、能力目录和命令行开发流程。",
    },
    logo: "https://raw.githubusercontent.com/limengdu/Seeed-Zephyr-Project/main/docs/assets/logo.png",
    boards: [{ name: "XIAO Series" }],
  },
];

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
            href={item.category?.id === "official" ? item.url : `/software-center/${item.slug}`}
            target={item.category?.id === "official" ? "_blank" : undefined}
            rel={item.category?.id === "official" ? "noopener noreferrer" : undefined}
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

        {/* 官方软件：直接在首屏渲染，点击卡片打开官方项目，不再经过二级页。 */}
        {OFFICIAL && (
          <section id="official" className="w-full scroll-mt-28 px-6 pb-10 pt-10 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-[1440px]">
              <Reveal>
                <div className="mb-7 text-center">
                  <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--ink-strong)] sm:text-4xl">
                    {pick(OFFICIAL.title, lang)}
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-base leading-[1.65] text-[var(--ink-muted)]">
                    {pick(OFFICIAL.desc, lang)}
                  </p>
                </div>
              </Reveal>

              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
                {OFFICIAL_FEATURED.map((item, i) => {
                  const boardCount = item.boards?.length ?? 0;
                  return (
                    <Reveal key={item.url || slugify(item.name)} delay={i * 45}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full min-h-[190px] flex-col rounded-2xl border border-[var(--line-soft)] bg-white p-5 shadow-[0_6px_18px_rgba(0,73,102,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-green)]/50 hover:shadow-[0_14px_30px_rgba(0,73,102,0.12)]"
                      >
                        <div className="flex items-start gap-4">
                          <SoftwareLogo item={item} lang={lang} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-green-deep)]">Official</span>
                                <h3 className="mt-1 text-base font-bold leading-snug text-[var(--ink-strong)]">
                                  {pick(item.name, lang)}
                                </h3>
                              </div>
                              <span className="shrink-0 text-lg text-[var(--brand-blue-soft)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                            </div>
                            {item.desc && (
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--ink-body)]">
                                {pick(item.desc, lang)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="-mx-5 -mb-5 mt-auto flex items-center gap-2 rounded-b-2xl border-t border-[var(--line-soft)] bg-[var(--surface-tint)]/55 px-5 py-3 text-xs text-[var(--ink-muted)]">
                          <span className="font-semibold text-[var(--brand-blue)]">
                            {boardCount} {lang === "zh" ? "类支持板卡" : "supported board groups"}
                          </span>
                          <span>·</span>
                          <span>{lang === "zh" ? "打开官方项目" : "Open official project"} →</span>
                        </div>
                      </a>
                    </Reveal>
                  );
                })}
              </div>
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
