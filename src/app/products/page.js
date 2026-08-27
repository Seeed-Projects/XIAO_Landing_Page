"use client";

import { SiteHeader } from "../components";
import { ProductPanel } from "../product-panel";
import { SmartSelector } from "./smart-selector";

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        {/* 产品目录：mt-16 顶住页眉，无顶部白边 */}
        <div id="products-catalog" className="mt-16 w-full scroll-mt-24 px-4 pb-8 sm:px-6 lg:px-8">
          <ProductPanel />
        </div>

        {/* 选型器 */}
        <SmartSelector />
      </main>
    </>
  );
}
