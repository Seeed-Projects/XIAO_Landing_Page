"use client";

import { homepageSections } from "./site-data";
import { useLang } from "./i18n";

// 取品牌名首字母作为 logo 占位
function initialsOf(name) {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "");
  return cleaned.slice(0, 2).toUpperCase();
}

// 从 partner.url 取主机名，用 Yandex favicon 服务兜底取官网 logo
function faviconOf(url) {
  try {
    return `https://favicon.yandex.net/favicon/${new URL(url).host}`;
  } catch {
    return "";
  }
}

export function PartnerMarquee() {
  const { t } = useLang();
  const groups = homepageSections.partnerGroups;

  return (
    <div className="space-y-8">
      {groups.map((group, gi) => (
        <div key={group.label}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--ink-muted)]">
            {t.developer.groupLabels[gi] ?? group.label}
          </h3>
          <div className="group relative overflow-hidden">
            {/* 滚动轨道：复制足够多份(6×)保证轨道宽于视口，铺满无空白；hover 暂停 */}
            <div
              className="flex w-max gap-3 marquee-track will-change-transform group-hover:[animation-play-state:paused]"
              style={{ animationDuration: "80s" }}
            >
              {/* 复制 6 份实现无缝滚动（两半各 3 份，内容一致，translateX -50% 严丝合缝） */}
              {Array.from({ length: 6 }, () => group.partners).flat().map((partner, index) => (
                <a
                  key={`${partner.name}-${index}`}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--line-soft)] bg-white/80 py-2 pl-2 pr-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/30 hover:shadow-md"
                >
                  {/* logo：专用图优先，否则按官网域名取 favicon 兜底，再失败回退品牌色方块 + 首字母 */}
                  {(() => {
                    const src = partner.logo || faviconOf(partner.url);
                    const isFavicon = src.startsWith("https://favicon.yandex.net");
                    if (!src) {
                      return (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-xs font-bold tracking-wide text-white">
                          {initialsOf(partner.name)}
                        </span>
                      );
                    }
                    return (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={partner.name}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            img.parentElement
                              .querySelector("[data-fallback]")
                              ?.removeAttribute("hidden");
                          }}
                          className={
                            "h-7 w-7 shrink-0 object-contain" +
                            (isFavicon
                              ? " rounded-md bg-neutral-100 p-1"
                              : "")
                          }
                        />
                        <span
                          data-fallback
                          hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-xs font-bold tracking-wide text-white"
                        >
                          {initialsOf(partner.name)}
                        </span>
                      </>
                    );
                  })()}
                  {/* 文字 */}
                  <span className="text-sm font-semibold text-[var(--ink-strong)]">
                    {partner.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
