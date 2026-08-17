"use client";

import { useLang } from "../../i18n";
import { SiteHeader } from "../../components";
import { Glow } from "../../Glow";
import { Reveal } from "../../reveal";

/**
 * 官方软件页 —— 只保留两个核心项目，左图右文 3:7 横幅卡片。
 * 左 3 成：仓库 logo（浅色背景，object-contain，不突兀）；
 * 右 7 成：OFFICIAL 标签 + 项目名 + 副标题 + 简介 + Explore。整卡跳转 GitHub。
 */
const PROJECTS = [
  {
    name: "Home Assistant Discovery",
    subtitle: "XIAO × Home Assistant",
    subtitleEn: "XIAO × Home Assistant",
    repo: "https://github.com/Seeed-Projects/Seeed-Homeassistant-Discovery",
    og: "https://opengraph.githubassets.com/1/Seeed-Projects/Seeed-Homeassistant-Discovery",
    logo: "https://raw.githubusercontent.com/Seeed-Projects/Seeed-Homeassistant-Discovery/main/custom_components/seeed_ha_discovery/icon.png",
    desc: "Seeed 出品的 Home Assistant 一键发现方案。只需在 Arduino IDE / PlatformIO 里写几行代码，XIAO ESP32 与 nRF52840 即可通过 Wi-Fi 或 BLE 接入 Home Assistant——无需 MQTT、无需云端，纯本地通信。",
    descEn:
      "A complete solution that makes it easy to connect ESP32/nRF52840 devices to Home Assistant, provided by Seeed Studio.",
  },
  {
    name: "Seeed Zephyr Base",
    subtitle: "用 Zephyr 构建 XIAO 应用",
    subtitleEn: "Build XIAO applications with Zephyr",
    repo: "https://github.com/limengdu/Seeed-Zephyr-Project",
    og: "https://opengraph.githubassets.com/1/limengdu/Seeed-Zephyr-Project",
    logo: "https://raw.githubusercontent.com/limengdu/Seeed-Zephyr-Project/main/docs/assets/logo.png",
    desc: "XIAO + Grove 的 Zephyr RTOS 示例库与命令行工作流。seeed-zephyr CLI 一条命令完成板卡选型与固件烧录，免去手写 Devicetree / Kconfig。",
    descEn:
      "The XIAO + Grove example library, capability catalog, and command-line workflow for Zephyr RTOS.",
  },
];

function ProjectBanner({ p, isEn }) {
  return (
    <a
      href={p.repo}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid min-h-[220px] grid-cols-1 overflow-hidden rounded-[24px] border border-[var(--line-soft)] bg-white shadow-[0_14px_36px_rgba(0,73,102,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(0,73,102,0.14)] sm:grid-cols-[3fr_7fr] sm:min-h-[260px]"
    >
      {/* 左：仓库圆形 logo，居中、稍大，浅色背景 */}
      <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden bg-[var(--surface-tint)] sm:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.logo}
          alt={p.name}
          className="h-28 w-28 rounded-full object-contain shadow-[0_6px_18px_rgba(0,73,102,0.14)] transition-transform duration-700 group-hover:scale-110 sm:h-32 sm:w-32"
        />
      </div>
      {/* 右：文字详情（7 成） */}
      <div className="flex flex-col justify-center p-6 sm:p-9">
        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-green-deep)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
          Official
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-[var(--ink-strong)] sm:text-3xl">
          {p.name}
        </h2>
        <p className="mt-1.5 text-sm font-medium text-[var(--brand-blue-soft)] sm:text-base">
          {isEn ? p.subtitleEn : p.subtitle}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
          {isEn ? p.descEn : p.desc}
        </p>
        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand-blue)]/25 bg-[var(--brand-blue)]/5 px-5 py-2.5 text-sm font-bold text-[var(--brand-blue)] transition-all duration-300 group-hover:gap-3 group-hover:bg-[var(--brand-blue)] group-hover:text-white group-hover:border-[var(--brand-blue)]">
          {isEn ? "Explore" : "探索"}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform"
          >
            <path d="M7 17 17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </span>
      </div>
    </a>
  );
}

export default function OfficialFirmwarePage() {
  const { lang } = useLang();
  const isEn = lang === "en";

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        {/* 标题 */}
        <section className="w-full px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-[var(--brand-blue-soft)]">
              {isEn ? "Official Software" : "官方软件"}
            </p>
            <Glow
              as="h1"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-4xl"
            >
              {isEn ? "XIAO Official Projects" : "XIAO 官方项目"}
            </Glow>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-body)]">
              {isEn
                ? "Two flagship open-source projects maintained by Seeed — click any card to open the repository directly."
                : "由 Seeed 维护的两个旗舰开源项目——点击卡片直接跳转 GitHub 仓库。"}
            </p>
          </div>
        </section>

        {/* 大横幅卡片 */}
        <section className="w-full px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.repo} delay={i * 80}>
                <ProjectBanner p={p} isEn={isEn} />
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

