"use client";

import Link from "next/link";
import { SiteHeader } from "../components";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import styles from "./playground.module.css";

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

function ToolIcon({ type }) {
  if (type === "pin") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 10v8m9-8v8m9-8v8M15 30v8m9-8v8m9-8v8M10 15h8m12 0h8M10 24h8m12 0h8M10 33h8m12 0h8"/><rect x="18" y="18" width="12" height="12" rx="2"/></svg>;
  if (type === "flash") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 5 13 27h10l-2 16 14-23H25l2-15Z"/></svg>;
  if (type === "files") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 8h16l8 8v24H12V8Z"/><path d="M28 8v9h8M18 25h12M18 31h12"/></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 15-9 9 9 9M31 15l9 9-9 9M27 9l-6 30"/></svg>;
}

export default function PlaygroundPage() {
  const { lang } = useLang();
  const zh = lang === "zh";

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.grid} aria-hidden="true" />
          <div className={styles.orbit} aria-hidden="true" />
          <div className={styles.copy}>
            <span className={styles.kicker}>XIAO PLAYGROUND · OPEN SOURCE</span>
            <h1>{zh ? "从一个引脚，走到完整作品" : "From one pin to a finished build"}</h1>
            <p>{zh ? "Pinout、硬件资料、软件指南与网页固件烧录集中在一个入口。少一点查找，多一点构建。" : "Pinouts, hardware resources, software guides and browser-based firmware flashing—one place to move from board to build."}</p>
            <div className={styles.actions}>
              <Link href="/playground/pinout">{zh ? "从 Pinout 开始" : "Start with Pinout"}<span>→</span></Link>
              <Link href="/playground/esp-flasher" className={styles.ghost}>{zh ? "打开网页烧录器" : "Open Web Flasher"}</Link>
            </div>
          </div>
          <div className={styles.boardStage}>
            <span className={styles.boardHalo} aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/playground-xiao-transparent.png")} alt="Front and back views of the Seeed Studio XIAO ESP32-S3" />
            <span className={`${styles.port} ${styles.portOne}`}>GPIO</span>
            <span className={`${styles.port} ${styles.portTwo}`}>FLASH</span>
            <span className={`${styles.port} ${styles.portThree}`}>DOCS</span>
          </div>
        </section>

        <section className={styles.toolSection}>
          <div className={styles.sectionHead}>
            <span>{zh ? "选择你的下一步" : "Choose your next step"}</span>
            <h2>{zh ? "开发所需，全部就位" : "Everything you need to keep building"}</h2>
          </div>
          <div className={styles.toolGrid}>
            {TOOLS.map((tool) => {
              const content = zh ? tool.zh : tool.en;
              return (
                <Link key={tool.key} href={tool.href} className={styles.toolCard}>
                  <span className={styles.toolIcon}><ToolIcon type={tool.icon} /></span>
                  <span className={styles.toolCopy}>
                    <strong>{content[0]}</strong>
                    <small>{content[1]}</small>
                  </span>
                  <span className={styles.arrow}>↗</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
