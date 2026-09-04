"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { PRODUCT_CATALOG } from "./products/catalog";
import { withBase } from "@/lib/basePath";

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

  const [activeCat, setActiveCat] = useState(() => {
    // 支持 ?cat=<id> 深链预选分类（来自 Glimpse 等卡片跳转）
    if (typeof window !== "undefined") {
      const cat = new URLSearchParams(window.location.search).get("cat");
      if (cat) {
        const idx = categories.findIndex((c) => c.id === cat);
        if (idx >= 0) return idx;
      }
    }
    return 0;
  });
  // activeSub = null 表示「全部」：展示当前分类下所有子分类的产品，不做细分
  const [activeSub, setActiveSub] = useState(null);

  const currentCategory = categories[activeCat] ?? categories[0];
  const subs = currentCategory.subcategories ?? [];
  // 当前分类下所有子分类产品合并（用于「全部」视图）
  const allItems = subs.flatMap((s) => s.items ?? []).concat(currentCategory.items ?? []);
  const currentSub = activeSub != null ? subs[activeSub] ?? null : null;
  const displayItems = currentSub?.items ?? allItems;

  const handleCategoryClick = (i) => {
    setActiveCat(i);
    setActiveSub(null);
  };

  const catLabel = (c) => (isEn ? c.labelEn : c.label) ?? c.label;
  const subLabel = (s) => (isEn ? s.labelEn : s.label) ?? s.label;
  const itemDesc = (it) => (isEn ? it.descEn : it.desc) ?? it.descEn ?? it.desc ?? "";

  return (
    <div className="mx-auto flex min-h-[680px] w-full max-w-none flex-col overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-white/80 backdrop-blur-sm lg:h-[calc(100dvh-13rem)] lg:min-h-[720px]">
      {/* 卡片头部 - 标题（只留大标题，去掉重复的小字 eyebrow） */}
      <div className="relative flex min-h-[76px] shrink-0 items-center px-6 py-5 sm:px-8">
        <Glow as="h2" className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[length:var(--type-section-title)] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ink-strong)]">
          {t.products.title}
        </Glow>
        <h3 className="ml-auto hidden text-sm font-medium text-[var(--ink-muted)] sm:block">
          {catLabel(currentCategory)}
          {subs.length > 0
            ? ` / ${currentSub ? subLabel(currentSub) : isEn ? "All" : "全部"}`
            : ""}
        </h3>
      </div>

      {/* 卡片主体 - 左导航 + 右内容 */}
      <div className="grid flex-1 grid-cols-[216px_minmax(0,1fr)] overflow-hidden">
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
                      {/* 「全部」：展示该分类下所有子分类产品 */}
                      <button
                        type="button"
                        onClick={() => setActiveSub(null)}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                          activeSub == null
                            ? "bg-[var(--brand-blue)]/8 text-[var(--brand-blue)]"
                            : "text-[var(--ink-muted)] hover:text-[var(--ink-strong)]"
                        }`}
                      >
                        <span>{isEn ? "All" : "全部"}</span>
                        <span className="text-[10px] tabular-nums opacity-70">{catItems}</span>
                      </button>
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
        <div className="overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
          {displayItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--ink-muted)]">
              <span className="text-sm">{isEn ? "No product currently listed in this category." : "该芯片类型暂无在售产品，敬请期待。"}</span>
            </div>
          ) : (
            <div
              key={`${activeCat}-${activeSub}`}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 animate-[panelSlide_360ms_ease-out]"
            >
              {displayItems.map((item, index) => (
                <a
                  key={`${currentCategory.id}-${item.title}-${index}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-[var(--line-soft)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* 产品图：固定 4:3 白框 + object-contain 贴底（不放大、不裁切）。
                      统一框尺寸与对齐，避免不同比例图源导致板子忽大忽小；白底与图源白底融合。 */}
                  {item.img ? (
                    <div className="aspect-[4/3] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={withBase(item.img)}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="block h-full w-full object-contain object-bottom"
                      />
                    </div>
                  ) : null}
                  <div className="p-3.5">
                    <h4 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--ink-strong)]">
                      {item.title}
                    </h4>
                    {itemDesc(item) ? (
                      <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[var(--ink-body)]">
                        {itemDesc(item)}
                      </p>
                    ) : null}
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
