"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import styles from "./project-hub.module.css";

const PROJECTS_YAML_URL =
  "https://raw.githubusercontent.com/Carla-Guo/OSHW-XIAO-Series/main/projects.yaml";
const JSYAML_CDN =
  "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js";

const HERO_IMG =
  "https://hackster.imgix.net/uploads/attachments/1958177/_TKgDFJ5Vnp.blob?auto=compress%2Cformat&fit=min&h=675&w=900";
const HERO_LINK =
  "https://www.hackster.io/rishabh-jain5/trailnav-solar-powered-off-grid-exploration-device-bb35b2";
const HUB_IFRAME = "https://seeed-studio.github.io/OSHW-XIAO-Series/";
const CONTRIBUTE_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSdiju4D3-h0fZavfZeRrXcOtAh-Lb7Ll8zbrkziB94RCvbZrQ/viewform";
const GITHUB_LINK = "https://github.com/Seeed-Studio/OSHW-XIAO-Series";

/* 应用方向（13 个）—— 与参考一致 */
const APPLICATION_DIRECTIONS = [
  ["AI Gadget", "AI 智能设备"],
  ["Gaming", "游戏与互动"],
  ["Hardware Design", "硬件设计"],
  ["Healthcare", "医疗健康"],
  ["IoT", "物联网"],
  ["LED Lighting", "LED 灯光"],
  ["Mechanical Keyboard", "机械键盘"],
  ["Robotics", "机器人"],
  ["Scientific Tools", "科学工具"],
  ["Smart Home", "智能家居"],
  ["Telecommunication", "通信连接"],
  ["Tools & Accessories", "工具与配件"],
  ["Wearables", "可穿戴设备"],
];

const METRICS = [
  ["100+", "metricProjects", "community projects", "社区项目"],
  ["13", "metricAreas", "application areas", "应用方向"],
  ["10+", "metricBoards", "XIAO boards", "XIAO 开发板"],
  ["6", "metricSources", "source platforms", "内容来源"],
];

const T = {
  en: {
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
    sourceNote:
      "Curated from GitHub, YouTube, Hackster, Instructables, Hackaday and independent web projects. Updated regularly by the Seeed Studio community.",
    appDirLabel: "APPLICATION DIRECTION",
    latestCount: "LATEST 10",
    loading: "Loading latest projects…",
    error: "Unable to load the latest projects.",
    subscribeToast: "Project updates subscribed",
    selectedToast: (label) => `Selected ${label}`,
  },
  zh: {
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
    sourceNote:
      "内容整理自 GitHub、YouTube、Hackster、Instructables、Hackaday 和独立网页项目，由 Seeed Studio 社区持续更新。",
    appDirLabel: "应用方向",
    latestCount: "最近 10 个",
    loading: "正在加载最近项目…",
    error: "无法加载最近项目。",
    subscribeToast: "已订阅项目更新",
    selectedToast: (label) => `已选择 ${label}`,
  },
};

