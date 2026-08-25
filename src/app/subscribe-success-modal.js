"use client";

/**
 * SubscribeSuccessModal —— 订阅成功弹窗。
 * 固定层 overlay + 居中卡片，点遮罩或按钮关闭。
 */
export function SubscribeSuccessModal({ open, title = "Subscribed!", message, onClose, closeLabel = "Got it" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--line-soft)] bg-white p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
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
        <h3 className="mt-4 font-display text-lg font-bold text-[var(--ink-strong)]">{title}</h3>
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
    </div>
  );
}
