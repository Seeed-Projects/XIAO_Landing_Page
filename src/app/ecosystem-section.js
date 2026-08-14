"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { Reveal } from "./reveal";

/**
 * EcosystemSection —— 首页生态横幅 + 三个固定入口板块。
 * 横幅右侧是「烧录数据传输」可视化：源芯片 → 花纹电路 → 目标芯片，
 * 发光数据包沿轨道流动，节点脉冲，模拟固件烧录时数据从主机经总线写入芯片的过程。
 * 三板块入口分别通往 资料页 / 投票路线图 / 项目中心。插在「开发者」与「新闻」之间。
 */
/* 数据包轨道：3 条横向 lane，每条 2 个错峰包，从源芯片流向目标芯片 */
const PACKETS = [
  { lane: 70, begin: "0s" },
  { lane: 70, begin: "1.3s" },
  { lane: 96, begin: "0.45s" },
  { lane: 96, begin: "1.75s" },
  { lane: 122, begin: "0.9s" },
  { lane: 122, begin: "2.2s" },
];
const NODES = [70, 96, 122].flatMap((y) => [110, 150, 190].map((x) => ({ x, y })));

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
          <div className="relative z-10 max-w-xl space-y-5">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-white/72">
              {isEn ? "Tiny Board, Big Ecosystem" : "小生态，大可能"}
            </p>
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

          {/* 烧录数据传输可视化：透明底，发光数据流直接浮在横幅上 */}
          <svg
            aria-hidden
            viewBox="0 0 300 190"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute right-6 top-[60%] hidden h-[190px] w-[300px] -translate-y-1/2 sm:block lg:w-[340px]"
          >
            <defs>
              <linearGradient id="ecoPkt" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5eead4" stopOpacity="0.1" />
                <stop offset="0.5" stopColor="#a7f3d0" stopOpacity="0.98" />
                <stop offset="1" stopColor="#67e8f9" stopOpacity="0.98" />
              </linearGradient>
              <filter id="ecoGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="ecoGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0H0V30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* 背景：PCB 网格花纹 */}
            <rect x="0" y="0" width="300" height="190" fill="url(#ecoGrid)" />

            {/* 横向 lane（数据总线） */}
            {[70, 96, 122].map((y) => (
              <line key={y} x1="40" y1={y} x2="260" y2={y} stroke="rgba(167,243,208,0.28)" strokeWidth="1.4" />
            ))}
            {/* 竖向连接线 → 花纹格 */}
            {[110, 150, 190].map((x) => (
              <line key={x} x1={x} y1="70" x2={x} y2="122" stroke="rgba(167,243,208,0.18)" strokeWidth="1.2" />
            ))}
            {/* 装饰分支短线，丰富电路感 */}
            <line x1="110" y1="70" x2="110" y2="40" stroke="rgba(167,243,208,0.14)" strokeWidth="1.2" />
            <line x1="190" y1="122" x2="190" y2="152" stroke="rgba(167,243,208,0.14)" strokeWidth="1.2" />
            <line x1="150" y1="70" x2="150" y2="44" stroke="rgba(167,243,208,0.12)" strokeWidth="1.2" />

            {/* 节点 */}
            {NODES.map(({ x, y }, i) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="#a7f3d0" opacity="0.55">
                <animate
                  attributeName="opacity"
                  values="0.3;0.95;0.3"
                  dur="2.6s"
                  begin={`${(i % 5) * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* 源芯片（左） */}
            <g>
              <rect x="4" y="52" width="34" height="86" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(167,243,208,0.5)" strokeWidth="1.2" />
              <rect x="11" y="64" width="20" height="62" rx="2.5" fill="rgba(255,255,255,0.03)" stroke="rgba(167,243,208,0.35)" strokeWidth="0.8" />
              {[70, 84, 96, 108, 122].map((py) => (
                <line key={py} x1="38" y1={py} x2="44" y2={py} stroke="rgba(167,243,208,0.5)" strokeWidth="1.2" />
              ))}
              {/* 发射脉冲 */}
              <circle cx="21" cy="95" r="6" fill="none" stroke="#6ee7b7" strokeWidth="1.4">
                <animate attributeName="r" values="6;30" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.65;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* 目标芯片（右） */}
            <g>
              <rect x="262" y="52" width="34" height="86" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(167,243,208,0.5)" strokeWidth="1.2" />
              <rect x="269" y="64" width="20" height="62" rx="2.5" fill="rgba(255,255,255,0.03)" stroke="rgba(167,243,208,0.35)" strokeWidth="0.8" />
              {[70, 84, 96, 108, 122].map((py) => (
                <line key={py} x1="256" y1={py} x2="262" y2={py} stroke="rgba(167,243,208,0.5)" strokeWidth="1.2" />
              ))}
              {/* 接收脉冲（错峰） */}
              <circle cx="279" cy="95" r="6" fill="none" stroke="#67e8f9" strokeWidth="1.4">
                <animate attributeName="r" values="6;26" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* 数据包：沿 lane 从源流向目标 */}
            {PACKETS.map((p, i) => (
              <rect
                key={i}
                x="40"
                y={p.lane - 2.5}
                width="13"
                height="5"
                rx="2.5"
                fill="url(#ecoPkt)"
                filter="url(#ecoGlow)"
              >
                <animate
                  attributeName="x"
                  from="40"
                  to="248"
                  dur="2.6s"
                  begin={p.begin}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.85;1"
                  dur="2.6s"
                  begin={p.begin}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </svg>
        </Reveal>

        {/* 三板块入口 —— 图标带脉冲光晕，底部流动连接线 */}
        <div className="relative mt-6">
          {/* 流动连接线（桌面） */}
          <div className="absolute inset-x-0 top-7 hidden h-px bg-[var(--line-soft)] sm:block">
            <span className="absolute top-1/2 block h-[3px] w-20 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(143,195,31,0),rgba(143,195,31,0.9),rgba(0,73,102,0.9),rgba(0,73,102,0))] animate-[coflow_5s_linear_infinite]" />
          </div>

          <div className="relative grid gap-5 sm:grid-cols-3">
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
          </div>
        </div>
      </div>
    </section>
  );
}
