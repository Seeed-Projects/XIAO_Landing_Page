"use client";

import { ScrollBand } from "./scroll-band";
import { ScrollCard } from "./scroll-card";
import { PROJECTS } from "./projects-data";

/** 热门项目滚动带 —— 复用 ScrollBand，数据来自 projects-data.js（真实社区项目） */
export function ProjectsCarousel() {
  return (
    <ScrollBand
      items={PROJECTS}
      rows={2}
      speed={0.55}
      delayStep={45}
      hrefFor={(item) => item.url || "#"}
      renderCard={(item) => (
        <ScrollCard
          image={item.media_url}
          tag={item.tag}
          meta={item.author}
          title={item.title}
          excerpt={item.excerpt}
          alt={item.title}
        />
      )}
    />
  );
}
