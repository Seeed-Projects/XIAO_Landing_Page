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
    image: "/xiao-products/pinout/s3-front.svg",
    en: {
      task: "Check pins",
      title: "XIAO Pinout",
      description: "Choose a XIAO, inspect both sides of the board, search pins and open a pin for wiring notes and alternate functions.",
      details: ["Board picker", "Pin search", "Wiring notes"],
      action: "Explore pinout",
    },
    zh: {
      task: "查接线",
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
      task: "Flash board",
      title: "XIAO ESP32 Series Web Flasher",
      description: "Pick your XIAO ESP32 board and firmware, then connect over USB to flash it and check the serial output.",
      details: ["Sample or local .bin", "USB flashing", "Serial monitor"],
      action: "Open web flasher",
    },
    zh: {
      task: "烧录固件",
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
    image: "/res-thumb/s3-3d.png",
    en: {
      task: "Find files",
      title: "XIAO Hardware Resources",
      description: "Filter by XIAO model to find the hardware files needed for PCB, enclosure and product design.",
      details: ["Datasheets", "Schematics & footprints", "Dimensions & 3D models"],
      action: "Browse resources",
    },
    zh: {
      task: "找设计文件",
      title: "XIAO 硬件资料",
      description: "按 XIAO 型号筛选，集中找到 PCB、外壳和产品设计所需的硬件文件。",
      details: ["数据手册", "原理图与封装", "尺寸图与 3D 模型"],
      action: "浏览硬件资料",
    },
  },
  {
    key: "software",
    href: "/software-center",
    icon: "code",
    en: {
      task: "Find tools",
      title: "XIAO Software Ecosystem",
      description: "Find the development environment, framework and integration that fits your XIAO project.",
      details: ["Arduino & PlatformIO", "MicroPython & Zephyr", "Board support guides"],
      action: "Explore software",
    },
    zh: {
      task: "选开发软件",
      title: "XIAO 软件生态",
      description: "为 XIAO 项目找到合适的开发环境、软件框架和集成方案。",
      details: ["Arduino 与 PlatformIO", "MicroPython 与 Zephyr", "开发板支持指南"],
      action: "探索软件",
    },
  },
];

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
          <div className={`page-hero-copy ${styles.copy}`}>
            <Glow
              as="h1"
              className="products-hero-title home-type-hero-title text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            >
              XIAO Playground
            </Glow>
            <p className="page-hero-description home-type-body text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              {zh
                ? "从接线到运行，按眼前的任务找到合适的 XIAO 工具。"
                : "From first wiring to working firmware, find the XIAO tool for your next step."}
            </p>
            <nav className={styles.taskNav} aria-label={zh ? "按任务选择工具" : "Choose a tool by task"}>
              {TOOLS.map((tool) => (
                <a key={tool.key} href={`#tool-${tool.key}`} className={`${styles.taskLink} home-type-action home-filled-action`}>
                  <span>{(zh ? tool.zh : tool.en).task}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className={styles.toolSection}>
          <div className={styles.sectionHead}>
            <h2 className="home-type-title">{zh ? "XIAO 开发工具" : "XIAO Development Tools"}</h2>
          </div>
          <div className={styles.toolGrid}>
            {TOOLS.map((tool, index) => {
              const content = zh ? tool.zh : tool.en;
              return (
                <article key={tool.key} id={`tool-${tool.key}`} className={`${styles.toolCard} ${styles[tool.key]} ${index % 2 ? styles.toolReverse : ""}`}>
                  <div className={styles.toolPreview} aria-hidden="true">
                    {tool.images ? (
                      <div className={styles.boardFamily}>
                        {tool.images.map((image, imageIndex) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={image} src={withBase(image)} alt="" loading="lazy" style={{ "--board-index": imageIndex }} />
                        ))}
                      </div>
                    ) : tool.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={withBase(tool.image)} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.softwareStack}>
                        <span>Arduino IDE</span><span>PlatformIO</span><span>MicroPython</span><span>Zephyr</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.toolContent}>
                    <span className={styles.toolIcon}><ToolIcon type={tool.icon} /></span>
                    <h3 className="home-type-subtitle">{content.title}</h3>
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
