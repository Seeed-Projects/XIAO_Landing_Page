"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { TypewriterText } from "./typewriter-text";
import { defaultXiaoImage } from "./site-data";
import { withBase } from "../lib/basePath";

const FEATURES = [
  { image: "/home/XIAO落地页素材-1.webp", en: ["Popular SoCs Integrated", "RA4M1, RP2350, ESP32, RP2040, nRF52840, SAMD21, and more for embedded machine learning on MCUs."], zh: ["集成主流 SoC", "覆盖 RA4M1、RP2350、ESP32、RP2040、nRF52840、SAMD21 等平台，轻松构建 MCU 端嵌入式机器学习应用。"] },
  { image: "/home/XIAO落地页素材-2.webp", en: ["Thumb Size With SMD", "Sized at 21×17.8 mm with a single-sided surface-mount design, ready for space-constrained and tap-on designs."], zh: ["拇指大小，支持 SMD", "21×17.8 mm 单面贴装设计，适合空间受限及直接贴装式产品。"] },
  { image: "/home/XIAO落地页素材-3.webp", en: ["TinyML Native", "Compatible with Seeed’s no-code model training and deployment platform SenseCraft AI, making TinyML scalable."], zh: ["原生支持 TinyML", "兼容 Seeed 无代码模型训练与部署平台 SenseCraft AI，让 TinyML 更易规模化。"] },
  { image: "/home/XIAO落地页素材-4.webp", en: ["Developer-Friendly", "Natively compatible with Arduino, supporting PlatformIO, MicroPython, and CircuitPython."], zh: ["开发者友好", "原生兼容 Arduino，并支持 PlatformIO、MicroPython 与 CircuitPython。"] },
];

const GLIMPSE = [
  { no: "01", eyebrow: { en: "Core MCUs", zh: "核心 MCU" }, title: { en: "XIAO Dev Boards", zh: "XIAO 开发板" }, cat: "dev-boards", image: "/home/glimpse-devboards.webp", text: { en: "Thumb-sized, Arduino-compatible microcontrollers powered by popular chipsets for TinyML and edge computing.", zh: "拇指大小的 Arduino 兼容微控制器，搭载主流芯片，适合 TinyML 与边缘计算。" }, tags: { en: ["Plus Series", "Pre-soldered", "Tape & Reel", "3-Pack"], zh: ["Plus 系列", "预焊排针", "编带包装", "3 联包"] }, tone: "#3976ff" },
  { no: "02", eyebrow: { en: "Expansion Accessories", zh: "扩展配件" }, title: { en: "XIAO Add-ons", zh: "XIAO 扩展模块" }, cat: "addons", image: "/home/glimpse-addons.jpeg", text: { en: "Expansion boards, sensors, connectivity modules, actuators and kits designed for XIAO.", zh: "为 XIAO 设计的扩展板、传感器、连接模块、执行器与套件。" }, tags: { en: ["Expansion Boards", "Sensors", "Connectivity", "Actuators"], zh: ["扩展板", "传感器", "连接模块", "执行器"] }, tone: "#16a4bd" },
  { no: "03", eyebrow: { en: "Ready-to-Use Devices", zh: "即用设备" }, title: { en: "XIAO Gadgets", zh: "XIAO 智能设备" }, cat: "gadgets", image: "/home/glimpse-gadgets.jpeg", text: { en: "Out-of-the-box smart devices built on XIAO boards and add-ons for smart home, vision AI and maker projects.", zh: "基于 XIAO 开发板与扩展模块的开箱即用智能设备，覆盖智能家居、视觉 AI 与创客项目。" }, tags: { en: ["Smart Home", "Vision AI", "Maker Devices"], zh: ["智能家居", "视觉 AI", "创客设备"] }, tone: "#9857ff" },
];

export function FeaturesSection() {
  const { lang } = useLang();
  return <section id="features" className="section home-section bg-[#f4f6f7] px-6 sm:px-10 lg:px-16">
    <div className="home-content">
      <Reveal><h2 className="text-center text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">{lang === "en" ? "Features" : "特性一览"}</h2></Reveal>
      <div className="home-feature-grid">
        {FEATURES.map((item, i) => { const copy = lang === "en" ? item.en : item.zh; return <Reveal key={item.en[0]} delay={i * 70} className="home-feature">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase(item.image)} alt="" />
          <div><h3>{copy[0]}</h3><p>{copy[1]}</p></div>
        </Reveal>; })}
      </div>
    </div>
  </section>;
}

