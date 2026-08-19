"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { defaultXiaoImage } from "./site-data";

const SUBSCRIBE_URL = "https://mailchi.mp/seeed/xiao";

export function EdmSubscribe() {
  const { t } = useLang();
  const e = t.edm;
  const [email, setEmail] = useState("");

  // 提交即跳转到 Mailchimp 订阅页（新标签打开）
  const onSubmit = (ev) => {
    ev.preventDefault();
    window.open(SUBSCRIBE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glow-card grid overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-white/90 backdrop-blur-sm lg:grid-cols-2">
      {/* 左：图 */}
      <div
        className="relative min-h-[220px] overflow-hidden bg-neutral-100 sm:min-h-[280px] lg:min-h-[360px]"
        style={{ backgroundImage: `url("${defaultXiaoImage}")`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* 图上叠加品牌渐变与标题，保证与右栏文案呼应 */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,73,102,0.55),rgba(8,102,126,0.35),rgba(143,195,31,0.35))]" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {e.title}
          </h3>
        </div>
      </div>

      {/* 右：订阅表单 */}
      <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div className="space-y-3 sm:hidden">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
              {e.title}
            </h3>
          </div>
          <p className="hidden text-base leading-7 text-[var(--ink-body)] sm:block">
            {e.description}
          </p>

          <div className="flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/80 p-1.5 pl-5 transition focus-within:border-[rgba(143,195,31,0.5)] focus-within:shadow-[0_10px_24px_rgba(0,73,102,0.08)]">
            <svg className="h-5 w-5 shrink-0 text-[var(--ink-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder={e.placeholder}
              aria-label={e.placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink-strong)] outline-none placeholder:text-[var(--ink-muted)]"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-green)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-blue)] transition hover:bg-[var(--brand-green-deep)] hover:text-white"
            >
              {e.button}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <p className="text-xs leading-5 text-[var(--ink-muted)]">{e.footnote}</p>
        </form>
      </div>
    </div>
  );
}
