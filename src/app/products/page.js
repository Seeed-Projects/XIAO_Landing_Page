"use client";

import { SiteHeader } from "../components";
import { ProductPanel } from "../product-panel";
import { XiaoSelector } from "./xiao-selector";
import { ToolPageIntro } from "../tool-page-intro";
import { useLang } from "../i18n";

export function ProductsHero() {
  const { lang } = useLang();
  const isEn = lang === "en";
  const actions = (
    <>
      <a
        href="https://www.seeedstudio.com/xiao-selector"
        target="_blank"
        rel="noopener noreferrer"
        className="home-type-action home-filled-action home-primary-cta products-action products-hero-action"
        style={{ color: "#fff" }}
      >
        {isEn ? "Shop Now" : "立即购买"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </a>
      <a
        href="https://wiki.seeedstudio.com/xiao_topic_page/"
        target="_blank"
        rel="noopener noreferrer"
        className="home-type-action home-filled-action home-primary-cta products-action products-hero-action"
        style={{ color: "#fff" }}
      >
        {isEn ? "Get Started" : "快速开始"}
      </a>
    </>
  );
  return (
    <ToolPageIntro
      title={isEn ? "Seeed Studio XIAO Ecosystem" : "Seeed Studio XIAO 生态系统"}
      description={
        isEn
          ? "Seeed Studio XIAO is a full ecosystem that offers compact, Arduino-compatible development boards with expandable accessories for sensors, actuators, and connectivity."
          : "Seeed Studio XIAO 是一个完整的生态系统，提供紧凑的 Arduino 兼容开发板，并配有可扩展的传感器、执行器与连接配件。"
      }
      actions={actions}
    />
  );
}

// 保留 Pinout / ESP Flasher 引用：products 页暂时不渲染，由 Playground 下拉进入
// import { Pinout } from "./pinout";
// import { ESPFlasher } from "./esp-flasher";

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        {/* 广告 Hero：mt-16 顶住页眉，无顶部白边 */}
        <div id="top" className="mt-16">
          <ProductsHero />
        </div>

        <div id="products-catalog" className="page-content-shell scroll-mt-24 pb-24 sm:pb-28 lg:pb-32">
          <ProductPanel showTitle={false} />
        </div>

        {/* 选型器 */}
        <XiaoSelector />

        {/* Pinout 与 ESP Flasher 暂从 products 页下线（注释保留），
            由顶部 Playground 下拉进入对应入口。
        <Pinout />
        <ESPFlasher />
        */}
      </main>
    </>
  );
}
