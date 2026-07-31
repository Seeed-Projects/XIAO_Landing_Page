"use client";

import Link from "next/link";
import { useLang } from "./i18n";

function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换语言 / Switch language"
      className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--line-soft)] bg-white/70 p-0.5 text-xs font-semibold backdrop-blur-sm"
    >
      <span
        className={`rounded-full px-2.5 py-1 transition ${
          lang === "zh" ? "bg-[var(--brand-blue)] text-white" : "text-[var(--ink-muted)]"
        }`}
      >
        中文
      </span>
      <span
        className={`rounded-full px-2.5 py-1 transition ${
          lang === "en" ? "bg-[var(--brand-blue)] text-white" : "text-[var(--ink-muted)]"
        }`}
      >
        EN
      </span>
    </button>
  );
}

export function SiteHeader() {
  const { t } = useLang();
  const nav = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.products, href: "/products" },
    { label: t.nav.res, href: "/res" },
    { label: t.nav.projectHub, href: "/project-hub" },
    { label: t.nav.openRoadmap, href: "/open-roadmap" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line-soft)] bg-[var(--bg-base)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-6 sm:px-8 lg:px-12">
        {/* 左：logo 预留位 */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-sm font-semibold tracking-[0.24em] text-white">
            X
          </div>
          <span className="font-display text-base font-semibold tracking-[0.18em] text-[var(--brand-blue)]">
            XIAO
          </span>
        </Link>

        {/* 中：导航居中 */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--ink-body)] transition hover:bg-white/70 hover:text-[var(--brand-blue)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右：语言切换 */}
        <div className="flex flex-1 justify-end">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
