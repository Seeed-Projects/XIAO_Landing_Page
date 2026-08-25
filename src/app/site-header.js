"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { BASE_PATH, withBase } from "../lib/basePath";

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
          lang === "zh" ? "bg-[var(--ink-strong)] text-white" : "text-[var(--ink-muted)]"
        }`}
      >
        中文
      </span>
      <span
        className={`rounded-full px-2.5 py-1 transition ${
          lang === "en" ? "bg-[var(--ink-strong)] text-white" : "text-[var(--ink-muted)]"
        }`}
      >
        EN
      </span>
    </button>
  );
}

/* Playground 二级下拉：4 个开发工具入口，各自跳到不同页面/锚点。
   Pin Out / Flash → products 页对应锚点；Hardware Resources → /res；Software Ecosystem → /software-center。
   ⚠️ 样式待用户提供，此处先用与站点一致的默认卡片样式。 */
const PLAYGROUND_ITEMS = {
  zh: [
    { label: "引脚图", hint: "Pinout 定义与规格", href: "/products", id: "pinout" },
    { label: "烧录", hint: "一键固件烧录", href: "/products", id: "esp-flasher" },
    { label: "硬件资源", hint: "数据手册 / 原理图 / CAD", href: "/res", id: "top" },
    { label: "软件生态", hint: "官方与社区软件", href: "/software-center", id: "top" },
  ],
  en: [
    { label: "Pin Out", hint: "Pinouts & specs", href: "/products", id: "pinout" },
    { label: "Flash", hint: "One-click firmware flasher", href: "/products", id: "esp-flasher" },
    { label: "Hardware Resources", hint: "Datasheets · schematics · CAD", href: "/res", id: "top" },
    { label: "Software Ecosystem", hint: "Official & community software", href: "/software-center", id: "top" },
  ],
};

const Chevron = ({ open }) => (
  <svg
    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function SiteHeader() {
  const { t, lang } = useLang();
  const pathname = usePathname();

  // 一级导航：只有 Playground 有下拉，其余为普通链接
  const nav = [
    { label: t.nav.home, href: "/", key: "home" },
    { label: t.nav.products, href: "/products", key: "products" },
    { label: t.nav.projectHub, href: "/project-hub", key: "projectHub" },
    { label: t.nav.openRoadmap, href: "/open-roadmap", key: "openRoadmap" },
    { label: t.nav.playground, href: null, key: "playground" },
  ];

  const [pgOpen, setPgOpen] = useState(false);      // 桌面 Playground 下拉
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePg, setMobilePg] = useState(false);  // 移动端 Playground 展开
  const [canHover, setCanHover] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover)");
    const syncHover = () => setCanHover(hoverQuery.matches);
    queueMicrotask(syncHover);
    hoverQuery.addEventListener("change", syncHover);
    const onKey = (e) => { if (e.key === "Escape") { setPgOpen(false); setMobilePg(false); } };
    const onDoc = (e) => {
      const el = document.getElementById("site-header");
      if (el && !el.contains(e.target)) setPgOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
      hoverQuery.removeEventListener("change", syncHover);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openPlayground = () => {
    if (!canHover) return;
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setPgOpen(true);
  };
  const scheduleClose = () => {
    if (!canHover) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPgOpen(false), 280);
  };

  // 跳转到目标页面 + 锚点（静态导出 + basePath，必须手动拼尾斜杠）
  const goSection = (href, id) => {
    setPgOpen(false);
    setMobileOpen(false);
    const dir = `${BASE_PATH}${href.endsWith("/") ? href : href + "/"}`;
    if (!id || id === "top" || id === "hero") {
      if (pathname === href) window.scrollTo({ top: 0, behavior: "smooth" });
      else window.location.assign(dir);
      return;
    }
    if (pathname === href) {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    window.location.assign(`${dir}#${id}`);
  };

  const pgItems = PLAYGROUND_ITEMS[lang] || PLAYGROUND_ITEMS.en;

  const linkCls =
    "flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[13px] text-[var(--ink-body)] transition hover:bg-white/70 hover:text-[var(--brand-blue)] lg:px-3 lg:text-sm";

  return (
    <header
      id="site-header"
      className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line-soft)] bg-[var(--bg-base)]/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:px-8 lg:px-12">
        {/* 左：logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            src={withBase("/seeed-logo.png")}
            alt="Seeed Studio XIAO"
            className="h-7 w-auto shrink-0 sm:h-8"
          />
          <span className="font-display text-sm font-semibold tracking-[0.1em] text-[var(--brand-blue)] sm:text-base sm:tracking-[0.18em]">
            <span className="hidden sm:inline">Seeed Studio </span>XIAO
          </span>
        </Link>

        {/* 中：导航 —— 只有 Playground 带下拉，其余为普通链接 */}
        <nav className="hidden flex-1 items-center justify-center gap-0 min-[860px]:flex">
          {nav.map((item) =>
            item.key === "playground" ? (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={openPlayground}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-expanded={pgOpen}
                  onClick={() => setPgOpen((o) => !o)}
                  className={`${linkCls} cursor-pointer`}
                >
                  <span>{item.label}</span>
                  <Chevron open={pgOpen} />
                </button>

                {/* Playground 二级菜单（样式待用户提供，此处为默认） */}
                {pgOpen && (
                  <div className="absolute right-0 top-full z-50 pt-3">
                    <div className="w-[300px] rounded-2xl border border-[var(--line-soft)] bg-white/95 p-2 shadow-[0_24px_48px_rgba(0,73,102,0.16)] backdrop-blur-md">
                      {pgItems.map((m, mi) => (
                        <button
                          key={`${m.href}-${m.id}-${mi}`}
                          type="button"
                          onClick={() => goSection(m.href, m.id)}
                          className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[var(--brand-blue)]/8"
                        >
                          <span className="font-display text-xs font-semibold text-[var(--brand-blue)]/55">
                            {String(mi + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-snug text-[var(--ink-strong)]">
                              {m.label}
                            </span>
                            {m.hint && (
                              <span className="block truncate text-xs text-[var(--ink-muted)]">
                                {m.hint}
                              </span>
                            )}
                          </span>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                            className="shrink-0 text-[var(--ink-muted)]"
                          >
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.key} href={item.href} className={linkCls}>
                <span>{item.label}</span>
              </Link>
            ),
          )}
        </nav>

        {/* 右：语言切换 + 汉堡 */}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/75 text-[var(--ink-strong)] min-[860px]:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
          <LangToggle />
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <nav className="border-t border-[var(--line-soft)] bg-[var(--bg-base)]/98 px-4 py-3 shadow-[0_18px_36px_rgba(0,73,102,0.12)] min-[860px]:hidden">
          <div className="mx-auto grid max-h-[calc(100dvh-5rem)] w-full max-w-[720px] gap-1 overflow-y-auto">
            {nav.map((item) =>
              item.key === "playground" ? (
                <div key={item.key}>
                  <button
                    type="button"
                    aria-expanded={mobilePg}
                    onClick={() => setMobilePg((o) => !o)}
                    className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                  >
                    {item.label}
                    <Chevron open={mobilePg} />
                  </button>
                  {mobilePg && (
                    <div className="grid gap-1 pl-3">
                      {pgItems.map((m) => (
                        <button
                          key={`${m.href}-${m.id}`}
                          type="button"
                          onClick={() => goSection(m.href, m.id)}
                          className="flex min-h-11 items-center justify-between rounded-lg px-4 py-2.5 text-sm text-[var(--ink-body)]"
                        >
                          {m.label}
                          <span aria-hidden>→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${pathname === item.href ? "bg-[var(--surface-tint)] text-[var(--brand-green-deep)]" : "text-[var(--ink-strong)]"}`}
                >
                  {item.label}
                  <span aria-hidden>→</span>
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
