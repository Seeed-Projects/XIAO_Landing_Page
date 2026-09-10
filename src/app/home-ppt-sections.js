"use client";

import Link from "next/link";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { TypewriterText } from "./typewriter-text";
import { PlaygroundPreview } from "./playground-preview";
import { PlaygroundToolIcon } from "./playground-tool-icon";
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
        <p className="min-w-0 flex-1 text-left text-base leading-[1.6] text-[#35473c] sm:text-lg"><TypewriterText key={lang} text={lang === "en" ? "Developers, join us and shape the next XIAO!" : "\u5f00\u53d1\u8005\uff0c\u52a0\u5165\u6211\u4eec\uff0c\u5171\u540c\u6253\u9020\u4e0b\u4e00\u6b3e XIAO\uff01"} /></p>
        <a href={withBase("/open-roadmap")} style={{ color: "#182b0c" }} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#9dcc3c] px-3 py-3 text-sm font-bold text-[#182b0c] transition-[transform,background-color] duration-150 hover:bg-[#8ab833] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:text-base">
          {lang === "en" ? "Join Now" : "立即加入"}
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
        </a>
      </div>
    </Reveal>
  </div></section>;
}

const PLAYGROUND_TOOLS = [
  { key: "pinout", icon: "pin", href: "/playground/pinout", en: ["Pinout", "Interactive XIAO GPIO pinout reference"], zh: ["Pinout", "\u4ea4\u4e92\u5f0f XIAO GPIO \u5f15\u811a\u56fe"] },
  { key: "resources", icon: "files", href: "/res", en: ["Resources", "Specs, datasheets, schematics and KiCad files"], zh: ["\u8d44\u6599", "\u89c4\u683c\u3001\u6570\u636e\u624b\u518c\u3001\u539f\u7406\u56fe\u4e0e KiCad \u6587\u4ef6"] },
  { key: "software", icon: "code", href: "/software-center", en: ["Software Guide", "Find official and community software for XIAO"], zh: ["\u8f6f\u4ef6\u6307\u5357", "\u63a2\u7d22\u9002\u7528\u4e8e XIAO \u7684\u5b98\u65b9\u4e0e\u793e\u533a\u8f6f\u4ef6"] },
  { key: "flasher", icon: "flash", href: "/playground/esp-flasher", en: ["Web Flasher", "Flash tested firmware from your browser"], zh: ["\u7f51\u9875\u70e7\u5f55\u5668", "\u5728\u6d4f\u89c8\u5668\u4e2d\u70e7\u5f55\u5df2\u6d4b\u8bd5\u56fa\u4ef6"] },
];

export function PlaygroundSection() {
  const { lang } = useLang();
  const zh = lang === "zh";
  return (
    <section id="playground" className="section home-section home-playground-section relative overflow-hidden px-6 text-white sm:px-10 lg:px-16">
      <div className="home-content home-playground">
        <Reveal className="home-playground-heading text-center">
          <h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">XIAO Playground</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-[1.65] sm:text-lg">
            {zh ? "\u9009\u4e00\u5757 XIAO\uff0c\u63a2\u7d22\u3001\u521b\u9020\uff0c\u73a9\u8d77\u6765\u3002" : "Pick a board. Explore. Build. Play."}
          </p>
        </Reveal>
        <div className="home-playground-panel">
          <Reveal className="home-playground-visual">
            <PlaygroundPreview />
            <div className="home-playground-caption">
              <span>{zh ? "\u60ac\u505c\u63a2\u7d22\u578b\u53f7\uff0c\u70b9\u51fb\u9009\u4e2d\u4f60\u7684 XIAO" : "Hover to explore. Click to pick your XIAO."}</span>
            </div>
          </Reveal>
          <div className="home-playground-sidebar">
            <Reveal delay={100} className="home-playground-tools">
              {PLAYGROUND_TOOLS.map((tool) => {
                const [title, description] = zh ? tool.zh : tool.en;
                return (
                  <Link key={tool.key} href={tool.href} className="home-playground-tool" data-tool={tool.key}>
                    <span className="home-playground-tool-icon"><PlaygroundToolIcon type={tool.icon} /></span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                    <span className="home-playground-tool-arrow" aria-hidden="true">{"\u2192"}</span>
                  </Link>
                );
              })}
            </Reveal>
            <Reveal className="home-playground-action">
              <Link href="/playground" className="home-playground-cta inline-flex items-center justify-center gap-3 rounded-full px-8 py-3 text-base font-bold transition">
                {zh ? "\u5f00\u59cb\u73a9\uff01" : "Let\u2019s Play!"}<span aria-hidden="true">{"\u2192"}</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
