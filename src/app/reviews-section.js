"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";

export function ReviewsSection() {
  const { t } = useLang();
  const items = t.reviews.items;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal
          key={i}
          delay={i * 90}
          as="article"
          className="flex flex-col rounded-3xl border border-[var(--line-soft)] bg-white/90 p-7 backdrop-blur-sm transition hover:-translate-y-1 hover:border-[rgba(143,195,31,0.4)] hover:shadow-[0_28px_48px_rgba(0,73,102,0.12)]"
        >
          {/* 大引号 */}
          <span
            aria-hidden
            className="font-display text-5xl leading-[0.6] text-[var(--brand-green)]"
          >
            &ldquo;
          </span>

          {/* 评语 */}
          <p className="mt-3 flex-1 text-base leading-7 text-[var(--ink-body)]">
            {item.quote}
          </p>

          {/* 头像 + 姓名 + 身份 */}
          <div className="mt-6 flex items-center gap-4 border-t border-[var(--line-soft)] pt-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-sm font-semibold tracking-wide text-white">
              {item.avatar}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--ink-strong)]">
                {item.name}
              </p>
              <p className="truncate text-xs text-[var(--ink-muted)]">
                {item.role} · {item.company}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
