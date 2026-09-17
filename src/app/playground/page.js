"use client";

import Link from "next/link";
import { SiteHeader } from "../components";
import { Glow } from "../Glow";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import styles from "./playground.module.css";
import { PlaygroundToolIcon as ToolIcon } from "../playground-tool-icon";

const TOOLS = [
  {
    key: "pinout",
    href: "/playground/pinout",
    icon: "pin",
    en: ["Pinout", "Read every GPIO, power rail and interface at a glance."],
    zh: ["引脚定义", "快速查看每个 GPIO、电源引脚与通信接口。"],
  },
  {
    key: "flash",
    href: "/playground/esp-flasher",
    icon: "flash",
    en: ["Web Flasher", "Connect a supported XIAO and install tested firmware in the browser."],
    zh: ["网页烧录器", "连接受支持的 XIAO，直接在浏览器中安装已测试固件。"],
  },
  {
    key: "resources",
    href: "/res",
    icon: "files",
    en: ["Hardware Resources", "Find datasheets, schematics, footprints, dimensions and 3D files."],
    zh: ["硬件资料", "集中查找数据手册、原理图、封装、尺寸与 3D 文件。"],
  },
  {
    key: "software",
    href: "/software-center",
    icon: "code",
    en: ["Software Guide", "Choose official and community software for your XIAO workflow."],
    zh: ["软件指南", "选择适合 XIAO 开发流程的官方与社区软件。"],
  },
];

const CTA_ARROW = (
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
);

export default function PlaygroundPage() {
  const { lang } = useLang();
  const zh = lang === "zh";

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/playground-bg.webp")} alt="" aria-hidden="true" className={styles.heroBg} />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.grid} aria-hidden="true" />
          <div className={styles.orbit} aria-hidden="true" />
          <div className={`page-hero-copy ${styles.copy}`}>
            <Glow
              as="h1"
              className="products-hero-title home-type-hero-title text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            >
              {zh ? "从一个引脚，走到完整作品" : "From one pin to a finished build"}
            </Glow>
            <p className="page-hero-description home-type-body text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              {zh
                ? "Pinout、硬件资料、软件指南与网页固件烧录集中在一个入口。少一点查找，多一点构建。"
                : "Pinouts, hardware resources, software guides and browser-based firmware flashing—one place to move from board to build."}
            </p>
            <div className={styles.actions}>
              <Link
                href="/playground/pinout"
                className="home-type-action home-filled-action home-primary-cta"
                style={{ color: "#fff" }}
              >
                {zh ? "从 Pinout 开始" : "Start with Pinout"}
                {CTA_ARROW}
              </Link>
              <Link
                href="/playground/esp-flasher"
                className={`home-type-action home-text-action ${styles.secondaryLink}`}
              >
                {zh ? "打开网页烧录器" : "Open Web Flasher"} ↗
              </Link>
            </div>
          </div>
          <div className={styles.boardStage}>
            <span className={styles.boardHalo} aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/playground-hero.webp")} alt="Seeed Studio XIAO Playground overview" />
            <span className={`${styles.port} ${styles.portOne}`}>GPIO</span>
            <span className={`${styles.port} ${styles.portTwo}`}>FLASH</span>
            <span className={`${styles.port} ${styles.portThree}`}>DOCS</span>
          </div>
        </section>

        <section className={styles.toolSection}>
          <div className={styles.sectionHead}>
            <h2 className="home-type-title">{zh ? "开发所需，全部就位" : "Everything you need to keep building"}</h2>
          </div>
          <div className={styles.toolGrid}>
            {TOOLS.map((tool) => {
              const content = zh ? tool.zh : tool.en;
              return (
                <Link key={tool.key} href={tool.href} className={styles.toolCard}>
                  <span className={styles.toolIcon}><ToolIcon type={tool.icon} /></span>
                  <span className={styles.toolCopy}>
                    <strong className="home-type-subtitle">{content[0]}</strong>
                    <small className="home-type-body">{content[1]}</small>
                  </span>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
