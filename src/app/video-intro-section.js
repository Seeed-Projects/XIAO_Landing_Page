"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";

/**
 * VideoIntroSection —— 首页第二板块：视频 + 文字解说。
 * 桌面端左右两栏：左 16:9 YouTube 嵌入，右 文字解说；移动端上下堆叠。
 *
 * ⚠️ YOUTUBE_ID 是占位视频，用户给真实链接后替换即可。
 */
const YOUTUBE_ID = "aqz-KE-bpKQ"; // TODO: 占位（开源短片 Big Buck Bunny），替换为真实 XIAO 介绍视频

export function VideoIntroSection() {
  const { lang } = useLang();
  const isEn = lang === "en";

  const copy = isEn
    ? {
        kicker: "What is XIAO",
        title: "Tiny Boards, Built for AI",
        body: "Seeed XIAO is a series of thumb-sized, Arduino-compatible development boards packing serious compute — from ESP32-S3 with camera and AI, to nRF54L15 for ultra-low-power BLE, to RP2350 for control and USB. Designed for edge AI, smart home, wearables and education, every board keeps the same compact footprint so your idea can stay small, all the way to product.",
        cta: "See the full lineup",
      }
    : {
        kicker: "XIAO 是什么",
        title: "小身材，天生为 AI",
        body: "Seeed XIAO 是一系列拇指大小、兼容 Arduino 的开发板，却塞进了不俗的算力——带摄像头与 AI 的 ESP32-S3、超低功耗蓝牙的 nRF54L15、面向控制与 USB 的 RP2350。覆盖边缘 AI、智能家居、可穿戴与教育，所有板卡保持同样紧凑的尺寸，让你的点子从原型到量产都能「小」到底。",
        cta: "查看完整产品线",
      };

  return (
    <section
      id="intro"
      className="relative flex w-full scroll-mt-24 items-center bg-[var(--bg-base)] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        {/* 左：视频 */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--line-soft)] bg-black shadow-[0_20px_50px_rgba(0,73,102,0.16)]">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
                title="XIAO intro video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>

        {/* 右：文字 */}
        <Reveal delay={150} className="space-y-5">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-[var(--brand-blue-soft)]">
            {copy.kicker}
          </p>
          <Glow
            as="h2"
            className="font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--ink-strong)] sm:text-4xl"
          >
            {copy.title}
          </Glow>
          <p className="text-base leading-7 text-[var(--ink-body)] sm:text-lg sm:leading-8">
            {copy.body}
          </p>
          <a
            href="#ecosystem"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-soft)]"
          >
            {copy.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
