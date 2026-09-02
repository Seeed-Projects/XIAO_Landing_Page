"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import styles from "./project-hub.module.css";

const HERO_IMG = "/project-hub-projects/forager.jpg";
const HERO_LINK =
  "https://www.hackster.io/rishabh-jain5/trailnav-solar-powered-off-grid-exploration-device-bb35b2";
const HUB_IFRAME = "https://seeed-studio.github.io/OSHW-XIAO-Series/";
const HUB_EMBED = "/project-hub-embed.html";
const CONTRIBUTE_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSdiju4D3-h0fZavfZeRrXcOtAh-Lb7Ll8zbrkziB94RCvbZrQ/viewform";
const GITHUB_LINK = "https://github.com/Seeed-Studio/OSHW-XIAO-Series";

// Six editorially selected projects with local, article-sourced images.
const SHOWCASE_PROJECTS = [
  ["Forager", "机械键盘", "https://github.com/carrefinho/forager", "/project-hub-projects/forager.jpg", "Mechanical Keyboard", "Forager", "2024.07"],
  ["Visorbearer", "机械键盘", "https://github.com/carrefinho/visorbearer", "/project-hub-projects/visorbearer.png", "Mechanical Keyboard", "Visorbearer", "2025.08"],
  ["AtmosGuard C5: Dual-Band IAQ & Cloud Logger", "智能家居", "https://www.hackster.io/hendra/atmosguard-c5-dual-band-iaq-cloud-logger-72ff46", "/project-hub-projects/atmosguard.jpg", "Smart Home", "AtmosGuard C5: 双频 IAQ 与云端记录仪", "2026.01"],
  ["Final Countdown", "工具配件", "https://www.hackster.io/dquadros2/final-countdown-3fe49b", "/project-hub-projects/final-countdown.jpg", "Tools & Accessories", "Final Countdown", "2025.09"],
  ["Prospector", "机械键盘", "https://github.com/carrefinho/prospector", "/project-hub-projects/prospector.jpg", "Mechanical Keyboard", "Prospector", "2024.11"],
  ["E61 Gauge", "工具配件", "https://github.com/gidim/e61-gauge", "/project-hub-projects/e61-gauge.jpg", "Tools & Accessories", "E61 模拟温度表", "2026.05"],
];

const METRICS = [
  ["100+", "metricProjects", "community projects", "社区项目"],
  ["13", "metricAreas", "application areas", "应用方向"],
  ["10+", "metricBoards", "XIAO boards", "XIAO 开发板"],
  ["6", "metricSources", "source platforms", "内容来源"],
];

const T = {
  en: {
    introTagline:
      "Discover what you can build with XIAO through real projects from makers around the world. Find an idea, learn from the build, and make it your own.",
    introKicker: "DISCOVER · BUILD · SHARE",
    contributeIntro:
      "Built something with XIAO? Add your project to the community collection.",
    heroEyebrow: "FEATURED PROJECT · XIAO ESP32-C6",
    heroDek:
      "A solar-powered offline navigation device for outdoor exploration, waypoint tracking and off-grid adventures, integrating ePaper, GPS, a digital compass and MPPT solar charging.",
    viewProject: "View full project →",
    recentTitle: "Recent Projects",
    subscribe: "Follow updates →",
    subscribeNote: "A weekly curated project update",
    applicationTitle: "Application Areas",
    collectionTitle: "Explore every project",
    collectionDek:
      "Continue into the complete hub to compare boards, categories, sources and publication dates.",
    contributeTitle: "Built something with XIAO?",
    contributeDek:
      "Share your work with makers around the world and help grow the project collection.",
    contributeButton: "Contribute your project →",
    contributeKicker: "OPEN SOURCE · COMMUNITY DRIVEN",
    sourceLabel: "PROJECT SOURCES",
    sourceNote:
      "Curated from GitHub, YouTube, Hackster, Instructables, Hackaday and independent web projects. Updated regularly by the Seeed Studio community.",
    appDirLabel: "APPLICATION DIRECTION",
    latestCount: "LATEST 6",
    loading: "Loading latest projects…",
    error: "Unable to load the latest projects.",
    subscribeToast: "Project updates subscribed",
    selectedToast: (label) => `Selected ${label}`,
  },
  zh: {
    introTagline:
      "从世界各地创客的真实作品中，发现 XIAO 可以实现什么。寻找灵感、参考构建过程，再创造属于你的版本。",
    introKicker: "发现 · 构建 · 分享",
    contributeIntro:
      "用 XIAO 做出了新项目？把它加入社区项目集合。",
    heroEyebrow: "精选项目 · XIAO ESP32-C6",
    heroDek:
      "一款面向户外探索、航点追踪与离网冒险的太阳能离线导航设备，集成电子纸、GPS、数字罗盘与 MPPT 太阳能充电。",
    viewProject: "查看完整项目 →",
    recentTitle: "最近项目",
    subscribe: "订阅追踪 →",
    subscribeNote: "每周获取一期精选项目更新",
    applicationTitle: "应用方向",
    collectionTitle: "浏览全部项目",
    collectionDek:
      "进入完整项目中心，按开发板、应用类别、内容来源和发布日期继续探索。",
    contributeTitle: "你也用 XIAO 做了项目？",
    contributeDek:
      "把作品分享给世界各地的创客，一起扩展这个开放项目集合。",
    contributeButton: "提交你的项目 →",
    contributeKicker: "开源共创 · 由社区驱动",
    sourceLabel: "内容来源",
    sourceNote:
      "内容整理自 GitHub、YouTube、Hackster、Instructables、Hackaday 和独立网页项目，由 Seeed Studio 社区持续更新。",
    appDirLabel: "应用方向",
    latestCount: "最近 6 个",
    loading: "正在加载最近项目…",
    error: "无法加载最近项目。",
    subscribeToast: "已订阅项目更新",
    selectedToast: (label) => `已选择 ${label}`,
  },
};

