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
        title: "About Seeed Studio XIAO",
        body: "Seeed Studio XIAO Series is a collection of thumb-sized, powerful microcontroller units (MCUs) tailor-made for space-conscious projects requiring high performance and wireless connectivity. Embodying the essence of popular hardware platforms, the Arduino-compatible XIAO series is the perfect toolset for you to embrace tiny machine learning (TinyML) on the Edge.",
      }
    : {
        title: "关于 Seeed Studio XIAO",
        body: "Seeed Studio XIAO 系列是一组拇指大小、性能强大的微控制器（MCU），专为对空间敏感、又需要高性能与无线连接的项目而打造。汲取主流硬件平台的精髓，兼容 Arduino 的 XIAO 系列，是你拥抱边缘端微型机器学习（TinyML）的理想工具集。",
      };

  return (
    <section
      id="intro"
      className="section relative flex w-full scroll-mt-24 items-center bg-white px-6 sm:px-10 lg:px-16"
    >
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
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
          <Glow
            as="h2"
            className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#18224f] sm:text-[28px]"
          >
            {copy.title}
          </Glow>
          <p className="max-w-[640px] text-[15px] leading-[1.65] text-[#526b91] sm:text-[16px]">
            {copy.body}
          </p>
          <a
            href="https://mailchi.mp/seeed/xiao"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(143,195,31,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--button-bg-hover)]"
          >
            {isEn ? "Join the XIAO Newsletter" : "订阅 XIAO Newsletter"}
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
          </a>
          <div className="grid grid-cols-2 gap-12 pt-5 sm:gap-20">
            {[
              [isEn ? "Thumb Sized" : "拇指大小", "21×17.8", "mm"],
              [isEn ? "Trusted by" : "深受信赖", "500,000+", isEn ? "Developers" : "开发者"],
            ].map(([label, value, unit]) => (
              <div key={label} className="min-w-0">
                <p className="text-xs font-semibold text-[#777] sm:text-sm">{label}</p>
                <p className="mt-4 whitespace-nowrap text-[25px] font-bold tracking-[-0.04em] text-[#222] sm:text-[31px]">{value}</p>
                <p className="mt-3 text-xs font-semibold text-[#858585] sm:text-sm">{unit}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
