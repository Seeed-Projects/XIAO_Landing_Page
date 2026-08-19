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

/* 首页下拉目录：列出首页各内容板块，对应下方各 section 标题（已校正真实 id） */
const HOME_MENU = {
  zh: [
    { id: "hero", label: "主视觉", hint: "回到顶部" },
    { id: "data", label: "数据", hint: "关键数字一览" },
    { id: "developer", label: "开发者生态", hint: "合作伙伴与工具链" },
    { id: "ecosystem", label: "生态入口", hint: "资料 / 投票 / 项目中心" },
    { id: "news", label: "XIAO 资讯", hint: "媒体报道与博客" },
    { id: "projects", label: "热门项目", hint: "社区开源作品" },
    { id: "reviews", label: "开源社区信赖之选", hint: "外部媒体评测" },
    { id: "cocreate", label: "生态共创", hint: "从想法到产品" },
    { id: "edm", label: "订阅动态", hint: "邮件订阅" },
  ],
  en: [
    { id: "hero", label: "Hero", hint: "Back to top" },
    { id: "data", label: "DATA", hint: "Key numbers at a glance" },
    { id: "developer", label: "Developer Ecosystem", hint: "Partners & toolchains" },
    { id: "ecosystem", label: "Ecosystem Entry", hint: "Docs / Vote / Project Hub" },
    { id: "news", label: "XIAO in the News", hint: "Media & blog" },
    { id: "projects", label: "Popular Projects", hint: "Community open-source" },
    { id: "reviews", label: "Trusted by Community", hint: "External reviews" },
    { id: "cocreate", label: "Co-Creation", hint: "Idea to product" },
    { id: "edm", label: "Subscribe", hint: "Email updates" },
  ],
};

/* 软件中心下拉目录：页面真实可滚动锚点只有 top/official/community */
const SOFTWARE_MENU = {
  zh: [
    { id: "top", label: "概览", hint: "XIAO 软件中心" },
    { id: "official", label: "官方软件", hint: "Seeed 自研平台" },
    { id: "community", label: "社区软件", hint: "按语言 / OS / 协议分类" },
  ],
  en: [
    { id: "top", label: "Overview", hint: "XIAO Software Center" },
    { id: "official", label: "Official", hint: "Seeed's own platforms" },
    { id: "community", label: "Community", hint: "By language / OS / protocol" },
  ],
};

const ROUTE_OF_HREF = {
  "/": "home",
  "/products": "products",
  "/res": "res",
  "/project-hub": "projectHub",
  "/open-roadmap": "openRoadmap",
  "/software-center": "softwareCenter",
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
  const nav = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.products, href: "/products" },
    { label: t.nav.res, href: "/res" },
    { label: t.nav.projectHub, href: "/project-hub" },
    { label: t.nav.openRoadmap, href: "/open-roadmap" },
    { label: t.nav.software, href: "/software-center" },
  ];

  const menuFor = (href) => {
    const key = ROUTE_OF_HREF[href];
    if (key === "home") return HOME_MENU[lang] || HOME_MENU.en;
    if (key === "products") return t.side?.products ?? [];
    if (key === "softwareCenter") return SOFTWARE_MENU[lang] || SOFTWARE_MENU.en;
    return null;
  };

  const [openKey, setOpenKey] = useState(null);
  const [canHover, setCanHover] = useState(true);
  const closeTimer = useRef(null);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
    const onKey = (e) => { if (e.key === "Escape") setOpenKey(null); };
    const onDoc = (e) => {
      const el = document.getElementById("site-header");
      if (el && !el.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openMenu = (key) => {
    if (!canHover) return;
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenKey(key);
  };
  const scheduleClose = () => {
    if (!canHover) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 280);
  };

  const currentMenu = openKey ? menuFor(openKey) : null;

  const goSection = (href, id) => {
    setOpenKey(null);
    // 静态导出在子路径(basePath)下，且文件按尾斜杠目录存放；
    // 下拉菜单跳转用 window.location，必须手动加 basePath + 尾斜杠，否则 404。
    const dir = `${BASE_PATH}${href.endsWith("/") ? href : href + "/"}`;
    if (!id || id === "top" || id === "hero") {
      if (pathname === href) window.scrollTo({ top: 0, behavior: "smooth" });
      else window.location.href = dir;
      return;
    }
    if (pathname === href) {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    window.location.href = `${dir}#${id}`;
  };

  return (
    <header
      id="site-header"
      className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line-soft)] bg-[var(--bg-base)]/85 backdrop-blur-md"
      onMouseEnter={() => { if (canHover && closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } }}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-6 sm:px-8 lg:px-12">
        {/* 左：logo —— 圆形徽标 + XIAO 文字（透明底锁标） */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBase("/xiao-mark.png")}
            alt="XIAO"
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-base font-semibold tracking-[0.18em] text-[var(--brand-blue)]">
            XIAO
          </span>
        </Link>

        {/* 中：导航居中 —— 每项结构完全一致（点击跳转页面，悬停出下拉） */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const items = menuFor(item.href);
            const isOpen = openKey === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => (items?.length ? openMenu(item.href) : openMenu(null))}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm text-[var(--ink-body)] transition hover:bg-white/70 hover:text-[var(--brand-blue)]"
              >
                <span>{item.label}</span>
                {/* 有菜单的项显示箭头并随开合旋转；无菜单的项用透明占位，保证每项尺寸完全一致 */}
                <span className={items?.length ? "" : "opacity-0"}>
                  <Chevron open={isOpen} />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 右：语言切换 —— shrink-0 不占半边，把整行空间让给导航 */}
        <div className="ml-auto flex shrink-0 justify-end">
          <LangToggle />
        </div>
      </div>

      {/* 居中下拉面板：整宽桥接层 + 固定宽度固定 3 列，所有页面尺寸一致；280ms 延迟关闭 */}
      {currentMenu && (
        <div
          className="absolute inset-x-0 top-full z-50"
          onMouseEnter={() => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } }}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 pt-3 sm:px-8 lg:px-12">
            <div className="mx-auto grid w-[680px] grid-cols-3 gap-1 rounded-2xl border border-[var(--line-soft)] bg-white/95 p-2.5 shadow-[0_24px_48px_rgba(0,73,102,0.16)] backdrop-blur-md">
              {currentMenu.map((m, mi) => (
                <button
                  key={`${m.id}-${mi}`}
                  type="button"
                  onClick={() => goSection(openKey, m.id)}
                  className="flex items-start gap-2.5 rounded-xl p-3 text-left transition hover:bg-[var(--brand-blue)]/8"
                >
                  <span className="font-display text-xs font-semibold text-[var(--brand-blue)]/55">
                    {String(mi).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-[var(--ink-strong)]">
                      {m.label}
                    </span>
                    {m.hint ? (
                      <span className="block truncate text-xs text-[var(--ink-muted)]">
                        {m.hint}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
