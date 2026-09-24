"use client";

import { useLang } from "../i18n";
import { DESIGN_KIT, pickText } from "./resources-data.mjs";
import styles from "./res.module.css";

const FILE_ART = {
  footprints: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="8" width="36" height="48" rx="6" fill="rgba(255,255,255,0.12)" stroke="currentColor" strokeWidth="2" />
      {[16, 26, 36, 46].map((y) => (
        <g key={y}>
          <rect x="8" y={y - 3} width="12" height="6" rx="3" fill="currentColor" />
          <rect x="44" y={y - 3} width="12" height="6" rx="3" fill="currentColor" />
        </g>
      ))}
    </svg>
  ),
  symbols: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="20" y="14" width="24" height="36" rx="3" fill="rgba(255,255,255,0.12)" stroke="currentColor" strokeWidth="2" />
      {[22, 32, 42].map((y) => (
        <g key={y}>
          <path d={`M6 ${y}h14`} stroke="currentColor" strokeWidth="2" />
          <path d={`M44 ${y}h14`} stroke="currentColor" strokeWidth="2" />
          <circle cx="6" cy={y} r="2" fill="currentColor" />
          <circle cx="58" cy={y} r="2" fill="currentColor" />
        </g>
      ))}
    </svg>
  ),
};

/**
 * Series-wide KiCad library banner with the two shared downloads.
 * 全系列 KiCad 库横幅，放两份共享下载。
 */
export function DesignKit() {
  const { lang } = useLang();
  return (
    <section className={styles.kit} aria-labelledby="design-kit-title">
      <div className={styles.kitInner}>
        <div className={styles.kitCopy}>
          <p className={styles.kitEyebrow}>{pickText(DESIGN_KIT.eyebrow, lang)}</p>
          <h2 id="design-kit-title" className={`${styles.kitTitle} home-type-title scroll-mt-24`}>{pickText(DESIGN_KIT.title, lang)}</h2>
          <p className={`${styles.kitIntro} home-type-body`}>{pickText(DESIGN_KIT.intro, lang)}</p>
        </div>
        <div className={styles.kitFiles}>
          {DESIGN_KIT.files.map((file) => (
            <a key={file.id} className={styles.kitFile} href={file.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.kitFileArt}>{FILE_ART[file.id]}</span>
              <span className={styles.kitFileText}>
                <strong>{pickText(file.name, lang)}</strong>
                <span>{pickText(file.detail, lang)}</span>
                <small>{file.format}</small>
              </span>
              <span className={styles.kitFileArrow} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
