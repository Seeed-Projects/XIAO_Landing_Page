"use client";

import { SiteHeader } from "../components";
import { ProductPanel } from "../product-panel";
import { SmartSelector } from "./smart-selector";
import { HeroSection } from "../hero-section";
import { useLang } from "../i18n";

export function ProductsHero() {
  const { lang } = useLang();
  const isEn = lang === "en";
  return (
    <HeroSection
      title={isEn ? "Seeed Studio XIAO Ecosystem" : "Seeed Studio XIAO 生态系统"}
      subtitle={
        isEn
          ? "Seeed Studio XIAO is a full ecosystem that offers compact, Arduino-compatible development boards with expandable accessories for sensors, actuators, and connectivity."
          : "Seeed Studio XIAO 是一个完整的生态系统，提供紧凑的 Arduino 兼容开发板，并配有可扩展的传感器、执行器与连接配件。"
      }
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
        <div className="mt-16">
          <ProductsHero />
        </div>

        {/* 产品目录 */}
        <div id="products-catalog" className="w-full scroll-mt-24 px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
          <ProductPanel />
        </div>

        {/* 选型器 */}
        <SmartSelector />

        {/* Pinout 与 ESP Flasher 暂从 products 页下线（注释保留），
            由顶部 Playground 下拉进入对应入口。
        <Pinout />
        <ESPFlasher />
        */}
      </main>
    </>
  );
}
