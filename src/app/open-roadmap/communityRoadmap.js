"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { ToolPageIntro } from "../tool-page-intro";
import { withBase } from "../../lib/basePath";
import discussionData from "../../../public/open-roadmap/discussions.json";
import { announcementThread } from "./announcement-thread.mjs";
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

function ThreadReactions({ reactions, lang }) {
  return REACTION_META.filter(({ key }) => reactions[key] > 0).map(({ key, emoji }) => (
    <span key={key} className={styles.threadReaction}>
      <span role="img" aria-label={announcementThread.labels.reactions[key][lang]}>{emoji}</span>
      {reactions[key]}
    </span>
  ));
}

/** Render the announcement's Markdown heading, paragraphs, list, and links.
 * 渲染公告的 Markdown 标题、段落、列表与链接。 */
function AnnouncementBody({ body }) {
  const lines = body.split(/\r?\n/);
  const bullets = lines.filter((line) => /^\s*\* /.test(line));

  return (
    <>
      <h3 className={`${styles.threadAnnouncementWelcome} home-type-subtitle`}>{lines[0].replace(/^## /, "")}</h3>
      <p className="home-type-body">{lines[1]}</p>
      <ul className="home-type-body">
        {bullets.map((line) => (
          <li key={line}>
            {line.replace(/^\s*\* /, "").split(/(\[[^\]]+\]\(https:\/\/[^)]+\))/g).map((part, index) => {
              const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
              return link ? <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a> : part;
            })}
          </li>
        ))}
      </ul>
      <p className="home-type-body">{lines[lines.length - 1]}</p>
    </>
  );
}

const CHAT_INTERVAL_MS = 4200;
const CHAT_VISIBLE = 5;

/** Render one chat message: sender line, one bubble per line, optional reactions.
 * 渲染单条聊天消息：发送者信息、每行一个气泡、可选的表情反应。 */
function ChatMessage({ reply, lang, labels }) {
  return (
    <div className={`${styles.threadMessage} ${reply.team ? styles.threadTeam : styles.threadCommunity}`} data-author={reply.login}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.threadAvatar}
        src={reply.avatar}
        alt={reply.name || reply.login}
        width={reply.team ? 36 : 28}
        height={reply.team ? 36 : 28}
        referrerPolicy="no-referrer"
      />
      <div className={styles.threadMessageContent}>
        <div className={styles.threadSenderLine}>
          <h3 className={`${styles.threadName} home-type-subtitle`}>{reply.name || reply.login}</h3>
          {reply.team ? (
            <>
              <span className={`${styles.badge} ${styles.badgeSeeed}`}>{labels.team[lang]}</span>
              <span>{reply.role[lang]}</span>
            </>
          ) : (
            <span className={`${styles.badge} ${styles.threadContributor}`}>{labels.contributor[lang]}</span>
          )}
        </div>
        {reply.text[lang].map((line, lineIndex, lines) => (
          <div key={line} className={`${styles.threadBubble} ${lineIndex === lines.length - 1 ? styles.threadBubbleTail : ""}`}>
            <p className={`${styles.threadMessageText} home-type-body`}>{line}</p>
            {lineIndex === lines.length - 1 ? (
              <a
                className={styles.threadReplyLink}
                href={reply.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${labels.reply[lang]} · ${reply.name || reply.login}`}
                title={labels.reply[lang]}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 7-5 5 5 5M4 12h10a6 6 0 0 1 6 6" />
                </svg>
              </a>
            ) : null}
          </div>
        ))}
        {!reply.team && Object.values(reply.reactions).some((count) => count > 0) ? (
          <div className={styles.threadMessageReactions}>
            <ThreadReactions reactions={reply.reactions} lang={lang} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Loop the replies like a live chat: a new message enters at the bottom every few seconds
 * while older ones fade out at the top. Pauses off-screen, on hover and on focus.
 * 像实时聊天一样循环播放回复：每隔几秒在底部出现一条新消息，上方旧消息逐渐淡出；
 * 离开视口、鼠标悬停或键盘聚焦时暂停。
 */
function ChatStream({ replies, lang, labels }) {
  const streamRef = useRef(null);
  const [count, setCount] = useState(4);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = streamRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || reducedMotion) return undefined;
    const timer = window.setInterval(() => setCount((value) => value + 1), CHAT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [visible, paused, reducedMotion]);

  const items = reducedMotion
    ? replies.map((reply, index) => ({ reply, key: index }))
    : Array.from({ length: Math.min(count, CHAT_VISIBLE) }, (_, offset) => {
        const index = count - Math.min(count, CHAT_VISIBLE) + offset;
        return { reply: replies[index % replies.length], key: index };
      });

  return (
    <div
      ref={streamRef}
      className={`${styles.threadStream} ${reducedMotion ? styles.threadStreamStatic : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ol className={styles.threadMessages} aria-label={labels.communityReplies[lang]} role="list">
        {items.map(({ reply, key }) => (
          <li key={key} className={styles.threadStreamItem}>
            <div className={styles.threadStreamInner}>
              <ChatMessage reply={reply} lang={lang} labels={labels} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AnnouncementThread({ lang }) {
  const { post, replies, labels } = announcementThread;
  const body = post.body[lang];

  return (
    <section className={styles.announcementThread} aria-labelledby="roadmap-announcement">
      <div className={styles.threadAnnouncement}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.threadGroupAvatar}
          src={withBase(post.avatar)}
          alt={post.name}
          width={48}
          height={48}
          referrerPolicy="no-referrer"
        />
        <div className={styles.threadAnnouncementCopy}>
          <span className={styles.threadAnnouncementLabel}>
            <span aria-hidden="true">📢 </span>
            {labels.announcement[lang]} · {post.name} · {post.date[lang]}
          </span>
          <h2 id="roadmap-announcement" className={`${styles.threadAnnouncementTitle} home-type-subtitle`}>
            <a href={post.url} target="_blank" rel="noopener noreferrer">{post.title[lang]}</a>
          </h2>
          <div className={styles.threadAnnouncementBody}>
            <AnnouncementBody body={body} />
          </div>
          <div className={styles.threadAnnouncementReactions}>
            <ThreadReactions reactions={post.reactions} lang={lang} />
            <span className={styles.threadGroupMeta}>{post.commentCount} {labels.comments[lang]}</span>
          </div>
        </div>
      </div>
      <div className={styles.threadChat}>
        <div className={styles.threadChatInner}>
          <ChatStream replies={replies} lang={lang} labels={labels} />
          <a className={styles.threadComposer} href={post.url} target="_blank" rel="noopener noreferrer" aria-label={labels.join[lang]}>
            <span>{labels.composer[lang]}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
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

      <AnnouncementThread lang={lang} />

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
