"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";
import { RollingStat } from "./rolling-stat";
import { withBase } from "../lib/basePath";
import styles from "./video-intro-section.module.css";

const YOUTUBE_ID = "A_XUi8tlKWk";
const YOUTUBE_START = 5;
const YOUTUBE_TITLE = "Meet Seeed Studio XIAO, Tiny But Powerful MCUs";
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${YOUTUBE_ID}`;
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UC5mX-JaRWXc8cBc1gm5kKhg";
const YOUTUBE_SHARE_URL = `https://youtu.be/${YOUTUBE_ID}`;

function YouTubeWordmark() {
  return (
    <svg viewBox="0 0 93 20" width="93" height="20" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M14.4848 20S23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87 29 14.65 29 9.98 29 9.98S29 5.34 28.3808 3.14C28.0459 1.9 27.0917.94 25.8229.61 23.5695 0 14.4848 0 14.4848 0S5.42037 0 3.17711.61C1.9286.94.954148 1.9.59888 3.14 0 5.34 0 9.98 0 9.98S0 14.65.59888 16.87C.954148 18.08 1.9286 19.06 3.17711 19.4 5.42037 20 14.4848 20 14.4848 20Z" />
      <path d="M19 10 11.5 5.75v8.5L19 10Z" fill="#212121" />
      <path d="M37.1384 18.8999V13.4399L40.6084 2.09994H38.0184L36.6984 7.24994C36.3984 8.42994 36.1284 9.65994 35.9284 10.7999H35.7684C35.6584 9.79994 35.3384 8.48994 35.0184 7.22994L33.7384 2.09994H31.1484L34.5684 13.4399V18.8999H37.1384Z" />
      <path d="M44.1003 6.29994C41.0703 6.29994 40.0303 8.04994 40.0303 11.8199V13.6099C40.0303 16.9899 40.6803 19.1099 44.0403 19.1099C47.3503 19.1099 48.0603 17.0899 48.0603 13.6099V11.8199C48.0603 8.44994 47.3803 6.29994 44.1003 6.29994ZM45.3903 14.7199C45.3903 16.3599 45.1003 17.3899 44.0503 17.3899C43.0203 17.3899 42.7303 16.3499 42.7303 14.7199V10.6799C42.7303 9.27994 42.9303 8.02994 44.0503 8.02994C45.2303 8.02994 45.3903 9.34994 45.3903 10.6799V14.7199Z" />
      <path d="M52.2713 19.0899C53.7313 19.0899 54.6413 18.4799 55.3913 17.3799H55.5013L55.6113 18.8999H57.6012V6.53994H54.9613V16.4699C54.6812 16.9599 54.0312 17.3199 53.4212 17.3199C52.6512 17.3199 52.4113 16.7099 52.4113 15.6899V6.53994H49.7812V15.8099C49.7812 17.8199 50.3613 19.0899 52.2713 19.0899Z" />
      <path d="M62.8261 18.8999V4.14994H65.8661V2.09994H57.1761V4.14994H60.2161V18.8999H62.8261Z" />
      <path d="M67.8728 19.0899C69.3328 19.0899 70.2428 18.4799 70.9928 17.3799H71.1028L71.2128 18.8999H73.2028V6.53994H70.5628V16.4699C70.2828 16.9599 69.6328 17.3199 69.0228 17.3199C68.2528 17.3199 68.0128 16.7099 68.0128 15.6899V6.53994H65.3828V15.8099C65.3828 17.8199 65.9628 19.0899 67.8728 19.0899Z" />
      <path d="M80.6744 6.26994C79.3944 6.26994 78.4744 6.82994 77.8644 7.73994H77.7344C77.8144 6.53994 77.8744 5.51994 77.8744 4.70994V1.43994H75.3244L75.3144 12.1799L75.3244 18.8999H77.5444L77.7344 17.6999H77.8044C78.3944 18.5099 79.3044 19.0199 80.5144 19.0199C82.5244 19.0199 83.3844 17.2899 83.3844 13.6099V11.6999C83.3844 8.25994 82.9944 6.26994 80.6744 6.26994ZM80.7644 13.6099C80.7644 15.9099 80.4244 17.2799 79.3544 17.2799C78.8544 17.2799 78.1644 17.0399 77.8544 16.5899V9.23994C78.1244 8.53994 78.7244 8.02994 79.3944 8.02994C80.4744 8.02994 80.7644 9.33994 80.7644 11.7299V13.6099Z" />
      <path d="M92.6517 11.4999C92.6517 8.51994 92.3517 6.30994 88.9217 6.30994C85.6917 6.30994 84.9717 8.45994 84.9717 11.6199V13.7899C84.9717 16.8699 85.6317 19.1099 88.8417 19.1099C91.3817 19.1099 92.6917 17.8399 92.5417 15.3799L90.2917 15.2599C90.2617 16.7799 89.9117 17.3999 88.9017 17.3999C87.6317 17.3999 87.5717 16.1899 87.5717 14.3899V13.5499H92.6517V11.4999ZM88.8617 7.96994C90.0817 7.96994 90.1717 9.11994 90.1717 11.0699V12.0799H87.5717V11.0699C87.5717 9.13994 87.6517 7.96994 88.8617 7.96994Z" />
    </svg>
  );
}

