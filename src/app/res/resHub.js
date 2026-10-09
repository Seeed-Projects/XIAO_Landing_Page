"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { ToolPageIntro } from "../tool-page-intro";
import { BoardNav, BoardProfile } from "./BoardPicker";
import CourseCard from "./CourseCard";
import { DesignKit } from "./DesignKit";
import { PreviewDialog } from "./PreviewDialog";
import { ResourceCard } from "./ResourceCard";
import {
  COURSE_GROUPS,
  EXTRAS,
  RESOURCE_PRODUCTS,
  SHARED_RESOURCES,
  boardItems,
  fuzzyScore,
  pickText,
  shortBoardName,
} from "./resources-data.mjs";
import styles from "./res.module.css";

const TYPE_LABEL = {
  course: { en: "Course", zh: "课程" },
  project: { en: "Project", zh: "项目" },
  video: { en: "Video", zh: "视频" },
};

/**
 * Human label for which boards a learning item applies to.
 * 一条学习资源适用于哪些板子的文字说明。
 */
function boardScope(boardIds, zh) {
  if (boardIds.includes("all")) return zh ? "全系列 XIAO" : "All XIAO boards";
  const names = boardIds
    .map((id) => RESOURCE_PRODUCTS.find((board) => board.id === id))
    .filter(Boolean)
    .map((board) => shortBoardName(board.name));
  const shown = names.slice(0, 2).join(" · ");
  return names.length > 2 ? `${shown} +${names.length - 2}` : shown;
}

export function ResHub() {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState(RESOURCE_PRODUCTS[0].id);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);
  const hydrated = useRef(false);
  const active = RESOURCE_PRODUCTS.find((board) => board.id === activeId) || RESOURCE_PRODUCTS[0];
  const searching = query.trim().length > 0;
  const zh = lang === "zh";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("board");
    if (!hydrated.current) {
      hydrated.current = true;
      if (fromUrl && fromUrl !== activeId && RESOURCE_PRODUCTS.some((board) => board.id === fromUrl)) {
        setActiveId(fromUrl);
        return;
      }
    }
    if (params.get("board") === activeId) return;
    params.set("board", activeId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [activeId]);

  const searchResult = useMemo(() => {
    if (!searching) return { boards: [], shared: [] };
    const q = query.trim();
    const boards = [];
    for (const board of RESOURCE_PRODUCTS) {
      const matches = [];
      for (const { item, group } of boardItems(board)) {
        const hay = `${item.name} ${item.format} ${item.kind} ${board.name} ${group.label.en} ${group.label.zh}`;
        const score = fuzzyScore(q, hay);
        if (score > 0) matches.push({ item, score });
      }
      if (!matches.length) continue;
      matches.sort((a, b) => b.score - a.score);
      boards.push({ board, items: matches.map((match) => match.item), score: matches[0].score });
    }
    boards.sort((a, b) => b.score - a.score);
    const shared = SHARED_RESOURCES.filter((item) => fuzzyScore(q, `${item.name} ${item.format} ${item.kind}`) > 0);
    return { boards, shared };
  }, [query, searching]);

  const resultCount = searchResult.boards.reduce((sum, group) => sum + group.items.length, 0) + searchResult.shared.length;

  const learnItems = COURSE_GROUPS.flatMap((group) => group.items).map((item) => ({
    ...item,
    intro: pickText(item.intro, lang),
    tags: [pickText(TYPE_LABEL[item.type] || TYPE_LABEL.course, lang), boardScope(item.boards, zh)],
  }));
  const featuredItem = learnItems.find((item) => item.featured);
  const restItems = learnItems.filter((item) => !item.featured);

  const copy = {
    title: zh ? "硬件资源" : "Hardware Resources",
    description: zh
      ? "全系列通用的 KiCad 设计套件在最上面；往下选一块开发板，就能找到它的原理图、KiCad 工程、尺寸图、3D 模型和固件，图纸点开即可预览。"
      : "The series-wide KiCad design kit comes first. Below it, pick a board to find its schematics, KiCad project, dimensions, 3D models and firmware, with drawings that preview on click.",
    search: zh ? "搜索全部开发板的资源" : "Search every board's files",
    clear: zh ? "清除" : "Clear",
    files: (count) => (zh ? `${count} 个文件` : `${count} files`),
    results: (count) => (zh ? `找到 ${count} 个结果` : `${count} results`),
    empty: zh ? "没有匹配的资源，换个关键词试试。" : "No matching resources. Try another keyword.",
    shared: zh ? "XIAO 设计套件" : "XIAO Design Kit",
    open: zh ? "打开" : "Open",
    watch: zh ? "去看视频" : "Watch",
  };

  const selectBoard = (id) => {
    setActiveId(id);
    setQuery("");
  };

  const searchBox = (
    <label className={styles.search}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} aria-label={copy.search} />
      {searching && (
        <button type="button" className={styles.clearBtn} onClick={() => setQuery("")} aria-label={copy.clear}>×</button>
      )}
    </label>
  );

  const renderGroup = (key, title, items, count = true) => (
    <section key={key} className={styles.group}>
      <div className={styles.groupHead}>
        <h3 className={`${styles.groupTitle} home-type-subtitle`}>{title}</h3>
        {count && <span>{copy.files(items.length)}</span>}
      </div>
      <div className={styles.cardGrid}>
        {items.map((item) => (
          <ResourceCard key={`${key}-${item.url}`} item={item} onPreview={setPreview} />
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true" />
        <ToolPageIntro id="top" title={copy.title} description={copy.description} />
        <DesignKit />
      </div>

      <div className={styles.wrap}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <BoardNav active={active} onSelect={selectBoard} />
          </aside>

          <div className={styles.main} id="resources">
            <BoardProfile active={active}>{searchBox}</BoardProfile>

            {searching ? (
              <div className={styles.groups} key="search">
                <p className={styles.resultHead}>{copy.results(resultCount)}</p>
                {resultCount === 0 && <p className={styles.empty}>{copy.empty}</p>}
                {searchResult.boards.map(({ board, items }) => renderGroup(board.id, board.name, items))}
                {searchResult.shared.length > 0 && renderGroup("shared", copy.shared, searchResult.shared, false)}
              </div>
            ) : (
              <div className={styles.groups} key={active.id}>
                {active.groups.map((group) => renderGroup(group.id, pickText(group.label, lang), group.items))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section id="learn" className={styles.learnBand}>
        <div className={styles.wrap}>
          <div className={styles.learnHead}>
            <p className={styles.kicker}>{pickText(EXTRAS.eyebrow, lang)}</p>
            <h2 className="home-type-title">{pickText(EXTRAS.title, lang)}</h2>
            <p className="home-type-body">{pickText(EXTRAS.intro, lang)}</p>
          </div>
          {featuredItem && (
            <CourseCard item={featuredItem} actionLabel={pickText(featuredItem.action, lang) || copy.open} featured />
          )}
          <div className={styles.learnGrid}>
            {restItems.map((item) => (
              <CourseCard key={item.title} item={item} actionLabel={item.type === "video" ? copy.watch : copy.open} />
            ))}
          </div>
        </div>
      </section>
      <PreviewDialog item={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
