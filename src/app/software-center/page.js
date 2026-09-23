"use client";

import { SiteHeader } from "../components";
import { ToolPageIntro } from "../tool-page-intro";
import { useLang } from "../i18n";
import { communityGroups } from "./software-data";
import { FLAGSHIP_STORIES, officialRepoUrls } from "./official-stories.mjs";
import { OfficialSection } from "./OfficialStory";
import { CommunitySection } from "./CommunitySection";
import styles from "./software-center.module.css";

const INTRO = {
  en: "Official software designed and kept up for the XIAO ecosystem, and the wall of tools built by the community.",
  zh: "为 XIAO 生态系统化设计、持续维护的官方软件，以及社区铸造的生态墙。",
};

const STATS = {
  en: ["Flagship projects", "Official repositories", "Community platforms", "Community categories"],
  zh: ["旗舰项目", "官方仓库", "社区平台", "社区分类"],
};

/**
 * Software ecosystem page: official flagship stories, then the community wall.
 * 软件生态页：官方旗舰故事，然后是社区生态墙。
 */
export default function SoftwareCenterPage() {
  const { lang } = useLang();
  const groups = communityGroups();
  const platforms = groups.reduce((total, group) => total + group.items.length, 0);
  const values = [FLAGSHIP_STORIES.length, officialRepoUrls().length, platforms, groups.length];
  const labels = STATS[lang] ?? STATS.en;

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.hero}>
          <ToolPageIntro
            id="top"
            title={lang === "zh" ? "软件生态" : "Software Ecosystem"}
            description={INTRO[lang] ?? INTRO.en}
          />
          <div className={styles.wrap}>
            <dl className={styles.stats}>
              {values.map((value, index) => (
                <div key={labels[index]} className={styles.stat}>
                  <dt className={styles.statLabel}>{labels[index]}</dt>
                  <dd className={styles.statValue}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>
        <OfficialSection />
        <CommunitySection />
      </main>
    </>
  );
}
