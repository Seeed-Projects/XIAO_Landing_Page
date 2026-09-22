"use client";

import { useState } from "react";
import { withBase } from "../../lib/basePath";
import { courseCover } from "./resources-data.mjs";
import styles from "./res.module.css";

function VideoCover({ title }) {
  return (
    <div className={styles.videoCover} aria-hidden="true">
      <span className={styles.playBadge}>
        <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </span>
      <span className={styles.videoTitle}>{title}</span>
    </div>
  );
}

/**
 * Cover stage: the full image sits centred over a blurred copy of itself, so any aspect ratio fits.
 * 封面舞台：完整图片居中放在自身的模糊放大版之上，任何比例都能放下。
 */
function CoverStage({ src, onError }) {
  return (
    <>
      <img className={styles.coverBackdrop} src={src} alt="" aria-hidden="true" loading="lazy" />
      <img className={styles.coverImage} src={src} alt="" loading="lazy" onError={onError} />
    </>
  );
}

/**
 * Learning card. The featured variant is a wide two-column layout with its own action label.
 * 学习卡片。头条版本是宽的两栏布局，带独立的按钮文字。
 */
export default function CourseCard({ item, actionLabel, featured = false }) {
  const [imgError, setImgError] = useState(false);
  const cover = courseCover(item);
  const showImage = Boolean(cover) && !imgError;

  return (
    <a
      className={`${styles.courseCard} ${featured ? styles.courseFeatured : ""}`}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.courseCover}>
        {showImage ? <CoverStage src={withBase(cover)} onError={() => setImgError(true)} /> : <VideoCover title={item.title} />}
      </div>
      <div className={styles.courseBody}>
        <div className={styles.courseTags}>
          {(item.tags || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className={`${styles.courseTitle} home-type-subtitle`} title={item.title}>{item.title}</p>
        <p className={`${styles.courseIntro} home-type-body`}>{item.intro}</p>
        <span className={`${styles.courseLink} home-type-action ${featured ? "home-filled-action" : "home-text-action"}`}>
          {actionLabel}
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14m-5-5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </a>
  );
}
