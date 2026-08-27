"use client";

import { useLang } from "../i18n";
import { SiteHeader } from "../components";
import { Glow } from "../Glow";
import { ProductPanel } from "../product-panel";
import { SmartSelector } from "./smart-selector";
import { Pinout } from "./pinout";
import { ESPFlasher } from "./esp-flasher";
import { HeroSection } from "../hero-section";

export default function ProductsPage() {
  const { t } = useLang();
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-24 lg:pt-28">
        {/* 原首页广告 Hero：内容、文案、链接和视觉保持不变，仅移至 Products */}
        <HeroSection />
        {/* 一级标题：产品页 */}
        <section className="w-full px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px] text-center">
            <Glow as="h1" className="font-display text-4xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-5xl">
              {t.productsHero.h1}
            </Glow>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--ink-body)]">
              {t.productsHero.body}
            </p>
          </div>
        </section>

        {/* 二级板块：产品（与首页产品面板一致：分类→子分类 + 固定高度内部滚动 + 切换滑动） */}
        <div id="products-catalog" className="w-full scroll-mt-24 px-4 pb-8 sm:px-6 lg:px-8">
          <ProductPanel />
        </div>

        {/* 二级板块：选型（已恢复上線；其中"帮我选 XIAO"向导暂下线，仅保留"按参数筛选"） */}
        <SmartSelector />
        {/* 二级板块：Pinout */}
        <Pinout />
        {/* 二级板块：ESP Flasher 在线烧录 */}
        <ESPFlasher />
      </main>
    </>
  );
}
