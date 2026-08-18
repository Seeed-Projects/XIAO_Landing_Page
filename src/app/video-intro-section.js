"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";

/**
 * VideoIntroSection —— 首页第二板块：视频 + 文字解说。
 * 桌面端左右两栏：左 16:9 YouTube 嵌入，右 文字解说；移动端上下堆叠。
 * 视频起始 5s（用户指定）。
 */
const YOUTUBE_ID = "A_XUi8tlKWk"; // Seeed XIAO 介绍视频
const YOUTUBE_START = 5; // 起始秒数

export function VideoIntroSection() {
  const { lang } = useLang();
  const isEn = lang === "en";

  const copy = isEn
    ? {
        kicker: "About Seeed Studio XIAO",
        title: "Tiny MCUs, Built for TinyML on the Edge",
        body: "Seeed Studio XIAO Series is a collection of thumb-sized, powerful microcontroller units (MCUs) tailor-made for space-conscious projects requiring high performance and wireless connectivity. Embodying the essence of popular hardware platforms, the Arduino-compatible XIAO series is the perfect toolset for you to embrace tiny machine learning (TinyML) on the Edge.",
        cta: "See the full lineup",
      }
    : {
        kicker: "关于 Seeed Studio XIAO",
        title: "拇指大的 MCU，为边缘 TinyML 而生",
        body: "Seeed Studio XIAO 系列是一组拇指大小、性能强大的微控制器（MCU），专为对空间敏感、又需要高性能与无线连接的项目而打造。汲取主流硬件平台的精髓，兼容 Arduino 的 XIAO 系列，是你拥抱边缘端微型机器学习（TinyML）的理想工具集。",
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
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?start=${YOUTUBE_START}`}
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
