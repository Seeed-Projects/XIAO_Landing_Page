"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import styles from "./community-roadmap.module.css";

const STATUS_CLASS = {
  idea: styles.sIdea,
  review: styles.sReview,
  vote: styles.sVote,
  planned: styles.sPlanned,
  dev: styles.sDev,
  done: styles.sDone,
  nope: styles.sNope,
};

const TAB_DEFS = [
  { id: "all", label: { en: "All", zh: "全部" }, filter: () => true },
  { id: "vote", label: { en: "Open for Vote", zh: "公开投票" }, filter: (i) => i.status === "vote" },
  { id: "planned", label: { en: "Planned", zh: "已规划" }, filter: (i) => i.status === "planned" },
  { id: "dev", label: { en: "In Development", zh: "开发中" }, filter: (i) => i.status === "dev" },
  { id: "done", label: { en: "Completed", zh: "已完成" }, filter: (i) => i.status === "done" },
  { id: "help", label: { en: "Help Needed", zh: "需要帮助" }, filter: (i) => i.helpNeeded || i.status === "review" },
];

const GITHUB_DISCUSSIONS = "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions";

function relativeDate(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  const days = Math.floor(diff / day);
  if (days <= 0) return lang === "zh" ? "今天" : "today";
  if (days === 1) return lang === "zh" ? "1 天前" : "1 day ago";
  if (days < 30) return lang === "zh" ? `${days} 天前` : `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return lang === "zh" ? "1 个月前" : "1 month ago";
  if (months < 12) return lang === "zh" ? `${months} 个月前` : `${months} months ago`;
  const years = Math.floor(months / 12);
  return lang === "zh" ? (years === 1 ? "1 年前" : `${years} 年前`) : years === 1 ? "1 year ago" : `${years} years ago`;
}

export function CommunityRoadmap() {
  const { lang } = useLang();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [tabId, setTabId] = useState("all");
  const [active, setActive] = useState(null);

  const T = {
    h1: lang === "zh" ? "XIAO 开放路线图" : "XIAO Open Roadmap",
    sub: lang === "zh"
      ? "下一步做什么，由你决定"
      : "You decide what we build next",
    btnAll: lang === "zh" ? "查看全部想法" : "View all ideas",
    btnSubmit: lang === "zh" ? "在 GitHub 提交想法 ↗" : "Submit an idea on GitHub ↗",
    loading: lang === "zh" ? "加载中…" : "Loading discussions…",
    error: lang === "zh" ? "无法加载讨论。" : "Unable to load discussions.",
    count: (n) => lang === "zh" ? `${n} 条想法` : `${n} ${n === 1 ? "idea" : "ideas"}`,
    empty: lang === "zh" ? "该分类下暂无想法。" : "No ideas in this category yet.",
    votes: lang === "zh" ? "票" : "votes",
    comments: (n) => lang === "zh" ? `${n} 条评论` : `${n} comments`,
    updated: (s) => lang === "zh" ? `更新于 ${s}` : `updated ${s}`,
    detail: lang === "zh" ? "查看详情 →" : "View detail →",
    voteGithub: lang === "zh" ? "去 GitHub 投票 ↗" : "Vote on GitHub ↗",
    drawerKicker: lang === "zh" ? "想法详情" : "Idea detail",
    support: lang === "zh" ? "社区支持" : "Community support",
    ghComments: lang === "zh" ? "GitHub 评论" : "GitHub comments",
    proposed: lang === "zh" ? "提案内容" : "What is being proposed",
    why: lang === "zh" ? "为何重要" : "Why it matters",
    update: lang === "zh" ? "Seeed 最新进展" : "Latest update from Seeed",
    fullDiscussion: lang === "zh" ? "在 GitHub 查看完整讨论 ↗" : "View full discussion on GitHub ↗",
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("/open-roadmap/discussions.json"), { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  const tab = TAB_DEFS.find((t) => t.id === tabId) ?? TAB_DEFS[0];
  const visible = useMemo(() => items.filter(tab.filter), [items, tab]);
  const tabCounts = useMemo(() => {
    const m = { all: items.length };
    TAB_DEFS.forEach((t) => { m[t.id] = items.filter(t.filter).length; });
    return m;
  }, [items]);

  return (
    <div className={styles.roadmap}>
      <Reveal as="section" className={styles.roadmapHero}>
        <Image
          src={withBase("/openroadmap-hero.png")}
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <Glow as="h1">{T.h1}</Glow>
          <p>{T.sub}</p>
          <div className={styles.headActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href="#ideas">{T.btnAll}</a>
            <a className={`${styles.btn} ${styles.btnSecondary}`} href={GITHUB_DISCUSSIONS} target="_blank" rel="noopener">
              {T.btnSubmit}
            </a>
          </div>
        </div>
      </Reveal>

      <div className={styles.wrap}>
        <Reveal className={styles.filters} id="ideas">
          {TAB_DEFS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${t.id === tabId ? styles.active : ""}`}
              onClick={() => setTabId(t.id)}
            >
              {pick(t.label)}<span className={styles.tabCount}>{tabCounts[t.id]}</span>
            </button>
          ))}
        </Reveal>

        <div className={styles.listMeta}>
          {status === "loading" ? T.loading : status === "error" ? T.error : T.count(visible.length)}
        </div>

        <Reveal className={styles.list}>
          {status === "ok" && visible.length === 0 && (
            <div className={styles.empty}>{T.empty}</div>
          )}
          {visible.map((it, i) => (
            <Reveal key={it.id} delay={i * 70}>
            <article className={styles.card} onClick={() => setActive(it)}>
              <div className={styles.cardTop}>
                <div className={styles.vote}>
                  <b>▲ {it.votes}</b>
                  <small>{T.votes}</small>
                </div>
                <div className={styles.cardMain}>
                  <span className={`${styles.status} ${STATUS_CLASS[it.status] || styles.sIdea}`}>{pick(it.statusLabel)}</span>
                  <h3 className={styles.cardTitle}>{pick(it.title)}</h3>
                  <p className={styles.cardSummary}>{pick(it.summary)}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.productTag}>{pick(it.product)}</span>
                    <span className={styles.metaDot} />
                    <span>💬 {T.comments(it.comments)}</span>
                    <span className={styles.metaDot} />
                    <span>{T.updated(relativeDate(it.updated, lang))}</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardFoot}>
                <button
                  type="button"
                  className={styles.ghostLink}
                  onClick={(e) => { e.stopPropagation(); setActive(it); }}
                >
                  {T.detail}
                </button>
                <a
                  className={styles.voteLink}
                  href={it.githubUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                >
                  {T.voteGithub}
                </a>
              </div>
            </article>
            </Reveal>
          ))}
        </Reveal>
      </div>

      <div className={`${styles.backdrop} ${active ? styles.open : ""}`} onClick={() => setActive(null)} />
      {active && (
        <aside className={`${styles.drawer} ${styles.open}`} role="dialog" aria-modal="true">
          <div className={styles.drawerHead}>
            <div className={styles.drawerHeadLeft}>
              <span className={styles.drawerKicker}>{T.drawerKicker}</span>
              <h2 className={styles.drawerTitle}>{pick(active.title)}</h2>
              <span className={`${styles.status} ${STATUS_CLASS[active.status] || styles.sIdea}`}>{pick(active.statusLabel)}</span>
            </div>
            <button type="button" className={styles.closeBtn} onClick={() => setActive(null)}>×</button>
          </div>
          <div className={styles.drawerBody}>
            <div className={styles.supportRow}>
              <div className={styles.supportTile}>
                <b>▲ {active.votes}</b>
                <span>{T.support}</span>
              </div>
              <div className={styles.supportTile}>
                <b>💬 {active.comments}</b>
                <span>{T.ghComments}</span>
              </div>
            </div>

            <div className={styles.section}>
              <h4>{T.proposed}</h4>
              <p>{pick(active.proposed)}</p>
            </div>
            <div className={styles.section}>
              <h4>{T.why}</h4>
              <p>{pick(active.why)}</p>
            </div>
            <div className={styles.section}>
              <h4>{T.update}</h4>
              <p>{pick(active.update)}</p>
            </div>

            <div className={styles.drawerActions}>
              <a className={`${styles.btn} ${styles.btnLight}`} href={active.githubUrl} target="_blank" rel="noopener">
                {T.fullDiscussion}
              </a>
              <a className={`${styles.btn} ${styles.btnGreen}`} href={active.githubUrl} target="_blank" rel="noopener">
                {T.voteGithub}
              </a>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
