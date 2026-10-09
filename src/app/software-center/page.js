"use client";

import { SiteHeader } from "../components";
import { ToolPageIntro } from "../tool-page-intro";
import { useLang } from "../i18n";
import { OfficialSection } from "./OfficialStory";
import { CommunitySection } from "./CommunitySection";
import styles from "./software-center.module.css";

const INTRO = {
  en: "Build with XIAO: connect a smart home, develop across chips, create a display or run AI — with official software and community tools.",
  zh: "从智能家居、跨芯片开发到屏幕界面与边缘 AI，借助官方软件和社区工具，把 XIAO 变成真正可用的产品。",
};

/**
 * Software ecosystem page: official flagship stories, then the community wall.
 * 软件生态页：官方旗舰故事，然后是社区生态墙。
 */
export default function SoftwareCenterPage() {
  const { lang } = useLang();

  return (
    <>
      <SiteHeader />
      <main className={`${styles.page} pt-16`}>
        <div className={styles.hero}>
          <ToolPageIntro
            id="top"
            title={lang === "zh" ? "软件生态" : "Software Ecosystem"}
            description={INTRO[lang] ?? INTRO.en}
          />
        </div>
        <OfficialSection />
        <CommunitySection />
      </main>
    </>
  );
}
