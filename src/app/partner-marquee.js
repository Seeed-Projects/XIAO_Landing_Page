"use client";

import { homepageSections } from "./site-data";
import { useLang } from "./i18n";

// 取品牌名首字母作为 logo 占位
function initialsOf(name) {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "");
  return cleaned.slice(0, 2).toUpperCase();
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
            {/* 左右渐变遮罩 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />

            {/* 滚动轨道 */}
            <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
              {/* 复制一份实现无缝滚动 */}
              {[...group.partners, ...group.partners].map((partner, index) => (
                <a
                  key={`${partner.name}-${index}`}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--line-soft)] bg-white/80 py-2 pl-2 pr-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/30 hover:shadow-md"
                >
                  {/* logo 占位：品牌色渐变方块 + 首字母 */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-xs font-bold tracking-wide text-white">
                    {initialsOf(partner.name)}
                  </span>
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
