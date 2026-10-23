"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import { PRODUCT_CATALOG, SELECTOR_IMAGES } from "./catalog";
import { BOARD_HARDWARE, BOARD_SPECS, FILTER_GROUPS, HARDWARE_FIELDS, emptySelection } from "./board-specs.mjs";
import { buildComparisonGroups } from "./board-comparison.mjs";
import { getWirelessProtocols } from "./wireless-protocols.mjs";
import { getSensorIcons } from "./sensor-icons.mjs";
import {
  activeFilters,
  facetCounts,
  filterBoards,
  removalSuggestions,
  searchBoards,
  toggleSelection,
} from "./spec-filter.mjs";
import styles from "./xiao-selector.module.css";

const MAX_COMPARE = 4;
const TABLE_FALLBACK_ROWS = 7;
const CARD_VISIBLE_ROWS = 1.5;
const DESKTOP_QUERY = "(min-width: 1024px)";

const DEFAULT_OPEN_GROUPS = ["platform", "connectivity", "sensors", "antenna", "packaging"];

/**
 * Board list built from the shared catalog plus the spec / hardware matrices.
 * 由共享产品目录、规格矩阵与硬件摘要组合出的开发板列表。
 */
const BOARDS = PRODUCT_CATALOG.find((c) => c.id === "dev-boards").subcategories.flatMap((sub) =>
  sub.items.map((item) => ({
    id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: item.title,
    img: withBase(SELECTOR_IMAGES[item.title] ?? item.img),
    link: item.link,
    desc: item.descEn || item.desc || "",
    specs: BOARD_SPECS[item.title] ?? {},
    hardware: BOARD_HARDWARE[item.title] ?? {},
  }))
);

const OPTION_LABEL = Object.fromEntries(
  FILTER_GROUPS.flatMap((g) => g.options.map((o) => [`${g.id}:${o.id}`, o.label]))
);

const TEXT = {
  en: {
    title: "XIAO Selector",
    intro: "Narrow down XIAO boards by connectivity, platform, sensors, interfaces and purchase options.",
    filters: "Filters",
    searchPlaceholder: "Search board or MCU, e.g. nRF54, S3",
    reset: "Reset",
    moreFilters: "More Filters",
    lessFilters: "Fewer Filters",
    showing: (n, total) => `Showing ${n} of ${total} boards`,
    clearAll: "Clear all",
    cards: "Cards",
    table: "Table",
    scrollHint: "Scroll sideways for more specs →",
    compare: "Compare",
    compareN: (n) => `Compare (${n})`,
    emptyTitle: "No boards match these filters",
    emptyHint: "Remove one condition to see results again:",
    removeFor: (label, n) => `Remove ${label} → ${n} boards`,
    buy: "Buy",
    wiki: "Wiki",
    addCompare: "Compare",
    inCompare: "Added",
    compareTitle: "Compare boards",
    diffOnly: "Only show differences",
    compareReference: "Reference",
    compareLegend: "Green highlights differences from the first board",
    compareMissing: "— Not available / not listed",
    specifications: "Specifications",
    noDifferences: "These boards have the same listed specifications.",
    clear: "Clear",
    close: "Close",
    maxCompare: `Compare up to ${MAX_COMPARE} boards at once`,
    minCompare: "Pick at least 2 boards to compare",
    board: "Board",
    wireless: "Wireless",
    wirelessBadges: (labels) => `Wireless: ${labels.join(", ")}`,
    sensorBadges: (labels) => `Onboard sensors: ${labels.join(", ")}`,
    sensors: "Sensors",
    io: "Highlighted IOs",
    dev: "Dev Platform",
    purchaseCol: "Purchase",
    actions: "Actions",
    none: "None",
    applyFilters: (n) => (n ? `Show ${n} boards` : "No matches"),
  },
  zh: {
    title: "XIAO Selector",
    intro: "按无线能力、芯片平台、传感器、接口与采购形式快速缩小 XIAO 产品范围。",
    filters: "筛选条件",
    searchPlaceholder: "搜索型号或主控，如 nRF54、S3",
    reset: "重置",
    moreFilters: "更多筛选",
    lessFilters: "收起筛选",
    showing: (n, total) => `显示 ${n} / ${total} 款`,
    clearAll: "清空全部",
    cards: "卡片",
    table: "表格",
    scrollHint: "左右滑动查看更多参数 →",
    compare: "对比",
    compareN: (n) => `对比 (${n})`,
    emptyTitle: "没有符合条件的板子",
    emptyHint: "移除一个条件即可重新看到结果：",
    removeFor: (label, n) => `移除 ${label} → ${n} 款`,
    buy: "购买",
    wiki: "Wiki",
    addCompare: "对比",
    inCompare: "已加入",
    compareTitle: "产品对比",
    diffOnly: "只看差异",
    compareReference: "对比基准",
    compareLegend: "绿色标出与首款不同的配置",
    compareMissing: "— 不具备此项或未列出",
    specifications: "参数",
    noDifferences: "这些型号已列出的参数相同。",
    clear: "清空",
    close: "关闭",
    maxCompare: `最多同时对比 ${MAX_COMPARE} 款`,
    minCompare: "至少选择 2 款才能对比",
    board: "板子",
    wireless: "无线",
    wirelessBadges: (labels) => `\u65e0\u7ebf\uff1a${labels.join("\u3001")}`,
    sensorBadges: (labels) => `\u677f\u8f7d\u4f20\u611f\u5668\uff1a${labels.join("\u3001")}`,
    sensors: "传感器",
    io: "重点接口",
    dev: "开发平台",
    purchaseCol: "采购",
    actions: "操作",
    none: "无",
    applyFilters: (n) => (n ? `查看 ${n} 款` : "无匹配"),
  },
};

