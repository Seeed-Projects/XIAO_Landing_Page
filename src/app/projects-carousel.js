"use client";

import { ScrollBand } from "./scroll-band";
import { ScrollCard } from "./scroll-card";
import { PROJECTS } from "./projects-data";
import { useLang } from "./i18n";

function localize(value, lang) {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.zh || "";
}

/** 热门项目滚动带 —— 复用 ScrollBand，数据来自 projects-data.js（真实社区项目） */
export function ProjectsCarousel() {
  const { lang } = useLang();
  return (
    <ScrollBand
      items={PROJECTS}
      rows={2}
      speed={0.361}
      delayStep={45}
      hrefFor={(item) => item.url || "#"}
      renderCard={(item) => (
        <ScrollCard
          image={item.media_url}
          tag={localize(item.tag, lang)}
          meta={localize(item.author, lang)}
          title={localize(item.title, lang)}
          excerpt={localize(item.excerpt, lang)}
          alt={localize(item.title, lang)}
        />
      )}
    />
  );
}