export function GlimpseSection() {
  const { lang } = useLang();
  const zh = lang === "zh";
  const pick = (f) => (f && f[lang]) || (f && f.en) || "";
  return <section id="glimpse" className="section home-section bg-white px-6 sm:px-10 lg:px-16">
    <div className="home-content home-glimpse">
      <Reveal className="text-center"><h2 className="text-4xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">{zh ? "XIAO 一览" : "XIAO in a Glimpse"}</h2><p className="mx-auto mt-4 max-w-5xl text-base leading-[1.65] text-[#526b91] sm:text-lg">{zh ? "从核心开发板到扩展配件和开箱即用的智能设备——一个生态，无限可能" : "From core development boards to expansion add-ons and ready-to-use smart gadgets — one ecosystem, endless possibilities"}</p></Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {GLIMPSE.map((card, i) => <Reveal key={card.no} delay={i * 80} className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-[0_12px_30px_rgba(26,39,77,.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,39,77,.14)]">
          <Link href={`/products?cat=${card.cat}#products-catalog`} className="flex h-full flex-col">
          <div className="home-glimpse-image relative h-40 shrink-0 overflow-hidden bg-[#f6faf8]"><div className="absolute inset-0 bg-cover bg-center opacity-90" style={{backgroundImage:`url(${withBase(card.image || defaultXiaoImage)})`}} /><span className="absolute left-4 top-4 rounded bg-white px-2 py-1 font-mono text-xs" style={{color:card.tone}}>{card.no}</span></div>
          <div className="home-glimpse-copy flex flex-1 flex-col border-t-2 p-5" style={{borderColor:card.tone}}><p className="text-xs font-semibold" style={{color:card.tone}}>{pick(card.eyebrow)}</p><h3 className="mt-2 text-xl font-bold text-[#18224f]">{pick(card.title)}</h3><p className="mt-3 text-sm leading-6 text-[#526b91]">{pick(card.text)}</p><div className="mt-auto flex flex-wrap gap-2 pt-5">{pick(card.tags).map((tag) => <span key={tag} className="rounded-md bg-[#f7f9fc] px-2.5 py-1 text-[11px] font-semibold" style={{color:card.tone}}>{tag}</span>)}</div></div>
          </Link>
        </Reveal>)}
      </div>
      <Reveal className="mt-8 flex justify-center"><a href={withBase("/products")} style={{ color: "#fff" }} className="rounded-full bg-[var(--button-bg)] px-10 py-3 text-base font-semibold text-white shadow-[0_8px_24px_rgba(143,195,31,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--button-bg-hover)]">{zh ? "Seeed Studio XIAO 选型器" : "Seeed Studio XIAO Selector"}</a></Reveal>
    </div>
  </section>;
}

