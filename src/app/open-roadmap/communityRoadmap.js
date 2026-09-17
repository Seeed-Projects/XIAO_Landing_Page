"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import discussionData from "../../../public/open-roadmap/discussions.json";
import styles from "./community-roadmap.module.css";

const GITHUB_DISCUSSIONS = "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions";
const HOW_IT_WORKS_URL = "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions/1";

/** Board columns in lifecycle order (Help Needed is a separate rail). */
const STAGES = [
  {
    id: "wish",
    label: { en: "Wish List", zh: "愿望清单" },
    blurb: {
      en: "Fresh ideas from the community",
      zh: "社区提出的新想法",
    },
  },
  {
    id: "vote",
    label: { en: "Open for Vote", zh: "公开投票" },
    blurb: {
      en: "Cast your vote on GitHub",
      zh: "去 GitHub 投下你的一票",
    },
  },
  {
    id: "dev",
    label: { en: "In Development", zh: "开发中" },
    blurb: {
      en: "Seeed is building these now",
      zh: "Seeed 正在推进开发",
    },
  },
  {
    id: "done",
    label: { en: "Accomplished", zh: "已完成" },
    blurb: {
      en: "Shipped from community ideas",
      zh: "已从社区想法落地",
    },
  },
];

const HELP_STAGE = {
  id: "help",
  label: { en: "Help Needed", zh: "需要帮助" },
  blurb: {
    en: "Discussions looking for community input",
    zh: "需要社区一起推进的讨论",
  },
};

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
  return lang === "zh"
    ? years === 1
      ? "1 年前"
      : `${years} 年前`
    : years === 1
      ? "1 year ago"
      : `${years} years ago`;
}

function IdeaCard({ item, lang }) {
  const title = (item.title && (item.title[lang] || item.title.en)) || "";
  const excerpt = (item.excerpt && (item.excerpt[lang] || item.excerpt.en)) || "";
  const topics = item.topics || [];
  return (
    <a
      className={styles.ideaCard}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h3 className={styles.ideaTitle}>{title}</h3>
      {excerpt ? <p className={styles.ideaExcerpt}>{excerpt}</p> : null}
      {topics.length > 0 && (
        <div className={styles.topicRow}>
          {topics.map((topic) => (
            <span key={topic} className={styles.topicChip}>
              {topic}
            </span>
          ))}
        </div>
      )}
      <div className={styles.ideaMeta}>
        <span>▲ {item.votes}</span>
        <span className={styles.metaDot} aria-hidden="true" />
        <span>💬 {item.comments}</span>
        <span className={styles.metaDot} aria-hidden="true" />
        <span>{relativeDate(item.updatedAt, lang)}</span>
      </div>
    </a>
  );
}

function StageColumn({ stage, items, lang, emptyLabel }) {
  const label = stage.label[lang] || stage.label.en;
  const blurb = stage.blurb[lang] || stage.blurb.en;
  const toneClass = styles[`tone_${stage.id}`] || "";
  return (
    <section
      className={`${styles.column} ${toneClass}`}
      aria-labelledby={`stage-${stage.id}`}
    >
      <header className={styles.columnHead}>
        <div className={styles.columnTitleRow}>
          <h2 id={`stage-${stage.id}`} className={styles.columnTitle}>
            {label}
          </h2>
          <span className={styles.columnCount}>{items.length}</span>
        </div>
        <p className={styles.columnBlurb}>{blurb}</p>
      </header>
      <div className={styles.columnBody}>
        {items.length === 0 ? (
          <p className={`home-type-body ${styles.columnEmpty}`}>{emptyLabel}</p>
        ) : (
          items.map((item) => <IdeaCard key={item.id} item={item} lang={lang} />)
        )}
      </div>
    </section>
  );
}

export function CommunityRoadmap() {
  const { lang } = useLang();

  const T = {
    h1: lang === "zh" ? "XIAO 开放路线图" : "XIAO Open Roadmap",
    sub:
      lang === "zh"
        ? "下一步做什么，由你决定"
        : "You decide what we build next",
    btnSubmit: lang === "zh" ? "在 GitHub 提交想法" : "Submit an idea on GitHub",
    howItWorks: lang === "zh" ? "路线图如何运作" : "How the roadmap works",
    empty: lang === "zh" ? "这一阶段暂无条目。" : "No ideas in this stage yet.",
  };

  const byStage = useMemo(() => {
    const map = { wish: [], vote: [], dev: [], done: [], help: [] };
    for (const item of discussionData) {
      const key = map[item.stage] ? item.stage : "wish";
      map[key].push(item);
    }
    return map;
  }, []);

  return (
    <div className={styles.roadmap}>
      <Reveal as="section" className={styles.roadmapHero}>
        <Image
          src={withBase("/openroadmap-hero.webp")}
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroShade} />
        <div className={`page-hero-copy ${styles.heroCopy}`}>
          <Glow
            as="h1"
            className="home-type-hero-title text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          >
            {T.h1}
          </Glow>
          <p className="page-hero-description home-type-body text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {T.sub}
          </p>
          <div className={styles.headActions}>
            <a
              className="home-type-action home-filled-action home-primary-cta"
              href={GITHUB_DISCUSSIONS}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff" }}
            >
              {T.btnSubmit}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              className={`home-type-action home-text-action ${styles.howLink}`}
              href={HOW_IT_WORKS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {T.howItWorks} ↗
            </a>
          </div>
        </div>
      </Reveal>

      <div className={styles.wrap}>
        <div className={styles.board}>
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              items={byStage[stage.id]}
              lang={lang}
              emptyLabel={T.empty}
            />
          ))}
        </div>

        <section className={`${styles.helpRail} ${styles.tone_help}`} aria-labelledby="stage-help">
          <header className={styles.helpHead}>
            <div className={styles.columnTitleRow}>
              <h2 id="stage-help" className={styles.columnTitle}>
                {HELP_STAGE.label[lang] || HELP_STAGE.label.en}
              </h2>
              <span className={styles.columnCount}>{byStage.help.length}</span>
            </div>
            <p className={styles.columnBlurb}>
              {HELP_STAGE.blurb[lang] || HELP_STAGE.blurb.en}
            </p>
          </header>
          <div className={styles.helpBody}>
            {byStage.help.length === 0 ? (
              <p className={`home-type-body ${styles.columnEmpty}`}>{T.empty}</p>
            ) : (
              byStage.help.map((item) => (
                <IdeaCard key={item.id} item={item} lang={lang} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
