"use client";

import Image from "next/image";
import { withBase } from "../../lib/basePath";
import { resourceArtFor } from "./resource-art.mjs";
import styles from "./res.module.css";

/**
 * File-type icon shared by resource cards.
 * 资源卡片共用的文件类型图标。
 */
export function KindArt({ item }) {
  const art = resourceArtFor(item);

  return (
    <span className={styles.art}>
      <Image className={styles.artImage} src={withBase(art.src)} alt="" width={323} height={480} sizes="(max-width: 700px) 112px, 320px" />
    </span>
  );
}
