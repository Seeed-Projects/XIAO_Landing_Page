"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { defaultXiaoImage } from "./site-data";
import { useMailchimpSubscribe } from "./use-mailchimp-subscribe";
import { SubscribeSuccessModal } from "./subscribe-success-modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * EdmSubscribe —— 邮件订阅卡片。
 * 自定义 UI（邮箱框 + 绿色 Subscribe NOW 按钮），JSONP 内联提交到 Mailchimp，
 * 成功弹窗提示、失败在表单下显示错误信息，全程不跳转。
 */
export function EdmSubscribe() {
  const { t } = useLang();
  const e = t.edm;
  const { status, message, subscribe, reset } = useMailchimpSubscribe();
  const [email, setEmail] = useState("");
  const [localErr, setLocalErr] = useState("");
  const loading = status === "loading";

  const onSubmit = (ev) => {
    ev.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      setLocalErr("Please enter a valid email address.");
      return;
    }
    setLocalErr("");
    subscribe(v).then((data) => {
      if (data && data.result === "success") setEmail("");
    });
  };

  const closeSuccess = () => reset();

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

      {/* 右：订阅表单 */}
      <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
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

          <ul className="space-y-2 text-sm leading-6 text-[var(--ink-body)]">
            {e.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <p className="text-sm leading-6 text-[var(--ink-body)]">{e.contact}</p>

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
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-green)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-blue)] transition hover:bg-[var(--brand-green-deep)] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-[var(--brand-blue)]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
                  {e.button}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* 错误信息：本地校验 + Mailchimp 返回 */}
          {(localErr || status === "error") && (
            <p className="text-xs leading-5 text-[#e0413c]">{localErr || message}</p>
          )}

          <p className="text-xs leading-5 text-[var(--ink-muted)]">{e.footnote}</p>
        </form>
      </div>

      <SubscribeSuccessModal
        open={status === "success"}
        message={e.success}
        onClose={closeSuccess}
        closeLabel="Got it"
      />
    </div>
  );
}
