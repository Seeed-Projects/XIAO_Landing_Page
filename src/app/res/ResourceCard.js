"use client";

import { useLang } from "../i18n";
import { KindArt } from "./KindArt";
import { isExternalOpen } from "./resources-data.mjs";
import styles from "./res.module.css";

const ICONS = {
  preview: <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  download: <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v3h16v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  open: <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
};

function Icon({ name }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{ICONS[name]}</svg>;
}

/**
 * One file card: type icon, name, format, preview and download.
 * 一张资源卡：类型图标、名称、格式，以及预览和下载。
 */
export function ResourceCard({ item, onPreview }) {
  const { lang } = useLang();
  const external = isExternalOpen(item);
  const zh = lang === "zh";
  const labels = {
    preview: item.preview === "step" ? (zh ? "预览（3D，约 8 MB）" : "Preview (3D, about 8 MB)") : (zh ? "预览" : "Preview"),
    download: zh ? "下载" : "Download",
    open: zh ? "打开链接" : "Open link",
  };
  const secondary = external ? "open" : "download";
  const primary = item.preview ? "preview" : secondary;

  const visual = <KindArt item={item} />;

  return (
    <article className={styles.card}>
      {primary === "preview" ? (
        <button type="button" className={styles.thumb} onClick={() => onPreview(item)} aria-label={`${labels.preview}: ${item.name}`}>
          {visual}
        </button>
      ) : (
        <a className={styles.thumb} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${labels[primary]}: ${item.name}`}>
          {visual}
        </a>
      )}
      <div className={styles.cardBody}>
        <h3 className={`${styles.cardName} home-type-body`} title={item.name}>{item.name}</h3>
        <div className={styles.cardFoot}>
          <span className={styles.format}>{item.format}</span>
          <span className={styles.iconRow}>
            {item.preview && (
              <button type="button" className={`${styles.iconBtn} ${styles.iconPrimary}`} onClick={() => onPreview(item)} title={labels.preview} aria-label={labels.preview}>
                <Icon name="preview" />
              </button>
            )}
            <a
              className={`${styles.iconBtn} ${item.preview ? "" : styles.iconPrimary}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={labels[secondary]}
              aria-label={labels[secondary]}
            >
              <Icon name={secondary} />
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}
