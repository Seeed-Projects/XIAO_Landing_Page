"use client";

import { CardPeek } from "./card-peek";
import { ScrollBand } from "./scroll-band";
import { ScrollCard } from "./scroll-card";
import { PROJECTS } from "./projects-data";
import { useLang } from "./i18n";

function localize(value, lang) {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.zh || "";
}

function sourceHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** 悬停详情：完整标题、描述、开发板与来源，内容自然撑开，无需内部滚动 */
function ProjectPeek({ item, lang }) {
  const tag = localize(item.tag, lang);
  const author = localize(item.author, lang);
  const host = sourceHost(item.url);
  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {tag && <span className="card-peek-tag">{tag}</span>}
        {author && <span className="card-peek-meta">{author}</span>}
      </div>
      <p className="home-type-subtitle card-peek-title mt-3">{localize(item.title, lang)}</p>
      <p className="home-type-body card-peek-body mt-2">{localize(item.excerpt, lang)}</p>
      {(item.board || host) && (
        <div className="card-peek-footer mt-4 flex items-center justify-between gap-3 pt-3">
          {item.board && <span className="card-peek-board min-w-0 truncate">{item.board}</span>}
          {host && (
            <span className="card-peek-meta ml-auto inline-flex shrink-0 items-center gap-1">
              {host}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </span>
          )}
        </div>
      )}
    </>
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
