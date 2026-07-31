"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { Glow } from "./Glow";

/**
 * ProductPanel —— 首页与产品页共享的产品面板。
 * 左：分类 → 子分类 嵌套导航；右：固定高度内部可滚动的产品卡片网格。
 * 切换分类/子分类时，右侧网格与子分类列表带滑动入场动画。
 */
export function ProductPanel() {
  const { t } = useLang();
  const categories = t.products.categories;

  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(0);

  const currentCategory = categories[activeCat] ?? categories[0];
  const subs = currentCategory.subcategories ?? [];
  const currentSub = subs[activeSub] ?? subs[0] ?? null;
  const displayItems = currentSub?.items ?? currentCategory.items ?? [];

  const handleCategoryClick = (i) => {
    setActiveCat(i);
    setActiveSub(0);
  };

  return (
    <div className="mx-auto flex h-[640px] w-full max-w-[1440px] flex-col overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-white/80 backdrop-blur-sm">
      {/* 卡片头部 - 标题 */}
      <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-8">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-green-deep)]">
            {t.products.eyebrow}
          </span>
          <Glow as="h2" className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--ink-strong)] sm:text-3xl">
            {t.products.title}
          </Glow>
        </div>
        <h3 className="text-sm font-medium text-[var(--ink-muted)]">
          {currentCategory.label}
          {currentSub ? ` / ${currentSub.label}` : ""}
        </h3>
      </div>

      {/* 卡片主体 - 左导航 + 右内容 */}
      <div className="grid flex-1 grid-cols-[200px_minmax(0,1fr)] overflow-hidden">
        {/* 左侧分类导航 */}
        <aside className="overflow-y-auto bg-[var(--surface-tint)]/40 px-4 py-4">
          <div className="space-y-1">
            {categories.map((category, i) => {
              const isActive = i === activeCat;
              return (
                <div key={`${category.label}-${i}`} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(i)}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--brand-green)]/12 text-[var(--brand-green-deep)]"
                        : "text-[var(--ink-body)] hover:bg-white/60 hover:text-[var(--ink-strong)]"
                    }`}
                  >
                    {category.label}
                  </button>

                  {isActive && category.subcategories && (
                    <div
                      key={`sub-${i}`}
                      className="ml-3 space-y-0.5 border-l border-[var(--line-soft)] pl-3 animate-[panelSlide_300ms_ease-out]"
                    >
                      {category.subcategories.map((sub, j) => {
                        const isSubActive = j === activeSub;
                        return (
                          <button
                            key={`${sub.label}-${j}`}
                            type="button"
                            onClick={() => setActiveSub(j)}
                            className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                              isSubActive
                                ? "bg-[var(--brand-blue)]/8 text-[var(--brand-blue)]"
                                : "text-[var(--ink-muted)] hover:text-[var(--ink-strong)]"
                            }`}
                          >
                            {sub.label}
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
          <div
            key={`${activeCat}-${activeSub}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-[panelSlide_360ms_ease-out]"
          >
            {displayItems.map((item, index) => (
              <article
                key={`${currentCategory.label}-${item.title}-${index}`}
                className="group overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <div
                    className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url("${t.products.image}")` }}
                  />
                </div>
                <div className="p-5">
                  <h4 className="text-base font-bold text-[var(--ink-strong)]">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-body)]">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
