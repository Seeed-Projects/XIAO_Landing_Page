"use client";

import { SiteHeader } from "../components";
import { ToolPageIntro } from "../tool-page-intro";
import { useLang } from "../i18n";
import { OfficialSection } from "./OfficialStory";
import { CommunitySection } from "./CommunitySection";
import styles from "./software-center.module.css";

const INTRO = {
  en: "Discover compatible development environments, frameworks, libraries, and integrations to get started with development and bring your XIAO projects to life.",
  zh: "发现兼容的开发环境、框架、库与集成方案，快速上手开发，让你的 XIAO 项目真正落地。",
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