/**
 * The zero-second cover exposes independent playback, channel, sharing and watch controls.
 * 第零秒封面分别提供播放、频道、复制链接和平台观看控件。
 */
function YouTubeCover({ isEn, onPlay }) {
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function copyLink(event) {
    event.stopPropagation();
    window.clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(YOUTUBE_SHARE_URL);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    copyTimer.current = window.setTimeout(() => setCopyStatus(""), 2200);
  }

  const stopPlayback = (event) => event.stopPropagation();
  const copyLabel = isEn ? "Copy video link" : "\u590d\u5236\u89c6\u9891\u94fe\u63a5";
  const watchLabel = isEn ? "Watch on YouTube (opens in a new tab)" : "\u5728 YouTube \u89c2\u770b\uff08\u5728\u65b0\u6807\u7b7e\u9875\u6253\u5f00\uff09";
  const statusMessage = copyStatus === "copied"
    ? (isEn ? "Link copied" : "\u94fe\u63a5\u5df2\u590d\u5236")
    : copyStatus === "failed"
      ? (isEn ? "Unable to copy link" : "\u94fe\u63a5\u590d\u5236\u5931\u8d25")
      : "";

  return (
    <div className={styles.cover}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase("/home/xiao-intro-video-poster.webp")} alt="" width="1920" height="1080" loading="lazy" className={styles.poster} />
      <button
        type="button"
        className={styles.play}
        aria-label={isEn ? "Play XIAO intro video" : "\u64ad\u653e XIAO \u4ecb\u7ecd\u89c6\u9891"}
        onClick={onPlay}
      >
        <svg width="68" height="48" viewBox="0 0 68 48" aria-hidden="true" focusable="false" className={styles.playIcon}>
          <path d="M66.52 7.74a8 8 0 0 0-5.65-5.65C55.88.75 34 .75 34 .75S12.12.75 7.13 2.09a8 8 0 0 0-5.65 5.65C.14 12.73.14 24 .14 24s0 11.27 1.34 16.26a8 8 0 0 0 5.65 5.65C12.12 47.25 34 47.25 34 47.25s21.88 0 26.87-1.34a8 8 0 0 0 5.65-5.65C67.86 35.27 67.86 24 67.86 24s0-11.27-1.34-16.26Z" fill="#f03" />
          <path d="m27 14 18 10-18 10Z" fill="#fff" />
        </svg>
      </button>
      <div className={styles.top}>
        <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={styles.avatar} aria-label={isEn ? "Seeed Studio channel (opens in a new tab)" : "Seeed Studio \u9891\u9053\uff08\u5728\u65b0\u6807\u7b7e\u9875\u6253\u5f00\uff09"} onClick={stopPlayback}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/home/seeed-studio-youtube-avatar.jpg")} width="96" height="96" alt="" loading="lazy" />
        </a>
        <div className={styles.metadata}>
          <a href={YOUTUBE_WATCH_URL} target="_blank" rel="noopener noreferrer" className={styles.title} title={YOUTUBE_TITLE} aria-label={`${YOUTUBE_TITLE} (${isEn ? "opens in a new tab" : "\u5728\u65b0\u6807\u7b7e\u9875\u6253\u5f00"})`} onClick={stopPlayback}>{YOUTUBE_TITLE}</a>
          <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={styles.channel} aria-label={isEn ? "Seeed Studio channel (opens in a new tab)" : "Seeed Studio \u9891\u9053\uff08\u5728\u65b0\u6807\u7b7e\u9875\u6253\u5f00\uff09"} onClick={stopPlayback}>Seeed Studio</a>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.share}>
          <button type="button" className={styles.copy} onClick={copyLink} aria-label={copyLabel} title={copyLabel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="m10 13 4-4m-6.5 1.5-2 2a4 4 0 0 0 5.7 5.7l2-2m-2.4-8.4 2-2a4 4 0 0 1 5.7 5.7l-2 2" />
            </svg>
          </button>
          <span role="status" aria-atomic="true" className={styles.toast}>{statusMessage}</span>
        </div>
        <a href={`${YOUTUBE_WATCH_URL}&t=${YOUTUBE_START}s`} target="_blank" rel="noopener noreferrer" className={styles.watch} aria-label={watchLabel} onClick={stopPlayback}>
          <span>{isEn ? "Watch on" : "\u524d\u5f80\u5e73\u53f0\u89c2\u770b\uff1a"}</span>
          <YouTubeWordmark />
        </a>
      </div>
    </div>
  );
}

