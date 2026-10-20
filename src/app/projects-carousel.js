"use client";

import { CardPeek, CardPeekContent } from "./card-peek";
import { ScrollBand } from "./scroll-band";
import { ScrollCard } from "./scroll-card";
import { PROJECTS } from "./projects-data";
import { useLang } from "./i18n";

function localize(value, lang) {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.zh || "";
}

/**
 * Project peek: category, author, full title and description, board and source.
 * 项目详情：分类、作者、完整标题与描述、开发板和来源。
 */
function ProjectPeek({ item, lang }) {
  return (
    <CardPeekContent
      tag={localize(item.tag, lang)}
      meta={localize(item.author, lang)}
      title={localize(item.title, lang)}
      description={localize(item.excerpt, lang)}
      badge={item.board}
      url={item.url}
    />
  );
}

/** 热门项目滚动带 —— 复用 ScrollBand，数据来自 projects-data.js（真实社区项目） */
export function ProjectsCarousel() {
  const { lang } = useLang();
  return (
    <CardPeek renderPeek={(index) => <ProjectPeek item={PROJECTS[index]} lang={lang} />}>
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
    </CardPeek>
  );
}
