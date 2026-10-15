"use client";

import { Glow } from "./Glow";
import styles from "./tool-page-intro.module.css";

export function ToolPageIntro({ title, description, id, actions }) {
  return (
    <header className={styles.intro} id={id}>
      <Glow as="h1" className="home-type-hero-title">{title}</Glow>
      <p className="home-type-body">{description}</p>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
