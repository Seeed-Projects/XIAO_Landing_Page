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

const REACTION_META = [
  { key: "thumbsUp", emoji: "👍" },
  { key: "hooray", emoji: "🎉" },
  { key: "heart", emoji: "❤️" },
  { key: "rocket", emoji: "🚀" },
  { key: "eyes", emoji: "👀" },
];

const AVATAR_VISIBLE = 5;

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

function pickReactions(reactions) {
  const list = REACTION_META.map((meta) => ({
    ...meta,
    count: (reactions && reactions[meta.key]) || 0,
  })).filter((r) => r.count > 0);
  if (list.length === 0) {
    return [{ key: "thumbsUp", emoji: "👍", count: 0 }];
  }
  return list.slice(0, 3);
}

function IdeaCard({ item, lang, labels }) {
  const title = (item.title && (item.title[lang] || item.title.en)) || "";
  const excerpt = (item.excerpt && (item.excerpt[lang] || item.excerpt.en)) || "";
  const topics = item.topics || [];
  const participants = item.participants || [];
  const participantCount = item.participantCount || participants.length;
  const visibleAvatars = participants.slice(0, AVATAR_VISIBLE);
  const overflow = Math.max(0, participantCount - visibleAvatars.length);
  const reactions = pickReactions(item.reactions);
  const activityIso = item.lastActivityAt || item.updatedAt || item.createdAt;
  const badges = [];
  if (item.seeedReplied) badges.push({ key: "seeed", className: styles.badgeSeeed, text: labels.seeed });
  if (item.answered) badges.push({ key: "answered", className: styles.badgeAnswered, text: labels.answered });
  if (item.closed) badges.push({ key: "closed", className: styles.badgeClosed, text: labels.closed });

  return (
    <div className={styles.ideaSlot}>
      <a
        className={styles.ideaCard}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={styles.ideaBody}>
          <div className={styles.ideaHead}>
            <div className={styles.ideaHeadText}>
              <h3 className={styles.ideaTitle}>{title}</h3>
              {excerpt ? <p className={styles.ideaExcerpt}>{excerpt}</p> : null}
            </div>
            {item.image ? (
              <div className={`${styles.ideaThumb} ${styles.ideaThumbHot}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" loading="lazy" />
              </div>
            ) : null}
          </div>

          {topics.length > 0 ? (
            <div className={styles.topicRow}>
              {topics.map((topic) => (
                <span key={topic} className={styles.topicChip}>
                  {topic}
                </span>
              ))}
            </div>
          ) : null}

          {badges.length > 0 ? (
            <div className={styles.badgeRow}>
              {badges.map((badge) => (
                <span key={badge.key} className={`${styles.badge} ${badge.className}`}>
                  {badge.text}
                </span>
              ))}
            </div>
          ) : null}

          <div className={styles.signalRow}>
            <div className={styles.participantBlock}>
              {visibleAvatars.length > 0 ? (
                <div className={styles.avatarStack} aria-hidden="true">
                  {visibleAvatars.map((person) =>
                    person.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={person.login}
                        src={person.avatar}
                        alt=""
                        title={person.login}
                        loading="lazy"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <span key={person.login} className={styles.avatarFallback} title={person.login}>
                        {(person.login || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )
                  )}
                  {overflow > 0 ? <span className={styles.avatarMore}>+{overflow}</span> : null}
                </div>
              ) : null}
              <span className={styles.participantLabel}>
                {participantCount}{" "}
                {participantCount === 1 ? labels.participant : labels.participants}
              </span>
            </div>
            <div className={styles.reactionRow}>
              {reactions.map((reaction) => (
                <span key={reaction.key} className={styles.reaction}>
                  <span aria-hidden="true">{reaction.emoji}</span>
                  {reaction.count}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.ideaFoot}>
            <span className={styles.statMuted}>
              {labels.active} {relativeDate(activityIso, lang)}
            </span>
            <span className={styles.stat} title="Comments">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 3.5V15H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              {item.comments}
            </span>
          </div>
        </div>
      </a>
      {item.image ? (
        <div className={styles.ideaZoom} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" loading="lazy" />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Column header: numbered stage node on a left-to-right flow rail,
 * followed by the stage title, count and blurb.
 * 列头：流程线上的编号节点，下方是阶段名称、数量与说明。
 */
function StageHeader({ stage, count, lang, step, total, stepLabel }) {
  const label = stage.label[lang] || stage.label.en;
  const blurb = stage.blurb[lang] || stage.blurb.en;
  const isFirst = step === 1;
  const isLast = step === total;
  const railClass = [
    styles.stageRail,
    isFirst ? styles.stageRailFirst : "",
    isLast ? styles.stageRailLast : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={styles.stageHead}>
      {step ? (
        <div className={railClass} aria-hidden="true">
          <span className={styles.stageNode}>{step}</span>
          {!isLast ? (
            <svg className={styles.stageArrow} viewBox="0 0 10 12" fill="currentColor">
              <path d="M1.4 1.55c0-1.03 1.14-1.65 2-1.1l6.1 3.9a1.35 1.35 0 0 1 0 2.3l-6.1 3.9c-.86.55-2-.07-2-1.1V1.55Z" />
            </svg>
          ) : null}
        </div>
      ) : null}
      <div className={styles.stageTitleRow}>
        <div className={styles.stageTitleText}>
          {step ? (
            <span className={styles.stageEyebrow}>
              {stepLabel} {String(step).padStart(2, "0")}
            </span>
          ) : null}
          <h2 id={`stage-${stage.id}`} className={`${styles.columnTitle} scroll-mt-24`}>
            {label}
          </h2>
        </div>
        <span className={styles.columnCount}>{count}</span>
      </div>
      <p className={styles.columnBlurb}>{blurb}</p>
    </header>
  );
}

function StageColumn({ stage, items, lang, emptyLabel, labels, step, total, stepLabel }) {
  const toneClass = styles[`tone_${stage.id}`] || "";
  return (
    <section
      className={`${styles.column} ${toneClass}`}
      aria-labelledby={`stage-${stage.id}`}
    >
      <StageHeader
        stage={stage}
        count={items.length}
        lang={lang}
        step={step}
        total={total}
        stepLabel={stepLabel}
      />
      <div className={styles.columnBody}>
        {items.length === 0 ? (
          <p className={`home-type-body ${styles.columnEmpty}`}>{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <IdeaCard key={item.id} item={item} lang={lang} labels={labels} />
          ))
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
    seeed: lang === "zh" ? "Seeed 已回复" : "Seeed replied",
    answered: lang === "zh" ? "已解答" : "Answered",
    closed: lang === "zh" ? "已关闭" : "Closed",
    participant: lang === "zh" ? "位参与者" : "participant",
    participants: lang === "zh" ? "位参与者" : "participants",
    active: lang === "zh" ? "活跃" : "Active",
    step: lang === "zh" ? "阶段" : "Stage",
  };

  const cardLabels = {
    seeed: T.seeed,
    answered: T.answered,
    closed: T.closed,
    participant: T.participant,
    participants: T.participants,
    active: T.active,
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
      <Reveal as="section" id="top" className={styles.roadmapHero}>
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
          {STAGES.map((stage, index) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              items={byStage[stage.id]}
              lang={lang}
              emptyLabel={T.empty}
              labels={cardLabels}
              step={index + 1}
              total={STAGES.length}
              stepLabel={T.step}
            />
          ))}
        </div>

        <section className={`${styles.helpRail} ${styles.tone_help}`} aria-labelledby="stage-help">
          <StageHeader stage={HELP_STAGE} count={byStage.help.length} lang={lang} />
          <div className={styles.helpBody}>
            {byStage.help.length === 0 ? (
              <p className={`home-type-body ${styles.columnEmpty}`}>{T.empty}</p>
            ) : (
              byStage.help.map((item) => (
                <IdeaCard key={item.id} item={item} lang={lang} labels={cardLabels} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
