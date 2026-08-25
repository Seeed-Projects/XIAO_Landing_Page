"use client";

/**
 * SubscribeModal —— 订阅结果弹窗，两种模式：
 * - success：成功提示（绿色对勾 + 文案）
 * - fallback：JSONP 被拦时，内嵌 Mailchimp 托管表单，在弹窗里完成订阅、不跳转
 */
export function SubscribeModal({ open, mode = "success", message, fallbackUrl, onClose, closeLabel = "Got it" }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter subscribe"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white text-center shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        {mode === "success" ? (
          <div className="p-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-green)]/15">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-[var(--brand-green)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-[var(--ink-strong)]">Subscribed!</h3>
            {message ? (
              <p className="mt-1.5 text-sm leading-6 text-[var(--ink-body)]">{message}</p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--brand-green)] px-6 py-2.5 text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-[var(--brand-green-deep)] hover:text-white"
            >
              {closeLabel}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-3 text-left">
              <p className="text-sm font-semibold text-[var(--ink-strong)]">Complete your subscription</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-muted)] transition hover:bg-[var(--line-soft)]/60 hover:text-[var(--ink-strong)]"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="px-5 pt-3 text-xs leading-5 text-[var(--ink-muted)]">
              Inline submit was blocked by your browser (ad/tracking blocker). Fill the form below to finish subscribing.
            </p>
            <iframe
              src={fallbackUrl}
              title="XIAO newsletter subscribe"
              loading="lazy"
              className="h-[420px] w-full"
              style={{ border: 0 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
