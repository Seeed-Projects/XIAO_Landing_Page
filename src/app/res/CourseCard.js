"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./res.module.css";

// PDF 首页缩略图懒加载
const PdfThumb = dynamic(() => import("./PdfThumb"), { ssr: false });

// 课程/资源卡：封面图 + 标题 + 一段介绍 + 打开链接
export default function CourseCard({ item }) {
  const [imgError, setImgError] = useState(false);
  const showFallback =
    item.kind !== "img" || !item.cover || imgError;

  return (
    <a
      className={styles.courseCard}
      href={item.url}
      target="_blank"
      rel="noopener"
    >
      <div className={styles.courseCover}>
        {item.kind === "pdf" ? (
          <PdfThumb url={item.url} alt={item.title} />
        ) : showFallback ? (
          <div
            className={styles.courseFallback}
            style={{
              background: `linear-gradient(135deg, ${
                item.accent || "#276046"
              } 0%, #18241c 100%)`,
            }}
          >
            <span>{item.title}</span>
          </div>
        ) : (
          <img
            src={item.cover}
            alt={item.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className={styles.courseBody}>
        <div className={styles.courseTitle} title={item.title}>
          {item.title}
        </div>
        <p className={styles.courseIntro}>{item.intro}</p>
        <span className={styles.courseLink}>打开 ↗</span>
      </div>
    </a>
  );
}
