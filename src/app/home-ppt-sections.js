"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { defaultXiaoImage } from "./site-data";
import { withBase } from "../lib/basePath";

const FEATURES = [
  { image: "/home/XIAO落地页素材-1.webp", en: ["Popular SoCs Integrated", "RA4M1, RP2350, ESP32, RP2040, nRF52840, SAMD21, and more for embedded machine learning on MCUs."], zh: ["集成主流 SoC", "覆盖 RA4M1、RP2350、ESP32、RP2040、nRF52840、SAMD21 等平台，轻松构建 MCU 端嵌入式机器学习应用。"] },
  { image: "/home/XIAO落地页素材-2.webp", en: ["Thumb Size With SMD", "Sized at 21×17.8 mm with a single-sided surface-mount design, ready for space-constrained and tap-on designs."], zh: ["拇指大小，支持 SMD", "21×17.8 mm 单面贴装设计，适合空间受限及直接贴装式产品。"] },
  { image: "/home/XIAO落地页素材-3.webp", en: ["TinyML Native", "Compatible with Seeed’s no-code model training and deployment platform SenseCraft AI, making TinyML scalable."], zh: ["原生支持 TinyML", "兼容 Seeed 无代码模型训练与部署平台 SenseCraft AI，让 TinyML 更易规模化。"] },
  { image: "/home/XIAO落地页素材-4.webp", en: ["Developer-Friendly", "Natively compatible with Arduino, supporting PlatformIO, MicroPython, and CircuitPython."], zh: ["开发者友好", "原生兼容 Arduino，并支持 PlatformIO、MicroPython 与 CircuitPython。"] },
];

const GLIMPSE = [
  { no: "01", eyebrow: "Core MCUs", title: "XIAO Dev Boards", cat: "dev-boards", image: "/home/glimpse-devboards.webp", text: "Thumb-sized, Arduino-compatible microcontrollers powered by popular chipsets for TinyML and edge computing.", tags: ["Plus Series", "Pre-soldered", "Tape & Reel", "3-Pack"], tone: "#3976ff" },
  { no: "02", eyebrow: "Expansion Accessories", title: "XIAO Add-ons", cat: "addons", text: "Expansion boards, sensors, connectivity modules, actuators and kits designed for XIAO.", tags: ["Expansion Boards", "Sensors", "Connectivity", "Actuators"], tone: "#16a4bd" },
  { no: "03", eyebrow: "Ready-to-Use Devices", title: "XIAO Gadgets", cat: "gadgets", text: "Out-of-the-box smart devices built on XIAO boards and add-ons for smart home, vision AI and maker projects.", tags: ["Smart Home", "Vision AI", "Maker Devices"], tone: "#9857ff" },
];

export function FeaturesSection() {
  const { lang } = useLang();
  return <section id="features" className="section bg-[#f4f6f7] px-6 sm:px-10 lg:px-16">
    <div className="mx-auto max-w-[1440px]">
      <Reveal><h2 className="text-center text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">Features</h2></Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((item, i) => { const copy = lang === "en" ? item.en : item.zh; return <Reveal key={item.en[0]} delay={i * 70} className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase(item.image)} alt="" className="mx-auto h-24 w-24 object-contain sm:h-28 sm:w-28" />
          <h3 className="mt-5 text-lg font-bold text-[#18224f]">{copy[0]}</h3>
          <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[#526b91]">{copy[1]}</p>
        </Reveal>; })}
      </div>
    </div>
  </section>;
}

export function GlimpseSection() {
  const { lang } = useLang();
  return <section id="glimpse" className="section bg-white px-6 sm:px-10 lg:px-16">
    <div className="mx-auto max-w-[1320px]">
      <Reveal className="text-center"><h2 className="text-4xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">XIAO in a Glimpse</h2><p className="mx-auto mt-4 max-w-5xl text-base leading-[1.65] text-[#526b91] sm:text-lg">{lang === "en" ? "From core development boards to expansion add-ons and ready-to-use smart gadgets — one ecosystem, endless possibilities" : "从核心开发板到扩展配件和开箱即用的智能设备——一个生态，无限可能"}</p></Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {GLIMPSE.map((card, i) => <Reveal key={card.no} delay={i * 80} className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-[0_12px_30px_rgba(26,39,77,.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,39,77,.14)]">
          <Link href={`/products?cat=${card.cat}#products-catalog`} className="block">
          <div className="relative h-48 overflow-hidden bg-[#f6faf8]"><div className="absolute inset-0 bg-cover bg-center opacity-90" style={{backgroundImage:`url(${withBase(card.image || defaultXiaoImage)})`}} /><span className="absolute left-4 top-4 rounded bg-white px-2 py-1 font-mono text-xs" style={{color:card.tone}}>{card.no}</span></div>
          <div className="flex min-h-[270px] flex-col border-t-2 p-6" style={{borderColor:card.tone}}><p className="text-xs font-semibold" style={{color:card.tone}}>{card.eyebrow}</p><h3 className="mt-2 text-xl font-bold text-[#18224f]">{card.title}</h3><p className="mt-3 text-sm leading-6 text-[#526b91]">{card.text}</p><div className="mt-auto flex flex-wrap gap-2 pt-6">{card.tags.map((tag) => <span key={tag} className="rounded-md bg-[#f7f9fc] px-2.5 py-1 text-[11px] font-semibold" style={{color:card.tone}}>{tag}</span>)}</div></div>
          </Link>
        </Reveal>)}
      </div>
      <Reveal className="mt-8 flex justify-center"><a href={withBase("/products")} className="rounded-md bg-[#8fc31f] px-12 py-4 text-xl font-semibold text-white">Seeed Studio XIAO Selector</a></Reveal>
    </div>
  </section>;
}

