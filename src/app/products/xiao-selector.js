"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import { PRODUCT_CATALOG } from "./catalog";
import { BOARD_HARDWARE, BOARD_SPECS, FILTER_GROUPS, HARDWARE_FIELDS, emptySelection } from "./board-specs.mjs";
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
const DEFAULT_OPEN_GROUPS = ["connectivity", "variant", "platform", "sensors", "power", "pinHeader", "format"];

/**
 * Board list built from the shared catalog plus the spec / hardware matrices.
 * 由共享产品目录、规格矩阵与硬件摘要组合出的开发板列表。
 */
const BOARDS = PRODUCT_CATALOG.find((c) => c.id === "dev-boards").subcategories.flatMap((sub) =>
  sub.items.map((item) => ({
    id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: item.title,
    img: withBase(item.img),
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
    tabFilter: "Filter by Specs",
    tabHelp: "Help Me Choose",
    helpTitle: "Help Me Choose",
    helpBody: "Guided selection by project needs is coming soon. Filter by Specs is available now.",
    helpBack: "Back to Filter by Specs",
    filters: "Filters",
    searchPlaceholder: "Search board or MCU, e.g. nRF54, S3",
    reset: "Reset",
    moreFilters: "More Filters",
    lessFilters: "Fewer Filters",
    purchase: "Purchase Options",
    showing: (n, total) => `Showing ${n} of ${total} boards`,
    clearAll: "Clear all",
    cards: "Cards",
    table: "Table",
    compare: "Compare",
    compareN: (n) => `Compare (${n})`,
    emptyTitle: "No boards match these filters",
    emptyHint: "Remove one condition to see results again:",
    removeFor: (label, n) => `Remove ${label} → ${n} boards`,
    buy: "Buy",
    wiki: "Wiki",
    addCompare: "Add to compare",
    inCompare: "In compare",
    compareTitle: "Compare boards",
    diffOnly: "Only show differences",
    clear: "Clear",
    close: "Close",
    maxCompare: `Compare up to ${MAX_COMPARE} boards at once`,
    minCompare: "Pick at least 2 boards to compare",
    board: "Board",
    wireless: "Wireless",
    sensors: "Sensors",
    power: "Power",
    io: "I/O",
    dev: "Dev Platform",
    purchaseCol: "Purchase",
    actions: "Actions",
    none: "None",
    applyFilters: (n) => (n ? `Show ${n} boards` : "No matches"),
  },
  zh: {
    title: "XIAO Selector",
    intro: "按无线能力、芯片平台、传感器、接口与采购形式快速缩小 XIAO 产品范围。",
    tabFilter: "按规格筛选",
    tabHelp: "帮我选型",
    helpTitle: "帮我选型",
    helpBody: "按项目需求一步步辅助选型即将上线，当前可直接使用「按规格筛选」。",
    helpBack: "回到按规格筛选",
    filters: "筛选条件",
    searchPlaceholder: "搜索型号或主控，如 nRF54、S3",
    reset: "重置",
    moreFilters: "更多筛选",
    lessFilters: "收起筛选",
    purchase: "采购选项",
    showing: (n, total) => `显示 ${n} / ${total} 款`,
    clearAll: "清空全部",
    cards: "卡片",
    table: "表格",
    compare: "对比",
    compareN: (n) => `对比 (${n})`,
    emptyTitle: "没有符合条件的板子",
    emptyHint: "移除一个条件即可重新看到结果：",
    removeFor: (label, n) => `移除 ${label} → ${n} 款`,
    buy: "购买",
    wiki: "Wiki",
    addCompare: "加入对比",
    inCompare: "已加入",
    compareTitle: "产品对比",
    diffOnly: "只看差异",
    clear: "清空",
    close: "关闭",
    maxCompare: `最多同时对比 ${MAX_COMPARE} 款`,
    minCompare: "至少选择 2 款才能对比",
    board: "板子",
    wireless: "无线",
    sensors: "传感器",
    power: "供电",
    io: "接口",
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

  const [mode, setMode] = useState("filter");
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

  const labelsFor = (board, groupId) =>
    (board.specs[groupId] ?? []).map((id) => L(OPTION_LABEL[`${groupId}:${id}`]) || id);

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
        <div className={styles.sectionDivider}>
          <span>{t.purchase}</span>
        </div>
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
    const isPlus = board.specs.variant?.includes("plus");
    return (
      <article key={board.id} className={`${styles.card} ${inCompare ? styles.cardSelected : ""}`}>
        <div className={styles.cardVisual}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={board.img} alt={board.name} loading="lazy" decoding="async" />
          {isPlus && <span className={styles.plusBadge}>Plus</span>}
        </div>
        <div className={styles.cardBody}>
          <h3 className="home-type-subtitle">{board.name}</h3>
          <p className={styles.cardMcu}>{board.hardware.mcu} · {board.hardware.core}</p>
          <div className={styles.cardTags}>
            {renderTags(board, "connectivity", t.none)}
            {board.specs.sensors?.length ? renderTags(board, "sensors") : null}
          </div>
          <dl className={styles.specRow}>
            <div><dt>Flash</dt><dd>{board.hardware.flash}</dd></div>
            <div><dt>RAM</dt><dd>{board.hardware.ram}</dd></div>
            <div><dt>GPIO</dt><dd>{board.hardware.gpio}</dd></div>
          </dl>
        </div>
        <div className={styles.cardFooter}>
          <a className={`${styles.primaryBtn} home-type-action home-filled-action`} href={board.link} target="_blank" rel="noopener noreferrer">{t.buy}</a>
          <a className={styles.ghostBtn} href={board.hardware.wiki} target="_blank" rel="noopener noreferrer">{t.wiki}</a>
          <label className={`${styles.compareToggle} ${inCompare ? styles.compareToggleOn : ""}`}>
            <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(board.id)} />
            <span>{inCompare ? t.inCompare : t.addCompare}</span>
          </label>
        </div>
      </article>
    );
  };

  const renderTable = () => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thCompare} aria-label={t.compare} />
            <th>{t.board}</th>
            <th>{L(HARDWARE_FIELDS[0].label)}</th>
            <th>{L(HARDWARE_FIELDS[1].label)}</th>
            <th>{L(HARDWARE_FIELDS[2].label)} / {L(HARDWARE_FIELDS[3].label)}</th>
            <th>GPIO</th>
            <th>{t.wireless}</th>
            <th>{t.sensors}</th>
            <th>{t.power}</th>
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
                <td className={styles.thCompare}>
                  <input type="checkbox" checked={inCompare} onChange={() => toggleCompare(board.id)} aria-label={`${t.compare} ${board.name}`} />
                </td>
                <td>
                  <div className={styles.tableBoard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={board.img} alt="" loading="lazy" decoding="async" />
                    <div>
                      <strong>{board.name}</strong>
                      {board.specs.variant?.includes("plus") && <span className={styles.plusBadgeInline}>Plus</span>}
                    </div>
                  </div>
                </td>
                <td>{board.hardware.mcu}</td>
                <td className={styles.nowrap}>{board.hardware.core}</td>
                <td className={styles.nowrap}>{board.hardware.flash}<br /><span className={styles.muted}>{board.hardware.ram}</span></td>
                <td>{board.hardware.gpio}</td>
                <td>{renderTags(board, "connectivity")}</td>
                <td>{renderTags(board, "sensors")}</td>
                <td>{renderTags(board, "power")}</td>
                <td>{renderTags(board, "io")}</td>
                <td>{renderTags(board, "dev")}</td>
                <td>
                  <span className={styles.stack}>
                    {renderTags(board, "pinHeader")}
                    {renderTags(board, "format")}
                  </span>
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

  const compareRows = useMemo(() => {
    if (!compareBoards.length) return [];
    const rows = [
      ...HARDWARE_FIELDS.map((f) => ({
        id: f.id,
        label: L(f.label),
        values: compareBoards.map((b) => String(b.hardware[f.id] ?? "")),
      })),
      ...FILTER_GROUPS.map((g) => ({
        id: g.id,
        label: L(g.label),
        values: compareBoards.map((b) => labelsFor(b, g.id).join(", ") || t.none),
      })),
    ];
    return rows.map((row) => ({ ...row, differs: new Set(row.values).size > 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare, lang]);

  return (
    <div className={styles.selector} id="smart-selector">
      <div className={styles.intro}>
        <Glow as="h2" className="home-type-title">{t.title}</Glow>
        <p className="home-type-body">{t.intro}</p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={mode === "filter"} className={`${styles.tab} ${mode === "filter" ? styles.tabActive : ""}`} onClick={() => setMode("filter")}>
          {t.tabFilter}
        </button>
        <button type="button" role="tab" aria-selected={mode === "help"} className={`${styles.tab} ${mode === "help" ? styles.tabActive : ""}`} onClick={() => setMode("help")}>
          {t.tabHelp}
        </button>
      </div>

      {mode === "help" ? (
        <section className={styles.placeholder}>
          <h3 className="home-type-subtitle">{t.helpTitle}</h3>
          <p className="home-type-body">{t.helpBody}</p>
          <button type="button" className={`${styles.primaryBtn} home-type-action home-filled-action`} onClick={() => setMode("filter")}>
            {t.helpBack}
          </button>
        </section>
      ) : (
        <section className={styles.workbench} id="selector-workspace">
          {drawerOpen && <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />}
          {sidebar}

          <div className={styles.results}>
            <div className={styles.resultsHead}>
              <div className={styles.resultsTitle}>{t.showing(results.length, searched.length)}</div>
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
        </section>
      )}

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
            <div className={styles.compareScroll}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th />
                    {compareBoards.map((b) => (
                      <th key={b.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.img} alt="" />
                        <span>{b.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows
                    .filter((row) => !diffOnly || row.differs)
                    .map((row) => (
                      <tr key={row.id} className={row.differs ? styles.rowDiff : ""}>
                        <th>{row.label}</th>
                        {row.values.map((v, i) => <td key={i}>{v}</td>)}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
