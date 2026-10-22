"use client";

import { useMemo, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { ToolPageIntro } from "../tool-page-intro";
import discussionData from "../../../public/open-roadmap/discussions.json";
import styles from "./community-roadmap.module.css";

const GITHUB_DISCUSSIONS = "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions";

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

function StageColumn({ stage, items, lang, emptyLabel, labels, step, total, stepLabel, clampCount, expandLabel, collapseLabel }) {
  const toneClass = styles[`tone_${stage.id}`] || "";
  const collapsible = stage.id === "wish" || stage.id === "vote";
  const [expanded, setExpanded] = useState(false);
  const overflows = collapsible && clampCount > 0 && items.length > clampCount;
  const visible = collapsible && !expanded && clampCount > 0 ? Math.min(items.length, clampCount) : items.length;
  const hiddenCount = items.length - visible;

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
          items
            .slice(0, visible)
            .map((item) => (
              <IdeaCard key={item.id} item={item} lang={lang} labels={labels} />
            ))
        )}
      </div>
      {overflows ? (
        <button
          type="button"
          className={`home-type-action home-text-action ${styles.clampToggle}`}
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          {expanded ? collapseLabel : `${expandLabel} (${hiddenCount})`}
        </button>
      ) : null}
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
    empty: lang === "zh" ? "这一阶段暂无条目。" : "No ideas in this stage yet.",
    howEyebrow: lang === "zh" ? "玩法说明" : "How it works",
    howTitle:
      lang === "zh"
        ? "一起共创 XIAO 的未来"
        : "Build XIAO's future together",
    howDesc:
      lang === "zh"
        ? "从社区的真实需求出发，一起决定 XIAO 开发板与配件的新功能和新产品，让好想法走向落地。"
        : "Start with real community needs. Help shape new features and products for XIAO boards and accessories, and turn good ideas into things that ship.",
    howProposeLabel: lang === "zh" ? "提交提案" : "Propose",
    howPropose:
      lang === "zh"
        ? "任何人都可以发起 GitHub Discussion，分享 XIAO 功能或产品想法，加入愿望清单。"
        : "Anyone can open a GitHub Discussion to share a XIAO feature or product idea for the Wish List.",
    howVoteLabel: lang === "zh" ? "投票支持" : "Vote",
    howVote:
      lang === "zh"
        ? "合适的提案会获得“Open for Vote”标签，开放投票。点击上箭头 ⬆️，支持你喜欢的想法。"
        : "Good fits get the “Open for Vote” label. Upvote ⬆️ the ideas you love to help the community set priorities.",
    howBuildLabel: lang === "zh" ? "开发与交付" : "Build & ship",
    howBuild:
      lang === "zh"
        ? "Seeed 将高票想法推进到“开发中”，交付后标记为“已完成”。"
        : "Seeed moves the most-upvoted ideas into In Development, then marks them Accomplished when they ship.",
    howEngage:
      lang === "zh"
        ? "与其他社区成员互动。请保持开放心态——这个社区由大家一起建设 💪"
        : "Connect with other community members. Stay open-minded — this community is built together 💪",
    seeed: lang === "zh" ? "Seeed 已回复" : "Seeed replied",
    answered: lang === "zh" ? "已解答" : "Answered",
    closed: lang === "zh" ? "已关闭" : "Closed",
    participant: lang === "zh" ? "位参与者" : "participant",
    participants: lang === "zh" ? "位参与者" : "participants",
    active: lang === "zh" ? "活跃" : "Active",
    step: lang === "zh" ? "阶段" : "Stage",
    expandLabel: lang === "zh" ? "展开更多" : "Show more",
    collapseLabel: lang === "zh" ? "收起" : "Collapse",
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

  // Fold wish/vote to the taller of the dev/done columns so the four columns
  // line up. Cards are sliced whole (no overflow clipping), so the original
  // tilt/thumbnail styling stays untouched.
  const clampCount = Math.max(byStage.dev.length, byStage.done.length);

  return (
    <div className={styles.roadmap}>
      <Reveal as="section" id="top" className="scroll-mt-24">
        <ToolPageIntro
          title={T.h1}
          description={T.sub}
          actions={
            <a
              className={`home-type-action home-filled-action home-primary-cta ${styles.heroAction}`}
              href={GITHUB_DISCUSSIONS}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff" }}
            >
              {T.btnSubmit}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          }
        />
      </Reveal>

      <Reveal as="section" className={styles.howItWorksWrap} aria-labelledby="how-it-works">
        <div className={styles.howItWorks}>
          <header className={styles.howItWorksHead}>
            <p className={styles.howItWorksEyebrow}>{T.howEyebrow}</p>
            <h2 id="how-it-works" className={`${styles.howItWorksTitle} home-type-title`}>{T.howTitle}</h2>
            <p className={`${styles.howItWorksDesc} home-type-body`}>{T.howDesc}</p>
          </header>
          <ol className={styles.howItWorksPoints} role="list">
            <Reveal as="li" delay={100} className={`${styles.howPointReveal} ${styles.tone_wish}`}>
              <div className={styles.howItWorksRail} aria-hidden="true">
                <span className={styles.howItWorksNode}>01</span>
              </div>
              <div className={styles.howItWorksPoint}>
                <h3 className={`${styles.howItWorksStepTitle} home-type-subtitle`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 4H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2l4 3v-3h6a3 3 0 0 0 3-3v-3M18 2v6M15 5h6M7 9h4M7 13h8" />
                  </svg>
                  {T.howProposeLabel}
                </h3>
                <p className="home-type-body">{T.howPropose}</p>
                <div className={styles.howItWorksStages}>
                  <span className={styles.howItWorksStage}>{STAGES[0].label[lang]}</span>
                </div>
              </div>
            </Reveal>
            <Reveal as="li" delay={200} className={`${styles.howPointReveal} ${styles.tone_vote}`}>
              <div className={styles.howItWorksRail} aria-hidden="true">
                <span className={styles.howItWorksNode}>02</span>
              </div>
              <div className={styles.howItWorksPoint}>
                <h3 className={`${styles.howItWorksStepTitle} home-type-subtitle`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m7 10 5-5 5 5M12 5v11M5 16v4h14v-4" />
                  </svg>
                  {T.howVoteLabel}
                </h3>
                <p className="home-type-body">{T.howVote}</p>
                <div className={styles.howItWorksStages}>
                  <span className={styles.howItWorksStage}>{STAGES[1].label[lang]}</span>
                </div>
              </div>
            </Reveal>
            <Reveal as="li" delay={300} className={`${styles.howPointReveal} ${styles.tone_dev}`}>
              <div className={styles.howItWorksRail} aria-hidden="true">
                <span className={styles.howItWorksNode}>03</span>
                <span className={styles.howItWorksFinish}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 12 4 4 8-8" />
                  </svg>
                </span>
              </div>
              <div className={styles.howItWorksPoint}>
                <h3 className={`${styles.howItWorksStepTitle} home-type-subtitle`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9M8 5.25l8 4.5" />
                  </svg>
                  {T.howBuildLabel}
                </h3>
                <p className="home-type-body">{T.howBuild}</p>
                <div className={styles.howItWorksStages}>
                  <span className={styles.howItWorksStage}>{STAGES[2].label[lang]}</span>
                  <span className={styles.howItWorksStageArrow} aria-hidden="true">→</span>
                  <span className={`${styles.howItWorksStage} ${styles.tone_done}`}>{STAGES[3].label[lang]}</span>
                </div>
              </div>
            </Reveal>
          </ol>
          <p className={`${styles.howItWorksNote} home-type-body`}>{T.howEngage}</p>
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
              clampCount={clampCount}
              expandLabel={T.expandLabel}
              collapseLabel={T.collapseLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
