"use client";

import { logoSrc } from "./software-data";

// 软件项 logo：有图用真实图，失败回退到品牌色首字母
export default function SoftwareLogo({ item, size = 44 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-[var(--line-soft)]"
      style={{ width: size, height: size }}
    >
      {item.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc(item.logo)}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement
              .querySelector("[data-fallback]")
              ?.removeAttribute("hidden");
          }}
          className="h-full w-full object-contain p-2"
        />
      ) : null}
      <span
        data-fallback
        hidden={item.logo ? true : false}
        className="text-base font-bold text-[var(--brand-blue-soft)]"
      >
        {item.name[0]}
      </span>
    </div>
  );
}
