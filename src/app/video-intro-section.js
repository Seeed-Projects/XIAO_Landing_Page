"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";
import { RollingStat } from "./rolling-stat";
import { withBase } from "../lib/basePath";

/**
 * VideoIntroSection —— 首页第二板块：视频 + 文字解说。
 * 桌面端左右两栏：左 16:9 YouTube 嵌入，右 文字解说；移动端上下堆叠。
 * 视频起始 5s（用户指定）。
 */
const YOUTUBE_ID = "A_XUi8tlKWk"; // Seeed XIAO 介绍视频
const YOUTUBE_START = 5; // 起始秒数

const FEATURES = [
  { image: "/home/XIAO落地页素材-1.webp", en: ["Popular SoCs Integrated", "RA4M1, RP2350, ESP32, RP2040, nRF52840, SAMD21, and more for embedded machine learning on MCUs."], zh: ["集成主流 SoC", "覆盖 RA4M1、RP2350、ESP32、RP2040、nRF52840、SAMD21 等平台，轻松构建 MCU 端嵌入式机器学习应用。"] },
  { image: "/home/XIAO落地页素材-2.webp", en: ["Thumb Size With SMD", "Sized at 21×17.8 mm with a single-sided surface-mount design, ready for space-constrained and tap-on designs."], zh: ["拇指大小，支持 SMD", "21×17.8 mm 单面贴装设计，适合空间受限及直接贴装式产品。"] },
  { image: "/home/XIAO落地页素材-3.webp", en: ["TinyML Native", "Compatible with Seeed’s no-code model training and deployment platform SenseCraft AI, making TinyML scalable."], zh: ["原生支持 TinyML", "兼容 Seeed 无代码模型训练与部署平台 SenseCraft AI，让 TinyML 更易规模化。"] },
  { image: "/home/XIAO落地页素材-4.webp", en: ["Developer-Friendly", "Natively compatible with Arduino, supporting PlatformIO, MicroPython, and CircuitPython."], zh: ["开发者友好", "原生兼容 Arduino，并支持 PlatformIO、MicroPython 与 CircuitPython。"] },
];

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
      className="section home-section home-about-section relative flex w-full scroll-mt-24 items-center overflow-hidden px-6 sm:px-10 lg:px-16"
    >
      <div className="home-content home-about-content">
        <div className="home-about-lead grid items-center gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          {/* 左：视频 */}
          <Reveal>
            <div className="home-about-video relative overflow-hidden rounded-[24px] border border-[var(--line-soft)] bg-black shadow-[0_20px_50px_rgba(0,73,102,0.16)]">
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
          <Reveal delay={150} className="home-about-copy space-y-4">
            <Glow
              as="h2"
              className="home-type-title text-[#18224f]"
            >
              {copy.title}
            </Glow>
            <p className="home-type-body max-w-[640px] text-[#526b91]">
              {copy.body}
            </p>
            <a
              href="https://mailchi.mp/seeed/xiao"
              target="_blank"
              rel="noopener noreferrer"
              className="home-type-action home-filled-action group inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-6 py-3 text-white shadow-[0_12px_26px_rgba(143,195,31,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--button-bg-hover)]"
              style={{ color: "#fff" }}
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
            <div className="home-about-stats grid grid-cols-2 gap-8 sm:gap-16">
              {[
                [isEn ? "Thumb Sized" : "拇指大小", "21×17.8", "mm"],
                [isEn ? "Trusted by" : "深受信赖", "500,000+", isEn ? "Developers" : "开发者"],
              ].map(([label, value, unit]) => (
                <div key={label} className="home-about-stat min-w-0">
                  <p className="text-xs font-semibold text-[#667981] sm:text-sm">{label}</p>
                  <p className="home-about-stat-value mt-3 whitespace-nowrap font-bold tracking-[-0.04em] text-[#14384a]">
                    <RollingStat value={value} />
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#71858d] sm:text-sm">{unit}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div id="features" className="home-about-features scroll-mt-24">
          <div className="home-feature-grid">
            {FEATURES.map((item, index) => {
              const featureCopy = isEn ? item.en : item.zh;
              return (
                <Reveal key={item.en[0]} delay={index * 70} className="home-feature">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBase(item.image)} alt="" />
                  <div>
                    <h3 className="home-type-subtitle">{featureCopy[0]}</h3>
                    <p className="home-type-body">{featureCopy[1]}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
