"use client";

import { withBase } from "../lib/basePath";
import { useMailchimpSubscribe } from "./use-mailchimp-subscribe";
import { useLang } from "./i18n";

export function EdmSubscribe() {
  const { lang } = useLang();
  const zh = lang === "zh";
  const tr = (en, zhStr) => (zh ? zhStr : en);
  const { email, setEmail, status, msg, submit, reset } = useMailchimpSubscribe();

  return (
    <div
      className="relative min-h-[500px] overflow-hidden bg-[#5d4c3e] bg-cover bg-center sm:min-h-[560px]"
      style={{ backgroundImage: `url("${withBase("/home/xiao-newsletter-bg.jpeg")}")` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,28,31,.08)_0%,rgba(17,28,31,.14)_42%,rgba(17,28,31,.66)_100%)]" />
      <div className="relative z-10 ml-auto flex min-h-[500px] w-full items-center px-7 py-12 sm:min-h-[560px] sm:px-12 lg:w-[52%] lg:px-16">
        <div className="w-full max-w-[660px]">
          <h3 className="text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">XIAO Newsletter</h3>
          <p className="mt-5 max-w-xl text-xl leading-[1.35] text-white sm:text-2xl">
            {zh ? (
              <>双周更新：产品、项目、<br className="hidden sm:block" />资讯、早鸟计划与更多</>
            ) : (
              <>Bi-weekly updates on products, Projects,<br className="hidden sm:block" /> news, early adopter program and more</>
            )}
          </p>

          {status === "success" ? (
            <div className="mt-10 rounded-xl border-2 border-black/55 bg-white/85 px-5 py-6 backdrop-blur-[2px] sm:px-7">
              <p className="text-2xl font-bold text-black sm:text-3xl">🎉 {tr("You're subscribed!", "订阅成功！")}</p>
              <p className="mt-2 text-base leading-7 text-black/80 sm:text-lg">
                {msg || tr(
                  "Almost done — check your inbox to confirm your subscription.",
                  "就差一步——请到收件箱确认订阅。"
                )}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center rounded-full bg-[var(--button-bg)] px-8 py-3 text-base font-bold text-white transition hover:bg-[var(--button-bg-hover)]"
              >
                {tr("Subscribe another email", "订阅其他邮箱")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-10">
              <div className="flex items-center gap-3 rounded-xl border-2 border-black/55 bg-white/70 px-5 py-4 backdrop-blur-[2px] focus-within:bg-white/85 sm:px-7 sm:py-5">
                <svg className="h-6 w-6 shrink-0 text-[#667883]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder={tr("Your email here", "请输入你的邮箱")}
                  aria-label={tr("Your email here", "请输入你的邮箱")}
                  disabled={status === "loading"}
                  className="min-w-0 flex-1 bg-transparent text-xl text-black outline-none placeholder:text-black/90 disabled:opacity-60 sm:text-2xl"
                />
              </div>
              {status === "error" && msg && (
                <p className="mt-3 text-sm font-medium text-[#ffd9d9] sm:text-base">{msg}</p>
              )}
              <p className="mt-3 text-xs leading-5 text-white/70 sm:text-sm">
                {tr(
                  "By subscribing you agree to receive emails from Seeed Studio. You can unsubscribe at any time.",
                  "订阅即表示同意接收 Seeed Studio 的邮件，可随时退订。"
                )}
              </p>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-6 inline-flex min-w-[250px] items-center justify-center rounded-full bg-[var(--button-bg)] px-12 py-4 text-xl font-bold text-white transition hover:bg-[var(--button-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl"
              >
                {status === "loading" ? tr("Subscribing…", "订阅中…") : tr("Subscribe", "订阅")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
