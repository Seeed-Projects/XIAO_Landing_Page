"use client";

import { SiteHeader } from "../components";
import { ProductPanel } from "../product-panel";
import { SmartSelector } from "./smart-selector";
import { HeroSection } from "../hero-section";
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
          <HeroSection />
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
