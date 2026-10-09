"use client";

import Link from "next/link";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import {
  CHIP_FAMILIES,
  boardsInFamily,
  familyOf,
  fileCount,
  pickText,
  shortBoardName,
} from "./resources-data.mjs";
import styles from "./res.module.css";

/**
 * Board navigation: a grouped list on wide screens, family tabs plus a chip row on phones.
 * 板卡导航：宽屏是分组列表，手机是家族标签加一排小卡片。
 */
export function BoardNav({ active, onSelect }) {
  const { lang } = useLang();
  const family = familyOf(active);

  return (
    <nav className={styles.boardNav} aria-label={lang === "zh" ? "开发板" : "Boards"}>
      <div className={styles.navList}>
        {CHIP_FAMILIES.map((item) => (
          <div key={item.id} className={styles.navGroup}>
            <p className={styles.navGroupLabel}>{pickText(item.label, lang)}</p>
            {boardsInFamily(item.id).map((board) => (
              <button
                key={board.id}
                type="button"
                className={styles.navItem}
                data-active={board.id === active.id ? "1" : "0"}
                aria-current={board.id === active.id ? "true" : undefined}
                onClick={() => onSelect(board.id)}
              >
                <img src={withBase(board.image)} alt="" loading="lazy" />
                <span className={styles.navItemName}>{shortBoardName(board.name)}</span>
                <span className={styles.navItemCount}>{fileCount(board)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.navMobile}>
        <div className={styles.familyTabs} role="tablist">
          {CHIP_FAMILIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === family.id}
              className={styles.familyTab}
              data-active={item.id === family.id ? "1" : "0"}
              onClick={() => {
                const next = boardsInFamily(item.id);
                if (!next.some((board) => board.id === active.id)) onSelect(next[0].id);
              }}
            >
              {pickText(item.label, lang)}
            </button>
          ))}
        </div>
        <div className={styles.chipRow}>
          {boardsInFamily(family.id).map((board) => (
            <button
              key={board.id}
              type="button"
              className={styles.chip}
              data-active={board.id === active.id ? "1" : "0"}
              onClick={() => onSelect(board.id)}
            >
              <img src={withBase(board.image)} alt="" loading="lazy" />
              <span>{shortBoardName(board.name)}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * Selected board header: photo, intro, badges and quick links.
 * 当前板子的档案头：照片、简介、标签和快捷入口。
 */
export function BoardProfile({ active, children }) {
  const { lang } = useLang();
  const family = familyOf(active);
  return (
    <header className={styles.profile}>
      <img className={styles.profilePhoto} src={withBase(active.image)} alt="" />
      <div className={styles.profileCopy}>
        <p className={styles.kicker}>{pickText(family.label, lang)} · {lang === "zh" ? `${fileCount(active)} 个文件` : `${fileCount(active)} files`}</p>
        <h2 className={`${styles.profileName} home-type-subtitle`}>{active.name}</h2>
        <p className={`${styles.profileIntro} home-type-body`}>{pickText(active.intro, lang)}</p>
        <div className={styles.badges}>
          {active.badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
      </div>
      <div className={styles.profileSide}>
        {children}
        <div className={styles.profileActions}>
          {active.pinoutId && (
            <Link className={`${styles.filled} home-type-action home-filled-action`} href={`/playground/pinout/?board=${active.pinoutId}`}>
              {lang === "zh" ? "交互式引脚图" : "Interactive Pinout"}
            </Link>
          )}
          <a className={`${styles.quiet} home-type-action`} href={active.wiki} target="_blank" rel="noopener noreferrer">Wiki</a>
          {active.shop && (
            <a className={`${styles.quiet} home-type-action`} href={active.shop} target="_blank" rel="noopener noreferrer">
              {lang === "zh" ? "购买" : "Buy"}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
