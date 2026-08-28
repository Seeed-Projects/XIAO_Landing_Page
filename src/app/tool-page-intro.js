"use client";

import { Glow } from "./Glow";
import styles from "./tool-page-intro.module.css";

export function ToolPageIntro({ title, description, id }) {
  return (
    <header className={styles.intro} id={id}>
      <Glow as="h1">{title}</Glow>
      <p>{description}</p>
    </header>
  );
}
