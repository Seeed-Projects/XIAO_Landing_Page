"use client";
import dynamic from "next/dynamic";
import styles from "./res.module.css";
import t from "./thumb.module.css";

// pdf/step 客户端渲染组件懒加载，避免拖慢首屏
const PdfThumb = dynamic(() => import("./PdfThumb"), { ssr: false });
const StepThumb = dynamic(() => import("./StepThumb"), { ssr: false });

// 按 item.render 把不同格式分派到对应缩略图渲染器
export default function ResThumb({ item }) {
  const kind = item.render;

  if (kind === "img" && item.thumb) {
    return (
      <div className={styles.resItemThumb}>
        <img src={item.thumb} alt={item.name} loading="lazy" />
      </div>
    );
  }
  if (kind === "pdf") {
    return (
      <div className={styles.resItemThumb}>
        <PdfThumb url={item.url} alt={item.name} />
      </div>
    );
  }
  if (kind === "step") {
    return (
      <div className={styles.resItemThumb}>
        <StepThumb url={item.url} />
      </div>
    );
  }
  // pcb / dxf / xlsx：服务端渲染成 SVG，直接当图片
  if (kind === "pcb" || kind === "dxf" || kind === "xlsx") {
    return (
      <div className={styles.resItemThumb}>
        <img
          src={`/api/${kind}?url=${encodeURIComponent(item.url)}`}
          alt={item.name}
          loading="lazy"
        />
      </div>
    );
  }
  // 其余（固件 zip / 库 / 外链）：格式占位卡
  return (
    <div className={`${styles.resItemThumb} ${t.placeholder}`}>
      <span>{item.icon}</span>
      <small>{item.format}</small>
    </div>
  );
}