export function ProjectHub() {
  const { lang } = useLang();
  const recent = SHOWCASE_PROJECTS;
  const status = "ok";
  const [toast, setToast] = useState("");
  const [embedHeight, setEmbedHeight] = useState(1400);
  const [selectedProject, setSelectedProject] = useState(0);

  const toastTimer = useRef(null);

  const t = T[lang];
  const featured = recent[selectedProject];
  const featuredTitle = featured
    ? lang === "en"
      ? featured[0]
      : featured[5]
    : "TrailNAV: Solar-Powered Off-Grid";
  const featuredCategory = featured
    ? lang === "en"
      ? featured[4]
      : featured[1]
    : "Outdoor · Navigation";
  const featuredImage = withBase(featured?.[3] || HERO_IMG);
  const featuredLink = featured?.[2] || HERO_LINK;

  function notify(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "xiao-project-hub-height") return;
      const nextHeight = Number(event.data.height);
      if (!Number.isFinite(nextHeight) || nextHeight < 300) return;
      setEmbedHeight(Math.ceil(nextHeight));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className={styles.hub}>
      <div className={styles.noise} />

      <Reveal as="header" className={styles.projectIntro}>
        <div className={styles.introVisual}>
          <Image
            src={withBase("/projecthub-hero.webp")}
            alt=""
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className={styles.introShade} />
        <div className={styles.introCopy}>
          <Glow as="h1">XIAO Project Hub</Glow>
          <p>{t.introTagline}</p>
          <div className={styles.introAction}>
            <a href={CONTRIBUTE_LINK} target="_blank" rel="noopener">
              {t.contributeButton}
            </a>
            <span>{t.contributeIntro}</span>
          </div>
        </div>
        <div className={styles.introMetrics} aria-label="Project Hub statistics">
          {METRICS.map((m) => (
            <div key={m[1]}>
              <strong>{m[0]}</strong>
              <span>{lang === "en" ? m[2] : m[3]}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <main>
        <Reveal as="section" className={styles.hero}>
          <article className={styles.lead}>
            <div
              className={styles.leadArt}
              style={{ backgroundImage: `url('${featuredImage}')` }}
            />
            <div className={styles.leadCopy}>
              <span className={styles.featuredLabel}>{t.heroEyebrow}</span>
              <h1>{featuredTitle}</h1>
              <p className={styles.dek}>
                {featured ? `${featured[6]} · ${featuredCategory}` : t.heroDek}
              </p>
              <div className={styles.meta}>
                <a className={styles.play} href={featuredLink} target="_blank" rel="noopener">
                  {t.viewProject}
                </a>
                <span>{featured ? featured[6] : "2026.06 · Hackster"}</span>
              </div>
            </div>
            {recent.length > 1 && (
              <div className={styles.projectDots} aria-label={t.recentTitle}>
                {recent.slice(0, 6).map((project, index) => (
                  <button
                    key={project[2]}
                    type="button"
                    className={index === selectedProject ? styles.activeDot : ""}
                    onClick={() => setSelectedProject(index)}
                    aria-label={`${index + 1}. ${lang === "en" ? project[0] : project[5]}`}
                    aria-pressed={index === selectedProject}
                  />
                ))}
              </div>
            )}
          </article>

          <aside className={styles.side}>
            <div className={styles.sideHead}>
              <div>
                <h2>{t.recentTitle}</h2>
                <span className={styles.count}>{t.latestCount}</span>
              </div>
              <div className={styles.subscribeCluster}>
                <button
                  className={styles.sideSubscribe}
                  onClick={() => notify(t.subscribeToast)}
                >
                  <span />
                  <b>{t.subscribe}</b>
                </button>
                <small>{t.subscribeNote}</small>
              </div>
            </div>
            <div className={styles.episodeList}>
              {status === "loading" && (
                <p className={styles.projectStatus}>{t.loading}</p>
              )}
              {status === "error" && (
                <p className={`${styles.projectStatus} ${styles.error}`}>{t.error}</p>
              )}
              {status === "ok" &&
                recent.slice(0, 6).map((p, i) => (
                  <a
                    key={i}
                    className={`${styles.ep} ${i === selectedProject ? styles.selectedEp : ""}`}
                    href={p[2]}
                    target="_blank"
                    rel="noopener"
                    onMouseEnter={() => setSelectedProject(i)}
                    onFocus={() => setSelectedProject(i)}
                  >
                    <div
                      className={styles.thumb}
                      data-no={String(i + 1).padStart(2, "0")}
                      style={{
                        backgroundImage: `url('${withBase(p[3])}')`,
                      }}
                    />
                    <div>
                      <small>
                        {p[6]} · {lang === "en" ? p[4] : p[1]}
                      </small>
                      <h3>{lang === "en" ? p[0] : p[5]}</h3>
                    </div>
                  </a>
                ))}
            </div>
          </aside>
        </Reveal>

        <Reveal as="section" className={styles.browserSection}>
          <div className={styles.collectionIntro}>
            <div>
              <Glow as="h2">{t.collectionTitle}</Glow>
            </div>
            <p>{t.collectionDek}</p>
          </div>
          <div className={styles.browserBody} style={{ height: embedHeight }}>
            <iframe
              className={styles.liveSite}
              src={withBase(HUB_EMBED)}
              title="OSHW XIAO Series 互动网页"
              loading="lazy"
              allow="fullscreen"
              scrolling="no"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </Reveal>
      </main>

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
