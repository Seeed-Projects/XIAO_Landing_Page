"use client";

import { useState } from "react";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { withBase } from "../lib/basePath";

const SCALE_PROJECTS = [
  { title: "ESP-FLY DIY Micro Drone Kit by Max Imagination", href: "https://www.seeedstudio.com/ESP-FLY-co-create-p-6744.html", image: "/co-create-projects/esp-fly.jpg" },
  { title: "OpenUC2 10x AI Microscope by OpenUC2", href: "https://www.seeedstudio.com/XIAO-Microscope-p-5971.html", image: "/co-create-projects/openuc2.webp" },
  { title: "XIAO PowerBread Breadboard Power Supply and Meter by Nicho D", href: "https://www.seeedstudio.com/XIAO-PowerBread-p-6318.html", image: "/xiao-products/addons/Expansion/1-114993507-xiao-powerbread-45font.jpg" },
  { title: "XIAO Logger HAT for Temperature, Humidity and Light by Marcel", href: "https://www.seeedstudio.com/XIAO-LOG-p-6341.html", image: "/xiao-products/addons/sensors/1-114993446-xiao-log-45font.jpg" },
  { title: "Fusion DIY XIAO Mechanical Keyboards", href: "https://www.seeedstudio.com/blog/2022/12/02/seeed-fusion-diy-xiao-mechanical-keyboard-contest-is-closed-the-winners-are/", image: "/co-create-projects/keyboards.webp" },
];

export function CoCreateSection() {
  const { t } = useLang();
  const c = t.cocreate;
  const [expanded, setExpanded] = useState(false);

  const openProjects = () => setExpanded(true);

  return (
    <Reveal
      className="hero-orb relative overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] text-white"
      onMouseEnter={openProjects}
      onFocusCapture={openProjects}
    >
      {/* 上部：共创主视觉文案，与下部 gif 同处一张卡片 */}
      <div className="relative z-10 p-7 sm:p-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="home-type-title text-center">
            {c.banner.title}
          </h3>
          <div className="mt-7 grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
            <p className="home-type-body text-left text-white/88">{c.banner.text}</p>
            <a
              href="https://www.seeedstudio.com/co-create.html"
              target="_blank"
              rel="noopener noreferrer"
              className="home-type-action home-filled-action inline-flex min-w-[180px] items-center justify-center justify-self-start rounded-full bg-[var(--button-bg)] px-7 py-3 text-white transition hover:bg-[var(--button-bg-hover)] md:justify-self-end"
            >
              {c.banner.cta}
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* 下部：演示动图，与上方文案同一卡片，无分隔边框 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/co-create-demo.gif")}
        alt="XIAO Co-Create 流程演示"
        className="block h-auto w-full"
        loading="lazy"
      />

      <div className={`${expanded ? "max-h-[2600px] opacity-100 sm:max-h-[1900px] lg:max-h-[900px]" : "pointer-events-none max-h-0 opacity-0"} overflow-hidden bg-[#f3f7f8] text-[#18224f] transition-[max-height,opacity] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none`}>
        <div className={`${expanded ? "translate-y-0" : "translate-y-4"} px-6 py-14 transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transform-none motion-reduce:transition-none sm:px-10 lg:px-12`}>
          <h3 className="home-type-title text-center">Scale-up Co-Create Projects</h3>
          <p className="home-type-body mx-auto mt-4 max-w-3xl text-center text-[#526b91]">Find out how the community is scaling up their XIAO-based projects via our Fusion Co-Create.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SCALE_PROJECTS.map((project) => (
              <a key={project.title} href={project.href} target="_blank" rel="noopener noreferrer" className="group/project block text-left">
                <div className="aspect-[1.2] overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBase(project.image)} alt={project.title} className="h-full w-full object-cover transition duration-300 group-hover/project:scale-[1.025]" />
                </div>
                <h4 className="home-type-body mt-4 font-semibold text-[#18224f]">{project.title}</h4>
              </a>
            ))}
          </div>
          {/* Explore more —— 进入 Seeed Blog 授权产品案例故事合集 */}
          <div className="mt-12 flex justify-center">
            <a
              href="https://www.seeedstudio.com/blog/category/licensed-products-case-stories/"
              target="_blank"
              rel="noopener noreferrer"
              className="home-type-action home-filled-action group inline-flex items-center gap-2 rounded-full bg-[#8fc31f] px-12 py-3 text-white transition hover:-translate-y-0.5 hover:bg-[#79ad12]"
              style={{ color: "#fff" }}
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
