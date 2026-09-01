"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { withBase } from "../lib/basePath";

const SCALE_PROJECTS = [
  { title: "OpenUC2 10x AI Microscope by OpenUC2", href: "https://www.seeedstudio.com/XIAO-Microscope-p-5971.html", image: "/co-create-projects/openuc2.webp" },
  { title: "Green Dot Board by Collins Emasi", href: "https://www.seeedstudio.com/blog/2025/07/17/how-to-build-an-iot-sensor-node-with-flux-ai-wio-e5-lora-module-and-xiao-rp2040-mcu/", image: "/co-create-projects/green-dot.webp" },
  { title: "6 Channel Temperature Meter by Gokul", href: "https://www.seeedstudio.com/6-Channel-Temperature-Meter-g-1402461", image: "/co-create-projects/temperature.webp" },
  { title: "Fusion DIY XIAO Mechanical Keyboards", href: "https://github.com/mchldotdev/totem", image: "/co-create-projects/keyboards.webp" },
  { title: "Seeed Studio XIAO Use Case", href: "https://files.seeedstudio.com/wiki/XIAO/XIAO-Reference-Design.pdf", image: "/co-create-projects/use-case.webp" },
];

export function CoCreateSection() {
  const { t } = useLang();
  const c = t.cocreate;
  const [expanded, setExpanded] = useState(false);
  const closeTimer = useRef(null);

  const openProjects = () => {
    window.clearTimeout(closeTimer.current);
    setExpanded(true);
  };

  const closeProjects = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setExpanded(false), 650);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <Reveal
      className="hero-orb relative overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-white"
      onMouseEnter={openProjects}
      onMouseLeave={closeProjects}
      onFocusCapture={openProjects}
      onBlurCapture={closeProjects}
    >
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
        className="block h-[260px] w-full object-cover sm:h-[320px] lg:h-[380px]"
        loading="lazy"
      />

      <div className={`${expanded ? "max-h-[900px] opacity-100" : "pointer-events-none max-h-0 opacity-0"} overflow-hidden bg-[#f3f7f8] text-[#18224f] transition-[max-height,opacity] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none`}>
        <div className={`${expanded ? "translate-y-0" : "translate-y-4"} px-6 py-14 transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transform-none motion-reduce:transition-none sm:px-10 lg:px-12`}>
          <h3 className="text-center text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Scale-up Co-Create Projects</h3>
          <p className="mx-auto mt-3 max-w-3xl text-center text-base text-[#52616a]">Find out how the community is scaling up their XIAO-based projects via our Fusion Co-Create.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SCALE_PROJECTS.map((project) => (
              <a key={project.title} href={project.href} target="_blank" rel="noopener noreferrer" className="group/project block text-left">
                <div className="aspect-[1.2] overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBase(project.image)} alt={project.title} className="h-full w-full object-cover transition duration-300 group-hover/project:scale-[1.025]" />
                </div>
                <h4 className="mt-4 text-[15px] font-bold leading-snug text-[#18224f]">{project.title}</h4>
              </a>
            ))}
          </div>
          {/* Explore more —— 进入 Seeed Blog 授权产品案例故事合集 */}
          <div className="mt-12 flex justify-center">
            <a
              href="https://www.seeedstudio.com/blog/category/licensed-products-case-stories/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[#8fc31f] px-12 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#79ad12]"
            >
              Explore more
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
