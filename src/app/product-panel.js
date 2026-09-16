"use client";

import { startTransition, useEffect, useState } from "react";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { PRODUCT_CATALOG, SERIES_PRESENTATION } from "./products/catalog";
import { BOARD_HARDWARE } from "./products/board-specs.mjs";
import { withBase } from "@/lib/basePath";
import styles from "./product-panel.module.css";

const countItems = (category) =>
  (category.subcategories ?? []).reduce((n, s) => n + (s.items?.length ?? 0), category.items?.length ?? 0);

/**
 * ProductPanel — three-series product catalog stage.
 * 产品目录：以 Dev Boards / Add-ons / Gadgets 三大系列为主舞台。
 */
export function ProductPanel() {
  const { lang, t } = useLang();
  const isEn = lang === "en";
  const categories = PRODUCT_CATALOG;

  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(null);

  // Deep-link ?cat=<id> from Glimpse cards; deferred to avoid SSR/CSR mismatch.
  // 深链预选系列：放在 effect + startTransition，避免服务端与客户端首屏不一致。
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat");
    if (!cat) return;
    const idx = categories.findIndex((c) => c.id === cat);
    if (idx < 0) return;
    startTransition(() => {
      setActiveCat(idx);
      setActiveSub(null);
    });
  }, [categories]);

  const currentCategory = categories[activeCat] ?? categories[0];
  const presentation = SERIES_PRESENTATION[currentCategory.id] ?? SERIES_PRESENTATION["dev-boards"];
  const subs = currentCategory.subcategories ?? [];
  const allItems = subs.flatMap((s) =>
    (s.items ?? []).map((item) => ({
      ...item,
      subId: s.id,
      subLabel: isEn ? s.labelEn : s.labelZh || s.labelEn,
    }))
  );
  const currentSub = activeSub != null ? subs[activeSub] ?? null : null;
  const displayItems = currentSub
    ? (currentSub.items ?? []).map((item) => ({
        ...item,
        subId: currentSub.id,
        subLabel: isEn ? currentSub.labelEn : currentSub.labelZh || currentSub.labelEn,
      }))
    : allItems;

  const L = (obj) => (obj && (isEn ? obj.en : obj.zh)) || "";
  const seriesTitle = (category) =>
    isEn ? category.labelEn || category.label : category.labelZh || category.labelEn || category.label;
  const seriesCount = (category) => countItems(category);
  const handleSeriesClick = (i) => {
    setActiveCat(i);
    setActiveSub(null);
  };

  const itemDesc = (it) => (isEn ? it.descEn : it.desc) ?? it.descEn ?? it.desc ?? "";

  return (
    <section className={styles.panel} aria-labelledby="product-catalog-title">
      <header className={styles.header}>
        <Glow as="h2" id="product-catalog-title" className={`home-type-title ${styles.title}`}>
          {t.products.title}
        </Glow>
        <p className={`home-type-body ${styles.lead}`}>
          {isEn
            ? "Three product families — core boards, expansion add-ons, and ready-to-use gadgets — one XIAO ecosystem."
            : "三大产品系列——核心开发板、扩展模块与开箱即用设备——同属一个 XIAO 生态。"}
        </p>
      </header>

      {/* Series switcher — primary navigation for the three families */}
      <div className={styles.seriesGrid} role="tablist" aria-label={isEn ? "Product series" : "产品系列"}>
        {categories.map((category, i) => {
          const meta = SERIES_PRESENTATION[category.id];
          const active = i === activeCat;
          const count = seriesCount(category);
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.seriesCard} ${active ? styles.seriesCardActive : ""}`}
              style={{ "--series-tone": meta?.tone || "#3976ff" }}
              onClick={() => handleSeriesClick(i)}
            >
              <div className={styles.seriesCover}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase(meta.cover)} alt="" loading="lazy" decoding="async" />
              </div>
              <div className={styles.seriesCopy}>
                <span className={styles.seriesEyebrow}>{L(meta.eyebrow)}</span>
                <strong className={styles.seriesName}>{seriesTitle(category)}</strong>
                <span className={styles.seriesCount}>
                  {isEn ? `${count} products` : `${count} 款产品`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active series stage */}
      <div
        className={styles.stage}
        style={{ "--series-tone": presentation.tone }}
        key={currentCategory.id}
      >
        <div className={styles.stageIntro}>
          <div className={styles.stageText}>
            <span className={styles.stageEyebrow}>{L(presentation.eyebrow)}</span>
            <h3 className={`home-type-subtitle ${styles.stageTitle}`}>{L(presentation.title)}</h3>
            <p className={`home-type-body ${styles.stageDesc}`}>{L(presentation.description)}</p>
            <div className={styles.stageTags}>
              {(isEn ? presentation.tags.en : presentation.tags.zh).map((tag) => (
                <span key={tag} className={styles.stageTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.stageActions}>
            <span className={styles.stageMeta}>
              {isEn
                ? `Showing ${displayItems.length} of ${allItems.length}`
                : `显示 ${displayItems.length} / ${allItems.length}`}
            </span>
            {currentCategory.id === "dev-boards" ? (
              <a
                className={`${styles.selectorLink} home-type-action home-filled-action home-primary-cta`}
                href={withBase("/products#smart-selector")}
              >
                {isEn ? "Open XIAO Selector" : "打开选型器"}
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.chipRow} role="tablist" aria-label={isEn ? "Subcategories" : "子分类"}>
          <button
            type="button"
            role="tab"
            aria-selected={activeSub == null}
            className={`${styles.chip} ${activeSub == null ? styles.chipActive : ""}`}
            onClick={() => setActiveSub(null)}
          >
            {isEn ? "All" : "全部"}
            <span className={styles.chipCount}>{allItems.length}</span>
          </button>
          {subs.map((sub, j) => (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={activeSub === j}
              className={`${styles.chip} ${activeSub === j ? styles.chipActive : ""}`}
              onClick={() => setActiveSub(j)}
            >
              {isEn ? sub.labelEn : sub.labelZh || sub.labelEn}
              <span className={styles.chipCount}>{sub.items?.length ?? 0}</span>
            </button>
          ))}
        </div>

        {displayItems.length === 0 ? (
          <div className={styles.empty}>
            {isEn ? "No product currently listed in this category." : "该分类暂无在售产品，敬请期待。"}
          </div>
        ) : (
          <div
            className={`${styles.productList} ${styles.productListDense}`}
            key={`${currentCategory.id}-${activeSub}`}
          >
            {displayItems.map((item, index) => {
              const wiki = BOARD_HARDWARE[item.title]?.wiki;
              const desc = itemDesc(item) || item.subLabel || "";
              return (
                <article key={`${currentCategory.id}-${item.title}-${index}`} className={styles.productRow}>
                  <div className={styles.thumb}>
                    {item.img ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={withBase(item.img)} alt="" loading="lazy" decoding="async" />
                        <div className={styles.preview} aria-hidden="true">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={withBase(item.img)} alt="" loading="lazy" decoding="async" />
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className={styles.productBody}>
                    <h4 className={`home-type-subtitle ${styles.productName}`}>{item.title}</h4>
                    {desc ? <p className={`home-type-body ${styles.productDesc}`}>{desc}</p> : null}
                    <div className={styles.actions}>
                      {wiki ? (
                        <a
                          className={`${styles.wiki} home-type-action`}
                          href={wiki}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {isEn ? "Wiki" : "文档"}
                        </a>
                      ) : null}
                      <a
                        className={`${styles.buy} home-type-action home-filled-action`}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isEn ? "Buy" : "购买"}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