export function RoadmapCallout() {
  const { lang } = useLang();
  return <section id="roadmap" className="section home-section bg-white px-6 sm:px-10 lg:px-16"><div className="home-content text-center">
    <Reveal><h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">{lang === "en" ? "You Decide What We Build Next" : "下一款 XIAO，由你决定"}</h2><p className="mx-auto mt-5 max-w-5xl text-base leading-[1.65] text-[#526b91] sm:text-lg">{lang === "en" ? "We’re open-sourcing our roadmap for XIAO on GitHub, and you have a say in it. Vote for your favorite entries, suggest features, propose new products, or share feedback." : "我们在 GitHub 上公开 XIAO 路线图。你可以投票、建议功能、提出新产品，或直接分享反馈。"}</p></Reveal>
    <Reveal delay={100} className="mx-auto mt-10 max-w-4xl">
      <div className="flex items-center gap-4 rounded-2xl bg-[#f3f5f1] p-4 shadow-[0_5px_18px_rgba(35,52,29,0.08)] sm:gap-6 sm:p-6">
        <p className="min-w-0 flex-1 text-left text-base leading-[1.6] text-[#35473c] sm:text-lg"><TypewriterText key={lang} text={lang === "en" ? "Developers, join us and share your ideas for the next XIAO!" : "开发者，加入我们，分享你对下一款 XIAO 的想法！"} /></p>
        <a href={withBase("/open-roadmap")} style={{ color: "#182b0c" }} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#9dcc3c] px-3 py-3 text-sm font-bold text-[#182b0c] transition-[transform,background-color] duration-150 hover:bg-[#8ab833] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:text-base">
          {lang === "en" ? "Join Now" : "立即加入"}
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
        </a>
      </div>
    </Reveal>
  </div></section>;
}

export function PlaygroundSection() {
  const { lang } = useLang();
  const zh = lang === "zh";
  const tools = zh
    ? [
        ["⌘", "Pinout", "交互式 XIAO GPIO 引脚图"],
        ["▤", "资料", "规格、数据手册、原理图、KiCad 等"],
        ["</>", "软件指南", "Wiki 教程：在 XIAO 上运行开源软件"],
        ["⇩", "网页烧录器", "在浏览器中烧录已测试固件"],
      ]
    : [
        ["⌘", "Pinout", "Interactive XIAO GPIO pinout reference"],
        ["▤", "Resources", "Specs, datasheets, schematics, KiCad & more"],
        ["</>", "Software Guide", "Wiki tutorials on how to run open software on XIAO"],
        ["⇩", "Web Flasher", "Flash tested firmwares from your browser"],
      ];
  return <section id="playground" className="section home-section home-playground-section relative overflow-hidden px-6 text-white sm:px-10 lg:px-16">
    <div aria-hidden="true" className="home-playground-texture pointer-events-none absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280' viewBox='0 0 280 280'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1' opacity='0.07'%3E%3Cpath d='M20 40 H80 V20'/%3E%3Cpath d='M80 20 H140 V60 H200'/%3E%3Cpath d='M200 60 V120 H160 V180'/%3E%3Cpath d='M160 180 H60 V140 H20'/%3E%3Cpath d='M220 100 V160 H260'/%3E%3Cpath d='M120 220 H200 V260'/%3E%3Cpath d='M40 240 H100 V200'/%3E%3Cpath d='M240 200 V260'/%3E%3Cpath d='M120 100 H180'/%3E%3Cpath d='M40 80 V160'/%3E%3C/g%3E%3Cg fill='%23ffffff' opacity='0.10'%3E%3Ccircle cx='20' cy='40' r='3'/%3E%3Ccircle cx='80' cy='20' r='3'/%3E%3Ccircle cx='140' cy='60' r='3'/%3E%3Ccircle cx='200' cy='60' r='3'/%3E%3Ccircle cx='200' cy='120' r='3'/%3E%3Ccircle cx='160' cy='180' r='3'/%3E%3Ccircle cx='60' cy='180' r='3'/%3E%3Ccircle cx='60' cy='140' r='3'/%3E%3Ccircle cx='20' cy='140' r='3'/%3E%3Ccircle cx='220' cy='100' r='3'/%3E%3Ccircle cx='260' cy='160' r='3'/%3E%3Ccircle cx='120' cy='220' r='3'/%3E%3Ccircle cx='200' cy='220' r='3'/%3E%3Ccircle cx='200' cy='260' r='3'/%3E%3Ccircle cx='100' cy='240' r='3'/%3E%3Ccircle cx='100' cy='200' r='3'/%3E%3Ccircle cx='40' cy='240' r='3'/%3E%3Ccircle cx='240' cy='200' r='3'/%3E%3Ccircle cx='240' cy='260' r='3'/%3E%3Ccircle cx='120' cy='100' r='3'/%3E%3Ccircle cx='180' cy='100' r='3'/%3E%3Ccircle cx='40' cy='80' r='3'/%3E%3Ccircle cx='40' cy='160' r='3'/%3E%3C/g%3E%3C/svg%3E")`,backgroundSize:"280px 280px"}} />
    <div className="home-content home-playground relative z-10">
      <Reveal className="text-center"><h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">XIAO Playground</h2><p className="mx-auto mt-5 max-w-3xl text-center text-base leading-[1.65] text-white/70 sm:text-lg">{zh ? "引脚图、规格、原理图、网页固件烧录器、教程，全部在 Playground 开源。" : "Pin out, specs, schematics, web firmware flasher, tutorials, all open sourced in the Playground."}</p></Reveal>
      <Reveal delay={100} className="mt-9">
        <div className="home-playground-panel">
          <div className="home-playground-visual">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b5d6df]">{zh ? "开源" : "Open Source"}</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/home/playground_home.png")} alt="Seeed Studio XIAO Playground" className="home-playground-image" />
            <p className="text-base font-medium text-[#c4d4dd]">{zh ? "为开发者" : "for Developers"}</p>
            <Link href="/playground" className="home-playground-cta mt-5 inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-bold transition hover:-translate-y-0.5">{zh ? "开始玩！" : "Let’s Play!"}</Link>
          </div>
          <div className="home-playground-tools">
            {tools.map(([icon, title, text]) => <div key={title} className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#79bdcf]/[0.08] text-lg font-semibold text-[#a2d4e1]">{icon}</span><div><h3 className="text-lg font-semibold text-[#eff6fa]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#b3c6d2] sm:text-base">{text}</p></div></div>)}
          </div>
        </div>
      </Reveal>
    </div>
  </section>;
}