function loadJsYaml() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.jsyaml) return resolve(window.jsyaml);
    const existing = document.getElementById("jsyaml-cdn");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.jsyaml));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.id = "jsyaml-cdn";
    s.src = JSYAML_CDN;
    s.async = true;
    s.onload = () => resolve(window.jsyaml);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function ProjectHub() {
  const { lang, setLang } = useLang();
  const [recent, setRecent] = useState([]);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState("");

  const railRef = useRef(null);
  const leadRef = useRef(null);
  const sideRef = useRef(null);
  const recentListRef = useRef(null);
  const railPausedRef = useRef(false);
  const toastTimer = useRef(null);

  const t = T[lang];

  function notify(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }

  /* 加载最近项目 */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        await loadJsYaml();
        const response = await fetch(PROJECTS_YAML_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const source = await response.text();
        const jsyaml = window.jsyaml;
        let parsed;
        try {
          parsed = jsyaml.load(source);
        } catch {
          parsed = jsyaml.load(source.replace(/^﻿?projects:\s*\r?\n/, ""));
        }
        let projects = Array.isArray(parsed) ? parsed : parsed?.projects;
        if (!Array.isArray(projects)) {
          projects = jsyaml.load(source.replace(/^﻿?projects:\s*\r?\n/, ""));
        }
        const mapped = (projects || [])
          .filter((p) => p && p.name && p.link)
          .slice(0, 10)
          .map((p) => {
            const nameEn = p.name?.en || p.name?.zh || p.name || "Untitled Project";
            const nameZh = p.name?.zh || nameEn;
            const categoryEn = p.category?.en || p.category?.zh || "Project";
            const categoryZh = p.category?.zh || categoryEn;
            const month = String(p.month || "").padStart(2, "0");
            const date = p.year ? `${p.year}.${month}` : "LATEST";
            return [nameEn, categoryZh, p.link, p.image || "", categoryEn, nameZh, date];
          });
        if (!cancelled) {
          setRecent(mapped);
          setStatus(mapped.length ? "ok" : "error");
        }
      } catch (e) {
        if (!cancelled) setStatus("error");
        // eslint-disable-next-line no-console
        console.error("Unable to load projects.yaml", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* rail 无限滚动 */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf;
    const loop = () => {
      if (!railPausedRef.current) {
        rail.scrollLeft += 0.45;
        if (rail.scrollLeft >= rail.scrollWidth / 2) {
          rail.scrollLeft -= rail.scrollWidth / 2;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const enter = () => (railPausedRef.current = true);
    const leave = () => (railPausedRef.current = false);
    rail.addEventListener("mouseenter", enter);
    rail.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      rail.removeEventListener("mouseenter", enter);
      rail.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* 侧栏高度跟随 lead（桌面端） */
  useEffect(() => {
    const lead = leadRef.current;
    const side = sideRef.current;
    if (!lead || !side) return;
    const match = () => {
      if (window.innerWidth > 900) {
        side.style.height = lead.getBoundingClientRect().height + "px";
      } else {
        side.style.removeProperty("height");
      }
    };
    const ro = new ResizeObserver(match);
    ro.observe(lead);
    window.addEventListener("resize", match);
    match();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", match);
    };
  }, []);

  /* 最近项目列表滚动锁定（边缘不冒泡） */
  useEffect(() => {
    const list = recentListRef.current;
    if (!list) return;
    const onWheel = (e) => {
      const atTop = list.scrollTop <= 0;
      const atBottom =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
      e.preventDefault();
      e.stopPropagation();
      list.scrollTop += e.deltaY;
    };
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, []);

  function setLanguage(next) {
    setLang(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    }
  }

  function slideRail(d) {
    railRef.current?.scrollBy({ left: d * 650, behavior: "smooth" });
  }

  const railCards = [...APPLICATION_DIRECTIONS, ...APPLICATION_DIRECTIONS];

  return (
    <div className={styles.hub}>
      <div className={styles.noise} />

      <Reveal as="header" className={styles.projectIntro}>
        <div className={styles.languageSwitch} aria-label="Language">
          <button
            className={lang === "en" ? styles.active : ""}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <span>|</span>
          <button
            className={lang === "zh" ? styles.active : ""}
            onClick={() => setLanguage("zh")}
          >
            中文
          </button>
        </div>
        <div>
          <div className={styles.seeedLogo} aria-label="Seeed Studio">
            <span className={styles.seeedWord}>Seeed</span>
            <span className={styles.studioWord}>Studio</span>
          </div>
          <Glow as="h1">XIAO Project Hub</Glow>
        </div>
        <p>Discover what you can build with XIAO</p>
      </Reveal>

      <main>
        <Reveal as="section" className={styles.hero}>
          <article className={styles.lead} ref={leadRef}>
            <div
              className={styles.leadArt}
              style={{ backgroundImage: `url('${HERO_IMG}')` }}
            />
            <div className={styles.leadCopy}>
              <div className={styles.eyebrow}>
                <span className={styles.liveDot} />
                <span>{t.heroEyebrow}</span>
              </div>
              <h1>
                TrailNAV:
                <br />
                Solar-Powered
                <br />
                Off-Grid
              </h1>
              <p className={styles.dek}>{t.heroDek}</p>
              <div className={styles.meta}>
                <a className={styles.play} href={HERO_LINK} target="_blank" rel="noopener">
                  {t.viewProject}
                </a>
                <span>Rishabh Jain</span>
                <span>2026.06 · Hackster</span>
              </div>
            </div>
          </article>

          <aside className={styles.side} ref={sideRef}>
            <div className={styles.sideHead}>
              <div>
                <Glow as="h2">{t.recentTitle}</Glow>
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
            <div className={styles.episodeList} ref={recentListRef}>
              {status === "loading" && (
                <p className={styles.projectStatus}>{t.loading}</p>
              )}
              {status === "error" && (
                <p className={`${styles.projectStatus} ${styles.error}`}>{t.error}</p>
              )}
              {status === "ok" &&
                recent.map((p, i) => (
                  <a
                    key={i}
                    className={styles.ep}
                    href={p[2]}
                    target="_blank"
                    rel="noopener"
                  >
                    <div
                      className={styles.thumb}
                      data-no={String(i + 1).padStart(2, "0")}
                      style={{
                        backgroundImage: `linear-gradient(90deg,#1112,#1112),url('${p[3]}')`,
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

        <Reveal as="section" className={styles.ecosystemStrip}>
          {METRICS.map((m) => (
            <div key={m[1]}>
              <strong>{m[0]}</strong>
              <span>{lang === "en" ? m[2] : m[3]}</span>
            </div>
          ))}
        </Reveal>

        <Reveal as="section" id="archive" className={styles.archive}>
          <span className={styles.sectionKicker}>EXPLORE BY APPLICATION</span>
          <div className={styles.archiveTitle}>
            <Glow as="h2">{t.applicationTitle}</Glow>
          </div>
          <div className={styles.rail} ref={railRef}>
            {railCards.map((p, i) => {
              const n = (i % APPLICATION_DIRECTIONS.length) + 1;
              const x = ((n - 1) % 4) * (100 / 3);
              const y = Math.floor((n - 1) / 4) * (100 / 3);
              const primary = lang === "en" ? p[0] : p[1];
              const secondary = lang === "en" ? p[1] : p[0];
              return (
                <article
                  key={i}
                  className={styles.card}
                  aria-hidden={i >= APPLICATION_DIRECTIONS.length ? "true" : undefined}
                  onClick={() => notify(t.selectedToast(p[0]))}
                >
                  <div
                    className={`${styles.cardArt} ${styles.applicationImage}`}
                    style={{
                      backgroundImage: `linear-gradient(0deg,#05070599,transparent 58%),url('/application-scenes.png')`,
                      backgroundSize: "100% 100%, 400% 400%",
                      backgroundPosition: `center, ${x}% ${y}%`,
                    }}
                  >
                    <span className={styles.cardNo}>
                      {String(n).padStart(2, "0")}
                    </span>
                  </div>
                  <time>{t.appDirLabel}</time>
                  <h3>
                    {primary}
                    <br />
                    <small>{secondary}</small>
                  </h3>
                </article>
              );
            })}
          </div>
        </Reveal>

        <Reveal as="section" className={styles.browserSection}>
          <div className={styles.collectionIntro}>
            <div>
              <span className={styles.sectionKicker}>FULL PROJECT COLLECTION</span>
              <Glow as="h2">{t.collectionTitle}</Glow>
            </div>
            <p>{t.collectionDek}</p>
          </div>
          <div className={styles.browser}>
            <div className={styles.chrome}>
              <div className={styles.lights}>
                <i />
                <i />
                <i />
              </div>
              <a className={styles.url} href={HUB_IFRAME} target="_blank" rel="noopener">
                🔒 seeed-studio.github.io/OSHW-XIAO-Series/
              </a>
              <div />
            </div>
            <div className={styles.browserBody}>
              <iframe
                className={styles.liveSite}
                src={HUB_IFRAME}
                title="OSHW XIAO Series 互动网页"
                loading="lazy"
                allow="fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className={styles.browserShield} />
            </div>
          </div>

          <div className={styles.contribute}>
            <div>
              <span className={styles.sectionKicker}>OPEN SOURCE · COMMUNITY DRIVEN</span>
              <Glow as="h2">{t.contributeTitle}</Glow>
              <p>{t.contributeDek}</p>
            </div>
            <a href={CONTRIBUTE_LINK} target="_blank" rel="noopener">
              {t.contributeButton}
            </a>
          </div>
          <footer className={styles.sourceNote}>{t.sourceNote}</footer>
        </Reveal>
      </main>

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