const FEATURES = [
  { image: "/home/xiao-feature-popular-socs.webp", en: ["Popular SoCs Integrated", "ESP32, RP2040/2350, nRF52/54, SAMD21, MG24, RA4M1, STM32 and more for embedded machine learning on MCUs."], zh: ["集成主流 SoC", "覆盖 ESP32、RP2040/2350、nRF52/54、SAMD21、MG24、RA4M1、STM32 等平台，轻松构建 MCU 端嵌入式机器学习应用。"] },
  { image: "/home/xiao-feature-thumb-size.webp", en: ["Thumb Size With SMD", "Sized at 21×17.8 mm with a single-sided surface-mount design, ready for space-constrained and tap-on designs."], zh: ["拇指大小，支持 SMD", "21×17.8 mm 单面贴装设计，适合空间受限及直接贴装式产品。"] },
  { image: "/home/xiao-feature-tinyml.webp", en: ["TinyML Native", "Compatible with Seeed’s no-code model training and deployment platform SenseCraft AI, making TinyML scalable."], zh: ["原生支持 TinyML", "兼容 Seeed 无代码模型训练与部署平台 SenseCraft AI，让 TinyML 更易规模化。"] },
  { image: "/home/xiao-feature-developer-friendly.webp", en: ["Developer-Friendly", "Natively compatible with Arduino, supporting PlatformIO, MicroPython, and CircuitPython."], zh: ["开发者友好", "原生兼容 Arduino，并支持 PlatformIO、MicroPython 与 CircuitPython。"] },
];

export function VideoIntroSection() {
  const { lang } = useLang();
  const [isPlaying, setIsPlaying] = useState(false);
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
          {/* Video / 视频 */}
          <Reveal>
            <div className="home-about-video relative overflow-hidden rounded-[24px] border border-[var(--line-soft)] bg-black shadow-[0_20px_50px_rgba(0,73,102,0.16)]">
              <div className="relative aspect-video w-full">
                {isPlaying ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?start=${YOUTUBE_START}&autoplay=1`}
                    title={isEn ? "XIAO intro video" : "XIAO \u4ecb\u7ecd\u89c6\u9891"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <YouTubeCover isEn={isEn} onPlay={() => setIsPlaying(true)} />
                )}
              </div>
            </div>
          </Reveal>

          {/* Introduction / 介绍 */}
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
