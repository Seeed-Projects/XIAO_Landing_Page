"use client";

import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import styles from "./success-cases.module.css";

/**
 * SuccessCases — "idea → shipped" story cards that close the roadmap loop.
 * Each story mirrors the four board stages (wish / vote / dev / done) on a
 * timeline so the section reads as the natural end of the flow above.
 * SuccessCases —— 「想法 → 成果」故事卡，作为看板流程的终点。
 * 每个故事沿用看板四阶段（许愿 / 投票 / 开发 / 完成）的时间线。
 */

// TODO(placeholder-stories): narrative fields below are editorial placeholders
// until each product is backed by an Accomplished discussion.
const STORIES = [
  {
    id: "xiao-3pcs",
    product: {
      name: "XIAO 3PCS Pack",
      image:
        "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-110010004-seeed-studio-xiao-samd21-_3pcs_-45font.jpg",
      href: "https://www.seeedstudio.com/Seeeduino-XIAO-3Pcs-p-4546.html",
    },
    idea: {
      en: "Classrooms and workshops buy XIAO ten at a time. A multi-pack would cut per-board cost and packaging waste.",
      zh: "教室和工作坊一次要买十几块 XIAO，多片装能降低单板成本，也少很多包装。",
    },
    author: { login: "makerclass_lee", initial: "M" },
    votes: 38,
    participants: 12,
    timeline: { wish: "2023-03", vote: "2023-04", dev: "2023-06", done: "2023-08" },
    outcome: {
      en: "Three XIAO SAMD21 boards in one pack, priced for bulk teaching kits.",
      zh: "三块 XIAO SAMD21 一包，按教学套件的量价定价。",
    },
  },
  {
    id: "xiao-esp32c5",
    product: {
      name: "XIAO ESP32-C5 Pre-Soldered",
      image:
        "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-100093057-seeed-studio-xiao-esp32c5_pre-solder_.jpg",
      href: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C5-Pre-Soldered-p-6610.html",
    },
    idea: {
      en: "We need a XIAO with 5 GHz Wi-Fi for crowded venues, and headers already soldered so demos go faster.",
      zh: "人多的场地需要 5 GHz Wi-Fi 的 XIAO，排针最好出厂焊好，演示时省时间。",
    },
    author: { login: "rf_tinkerer", initial: "R" },
    votes: 64,
    participants: 21,
    timeline: { wish: "2024-09", vote: "2024-10", dev: "2025-01", done: "2025-06" },
    outcome: {
      en: "Dual-band Wi-Fi 6 on the XIAO footprint, shipped with headers in place.",
      zh: "XIAO 尺寸上的双频 Wi-Fi 6，出厂即带焊好的排针。",
    },
  },
  {
    id: "xiao-esp32s3-plus",
    product: {
      name: "XIAO ESP32-S3 Plus",
      image:
        "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-102010671-seeedstudio-xiao-esp32s3-plus_1.jpg",
      href: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Plus-p-6361.html",
    },
    idea: {
      en: "Camera projects run out of pins on the S3. Expose more GPIO and give us 16 MB flash without breaking the footprint.",
      zh: "做摄像头项目时 S3 的引脚不够用，希望多露出一些 GPIO 并升级 16 MB 闪存，同时保持尺寸不变。",
    },
    author: { login: "camera_hacks", initial: "C" },
    votes: 52,
    participants: 17,
    timeline: { wish: "2024-02", vote: "2024-03", dev: "2024-06", done: "2024-10" },
    outcome: {
      en: "Extra GPIO pads on the underside, 16 MB flash, same XIAO outline.",
      zh: "底部新增 GPIO 焊盘、16 MB 闪存，外形与 XIAO 完全一致。",
    },
  },
  {
    id: "xiao-heatsink",
    product: {
      name: "Aluminum Heat Sink for XIAO (2pcs)",
      image:
        "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-114010001-aluminum-heat-sink-for-xiao-_2pcs_-.jpg",
      href: "https://www.seeedstudio.com/Aluminum-Heat-Sink-For-XIAO-2pcs-p-5972.html",
    },
    idea: {
      en: "The S3 gets warm when streaming video. A tiny heat sink cut to the XIAO shield would keep it stable.",
      zh: "S3 推流时会发热，希望有一块贴合 XIAO 屏蔽罩的小散热片保持稳定。",
    },
    author: { login: "thermal_dan", initial: "T" },
    votes: 27,
    participants: 9,
    timeline: { wish: "2024-05", vote: "2024-06", dev: "2024-07", done: "2024-09" },
    outcome: {
      en: "A pre-cut aluminum heat sink that drops onto the XIAO shield, two per pack.",
      zh: "预裁好的铝制散热片，直接贴在 XIAO 屏蔽罩上，一包两片。",
    },
  },
];

const STAGE_KEYS = ["wish", "vote", "dev", "done"];

