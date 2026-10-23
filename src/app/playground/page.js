"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "../components";
import { ToolPageIntro } from "../tool-page-intro";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import styles from "./playground.module.css";
import { PlaygroundToolIcon as ToolIcon } from "../playground-tool-icon";
import { createStoryPlayback } from "../software-center/story-playback.mjs";

const TOOLS = [
  {
    key: "pinout",
    href: "/playground/pinout",
    icon: "pin",
    video: "/playground/pinout-preview.mp4",
    poster: "/playground/pinout-preview.webp",
    en: {
      title: "XIAO Pinout",
      description: "Choose a XIAO, inspect both sides of the board, search pins and open a pin for wiring notes and alternate functions.",
      details: ["Board picker", "Pin search", "Wiring notes"],
      action: "Explore pinout",
    },
    zh: {
      title: "XIAO 引脚定义",
      description: "选择 XIAO 型号，查看正反面引脚图，搜索引脚，并打开具体引脚查看接线提示与复用功能。",
      details: ["选开发板", "搜引脚", "看接线提示"],
      action: "查看引脚",
    },
  },
  {
    key: "flash",
    href: "/playground/esp-flasher",
    icon: "flash",
    images: [
      "/home/playground-boards/esp32-s3.webp",
      "/home/playground-boards/esp32-c3.webp",
      "/home/playground-boards/esp32-c6.webp",
      "/home/playground-boards/esp32-c5.webp",
    ],
    en: {
      title: "XIAO ESP32 Series Web Flasher",
      description: "Pick your XIAO ESP32 board and firmware, then connect over USB to flash it and check the serial output.",
      details: ["Sample or local .bin", "USB flashing", "Serial monitor"],
      action: "Open web flasher",
    },
    zh: {
      title: "XIAO ESP32 系列网页烧录器",
      description: "选择 XIAO ESP32 开发板和固件，通过 USB 完成烧录，并查看串口运行输出。",
      details: ["示例或本地 .bin", "USB 烧录", "串口监视器"],
      action: "打开烧录器",
    },
  },
  {
    key: "resources",
    href: "/res",
    icon: "files",
    en: {
      title: "XIAO Hardware Resources",
      description: "Pick a XIAO to get schematics, KiCad files, dimensions, 3D models and firmware, plus the series-wide KiCad design kit.",
      details: ["Design files", "3D & dimensions", "KiCad design kit"],
      action: "Browse resources",
    },
    zh: {
      title: "XIAO 硬件资料",
      description: "选择开发板，获取设计文件、尺寸图、3D 模型、固件及全系列 KiCad 套件。",
      details: ["设计文件", "3D 与尺寸图", "KiCad 设计套件"],
      action: "浏览硬件资料",
    },
  },
  {
    key: "software",
    href: "/software-center",
    icon: "code",
    en: {
      title: "XIAO Software Ecosystem",
      description: "Explore official XIAO software for smart homes, cross-chip development, displays and AI, alongside community tools.",
      details: ["Official software stories", "Smart home & AI", "Community tools"],
      action: "Explore software",
    },
    zh: {
      title: "XIAO 软件生态",
      description: "探索 XIAO 官方软件，了解智能家居、跨芯片开发、屏幕与 AI 应用，并发现社区工具。",
      details: ["官方软件", "智能家居与 AI", "社区工具"],
      action: "探索软件",
    },
  },
];

const RESOURCE_FILES = [
  { name: "Datasheet", format: "PDF", image: "/res-generic/datasheet.webp" },
  { name: "Schematic", format: "PDF", image: "/res-generic/schematic.webp" },
  { name: "KiCad", format: "ZIP", image: "/res-generic/pcb-source.webp" },
  { name: "Dimensions", format: "DXF", image: "/res-generic/dxf.webp" },
  { name: "3D model", format: "STEP", image: "/res-generic/3d-model.webp" },
];

const SOFTWARE_STORIES = [
  { name: "Zephyr RTOS", image: "/software-animations/zephyr.webp" },
  { name: "Home Assistant", image: "/software-animations/ha.webp" },
];

function PreviewImage({ image, width, height }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={withBase(image)} alt="" width={width} height={height} loading="lazy" />
  );
}

/**
 * Plays a viewport-aware loop with a static poster for motion preferences and media errors.
 * 按视口可见性播放循环动画，并在动态偏好或媒体错误时显示静态封面。
 */
