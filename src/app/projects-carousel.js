"use client";

import { ScrollBand } from "./scroll-band";
import { PROJECTS } from "./projects-data";

/** 热门项目滚动带 —— 复用 ScrollBand，数据来自 projects-data.js（真实社区项目） */
export function ProjectsCarousel() {
  return (
    <ScrollBand
      items={PROJECTS}
      hrefFor={(item) => item.url || "#"}
      renderCard={(item) => (
        <>
          {/* 封面图：加载成功显示真图，失败/无图回退渐变占位 */}
          <div
            className="aspect-[16/9] w-full overflow-hidden rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(143,195,31,0.14), rgba(0,73,102,0.14))",
            }}
          >
            {item.media_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.media_url}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {/* 文字 */}
          <div className="mt-4 flex flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--brand-blue)]/12 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-blue-soft)]">
                {item.tag}
              </span>
              <span className="text-xs text-[var(--ink-muted)]">{item.author}</span>
            </div>
            <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--ink-strong)]">
              {item.title}
            </h3>
          </div>
        </>
      )}
    />
  );
}