/** Months between two YYYY-MM strings. */
function monthsBetween(from, to) {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/** Format YYYY-MM as "Jul 2024" / "2024 年 7 月". */
function formatMonth(ym, lang) {
  const [y, m] = ym.split("-").map(Number);
  if (lang === "zh") return `${y} 年 ${m} 月`;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[m - 1]} ${y}`;
}

function StoryCard({ story, lang, T }) {
  const idea = story.idea[lang] || story.idea.en;
  const outcome = story.outcome[lang] || story.outcome.en;
  const months = monthsBetween(story.timeline.wish, story.timeline.done);

  return (
    <article className={styles.story}>
      <div className={styles.storyTop}>
        <div className={styles.ideaPane}>
          <span className={`${styles.paneTag} ${styles.paneTagIdea}`}>
            {T.ideaTag} · {formatMonth(story.timeline.wish, lang)}
          </span>
          <blockquote className={styles.quote}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            {idea}
          </blockquote>
          <div className={styles.ideaMeta}>
            <span className={styles.authorChip}>
              <span className={styles.authorInitial} aria-hidden="true">
                {story.author.initial}
              </span>
              @{story.author.login}
            </span>
            <span className={styles.metaStat}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 5l7 12H5L12 5z" />
              </svg>
              {story.votes} {T.votes}
            </span>
            <span className={styles.metaStat}>
              {story.participants} {T.participants}
            </span>
          </div>
        </div>

        <div className={styles.bridge} aria-hidden="true">
          <span className={styles.bridgeLine} />
          <svg className={styles.bridgeArrow} viewBox="0 0 10 12" fill="currentColor">
            <path d="M1.4 1.55c0-1.03 1.14-1.65 2-1.1l6.1 3.9a1.35 1.35 0 0 1 0 2.3l-6.1 3.9c-.86.55-2-.07-2-1.1V1.55Z" />
          </svg>
        </div>

        <a
          className={styles.outcomePane}
          href={story.product.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.productText}>
            <span className={`${styles.paneTag} ${styles.paneTagShipped}`}>
              {T.shippedTag} · {formatMonth(story.timeline.done, lang)}
            </span>
            <h3 className={`home-type-subtitle ${styles.productName}`}>{story.product.name}</h3>
            <p className={styles.outcomeText}>{outcome}</p>
            <span className={`home-type-action ${styles.productCta}`}>
              {T.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </div>
          <div className={styles.productImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.product.image} alt={story.product.name} loading="lazy" />
          </div>
        </a>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineTrack} aria-hidden="true" />
        {STAGE_KEYS.map((key) => (
          <div key={key} className={`${styles.timelineStep} ${styles[`step_${key}`]}`}>
            <span className={styles.timelineDot} aria-hidden="true" />
            <span className={styles.timelineLabel}>{T.stages[key]}</span>
            <span className={styles.timelineDate}>{formatMonth(story.timeline[key], lang)}</span>
          </div>
        ))}
        <span className={styles.durationChip}>
          {lang === "zh" ? `历时 ${months} 个月` : `${months} months from idea to shelf`}
        </span>
      </div>
    </article>
  );
}

export function SuccessCases() {
  const { lang } = useLang();
  const isZh = lang === "zh";

  const T = {
    eyebrow: isZh ? "阶段 04 · 已发布" : "Stage 04 · Shipped",
    title: isZh ? "成功案例" : "Success Stories",
    sub: isZh
      ? "每一个都从一条社区留言开始。下面是它们从想法走到货架的路。"
      : "Every one of these started as a community post. Here is how each idea made it to the shelf.",
    ideaTag: isZh ? "社区想法" : "Community idea",
    shippedTag: isZh ? "已发布" : "Shipped",
    votes: isZh ? "票" : "votes",
    participants: isZh ? "位参与者" : "participants",
    cta: isZh ? "查看产品" : "View product",
    stages: {
      wish: isZh ? "许愿" : "Wish",
      vote: isZh ? "投票" : "Vote",
      dev: isZh ? "开发" : "Build",
      done: isZh ? "发布" : "Ship",
    },
    statIdeas: isZh ? "个想法已落地" : "ideas shipped",
    statVotes: isZh ? "张社区选票" : "community votes",
    statMonths: isZh ? "个月平均周期" : "months on average",
  };

  const totalVotes = STORIES.reduce((sum, s) => sum + s.votes, 0);
  const avgMonths = Math.round(
    STORIES.reduce((sum, s) => sum + monthsBetween(s.timeline.wish, s.timeline.done), 0) /
      STORIES.length
  );

  return (
    <section id="success" className={`scroll-mt-24 ${styles.section}`}>
      <div className={styles.lane}>
        <Reveal className={styles.head}>
          <div className={styles.headText}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowNode} aria-hidden="true">
                4
              </span>
              {T.eyebrow}
            </span>
            <Glow as="h2" className={`home-type-title ${styles.title}`}>
              {T.title}
            </Glow>
            <p className={`home-type-body ${styles.sub}`}>{T.sub}</p>
          </div>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>{STORIES.length}</dt>
              <dd>{T.statIdeas}</dd>
            </div>
            <div className={styles.stat}>
              <dt>{totalVotes}</dt>
              <dd>{T.statVotes}</dd>
            </div>
            <div className={styles.stat}>
              <dt>{avgMonths}</dt>
              <dd>{T.statMonths}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className={styles.grid}>
          {STORIES.map((story) => (
            <StoryCard key={story.id} story={story} lang={lang} T={T} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