function LoopPreview({ video, poster }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const controller = useRef(null);
  const [state, setState] = useState({ playing: false, still: false });
  const source = withBase(video);

  useEffect(() => {
    const playback = createStoryPlayback(videoRef.current, source, setState);
    controller.current = playback;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => playback.setReducedMotion(preference.matches);
    const syncVisibility = () => playback.setPageVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      (entries) => entries.forEach((entry) => playback.setVisible(entry.isIntersecting)),
      { threshold: 0 }
    );
    if (observer) observer.observe(ref.current);
    else playback.setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
      playback.destroy();
      controller.current = null;
    };
  }, [source]);

  return (
    <div ref={ref} className={styles.loopScreen} data-still={state.still ? "1" : "0"}
      style={{ backgroundImage: `url("${withBase(poster)}")` }}>
      <video ref={videoRef} className={styles.loopVideo} muted loop playsInline preload="none"
        poster={withBase(poster)} width="1280" height="800" aria-hidden="true"
        onError={() => controller.current?.fail()} />
    </div>
  );
}

function ResourcePreview() {
  return (
    <div className={styles.resourceLibrary}>
      <span className={styles.resourceBoard}>
        <PreviewImage image="/home/playground-boards/esp32-s3.webp" />
        XIAO ESP32-S3
      </span>
      <div className={styles.resourceFiles}>
        {RESOURCE_FILES.map((file) => (
          <div key={file.name} className={styles.resourceFile}>
            <div className={styles.resourceThumb}>
              <PreviewImage image={file.image} />
            </div>
            <div className={styles.resourceCaption}>
              <span className={styles.resourceName}>{file.name}</span>
              <span className={styles.resourceFormat}>{file.format}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SoftwarePreview() {
  return (
    <div className={styles.softwareEcosystem}>
      <div className={styles.storyDeck}>
        {SOFTWARE_STORIES.map((story) => (
          <div key={story.name} className={styles.storyScreen}>
            <PreviewImage image={story.image} width="1200" height="720" />
            <div className={styles.storyCaption}>
              <span className={styles.storyBadge}>{story.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.communityStrip}>
        <span className={styles.communityLabel}>Community ecosystem</span>
        <div className={styles.communityNames}>
          <span>PlatformIO</span><span>CircuitPython</span><span>Matter</span><span>Edge Impulse</span>
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const { lang } = useLang();
  const zh = lang === "zh";

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className="scroll-mt-24" id="top">
          <ToolPageIntro
            title="XIAO Playground"
            description={
              zh
                ? "从接线到运行，按眼前的任务找到合适的 XIAO 工具。"
                : "From first wiring to working firmware, find the XIAO tool for your next step."
            }
          />
        </section>

        <section className={styles.toolSection}>
          <div className={styles.toolGrid}>
            {TOOLS.map((tool, index) => {
              const content = zh ? tool.zh : tool.en;
              return (
                <article key={tool.key} id={`tool-${tool.key}`} className={`${styles.toolCard} ${styles[tool.key]} ${index % 2 ? styles.toolReverse : ""}`}>
                  <div className={styles.toolPreview} aria-hidden="true">
                    {tool.video ? (
                      <LoopPreview video={tool.video} poster={tool.poster} />
                    ) : tool.images ? (
                      <div className={styles.boardFamily}>
                        {tool.images.map((image, imageIndex) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={image} src={withBase(image)} alt="" loading="lazy" style={{ "--board-index": imageIndex }} />
                        ))}
                      </div>
                    ) : tool.key === "resources" ? (
                      <ResourcePreview />
                    ) : tool.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={withBase(tool.image)} alt="" loading="lazy" />
                    ) : (
                      <SoftwarePreview />
                    )}
                  </div>
                  <div className={styles.toolContent}>
                    <span className={styles.toolIcon}><ToolIcon type={tool.icon} /></span>
                    <h2 className="home-type-subtitle">{content.title}</h2>
                    <p className="home-type-body">{content.description}</p>
                    <ul className={styles.toolDetails}>
                      {content.details.map((detail) => <li key={detail}>{detail}</li>)}
                    </ul>
                    <Link href={tool.href} className={`home-type-action home-filled-action home-primary-cta ${styles.toolAction}`}>
                      {content.action}<span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
