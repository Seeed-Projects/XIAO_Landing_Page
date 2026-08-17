"use client";

import { useLang } from "../i18n";
import { SiteHeader } from "../components";
import { Glow } from "../Glow";
import { ProductPanel } from "../product-panel";
import { SmartSelector } from "./smart-selector";
import { Pinout } from "./pinout";
import { ESPFlasher } from "./esp-flasher";

export default function ProductsPage() {
  const { t } = useLang();
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-24 lg:pt-28">
        {/* 一级标题：产品页 */}
        <section className="w-full px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-[var(--brand-blue-soft)]">
              {t.productsHero.eyebrow}
            </p>
            <Glow as="h1" className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-5xl">
              {t.productsHero.h1}
            </Glow>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-body)]">
              {t.productsHero.body}
            </p>
          </div>
        </section>

        {/* 二级板块：产品（与首页产品面板一致：分类→子分类 + 固定高度内部滚动 + 切换滑动） */}
        <div id="products-catalog" className="w-full scroll-mt-24 px-4 pb-8 sm:px-6 lg:px-8">
          <ProductPanel />
        </div>

        {/* 二级板块：选型 */}
        <SmartSelector />
        {/* 二级板块：Pinout */}
        <Pinout />
        {/* 二级板块：ESP Flasher 在线烧录 */}
        <ESPFlasher />
      </main>
    </>
  );
}