export function RoadmapCallout() {
  const { lang } = useLang();
  return <section id="roadmap" className="section bg-white px-6 sm:px-10 lg:px-16"><div className="mx-auto max-w-[1320px] text-center">
    <Reveal><h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">{lang === "en" ? "You Decide What We Build Next" : "下一款 XIAO，由你决定"}</h2><p className="mx-auto mt-5 max-w-5xl text-base leading-[1.65] text-[#526b91] sm:text-lg">{lang === "en" ? "We’re open-sourcing our roadmap for XIAO on GitHub, and you have a say in it. Vote for your favorite entries, suggest features, propose new products, or share feedback." : "我们在 GitHub 上公开 XIAO 路线图。你可以投票、建议功能、提出新产品，或直接分享反馈。"}</p></Reveal>
    <Reveal delay={100} className="relative mt-12 rounded-[28px] bg-[#174756] px-6 py-10 sm:px-8 sm:py-12 before:absolute before:left-1/2 before:top-0 before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-full before:border-x-[18px] before:border-b-[18px] before:border-x-transparent before:border-b-[#174756]"><div className="mx-auto flex max-w-5xl flex-col items-center gap-3 rounded-xl border border-white/25 px-5 py-3 md:flex-row"><p className="flex-1 text-left text-base text-white/90 sm:text-lg">Developer, join to shape the next XIAO with us!</p><span className="inline-flex items-center gap-2 border-l border-white/25 px-4 text-base font-bold text-white sm:text-lg"><svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.4-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg>GitHub</span><a href={withBase("/open-roadmap")} className="rounded-xl bg-[#9dcc3c] px-7 py-2.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#8ab833]">Join Now</a></div></Reveal>
  </div></section>;
}

export function PlaygroundSection() {
  return <section id="playground" className="section bg-white px-6 text-[#18224f] sm:px-10 lg:px-16">
    <div className="mx-auto max-w-[1440px]">
      <Reveal className="text-center"><h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">XIAO Playground</h2><p className="mx-auto mt-5 max-w-3xl text-center text-base leading-[1.65] text-[#526b91] sm:text-lg">Pin out, specs, schematics, web firmware flasher, tutorials, all open sourced in the Playground.</p></Reveal>
      <Reveal delay={100} className="mt-10 overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[#f6f8fa] shadow-[0_22px_60px_rgba(26,39,77,.10)]">
        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative flex min-h-[520px] flex-col items-center justify-center border-b border-[var(--line-soft)] p-10 lg:border-b-0 lg:border-r">
            <h3 className="text-2xl font-bold sm:text-3xl">Open Source</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/playground-hero.webp")} alt="Seeed Studio XIAO Playground" className="my-10 h-44 w-full object-contain sm:h-52" />
            <p className="text-xl font-semibold sm:text-2xl">for Developers</p>
            <Link href="/playground" className="mt-8 rounded-full bg-[#91d000] px-10 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#7fb300]">Let’s Play!</Link>
          </div>
          <div className="grid content-center gap-8 p-8 sm:p-12">
            {[
              ["⌘", "Pinout", "Interactive XIAO GPIO pinout reference"],
              ["▤", "Resources", "Specs, datasheets, schematics, KiCad & more"],
              ["</>", "Software Guide", "Wiki tutorials on how to run open software on XIAO"],
              ["⇩", "Web Flasher", "Flash tested firmwares from your browser"],
            ].map(([icon, title, text]) => <div key={title} className="grid grid-cols-[56px_1fr] items-start gap-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--brand-blue)]/25 text-xl font-bold text-[var(--brand-blue)]">{icon}</span><div><h3 className="text-lg font-bold sm:text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-[#526b91] sm:text-base">{text}</p></div></div>)}
          </div>
        </div>
      </Reveal>
    </div>
  </section>;
}
