"use client";

import { useLang } from "./i18n";
import { defaultXiaoImage } from "./site-data";

const SUBSCRIBE_URL = "https://mailchi.mp/seeed/xiao";

/**
 * EdmSubscribe —— 邮件订阅卡片。
 * 由于只有 Mailchimp 短链、拿不到 embedded form 的 u/id（沙箱无外网无法解析），
 * 这里用 iframe 内嵌 Mailchimp 托管表单：用户在卡片内直接填邮箱、提交，
 * Mailchimp 在 iframe 内返回订阅成功提示，全程不跳转、不离开本页。
 * 表单未加载时提供「在新标签打开」兜底链接。
 */
export function EdmSubscribe() {
  const { t } = useLang();
  const e = t.edm;

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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
            {e.kicker}
          </p>
          <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {e.title}
          </h3>
        </div>
      </div>

      {/* 右：订阅表单（iframe 内嵌 Mailchimp 托管表单，本页内完成） */}
      <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
        <div className="space-y-3 sm:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-blue)]">
            {e.kicker}
          </p>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
            {e.title}
          </h3>
        </div>
        <p className="hidden text-base leading-7 text-[var(--ink-body)] sm:block">
          {e.description}
        </p>

        {/* Mailchimp 托管表单：iframe 内填邮箱 + 提交 + 成功提示，不跳转 */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-[0_10px_24px_rgba(0,73,102,0.06)]">
          <iframe
            src={SUBSCRIBE_URL}
            title="XIAO newsletter subscribe"
            loading="lazy"
            className="h-[460px] w-full"
            style={{ border: 0 }}
          />
        </div>

        {/* 兜底：表单未加载时可直接打开 */}
        <a
          href={SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--ink-muted)] transition hover:text-[var(--brand-blue)]"
        >
          {`表单未显示？点此打开 ↗`}
        </a>

        <p className="mt-4 text-sm leading-6 text-[var(--ink-body)]">{e.contact}</p>
        <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">{e.footnote}</p>
      </div>
    </div>
  );
}
