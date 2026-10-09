"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import SoftwareLogo from "./SoftwareLogo";
import { LogoMarquee } from "./LogoMarquee";
import {
  communityGroups,
  logoWallItems,
  pick,
  slugify,
} from "./software-data";
import styles from "./software-center.module.css";

const COPY = {
  en: {
    act: "Act two",
    title: "Built by the community",
    intro: "Find community-supported tools for your next XIAO project — from writing code and connecting devices to building applications.",
    boards: (count) => (count === 1 ? "1 board" : `${count} boards`),
  },
  zh: {
    act: "第二幕",
    title: "社区共建的生态墙",
    intro: "从编写代码、连接设备到实现应用，按你的开发目标找到社区支持的工具与平台。",
    boards: (count) => `${count} 块板`,
  },
};

/**
 * Community wall: logo marquee, category switch and cards with a board count.
 * 社区墙：logo 跑马灯、分类切换，以及带板卡数量的卡片。
 */
export function CommunitySection() {
  const { lang } = useLang();
  const copy = COPY[lang] ?? COPY.en;
  const groups = communityGroups();
  const [activeId, setActiveId] = useState(groups[0]?.id);
  const active = groups.find((group) => group.id === activeId) ?? groups[0];
  const logos = logoWallItems({ excludeCategory: "official" });
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)];

  return (
    <section id="community" className={styles.community}>
      <div className={styles.wrap}>
        <header className={styles.sectionHead}>
          <p className={styles.act}>{copy.act}</p>
          <h2 className={`${styles.bandTitle} home-type-title`}>{copy.title}</h2>
          <p className={`${styles.bandIntro} home-type-body`}>{copy.intro}</p>
        </header>
      </div>

      <div className={styles.marquee}>
        {rows.map((row, rowIndex) => (
          <LogoMarquee key={rowIndex} items={row} lang={lang} reverse={rowIndex === 1} />
        ))}
      </div>

      <div className={styles.wrap}>
        <div className={styles.chips} role="group" aria-label={copy.title}>
          {groups.map((group) => {
            const selected = group.id === active?.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={selected}
                aria-controls="community-tools"
                onClick={() => setActiveId(group.id)}
                className={`${selected ? styles.chipOn : styles.chip} home-type-action`}
              >
                {pick(group.title, lang)}
              </button>
            );
          })}
        </div>

        <p className={`${styles.groupIntro} home-type-body`}>{pick(active?.desc, lang)}</p>

        {active && (
          <div id="community-tools" className={styles.cardGrid} key={active.id}>
            {active.items.map((item) => {
              const slug = slugify(item.name);
              const count = item.boards.length;
              return (
                <Link key={slug} href={`/software-center/${slug}`} className={styles.cardLink}>
                  <div className={styles.cardTop}>
                    <SoftwareLogo item={item} lang={lang} size={56} />
                    <span className={styles.boardCount}>{copy.boards(count)}</span>
                    <span className={styles.cardArrow} aria-hidden="true">→</span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={`${styles.cardName} home-type-subtitle`}>{pick(item.name, lang)}</h3>
                    {item.desc ? (
                      <p className={`${styles.cardDesc} home-type-body`}>{pick(item.desc, lang)}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