export function XiaoSelector() {
  const { lang } = useLang();
  const t = TEXT[lang] ?? TEXT.en;
  const L = (label) => (label && (label[lang] || label.en)) || "";

  const [selection, setSelection] = useState(emptySelection);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("cards");
  const [openGroups, setOpenGroups] = useState(() => new Set(DEFAULT_OPEN_GROUPS));
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compare, setCompare] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [diffOnly, setDiffOnly] = useState(true);
  const [toast, setToast] = useState(null);
  const resultsBodyRef = useRef(null);
  const cardsHeightRef = useRef(0);
  const toastTimer = useRef(null);

  const showToast = (text) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  const searched = useMemo(() => searchBoards(BOARDS, query), [query]);
  const results = useMemo(() => filterBoards(searched, selection), [searched, selection]);
  const counts = useMemo(() => facetCounts(searched, selection), [searched, selection]);
  const chips = useMemo(() => activeFilters(selection), [selection]);
  const suggestions = useMemo(
    () => (results.length === 0 && chips.length ? removalSuggestions(searched, selection) : []),
    [results.length, chips.length, searched, selection]
  );

  const defaultGroups = FILTER_GROUPS.filter((g) => g.section === "default");
  const moreGroups = FILTER_GROUPS.filter((g) => g.section === "more");
  const purchaseGroups = FILTER_GROUPS.filter((g) => g.section === "purchase");
  const moreSelected = moreGroups.reduce((n, g) => n + (selection[g.id]?.length ?? 0), 0);

  const toggleGroupOpen = (id) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleOption = (group, optionId) => setSelection((prev) => toggleSelection(prev, group, optionId));

  const resetAll = () => {
    setSelection(emptySelection());
    setQuery("");
  };

  const toggleCompare = (id) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        showToast(t.maxCompare);
        return prev;
      }
      return [...prev, id];
    });
  };

  const openCompare = () => {
    if (compare.length < 2) {
      showToast(t.minCompare);
      return;
    }
    setCompareOpen(true);
  };

  const compareBoards = compare.map((id) => BOARDS.find((b) => b.id === id)).filter(Boolean);

  const isHit = (groupId, optionId) => (selection[groupId] ?? []).includes(optionId);

  const renderTags = (board, groupId, emptyText) => {
    const ids = board.specs[groupId] ?? [];
    if (!ids.length) return <span className={styles.muted}>{emptyText ?? t.none}</span>;
    return (
      <span className={styles.tagRow}>
        {ids.map((id) => (
          <span key={id} className={`${styles.tag} ${isHit(groupId, id) ? styles.tagHit : ""}`}>
            {L(OPTION_LABEL[`${groupId}:${id}`]) || id}
          </span>
        ))}
      </span>
    );
  };

  const renderGroup = (group) => {
    const open = openGroups.has(group.id);
    const selectedCount = selection[group.id]?.length ?? 0;
    return (
      <div key={group.id} className={styles.group}>
        <button
          type="button"
          className={styles.groupHead}
          onClick={() => toggleGroupOpen(group.id)}
          aria-expanded={open}
        >
          <span className={styles.groupTitle}>{L(group.label)}</span>
          {selectedCount > 0 && <span className={styles.groupBadge}>{selectedCount}</span>}
          <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className={styles.optionList}>
            {group.options.map((option) => {
              const checked = isHit(group.id, option.id);
              const count = counts[group.id]?.[option.id] ?? 0;
              const disabled = !checked && count === 0;
              return (
                <label
                  key={option.id}
                  className={`${styles.option} ${checked ? styles.optionChecked : ""} ${disabled ? styles.optionDisabled : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(group, option.id)}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionText}>
                    <span>{L(option.label)}</span>
                    {option.note && <span className={styles.optionNote}>{L(option.note)}</span>}
                  </span>
                  <span className={styles.optionCount}>{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const sidebar = (
    <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`} aria-label={t.filters}>
      <div className={styles.sidebarHead}>
        <strong className={styles.sidebarTitle}>{t.filters}</strong>
        <button type="button" className={styles.linkBtn} onClick={resetAll}>{t.reset}</button>
        <button type="button" className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label={t.close}>×</button>
      </div>
      <div className={styles.search}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
        />
      </div>
      <div className={styles.groups}>
        {defaultGroups.map(renderGroup)}
        <button
          type="button"
          className={styles.moreToggle}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span>{moreOpen ? "−" : "+"}</span>
          <span>{moreOpen ? t.lessFilters : t.moreFilters}</span>
          {!moreOpen && moreSelected > 0 && <span className={styles.groupBadge}>{moreSelected}</span>}
        </button>
        {moreOpen && moreGroups.map(renderGroup)}
        {purchaseGroups.map(renderGroup)}
      </div>
      <div className={styles.drawerFooter}>
        <button type="button" className={styles.primaryBtn} onClick={() => setDrawerOpen(false)}>
          {t.applyFilters(results.length)}
        </button>
      </div>
    </aside>
  );

  const renderCard = (board) => {
    const inCompare = compare.includes(board.id);
    const isPlus = board.specs.packaging?.includes("plus");
    const protocols = getWirelessProtocols(board.specs.connectivity);
    const sensorIcons = getSensorIcons(board.specs.sensors);
    return (
      <article key={board.id} className={`${styles.card} ${inCompare ? styles.cardSelected : ""}`}>
        <div className={styles.cardVisual}>
          <div className={styles.cardBadgeBand}>
            {isPlus && (
              <div className={styles.cardBadges}>
                <span className={styles.plusBadge}>Plus</span>
              </div>
            )}
          </div>
          <div className={styles.cardImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={board.img} alt={board.name} loading="lazy" decoding="async" />
          </div>
        </div>
        <div className={styles.cardBody}>
          <h3 className="home-type-subtitle">{board.name}</h3>
          <p className={styles.cardMcu}>{board.hardware.mcu} · {board.hardware.core}</p>
          {protocols.length > 0 || sensorIcons.length > 0 ? (
            <div className={styles.protocolBadges}>
              {protocols.length > 0 && (
                <span
                  className={styles.badgeGroup}
                  role="group"
                  aria-label={t.wirelessBadges(protocols.map(({ id }) => L(OPTION_LABEL[`connectivity:${id}`])))}
                >
                  {protocols.map(({ id, label, color, viewBox, path, fillRule }) => (
                    <span
                      key={id}
                      className={`${styles.protocolBadge} ${isHit("connectivity", id) ? styles.protocolBadgeHit : ""}`}
                      role="img"
                      aria-label={label}
                      data-tip={label}
                      style={{ backgroundColor: color }}
                    >
                      <svg width={id === "wifi" ? "23" : "16"} height="16" viewBox={viewBox} fill="currentColor" aria-hidden="true" focusable="false">
                        <path d={path} fillRule={fillRule} />
                      </svg>
                    </span>
                  ))}
                </span>
              )}
              {sensorIcons.length > 0 && (
                <span
                  className={styles.badgeGroup}
                  role="group"
                  aria-label={t.sensorBadges(sensorIcons.map(({ id }) => L(OPTION_LABEL[`sensors:${id}`])))}
                >
                  {sensorIcons.map(({ id, path }) => {
                    const label = L(OPTION_LABEL[`sensors:${id}`]) || id;
                    return (
                      <span
                        key={id}
                        className={`${styles.sensorBadge} ${isHit("sensors", id) ? styles.protocolBadgeHit : ""}`}
                        role="img"
                        aria-label={label}
                        data-tip={label}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                          <path d={path} />
                        </svg>
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          ) : null}
          <dl className={styles.specRow}>
            <div><dt>Flash</dt><dd>{board.hardware.flash}</dd></div>
            <div><dt>RAM</dt><dd>{board.hardware.ram}</dd></div>
            <div><dt>GPIO</dt><dd>{board.hardware.gpio}</dd></div>
          </dl>
        </div>
        <div className={styles.cardFooter}>
          <label className={`${styles.compareToggle} ${inCompare ? styles.compareToggleOn : ""}`}>
            <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(board.id)} />
            <span>{inCompare ? t.inCompare : `＋ ${t.addCompare}`}</span>
          </label>
          <div className={styles.footerActions}>
            <a className={`${styles.primaryBtn} home-type-action home-filled-action home-primary-cta`} href={board.link} target="_blank" rel="noopener noreferrer">{t.buy}</a>
            <a className={styles.ghostBtn} href={board.hardware.wiki} target="_blank" rel="noopener noreferrer">{t.wiki}</a>
          </div>
        </div>
      </article>
    );
  };

  const renderTable = () => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={`${styles.thCompare} ${styles.stickyCol}`} aria-label={t.compare} />
            <th className={`${styles.stickyCol} ${styles.stickyBoard}`}>{t.board}</th>
            <th>{L(HARDWARE_FIELDS[0].label)}</th>
            <th>{L(HARDWARE_FIELDS[1].label)}</th>
            <th>{L(HARDWARE_FIELDS[2].label)} / {L(HARDWARE_FIELDS[3].label)}</th>
            <th>GPIO</th>
            <th>{t.wireless}</th>
            <th>{t.sensors}</th>
            <th>{t.io}</th>
            <th>{t.dev}</th>
            <th>{t.purchaseCol}</th>
            <th>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((board) => {
            const inCompare = compare.includes(board.id);
            return (
              <tr key={board.id} className={inCompare ? styles.rowSelected : ""}>
                <td className={`${styles.thCompare} ${styles.stickyCol}`}>
                  <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(board.id)} aria-label={`${t.compare} ${board.name}`} />
                </td>
                <td className={`${styles.stickyCol} ${styles.stickyBoard}`}>
                  <div className={styles.tableBoard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={board.img} alt="" loading="lazy" decoding="async" />
                    <div>
                      <strong>{board.name}</strong>
                    </div>
                  </div>
                </td>
                <td>{board.hardware.mcu}</td>
                <td className={styles.nowrap}>{board.hardware.core}</td>
                <td className={styles.nowrap}>{board.hardware.flash}<br /><span className={styles.muted}>{board.hardware.ram}</span></td>
                <td>{board.hardware.gpio}</td>
                <td>{renderTags(board, "connectivity")}</td>
                <td>{renderTags(board, "sensors")}</td>
                <td>{renderTags(board, "io")}</td>
                <td>{renderTags(board, "dev")}</td>
                <td>
                  {renderTags(board, "packaging")}
                </td>
                <td>
                  <span className={styles.tableActions}>
                    <a className={styles.miniBtn} href={board.link} target="_blank" rel="noopener noreferrer">{t.buy}</a>
                    <a className={styles.miniBtnGhost} href={board.hardware.wiki} target="_blank" rel="noopener noreferrer">{t.wiki}</a>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Size the results panel to one and a half card rows on desktop; the table reuses that height.
  // 桌面端将结果区高度设为一行半卡片，表格沿用同一高度。
  useEffect(() => {
    const body = resultsBodyRef.current;
    if (!body) return undefined;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const measure = () => {
      if (!desktop.matches) {
        body.style.removeProperty("height");
        return;
      }
      let height = 0;
      if (view === "table" && cardsHeightRef.current) {
        height = cardsHeightRef.current;
      } else if (view === "table") {
        const wrap = body.querySelector("table")?.parentElement;
        const rows = body.querySelectorAll("tbody tr");
        const last = rows[Math.min(TABLE_FALLBACK_ROWS, rows.length) - 1];
        if (wrap && last) {
          const wrapTop = wrap.getBoundingClientRect().top - wrap.scrollTop;
          height = last.getBoundingClientRect().bottom - wrapTop + wrap.clientTop * 2;
        }
      } else {
        const card = body.querySelector("article");
        if (card) {
          const gap = parseFloat(getComputedStyle(card.parentElement).rowGap) || 0;
          const style = getComputedStyle(body);
          height = card.offsetHeight * CARD_VISIBLE_ROWS + gap + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          cardsHeightRef.current = height;
        }
      }
      if (height > 0) body.style.height = `${Math.round(height)}px`;
      else body.style.removeProperty("height");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body.firstElementChild ?? body);
    desktop.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [view, results, lang]);

  const comparisonGroups = buildComparisonGroups(compareBoards, lang, diffOnly);

  return (
    <div className={styles.selector} id="smart-selector">
      <div className={styles.intro}>
        <Glow as="h2" className="home-type-title">{t.title}</Glow>
        <p className="home-type-body">{t.intro}</p>
      </div>

      <section className={styles.workbench} id="selector-workspace">
        {drawerOpen && <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />}
        {sidebar}

        <div className={styles.results}>
          <div className={styles.resultsHead}>
            <div className={styles.resultsTitle}>
              {t.showing(results.length, searched.length)}
              {view === "table" && results.length > 0 ? <span className={styles.scrollHint}>{t.scrollHint}</span> : null}
            </div>
            <div className={styles.resultsTools}>
              <button type="button" className={styles.filtersBtn} onClick={() => setDrawerOpen(true)}>
                {t.filters}{chips.length ? ` (${chips.length})` : ""}
              </button>
              <div className={styles.viewToggle} role="group">
                <button type="button" className={`${styles.viewBtn} ${view === "cards" ? styles.viewBtnActive : ""}`} onClick={() => setView("cards")} aria-pressed={view === "cards"}>
                  {t.cards}
                </button>
                <button type="button" className={`${styles.viewBtn} ${view === "table" ? styles.viewBtnActive : ""}`} onClick={() => setView("table")} aria-pressed={view === "table"}>
                  {t.table}
                </button>
              </div>
              <button type="button" className={`${styles.compareBtn} ${compare.length >= 2 ? styles.compareBtnReady : ""}`} onClick={openCompare}>
                {compare.length ? t.compareN(compare.length) : t.compare}
              </button>
            </div>
          </div>

          {(chips.length > 0 || query) && (
            <div className={styles.chipBar}>
              {query && (
                <button type="button" className={styles.chip} onClick={() => setQuery("")}>
                  <span className={styles.chipGroup}>Search</span>
                  <span>{query}</span>
                  <span className={styles.chipX}>×</span>
                </button>
              )}
              {chips.map(({ group, option }) => (
                <button key={`${group.id}:${option.id}`} type="button" className={styles.chip} onClick={() => toggleOption(group, option.id)}>
                  <span className={styles.chipGroup}>{L(group.label)}</span>
                  <span>{L(option.label)}</span>
                  <span className={styles.chipX}>×</span>
                </button>
              ))}
              <button type="button" className={styles.linkBtn} onClick={resetAll}>{t.clearAll}</button>
            </div>
          )}

          <div ref={resultsBodyRef} className={`${styles.resultsBody} ${view === "table" && results.length > 0 ? styles.resultsBodyTable : ""}`}>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <strong>{t.emptyTitle}</strong>
                {suggestions.length > 0 && (
                  <>
                    <p>{t.emptyHint}</p>
                    <div className={styles.suggestions}>
                      {suggestions.slice(0, 4).map((s) => {
                        const group = FILTER_GROUPS.find((g) => g.id === s.groupId);
                        const label = L(OPTION_LABEL[`${s.groupId}:${s.optionId}`]);
                        return (
                          <button key={`${s.groupId}:${s.optionId}`} type="button" className={styles.suggestion} onClick={() => toggleOption(group, s.optionId)}>
                            {t.removeFor(label, s.count)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                <button type="button" className={styles.ghostBtn} onClick={resetAll}>{t.reset}</button>
              </div>
            ) : view === "table" ? (
              renderTable()
            ) : (
              <div className={styles.cardGrid}>{results.map(renderCard)}</div>
            )}
          </div>
        </div>
      </section>

      {compare.length > 0 && !compareOpen && (
        <div className={styles.compareBar}>
          <div className={styles.compareItems}>
            {compareBoards.map((b) => (
              <button key={b.id} type="button" className={styles.compareItem} onClick={() => toggleCompare(b.id)} title={t.clear}>
                {b.name} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          <div className={styles.compareActions}>
            <button type="button" className={styles.barGhost} onClick={() => setCompare([])}>{t.clear}</button>
            <button type="button" className={styles.barPrimary} onClick={openCompare}>{t.compareN(compare.length)}</button>
          </div>
        </div>
      )}

      {compareOpen && (
        <div className={styles.modalBackdrop} onClick={(e) => e.target === e.currentTarget && setCompareOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t.compareTitle}>
            <div className={styles.modalHead}>
              <h3>{t.compareTitle}</h3>
              <label className={styles.switch}>
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                <span>{t.diffOnly}</span>
              </label>
              <button type="button" className={styles.closeBtn} onClick={() => setCompareOpen(false)} aria-label={t.close}>×</button>
            </div>
            <div className={styles.compareLegend}>
              <span><i aria-hidden="true" />{t.compareLegend}</span>
              <span>{t.compareMissing}</span>
            </div>
            <div className={styles.compareFrame}>
              <div className={styles.compareScroll} tabIndex={0} role="region" aria-label={t.compareTitle}>
              <table className={styles.compareTable} style={{ "--compare-columns": compareBoards.length }}>
                <colgroup>
                  <col className={styles.compareLabelCol} />
                  {compareBoards.map((b) => <col key={b.id} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t.specifications}</th>
                    {compareBoards.map((b, index) => (
                      <th key={b.id} scope="col">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.img} alt="" />
                        <span>{b.name}</span>
                        {index === 0 && <small className={styles.referenceLabel}>{t.compareReference}</small>}
                      </th>
                    ))}
                  </tr>
                </thead>
                {comparisonGroups.map((group) => (
                  <tbody key={group.id} className={styles.compareGroup}>
                    {group.rows.map((row, rowIndex) => (
                      <tr key={row.id}>
                        {rowIndex === 0 && <th scope="rowgroup" rowSpan={group.rows.length}>{group.label}</th>}
                        {row.cells.map((cell, index) => (
                          <td key={compareBoards[index].id}>
                            <span className={`${styles.compareValue} ${cell.changed ? styles.valueChanged : ""} ${cell.value == null ? styles.valueMissing : ""}`}
                              aria-label={cell.value == null ? `${row.label}: ${t.compareMissing}` : undefined}>
                              {cell.value ?? "—"}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
                {!comparisonGroups.length && <tbody><tr><td colSpan={compareBoards.length + 1} className={styles.compareEmpty}>{t.noDifferences}</td></tr></tbody>}
              </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
