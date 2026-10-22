"use client";

import { Fragment, startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { Glow } from "./Glow";
import { CardPeek, CardPeekContent } from "./card-peek";
import { PRODUCT_CATALOG, SERIES_PRESENTATION } from "./products/catalog";
import { BOARD_HARDWARE } from "./products/board-specs.mjs";
import { withBase } from "@/lib/basePath";
import styles from "./product-panel.module.css";

const countItems = (category) =>
  (category.subcategories ?? []).reduce((n, s) => n + (s.items?.length ?? 0), category.items?.length ?? 0);

// One outline follows the tab and catalog perimeter in CSS pixels.
// 单条轮廓以 CSS 像素沿标签和目录面板的外沿绘制。
function SeriesTabOutline({ first, last, lang }) {
  const svgRef = useRef(null);
  const fillRef = useRef(null);
  const strokeRef = useRef(null);
  const highlightRef = useRef(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const tab = svg?.parentElement;
    const stage = tab?.parentElement.nextElementSibling;
    if (!tab || !stage) return;

    const draw = () => {
      const box = tab.getBoundingClientRect();
      const panel = stage.getBoundingClientRect();
      const style = getComputedStyle(tab);
      const panelStyle = getComputedStyle(stage);
      const border = parseFloat(panelStyle.borderTopWidth);
      const half = border / 2;
      const curve = parseFloat(style.getPropertyValue("--tab-curve"));
      const radius = Math.min(parseFloat(style.getPropertyValue("--tab-radius")) - half, (box.width - border) / 2);
      const left = half;
      const right = box.width - half;
      const top = half;
      const seam = panel.top - box.top + half;
      const start = first ? left : left - curve;
      const end = last ? right : right + curve;
      const outline = [
        `M ${start} ${seam}`,
        first ? "" : `A ${curve} ${curve} 0 0 0 ${left} ${seam - curve}`,
        `L ${left} ${top + radius}`,
        `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
        `L ${right - radius} ${top}`,
        `A ${radius} ${radius} 0 0 1 ${right} ${top + radius}`,
        `L ${right} ${last ? seam : seam - curve}`,
        last ? "" : `A ${curve} ${curve} 0 0 0 ${end} ${seam}`,
      ].join(" ");
      const panelLeft = panel.left - box.left + half;
      const panelRight = panel.right - box.left - half;
      const panelBottom = panel.bottom - box.top - half;
      const panelRadius = parseFloat(panelStyle.getPropertyValue("--stage-radius")) - half;
      const perimeter = [
        outline,
        last ? "" : `L ${panelRight - panelRadius} ${seam} A ${panelRadius} ${panelRadius} 0 0 1 ${panelRight} ${seam + panelRadius}`,
        `L ${panelRight} ${panelBottom - panelRadius}`,
        `A ${panelRadius} ${panelRadius} 0 0 1 ${panelRight - panelRadius} ${panelBottom}`,
        `L ${panelLeft + panelRadius} ${panelBottom}`,
        `A ${panelRadius} ${panelRadius} 0 0 1 ${panelLeft} ${panelBottom - panelRadius}`,
        `L ${panelLeft} ${first ? seam : seam + panelRadius}`,
        first ? "" : `A ${panelRadius} ${panelRadius} 0 0 1 ${panelLeft + panelRadius} ${seam}`,
        "Z",
      ].join(" ");
      const offset = panel.left - box.left;
      const width = panel.width;
      const height = panel.bottom - box.top;

      svg.setAttribute("viewBox", `${offset} 0 ${width} ${height}`);
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      svg.style.left = `${offset - parseFloat(style.borderLeftWidth)}px`;
      svg.style.top = `${-parseFloat(style.borderTopWidth)}px`;
      // The tab fill closes below the seam; the stroke encloses the catalog.
      // 标签填色在接缝下方闭合，描边环绕完整目录。
      fillRef.current.setAttribute("d", `${outline} L ${end} ${seam + half} L ${start} ${seam + half} Z`);
      strokeRef.current.setAttribute("d", perimeter);
      strokeRef.current.setAttribute("stroke-width", border);
      const inset = half + 1;
      const innerRadius = Math.max(0, radius - inset);
      highlightRef.current.setAttribute("d", [
        `M ${left + inset} ${top + radius}`,
        `A ${innerRadius} ${innerRadius} 0 0 1 ${left + radius} ${top + inset}`,
        `L ${right - radius} ${top + inset}`,
        `A ${innerRadius} ${innerRadius} 0 0 1 ${right - inset} ${top + radius}`,
      ].join(" "));
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(tab);
    observer.observe(stage);
    window.addEventListener("resize", draw);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [first, last, lang]);

  return (
    <svg ref={svgRef} className={styles.seriesOutline} aria-hidden="true" focusable="false">
      <path ref={fillRef} className={styles.seriesOutlineFill} />
      <path ref={strokeRef} className={styles.seriesOutlineStroke} vectorEffect="non-scaling-stroke" />
      <path ref={highlightRef} className={styles.seriesOutlineHighlight} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * ProductPanel — three-series product catalog stage.
 * 产品目录：以 Dev Boards / Add-ons / Gadgets 三大系列为主舞台。
 */
export function ProductPanel({ showTitle = true } = {}) {
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
  // Add-ons / Gadgets are flat lists (no second-level grouping);
  // Dev Boards keep their chip subcategories.
  // Add-ons / Gadgets 为平铺清单（无二级分类），Dev Boards 保留子分类。
  const flatItems = currentCategory.items ?? [];
  const allItems = subs.length
    ? subs.flatMap((s) =>
        (s.items ?? []).map((item) => ({
          ...item,
          subId: s.id,
          subLabel: isEn ? s.labelEn : s.labelZh || s.labelEn,
        }))
      )
    : flatItems;
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
  // Move focus and selection together within the series tablist.
  // 在系列标签组内同步移动焦点与选中项。
  const handleSeriesKeyDown = (event, i) => {
    let next;
    switch (event.key) {
      case "ArrowLeft": next = (i - 1 + categories.length) % categories.length; break;
      case "ArrowRight": next = (i + 1) % categories.length; break;
      case "Home": next = 0; break;
      case "End": next = categories.length - 1; break;
      default: return;
    }
    event.preventDefault();
    handleSeriesClick(next);
    event.currentTarget.parentElement.children[next].focus({ preventScroll: true });
  };

  const itemDesc = (it) => (isEn ? it.descEn : it.desc) ?? it.descEn ?? it.desc ?? "";

  return (
    <section
      className={styles.panel}
      aria-labelledby="product-catalog-title"
      style={{ "--series-tone": presentation.tone, "--series-ink": presentation.ink }}
    >
      <header className={`${styles.header} ${showTitle ? "" : styles.headerCompact}`}>
        {showTitle ? (
          <Glow as="h2" id="product-catalog-title" className={`home-type-title ${styles.title}`}>
            {t.products.title}
          </Glow>
        ) : <h2 id="product-catalog-title" className="sr-only">{t.products.title}</h2>}
        <p className={`home-type-body ${styles.lead}`}>
          {isEn
            ? "Three product families — core boards, expansion add-ons, and ready-to-use gadgets — one XIAO ecosystem."
            : "三大产品系列——核心开发板、扩展模块与开箱即用设备——同属一个 XIAO 生态。"}
        </p>
      </header>

      {/* Series tabs share the catalog surface. / 系列标签与目录共用表面。 */}
      <div className={styles.seriesGrid} role="tablist" aria-label={isEn ? "Product series" : "产品系列"}>
        {categories.map((category, i) => {
          const meta = SERIES_PRESENTATION[category.id];
          const active = i === activeCat;
          const count = seriesCount(category);
          return (
            <button
              key={category.id}
              id={`series-tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="series-stage"
              tabIndex={active ? 0 : -1}
              className={`${styles.seriesCard} ${active ? styles.seriesCardActive : ""}`}
              style={{ "--series-tone": meta?.tone || "var(--theme-blue)", "--series-ink": meta?.ink || "var(--theme-blue)" }}
              onClick={() => handleSeriesClick(i)}
              onKeyDown={(event) => handleSeriesKeyDown(event, i)}
            >
              {active && <SeriesTabOutline first={i === 0} last={i === categories.length - 1} lang={lang} />}
              <div className={styles.seriesCover}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase(meta.cover)} alt="" loading="lazy" decoding="async" />
              </div>
              <div className={styles.seriesCopy}>
                <span className={styles.seriesEyebrow}>{L(meta.eyebrow)}</span>
                <strong className={`home-type-subtitle ${styles.seriesName}`}>
                  {seriesTitle(category).split(" ").map((word, w) => (
                    <Fragment key={word}>
                      {w > 0 && " "}
                      <span className={styles.seriesWord}>{word}</span>
                    </Fragment>
                  ))}
                </strong>
                <span className={styles.seriesCount}>
                  {isEn ? `${count} products` : `${count} 款产品`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active series stage, labelled by the active series tab */}
      <div
        id="series-stage"
        role="tabpanel"
        aria-labelledby={`series-tab-${currentCategory.id}`}
        tabIndex={0}
        className={styles.stage}
      >
        <div className={styles.stageHeader}>
          <div className={styles.stageIntro} key={currentCategory.id}>
            <div className={styles.stageText}>
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
            </div>
          </div>

          {subs.length > 0 && (
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
          )}
        </div>

        {displayItems.length === 0 ? (
          <div className={styles.empty}>
            {isEn ? "No product currently listed in this category." : "该分类暂无在售产品，敬请期待。"}
          </div>
        ) : (
          <CardPeek
            key={`${currentCategory.id}-${activeSub}`}
            renderPeek={(index) => {
              const item = displayItems[index];
              return (
                <CardPeekContent
                  image={item.img ? withBase(item.img) : undefined}
                  title={item.title}
                  description={itemDesc(item) || item.subLabel || undefined}
                />
              );
            }}
          >
            <div className={`${styles.productList} ${styles.productListDense}`}>
              {displayItems.map((item, index) => {
                // Add-ons / Gadgets carry their own wiki link; boards fall back to BOARD_HARDWARE.
                // Add-ons / Gadgets 自带 wiki 链接，开发板回退到 BOARD_HARDWARE。
                const wiki = item.wiki ?? BOARD_HARDWARE[item.title]?.wiki;
                const desc = itemDesc(item) || item.subLabel || "";
                return (
                  <article
                    key={`${currentCategory.id}-${item.title}-${index}`}
                    className={styles.productRow}
                    data-card-index={index}
                    tabIndex={0}
                  >
                    <div className={styles.thumb}>
                      {item.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={withBase(item.img)} alt="" loading="lazy" decoding="async" />
                      ) : null}
                    </div>
                    <div className={styles.productBody}>
                      <h3 className={`home-type-subtitle ${styles.productName}`}>{item.title}</h3>
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
                        {item.link ? (
                          <a
                            className={`${styles.buy} home-type-action home-filled-action`}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {isEn ? "Buy" : "购买"}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </CardPeek>
        )}
      </div>
    </section>
  );
}
