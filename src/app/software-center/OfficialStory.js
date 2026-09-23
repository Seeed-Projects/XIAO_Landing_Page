"use client";

import { useLang } from "../i18n";
import { pick } from "./software-data";
import { FLAGSHIP_STORIES, MORE_OFFICIAL } from "./official-stories.mjs";
import { StoryDiagram } from "./StoryDiagram";
import styles from "./software-center.module.css";

const LABELS = {
  en: {
    act: "Act one",
    title: "Official software",
    intro: "Seeed designs these tools for the XIAO ecosystem and keeps them up to date. Each one removes a specific obstacle.",
    problem: "The obstacle",
    what: "What it is",
    steps: "How to use it",
    can: "What it can do",
    boards: "Boards",
    moreTitle: "More official repositories",
    moreIntro: "The same maintenance continues in smaller repositories: a module, a display library, a link, a kit.",
  },
  zh: {
    act: "第一幕",
    title: "官方软件",
    intro: "这些是 Seeed 为 XIAO 生态设计并持续维护的工具。每一个都对着一个具体的障碍。",
    problem: "卡在哪里",
    what: "它是什么",
    steps: "怎么用",
    can: "能做什么",
    boards: "支持的板卡",
    moreTitle: "更多官方仓库",
    moreIntro: "同样的维护还落在更小的仓库里：一个模块、一个显示库、一种连接、一套套件。",
  },
};

/**
 * Flagship stories as chapter panels, then the compact list of other official repositories.
 * 旗舰故事以章节面板呈现，其后是其余官方仓库的紧凑列表。
 */
export function OfficialSection() {
  const { lang } = useLang();
  const copy = LABELS[lang] ?? LABELS.en;

  return (
    <section id="official" className={styles.official}>
      <div className={styles.wrap}>
        <header className={styles.sectionHead}>
          <p className={styles.act}>{copy.act}</p>
          <h2 className={`${styles.sectionTitle} home-type-title`}>{copy.title}</h2>
          <p className={`${styles.sectionIntro} home-type-body`}>{copy.intro}</p>
        </header>

        <div className={styles.stories}>
          {FLAGSHIP_STORIES.map((story, index) => (
            <article key={story.id} className={styles.story} data-flip={index % 2 === 1 ? "1" : "0"}>
              <div className={styles.storyTop}>
                <div className={styles.copy}>
                  <p className={styles.kicker}>
                    <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                    {pick(story.eyebrow, lang)}
                  </p>
                  <h3 className={`${styles.storyName} home-type-title`}>{pick(story.name, lang)}</h3>
                  <p className={`${styles.lede} home-type-body`}>{pick(story.lede, lang)}</p>

                  <div className={styles.problem}>
                    <p className={styles.blockLabel}>{copy.problem}</p>
                    <p className={`${styles.blockText} home-type-body`}>{pick(story.problem, lang)}</p>
                  </div>
                  <div className={styles.block}>
                    <p className={styles.blockLabel}>{copy.what}</p>
                    <p className={`${styles.blockText} home-type-body`}>{pick(story.what, lang)}</p>
                  </div>
                </div>

                <div className={styles.screen}>
                  <StoryDiagram id={story.diagram} lang={lang} />
                  <ul className={styles.badges}>
                    {story.badges.map((badge) => (
                      <li key={pick(badge, "en")} className={styles.badge}>{pick(badge, lang)}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.storyBottom}>
                <p className={styles.blockLabel}>{copy.steps}</p>
                <ol className={styles.steps}>
                  {story.steps.map((step) => (
                    <li key={pick(step, "en")} className={styles.step}>
                      <span className={`${styles.stepText} home-type-body`}>{pick(step, lang)}</span>
                    </li>
                  ))}
                </ol>

                <div className={styles.storyFoot}>
                  <div className={styles.facts}>
                    <p className={styles.blockLabel}>{copy.can}</p>
                    <ul className={styles.tags}>
                      {story.capabilities.map((tag) => (
                        <li key={pick(tag, "en")} className={styles.tag}>{pick(tag, lang)}</li>
                      ))}
                    </ul>
                    <p className={styles.boardsLine}>
                      <span className={styles.boardsLabel}>{copy.boards}</span>
                      {story.boards.join(" · ")}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    {story.links.map((link, linkIndex) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkIndex === 0
                          ? `${styles.primary} home-type-action home-filled-action`
                          : `${styles.secondary} home-type-action`}
                      >
                        {pick(link.label, lang)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.more}>
          <h3 className={`${styles.moreTitle} home-type-subtitle`}>{copy.moreTitle}</h3>
          <p className={`${styles.moreIntro} home-type-body`}>{copy.moreIntro}</p>
          <ul className={styles.repoList}>
            {MORE_OFFICIAL.map((item) => (
              <li key={item.id} className={styles.repo}>
                <div className={styles.repoHead}>
                  <h4 className={`${styles.repoName} home-type-subtitle`}>{pick(item.name, lang)}</h4>
                  <p className={styles.repoBoards}>{item.boards.join(" · ")}</p>
                </div>
                <p className={`${styles.repoSummary} home-type-body`}>{pick(item.summary, lang)}</p>
                <div className={styles.repoLinks}>
                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.repoLink} home-type-action`}
                    >
                      {pick(link.label, lang)}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
