"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { withBase } from "../lib/basePath";

export function CoCreateSection() {
  const { t } = useLang();
  const c = t.cocreate;

  return (
    <Reveal className="hero-orb relative overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-white">
      {/* 上部：共创主视觉文案，与下部 gif 同处一张卡片 */}
      <div className="relative z-10 p-7 sm:p-9 lg:p-11">
        <div className="max-w-2xl space-y-5">
          <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {c.banner.title}
          </h3>
          <p className="text-base leading-7 text-white/88">{c.banner.text}</p>
          <a
            href="https://www.seeedstudio.com/co-create.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-green)] px-6 py-3 text-sm font-semibold text-[var(--brand-blue)] transition hover:bg-[var(--brand-green-deep)] hover:text-white"
          >
            {c.banner.cta}
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>

      {/* 下部：演示动图，与上方文案同一卡片，无分隔边框 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/co-create-demo.gif")}
        alt="XIAO Co-Create 流程演示"
        className="block h-auto w-full object-cover"
        loading="lazy"
      />
    </Reveal>
  );
}
