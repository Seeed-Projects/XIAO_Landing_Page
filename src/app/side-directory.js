"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./i18n";

function routeKey(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  switch (path) {
    case "/":
      return "home";
    case "/products":
      return "products";
    case "/res":
      return "res";
    case "/project-hub":
      return "projectHub";
    case "/open-roadmap":
      return "openRoadmap";
    case "/software-center":
      return "softwareCenter";
    default:
      // Unmatched routes (software detail, official subpages) hide the rail.
      // 未匹配路由（软件详情、official 子页）不渲染侧栏。
      return null;
  }
}

export function SideDirectory() {
  const { t } = useLang();
  const pathname = usePathname();
  const key = routeKey(pathname);
  const items = useMemo(() => (key ? t.side?.[key] ?? [] : []), [key, t.side]);
  const [active, setActive] = useState(items[0]?.id ?? null);

  // 滚动监听，高亮当前可视区段
  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.id))];
    if (!ids.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items, pathname]);

  const handleSelect = (id) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!items.length) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <div className="flex flex-col items-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.055)] px-0.5 py-1 opacity-[0.58] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(15,23,42,0.035)] backdrop-blur-xl backdrop-saturate-[0.85] transition-[background-color,opacity] duration-200 hover:bg-[rgba(255,255,255,0.10)] hover:opacity-[0.86] focus-within:bg-[rgba(255,255,255,0.10)] focus-within:opacity-[0.86] motion-reduce:transition-none">
        {items.map((item, i) => {
          const isActive = item.id === active;
          return (
            <button
              key={`${item.label}-${i}`}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "location" : undefined}
              onClick={() => handleSelect(item.id)}
              className="group relative flex h-7 w-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-bg)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-[#18224f]/95 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-[0_8px_24px_rgba(24,34,79,0.20)] transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className={`shrink-0 rounded-full transition-[height,width,background-color,transform,box-shadow] duration-200 motion-reduce:transition-none ${
                  isActive
                    ? "h-3 w-1 bg-[var(--button-bg)] opacity-[0.85] shadow-[0_0_0_2px_rgba(143,195,31,0.10)]"
                    : "h-1.5 w-1.5 bg-[#9aa5b5] group-hover:scale-110 group-hover:bg-[var(--brand-blue)]"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
