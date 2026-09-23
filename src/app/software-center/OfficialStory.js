"use client";

import { useLang } from "../i18n";
import { pick } from "./software-data";
import { FLAGSHIP_STORIES } from "./official-stories.mjs";
import { StoryDiagram } from "./StoryDiagram";
import styles from "./software-center.module.css";

const LABELS = {
  en: {
    act: "Act one",
    title: "Official software",
    intro: "Connect devices, reuse your development workflow and turn prototypes into working products with software built for XIAO.",
    problem: "Why it matters",
    what: "What it brings",
    steps: "How to use it",
    can: "What it can do",
    boards: "Boards",
  },
  zh: {
    act: "第一幕",
    title: "官方软件",
    intro: "让设备融入生活，让开发经验跨板卡复用，让原型成为可用的产品。这些是 XIAO 官方软件要解决的事。",
    problem: "解决什么问题",
    what: "带来什么价值",
    steps: "怎么用",
    can: "能做什么",
    boards: "支持的板卡",
  },
};

/**
 * Official software panels combine purpose, supported hardware and getting-started links.
 * 官方软件章节展示用途、支持硬件和上手入口。
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

      </div>
    </section>
  );
}
