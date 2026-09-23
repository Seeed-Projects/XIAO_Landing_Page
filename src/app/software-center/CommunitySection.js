"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "../i18n";
import SoftwareLogo from "./SoftwareLogo";
import {
  communityGroups,
  logoSrc,
  logoWallItems,
  pick,
  slugify,
} from "./software-data";
import styles from "./software-center.module.css";

const COPY = {
  en: {
    act: "Act two",
    title: "Built by the community",
    intro: "People who use XIAO have filled in languages, real-time systems, protocols and tools. This wall is theirs. It is not a catalog Seeed ships. It is a stack the community keeps extending.",
    boards: (count) => (count === 1 ? "1 board" : `${count} boards`),
  },
  zh: {
    act: "第二幕",
    title: "社区共建的生态墙",
    intro: "使用 XIAO 的人补上了语言、实时操作系统、协议和工具。这面墙是他们铸的。它不是 Seeed 的出货清单，而是社区一直在加长的生态。",
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
          <div key={rowIndex} className={rowIndex === 1 ? styles.rowSecond : undefined}>
            <div className={`${styles.track} ${rowIndex === 1 ? styles.trackReverse : ""}`}>
              {[0, 1].map((copyIndex) => (
                row.map((item) => (
                  <Link
                    key={`${item.slug}-${copyIndex}`}
                    href={`/software-center/${item.slug}`}
                    data-clone={copyIndex === 1 ? "1" : "0"}
                    title={pick(item.name, lang)}
                    className={styles.logoTile}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc(item.logo)} alt="" />
                  </Link>
                ))
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.wrap}>
        <div className={styles.chips} role="tablist" aria-label={copy.title}>
          {groups.map((group) => {
            const selected = group.id === active?.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(group.id)}
                className={selected ? styles.chipOn : styles.chip}
              >
                {pick(group.title, lang)}
                <span className={styles.chipCount}>{group.items.length}</span>
              </button>
            );
          })}
        </div>

        {active && (
          <div className={styles.cardGrid} key={active.id}>
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
