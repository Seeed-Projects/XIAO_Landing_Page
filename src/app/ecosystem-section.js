"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { Reveal } from "./reveal";

/**
 * EcosystemSection —— 首页生态横幅 + 三个固定入口板块。
 * 横幅左侧点题，三板块入口分别通往 资料页 / 投票路线图 / 项目中心。
 * 插在「开发者」与「新闻」之间。
 */

export function EcosystemSection() {
  const { lang } = useLang();
  const isEn = lang === "en";

  const cards = [
    {
      href: "/res",
      title: isEn ? "Rich Resources" : "丰富的资料",
      desc: isEn
        ? "Docs, tutorials and wikis — everything you need, in one place."
        : "文档、教程与 wiki 一站式查阅，从入门到进阶。",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V6a2 2 0 0 1 2-2h7l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M13 4v5h5" />
          <path d="M8 13h6M8 17h4" />
        </svg>
      ),
    },
    {
      href: "/open-roadmap",
      title: isEn ? "Vote & Shape" : "投票互动",
      desc: isEn
        ? "Vote for the next feature you want — your voice shapes the roadmap."
        : "投出你想要的下一个功能，让用户的存在感进入产品路线。",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 16h4" />
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 4v17M16 4v17" />
        </svg>
      ),
    },
    {
      href: "/project-hub",
      title: isEn ? "Project Hub" : "项目中心",
      desc: isEn
        ? "Community builds and real-world projects to spark your next idea."
        : "社区作品与实战项目集合，给你的下一个灵感点火。",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="ecosystem"
      className="bg-mod-mint relative flex w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* 横幅：左侧点题 + 右侧生态轨道动画 */}
        <Reveal className="hero-orb relative overflow-hidden rounded-[28px] bg-[linear-gradient(118deg,rgba(0,73,102,0.96),rgba(29,103,132,0.92)_58%,rgba(22,182,106,0.88))] p-8 text-white shadow-[0_18px_44px_rgba(0,73,102,0.18)] sm:p-12 lg:p-14">
          <div className="relative z-10 max-w-2xl space-y-5">
            <Glow
              as="h2"
              className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {isEn
                ? "A thumb-sized board that grew a whole ecosystem."
                : "一块拇指大的板子，长出了一整片生态。"}
            </Glow>
            <p className="text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              {isEn
                ? "Hardware, software, docs, and a community that builds together — start anywhere below."
                : "硬件、软件、资料与共建社区——从下面任意一个入口开始。"}
            </p>
          </div>
        </Reveal>

        {/* 三板块入口 —— 图标带脉冲光晕，底部流动连接线 */}
        <div className="relative mt-6">
          {/* 流动连接线（桌面） */}
          <div className="absolute inset-x-0 top-7 hidden h-px bg-[var(--line-soft)] sm:block">
            <span className="absolute top-1/2 block h-[3px] w-20 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(143,195,31,0),rgba(143,195,31,0.9),rgba(0,73,102,0.9),rgba(0,73,102,0))] animate-[coflow_5s_linear_infinite]" />
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
              <Reveal key={c.href} delay={i * 90}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-7 shadow-[0_8px_24px_rgba(0,73,102,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)]/30 hover:shadow-[0_16px_36px_rgba(0,73,102,0.12)]"
                >
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-blue)]/8 text-[var(--brand-blue)] ring-1 ring-inset ring-[var(--brand-blue)]/15 transition group-hover:bg-[var(--brand-blue)] group-hover:text-white">
                    <span className="h-6 w-6">{c.icon}</span>
                    <span className="absolute inset-0 rounded-xl bg-[var(--brand-blue)]/30 animate-[copulse_3s_ease-out_infinite] group-hover:animate-none" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold leading-tight tracking-tight text-[var(--ink-strong)]">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--ink-body)]">
                    {c.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-blue)]">
                    {isEn ? "Explore" : "进入"}
                    <svg
                      width="16"
                      height="16"
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
                </Link>
              </Reveal>
            ))}

            {/* 第 4 张：广告/推广卡 —— 生态里更多可直接用的在线工具（引脚 / 烧录） */}
            <Reveal delay={270}>
              <div className="group flex h-full flex-col rounded-2xl border border-[var(--line-soft)] bg-white/90 p-7 shadow-[0_8px_24px_rgba(0,73,102,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)]/30 hover:shadow-[0_16px_36px_rgba(0,73,102,0.12)]">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-blue)]/8 text-[var(--brand-blue)] ring-1 ring-inset ring-[var(--brand-blue)]/15 transition group-hover:bg-[var(--brand-blue)] group-hover:text-white">
                  <span className="h-6 w-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <path d="M14 14h7v3M21 21h-7" />
                      <path d="M17.5 17.5 21 21" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 rounded-xl bg-[var(--brand-blue)]/30 animate-[copulse_3s_ease-out_infinite] group-hover:animate-none" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold leading-tight tracking-tight text-[var(--ink-strong)]">
                  {isEn ? "More Tools" : "更多平台工具"}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--ink-body)]">
                  {isEn
                    ? "Browse pin maps and flash firmware — right in the browser."
                    : "在线查引脚、一键烧录固件，浏览器里直接搞定。"}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    href="/products#pinout"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink-strong)] bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--ink-strong)] hover:text-white"
                  >
                    {isEn ? "Pin Map" : "引脚插入"}
                  </Link>
                  <Link
                    href="/products#esp-flasher"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink-strong)] bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--ink-strong)] hover:text-white"
                  >
                    {isEn ? "One-Click Flash" : "一键接入"}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
