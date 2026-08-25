"use client";

import { useState } from "react";
import Link from "next/link";
import { useMailchimpSubscribe } from "./use-mailchimp-subscribe";
import { SubscribeSuccessModal } from "./subscribe-success-modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * SiteFooter —— XIAO 落地页页脚。
 * 5 列：品牌(Seeed Studio XIAO) / Company / Develop with XIAO / Community / Stay Connected with XIAO
 * + 底部版权。订阅用 JSONP 内联提交到 Mailchimp，成功弹窗，不跳转。
 */
export function SiteFooter() {
  const columns = [
    {
      title: "Company",
      links: [
        { label: "About Seeed", href: "https://www.seeedstudio.com/about-us/", ext: true },
        { label: "Contact Us", href: "https://www.seeedstudio.com/contacts", ext: true },
        { label: "Tech Support", href: "https://aftersale.seeedstudio.com/home", ext: true },
        { label: "Warranty & Return", href: "https://www.seeedstudio.com/get_help/ReturnsRefund", ext: true },
      ],
    },
    {
      title: "Develop with XIAO",
      links: [
        { label: "Selection Guide", href: "/products#smart-selector" },
        {
          label: "Documentation",
          title: "Datasheet, Schematic, PCB Design Files, Mechanical Design Files",
          href: "/res",
        },
        { label: "Compatible Software", href: "/software-center" },
        { label: "Pin Out", href: "/products#pinout" },
        { label: "XIAO Flasher", href: "/products#esp-flasher" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Project Hub", href: "/project-hub" },
        { label: "XIAO Open Roadmap", href: "/open-roadmap" },
        { label: "Discord", href: "https://discord.com/invite/QqMgVwHT3X", ext: true },
        { label: "Forum", href: "https://forum.seeedstudio.com/", ext: true },
      ],
    },
  ];

  const socials = [
    {
      label: "Discord",
      href: "https://discord.com/invite/QqMgVwHT3X",
      d: "M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.54 2.13 5.25 2.66c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.46-1.34 5.26-2.66c.02-.01.03-.03.03-.05c.44-4.54-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.87-.95-1.87-2.12c0-1.17.82-2.12 1.87-2.12c1.05 0 1.88.96 1.87 2.12c0 1.17-.82 2.12-1.87 2.12zm6.92 0c-1.03 0-1.87-.95-1.87-2.12c0-1.17.82-2.12 1.87-2.12c1.05 0 1.88.96 1.87 2.12c0 1.17-.81 2.12-1.87 2.12z",
      fill: true,
    },
    {
      label: "GitHub",
      href: "https://github.com/Seeed-Studio",
      d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.93 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.07 1 5.07 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/seeedstudio",
      d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.54.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .52 5.33A2.78 2.78 0 0 0 3.46 19c1.66.42 8.54.42 8.54.42s6.88 0 8.54-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .52-5.25 29 29 0 0 0-.52-5.33z",
      poly: "9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02",
    },
    {
      label: "X",
      href: "https://x.com/seeedstudio",
      d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      fill: true,
    },
    {
      label: "Forum",
      href: "https://forum.seeedstudio.com/",
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    },
  ];

  const { status, message, subscribe, reset } = useMailchimpSubscribe();
  const [email, setEmail] = useState("");
  const [localErr, setLocalErr] = useState("");
  const loading = status === "loading";

  const onSubmit = (e) => {
    e.preventDefault();
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

  return (
    <footer className="mt-auto w-full bg-[var(--ink-strong)] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.7fr_1.3fr]">
          {/* 品牌列 */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-base font-bold tracking-tight text-white">
              Seeed Studio XIAO
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
              The smallest Arduino-compatible dev boards for building your next AI gadgets.
            </p>
          </div>

          {/* 链接列 */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) =>
                  l.ext ? (
                    <li key={l.href + l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={l.title}
                        className="text-sm leading-6 text-white/80 transition hover:text-[var(--brand-green)]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        title={l.title}
                        className="text-sm leading-6 text-white/80 transition hover:text-[var(--brand-green)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}

          {/* Stay Connected with XIAO —— 订阅（JSONP 内联提交，成功弹窗） */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
              Stay Connected with XIAO
            </h3>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <label className="sr-only" htmlFor="footer-email">Email address</label>
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-[var(--brand-green)]"
              />
              <label className="flex items-start gap-2 text-xs leading-5 text-white/75">
                <input
                  type="checkbox"
                  name="xiao-newsletter-consent"
                  required
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-[var(--brand-green)]"
                />
                <span>I agree to receive newsletters on XIAO from Seeed Studio.</span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-green)] px-5 py-2.5 text-sm font-semibold text-[var(--ink-strong)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </>
                )}
              </button>
              {(localErr || status === "error") && (
                <p className="text-xs leading-5 text-[#f0a39b]">{localErr || message}</p>
              )}
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-white/70 transition hover:bg-[var(--brand-green)] hover:text-[var(--ink-strong)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill={s.fill ? "currentColor" : "none"}
                    stroke={s.fill ? "none" : "currentColor"}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={s.d} />
                    {s.poly && <polygon points={s.poly} fill="currentColor" stroke="none" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1440px] px-6 py-5 text-center text-xs text-white/55 sm:px-10 lg:px-16">
          © 2026 Seeed Studio. All rights reserved.
        </div>
      </div>

      <SubscribeSuccessModal
        open={status === "success"}
        message="Subscribed! Please check your inbox for the confirmation email."
        onClose={() => reset()}
        closeLabel="Got it"
      />
    </footer>
  );
}
