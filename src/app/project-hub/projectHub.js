"use client";

import { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import styles from "./project-hub.module.css";

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
  ["E61 Gauge", "工具配件", "https://github.com/gidim/e61-gauge", "/project-hub-projects/e61-gauge.png", "Tools & Accessories", "E61 模拟温度表", "2026.05"],
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
  const [embedHeight, setEmbedHeight] = useState(1400);

  const t = T[lang];

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

      <main>
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
    </div>
  );
}
