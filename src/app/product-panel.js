"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { PRODUCT_CATALOG } from "./products/catalog";

/**
 * ProductPanel —— 首页与产品页共享的产品面板。
 * 左：分类 → 子分类 嵌套导航；右：固定高度内部可滚动的产品卡片网格。
 * 数据来自 seeedstudio.com XIAO 分类页 (c-2428)，每张卡片含真实产品图与跳转链接。
 * 切换分类/子分类时，右侧网格与子分类列表带滑动入场动画。
 */
export function ProductPanel() {
  const { lang, t } = useLang();
  const isEn = lang === "en";
  const categories = PRODUCT_CATALOG;

  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(0);

  const currentCategory = categories[activeCat] ?? categories[0];
  const subs = currentCategory.subcategories ?? [];
  // 跳过空子分类，落到第一个有内容的子分类
  const currentSub = subs[activeSub] ?? subs[0] ?? null;
  const displayItems = currentSub?.items ?? currentCategory.items ?? [];

  const handleCategoryClick = (i) => {
    setActiveCat(i);
    setActiveSub(0);
  };

  const catLabel = (c) => (isEn ? c.labelEn : c.label) ?? c.label;
  const subLabel = (s) => (isEn ? s.labelEn : s.label) ?? s.label;
  const itemDesc = (it) => (isEn ? it.descEn : it.desc) ?? it.desc;

  return (
    <div className="mx-auto flex h-[640px] w-full max-w-[1440px] flex-col overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-white/80 backdrop-blur-sm">
      {/* 卡片头部 - 标题 + 跳转 XIAO 系列总览 */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <div>
          <Glow as="h2" className="font-display text-2xl font-bold tracking-tight text-[var(--ink-strong)] sm:text-3xl">
            {t.products.title}
          </Glow>
        </div>
        <div className="flex flex-col items-end gap-2">
          <h3 className="text-sm font-medium text-[var(--ink-muted)]">
            {catLabel(currentCategory)}
            {currentSub ? ` / ${subLabel(currentSub)}` : ""}
          </h3>
          <a
            href="https://www.seeedstudio.com/xiao-series-page"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--brand-blue)]/20 bg-white px-5 py-2 text-sm font-semibold text-[var(--brand-blue)] shadow-[0_8px_24px_rgba(0,73,102,0.10)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/45 hover:bg-[var(--brand-blue)]/5"
          >
            {isEn ? "Shop XIAO Series" : "查看 XIAO 系列"}
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
        </div>
      </div>

      {/* 卡片主体 - 左导航 + 右内容 */}
      <div className="grid flex-1 grid-cols-[200px_minmax(0,1fr)] overflow-hidden">
        {/* 左侧分类导航 */}
        <aside className="overflow-y-auto bg-[var(--surface-tint)]/40 px-4 py-4">
          <div className="space-y-1">
            {categories.map((category, i) => {
              const isActive = i === activeCat;
              const catItems = (category.subcategories ?? []).reduce(
                (n, s) => n + (s.items?.length ?? 0),
                (category.items?.length ?? 0)
              );
              return (
                <div key={`${category.id}-${i}`} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(i)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--brand-green)]/12 text-[var(--brand-green-deep)]"
                        : "text-[var(--ink-body)] hover:bg-white/60 hover:text-[var(--ink-strong)]"
                    }`}
                  >
                    <span>{catLabel(category)}</span>
                    <span className={`text-[11px] tabular-nums ${isActive ? "text-[var(--brand-green-deep)]/70" : "text-[var(--ink-muted)]"}`}>
                      {catItems}
                    </span>
                  </button>

                  {isActive && category.subcategories && (
                    <div
                      key={`sub-${i}`}
                      className="ml-3 space-y-0.5 border-l border-[var(--line-soft)] pl-3 animate-[panelSlide_300ms_ease-out]"
                    >
                      {category.subcategories.map((sub, j) => {
                        const isSubActive = j === activeSub;
                        const count = sub.items?.length ?? 0;
                        return (
                          <button
                            key={`${sub.id}-${j}`}
                            type="button"
                            onClick={() => setActiveSub(j)}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                              isSubActive
                                ? "bg-[var(--brand-blue)]/8 text-[var(--brand-blue)]"
                                : "text-[var(--ink-muted)] hover:text-[var(--ink-strong)]"
                            }`}
                          >
                            <span>{subLabel(sub)}</span>
                            <span className="text-[10px] tabular-nums opacity-70">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* 右侧产品网格 —— 切换分类/子分类时滑动入场 */}
        <div className="overflow-y-auto px-6 py-5 sm:px-8">
          {displayItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--ink-muted)]">
              <span className="text-sm">{isEn ? "No product currently listed in this category." : "该芯片类型暂无在售产品，敬请期待。"}</span>
            </div>
          ) : (
            <div
              key={`${activeCat}-${activeSub}`}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-[panelSlide_360ms_ease-out]"
            >
              {displayItems.map((item, index) => (
                <a
                  key={`${currentCategory.id}-${item.title}-${index}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                    <div
                      className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                      style={item.img ? { backgroundImage: `url("${item.img}")` } : undefined}
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="line-clamp-2 text-base font-bold leading-snug text-[var(--ink-strong)]">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[var(--ink-body)]">
                      {itemDesc(item)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
