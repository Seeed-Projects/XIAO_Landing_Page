"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { ProductPanel } from "./product-panel";

export function HomeProductPanel() {
  return (
    <section
      id="products"
      className="bg-mod-mint relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <Reveal className="mx-auto w-full max-w-[1440px]">
        <ProductPanel />
      </Reveal>
    </section>
  );
}
