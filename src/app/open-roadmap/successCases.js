"use client";

import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import styles from "./community-roadmap.module.css";

/**
 * SuccessCases —— Open Roadmap 社区驱动产品成功案例。
 * 横向小尺寸轮播（scroll-snap），每卡含产品图、名称、跳转商详链接。
 * 插在 open-roadmap 页面 CommunityRoadmap 下方。
 */
const CASES = [
  {
    name: "XIAO 3PCS Pack",
    image:
      "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-110010004-seeed-studio-xiao-samd21-_3pcs_-45font.jpg",
    href: "https://www.seeedstudio.com/Seeeduino-XIAO-3Pcs-p-4546.html",
  },
  {
    name: "XIAO ESP32-C5 Pre-Soldered",
    image:
      "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-100093057-seeed-studio-xiao-esp32c5_pre-solder_.jpg",
    href: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C5-Pre-Soldered-p-6610.html",
  },
  {
    name: "XIAO ESP32-S3 Plus",
    image:
      "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-102010671-seeedstudio-xiao-esp32s3-plus_1.jpg",
    href: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Plus-p-6361.html",
  },
  {
    name: "Aluminum Heat Sink for XIAO (2pcs)",
    image:
      "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-114010001-aluminum-heat-sink-for-xiao-_2pcs_-.jpg",
    href: "https://www.seeedstudio.com/Aluminum-Heat-Sink-For-XIAO-2pcs-p-5972.html",
  },
];

export function SuccessCases() {
  const { lang } = useLang();
  const isEn = lang === "en";
  const eyebrow = isEn ? "Open Roadmap" : "Open Roadmap";
  const title = isEn ? "Success Stories" : "成功案例";
  const sub = isEn
    ? "Community-voted ideas that shipped — now real products you can buy."
    : "社区投票的想法落地成真——已成为可购买的真实产品。";
  const cta = isEn ? "View product →" : "查看商详 →";

  return (
    <section id="success" className="w-full scroll-mt-24 bg-[var(--page-bg)] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <Reveal className="text-center">
          <Glow as="h2" className="font-display text-3xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-4xl">
            {title}
          </Glow>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--ink-body)]">
            {sub}
          </p>
        </Reveal>

        <Reveal className="mt-9">
          <div className="flex snap-x snap-mandatory justify-center gap-5 overflow-x-auto px-1 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CASES.map((c, i) => (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-[230px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white/90 shadow-[0_8px_24px_rgba(0,73,102,0.06)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[rgba(143,195,31,0.45)] hover:shadow-[0_16px_36px_rgba(0,73,102,0.12)] sm:w-[250px]"
              >
                <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm font-semibold leading-snug text-[var(--ink-strong)]">
                    {c.name}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-blue)]">
                    {cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
