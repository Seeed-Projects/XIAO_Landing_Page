"use client";

import Image from "next/image";
import { withBase } from "../../lib/basePath";
import { resourceArtFor } from "./resource-art.mjs";
import styles from "./res.module.css";

/**
 * Shared animated visual used when a resource has no rendered thumbnail.
 * 资源没有可渲染缩略图时，显示共用的轻动画示意图。
 */
export function KindArt({ kind, format }) {
  const art = resourceArtFor(kind);

  return (
    <span className={styles.art} data-art-kind={art.group}>
      <Image className={styles.artImage} src={withBase(art.src)} alt="" width={724} height={543} sizes="(max-width: 700px) 112px, 320px" />
      <span className={styles.artFormat}>{format}</span>
    </span>
  );
}
