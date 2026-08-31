"use client";

import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { defaultXiaoImage } from "./site-data";

const FEATURES = [
  { icon: "⬡", en: ["Popular SoCs Integrated", "RA4M1, RP2350, ESP32, RP2040, nRF52840, SAMD21, and more for embedded machine learning on MCUs."], zh: ["集成主流 SoC", "覆盖 RA4M1、RP2350、ESP32、RP2040、nRF52840、SAMD21 等平台，轻松构建 MCU 端嵌入式机器学习应用。"] },
  { icon: "☝", en: ["Thumb Size With SMD", "Sized at 21×17.8 mm with a single-sided surface-mount design, ready for space-constrained and tap-on designs."], zh: ["拇指大小，支持 SMD", "21×17.8 mm 单面贴装设计，适合空间受限及直接贴装式产品。"] },
  { icon: "</>", en: ["TinyML Native", "Compatible with Seeed’s no-code model training and deployment platform SenseCraft AI, making TinyML scalable."], zh: ["原生支持 TinyML", "兼容 Seeed 无代码模型训练与部署平台 SenseCraft AI，让 TinyML 更易规模化。"] },
  { icon: "☺", en: ["Developer-Friendly", "Natively compatible with Arduino, supporting PlatformIO, MicroPython, and CircuitPython."], zh: ["开发者友好", "原生兼容 Arduino，并支持 PlatformIO、MicroPython 与 CircuitPython。"] },
];

const GLIMPSE = [
  { no: "01", eyebrow: "Core MCUs", title: "XIAO Dev Boards", text: "Thumb-sized, Arduino-compatible microcontrollers powered by popular chipsets for TinyML and edge computing.", tone: "#3976ff" },
  { no: "02", eyebrow: "Expansion Accessories", title: "XIAO Add-ons", text: "Expansion boards, sensors, connectivity modules, actuators and kits designed for XIAO.", tone: "#16a4bd" },
  { no: "03", eyebrow: "Ready-to-Use Devices", title: "XIAO Gadgets", text: "Out-of-the-box smart devices built on XIAO boards and add-ons for smart home, vision AI and maker projects.", tone: "#9857ff" },
];

export function FeaturesSection() {
  const { lang } = useLang();
  return <section id="features" className="bg-[#f4f4f4] px-6 py-20 sm:px-10 lg:px-16">
    <div className="mx-auto max-w-[1440px]">
      <Reveal><h2 className="text-center text-4xl font-bold tracking-[-0.03em] text-[#18224f] sm:text-5xl">Features</h2></Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((item, i) => { const copy = lang === "en" ? item.en : item.zh; return <Reveal key={item.en[0]} delay={i * 70} className="text-center">
          <div className="mx-auto flex h-16 items-center justify-center text-5xl font-black text-[#8fc31f]">{item.icon}</div>
          <h3 className="mt-5 text-lg font-bold text-[#18224f]">{copy[0]}</h3>
          <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-[#526b91]">{copy[1]}</p>
        </Reveal>; })}
      </div>
    </div>
  </section>;
}

export function GlimpseSection() {
  const { lang } = useLang();
  return <section id="glimpse" className="bg-white px-6 py-20 sm:px-10 lg:px-16">
    <div className="mx-auto max-w-[1320px]">
      <Reveal className="text-center"><h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#18224f] sm:text-5xl">XIAO in a Glimpse</h2><p className="mx-auto mt-3 max-w-5xl text-lg text-[#202020]">{lang === "en" ? "From core development boards to expansion add-ons and ready-to-use smart gadgets — one ecosystem, endless possibilities" : "从核心开发板到扩展配件和开箱即用的智能设备——一个生态，无限可能"}</p></Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {GLIMPSE.map((card, i) => <Reveal key={card.no} delay={i * 80} className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-[0_12px_30px_rgba(26,39,77,.08)]">
          <div className="relative h-48 overflow-hidden bg-[#f6faf8]"><div className="absolute inset-0 bg-cover bg-center opacity-90" style={{backgroundImage:`url(${defaultXiaoImage})`}} /><span className="absolute left-4 top-4 rounded bg-white px-2 py-1 font-mono text-xs" style={{color:card.tone}}>{card.no}</span></div>
          <div className="border-t-2 p-6" style={{borderColor:card.tone}}><p className="text-xs font-semibold" style={{color:card.tone}}>{card.eyebrow}</p><h3 className="mt-2 text-xl font-bold text-[#18224f]">{card.title}</h3><p className="mt-3 text-sm leading-6 text-[#526b91]">{card.text}</p></div>
        </Reveal>)}
      </div>
      <Reveal className="mt-8 flex justify-center"><a href="/products" className="rounded-md bg-[#8fc31f] px-12 py-4 text-xl font-semibold text-white">Seeed Studio XIAO Selector</a></Reveal>
    </div>
  </section>;
}

export function RoadmapCallout() {
  const { lang } = useLang();
  return <section id="roadmap" className="bg-white px-6 py-20 sm:px-10 lg:px-16"><div className="mx-auto max-w-[1320px] text-center">
    <Reveal><h2 className="text-4xl font-bold tracking-[-0.03em] text-[#18224f] sm:text-5xl">{lang === "en" ? "You Decide What We Build Next" : "下一款 XIAO，由你决定"}</h2><p className="mx-auto mt-5 max-w-5xl text-base leading-7 text-[#444]">{lang === "en" ? "We’re open-sourcing our roadmap for XIAO on GitHub, and you have a say in it. Vote for your favorite entries, suggest features, propose new products, or share feedback." : "我们在 GitHub 上公开 XIAO 路线图。你可以投票、建议功能、提出新产品，或直接分享反馈。"}</p></Reveal>
    <Reveal delay={100} className="relative mt-14 rounded-[42px] bg-[#00485a] px-8 py-16"><div className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-2xl border border-white/30 px-8 py-5 md:flex-row"><p className="flex-1 text-left text-2xl text-white">Developer, join to shape the next XIAO with us!</p><a href="/open-roadmap" className="rounded-xl bg-[#8fc31f] px-10 py-4 text-xl font-bold text-white">Join Now</a></div></Reveal>
  </div></section>;
}

export function ScaleUpSection() {
  const cards = ["OpenUC2 10x AI Microscope", "Green Dot Board", "6 Channel Temperature Meter", "Fusion DIY XIAO Mechanical Keyboards", "Seeed Studio XIAO Use Case"];
  return <section id="scale-up" className="bg-[#f3f7f8] px-6 py-20 sm:px-10 lg:px-16"><div className="mx-auto max-w-[1320px] text-center"><Reveal><h2 className="text-4xl font-bold tracking-[-0.03em] text-[#18224f] sm:text-5xl">Scale-up Co-Create Projects</h2><p className="mt-4 text-lg text-[#444]">Find out how the community is scaling up their XIAO-based projects via our Fusion Co-Create.</p></Reveal><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">{cards.map((card, i)=><Reveal key={card} delay={i*60} className="text-left"><div className="aspect-[1.15] rounded-sm bg-cover bg-center" style={{backgroundImage:`linear-gradient(135deg,rgba(0,73,102,.05),rgba(143,195,31,.16)),url(${defaultXiaoImage})`}}/><h3 className="mt-5 text-lg font-bold leading-snug text-[#18224f]">{card}</h3></Reveal>)}</div><a href="https://www.seeedstudio.com/co-create.html" className="mt-12 inline-flex rounded-full bg-[#9ed33f] px-12 py-4 text-lg font-bold text-white">Explore more</a></div></section>;
}
