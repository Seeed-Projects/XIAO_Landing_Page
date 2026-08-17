"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./i18n";

function routeKey(pathname) {
  switch (pathname) {
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
      // 未匹配路由（如软件详情页 /software-center/[slug]、official 子页）
      //没有对应锚点目录，返回 null → 不渲染侧栏，避免误显示首页目录。
      return null;
  }
}

export function SideDirectory() {
  const { t } = useLang();
  const pathname = usePathname();
  const key = routeKey(pathname);
  const items = key ? t.side?.[key] ?? [] : [];
  const [active, setActive] = useState(items[0]?.id ?? null);

  // 滚动监听，高亮当前可视区段
  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.id))].filter((id) => id !== "top");
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
      aria-label="目录"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex"
    >
      {items.map((item, i) => {
        const isActive = item.id === active;
        return (
          <button
            key={`${item.label}-${i}`}
            type="button"
            onClick={() => handleSelect(item.id)}
            className="group flex items-center justify-end gap-2"
          >
            <span
              className={`overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "max-w-[220px] opacity-100 text-[var(--brand-blue)]"
                  : "max-w-0 opacity-0 group-hover:max-w-[220px] group-hover:opacity-100 group-hover:text-[var(--ink-body)]"
              }`}
            >
              {item.label}
            </span>
            <span
              className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                isActive
                  ? "scale-150 bg-[var(--brand-blue)]"
                  : "bg-[var(--ink-muted)]/40 group-hover:bg-[var(--brand-blue)]"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
