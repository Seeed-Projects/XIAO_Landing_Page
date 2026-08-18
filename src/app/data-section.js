"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import { Reveal } from "./reveal";
import { SectionHeader } from "./components";
import { Glow } from "./Glow";

/**
 * DataSection —— 首页数据区：PCB 电路板风格。
 * 深色底 + 电路网格/走线/过孔花纹，数据包沿走线流动；
 * 每张数据卡做成 IC 模块：顶部引脚、大号 LED 数字（滚入递增 + 渐变发光）、
 * 底部走线 + 流动脉冲。
 */

/* 沿卡底走线流动的脉冲 */
function TracePulse({ delay = 0, color = "#5eead4" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 24"
      preserveAspectRatio="none"
      className="h-6 w-full"
    >
      <path
        d="M0 12 H120 L136 4 L152 20 L168 8 L184 16 H320"
        fill="none"
        stroke="rgba(94,234,212,0.35)"
        strokeWidth="1.4"
      />
      <circle r="3.2" fill={color}>
        <animateMotion
          dur="3.4s"
          begin={`${delay}s`}
          repeatCount="indefinite"
          path="M0 12 H120 L136 4 L152 20 L168 8 L184 16 H320"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.1;0.9;1"
          dur="3.4s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* 数字递增 hook：进入视口后从 0 动到目标值 */
function useCountUp(target, inView, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || !target) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, inView, duration]);
  return val;
}

/* 把 value 串拆成「数字 + 后缀」：17 / 300+ / 500,000+ / 500+ Million / 21×17.8 mm */
function parseValue(raw) {
  const m = /^([\d,]+)(.*)$/.exec(String(raw).trim());
  if (!m) return { raw, num: null, suffix: "" };
  const num = parseInt(m[1].replace(/,/g, ""), 10);
  return { raw, num: Number.isFinite(num) ? num : null, suffix: m[2] };
}

function StatCard({ item, index, inView }) {
  const { num, suffix } = parseValue(item.value);
  const display = useCountUp(num ?? 0, inView);
  const formatted = num != null ? display.toLocaleString() + suffix : item.value;

  return (
    <Reveal
      delay={index * 90}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[rgba(94,234,212,0.18)] bg-white/[0.04] px-7 py-8 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[rgba(94,234,212,0.45)] hover:bg-white/[0.07]"
    >
      {/* 顶部引脚排（IC pin header） */}
      <div className="pointer-events-none absolute inset-x-6 top-3 flex justify-between opacity-50">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-[1px] bg-[rgba(94,234,212,0.6)]" />
        ))}
      </div>

      {/* 角标过孔 */}
      <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 rounded-full border border-[rgba(94,234,212,0.5)]" />
      <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full border border-[rgba(94,234,212,0.5)]" />

      <div className="mt-4">
        <Glow
          as="div"
          className="font-mono text-4xl font-semibold leading-none tracking-tight text-transparent sm:text-5xl lg:text-[52px] lg:leading-[1.05]"
          style={{
            backgroundImage:
              "linear-gradient(120deg,#7dd3fc 0%,#5eead4 45%,#a7f3d0 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 14px rgba(94,234,212,0.35))",
          }}
        >
          {formatted}
        </Glow>
        <p className="mt-3 text-sm font-medium text-white/75 sm:text-base">
          {item.label}
        </p>
      </div>

      {/* 底部走线 + 流动脉冲 */}
      <div className="mt-6">
        <TracePulse delay={index * 0.5} />
      </div>

      {/* 悬浮扫光 */}
      <span className="pointer-events-none absolute -inset-x-2 -top-1/2 h-full bg-[linear-gradient(180deg,rgba(94,234,212,0.10),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Reveal>
  );
}

export function DataSection() {
  const { t } = useLang();
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="data"
      ref={ref}
      className="relative flex min-h-[100dvh] w-full scroll-mt-24 items-center overflow-hidden bg-mod-blue px-6 py-20 sm:px-10 lg:px-16"
    >
      {/* 电路板底纹：网格 + 走线 + 过孔 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern id="pcbGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(94,234,212,0.07)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#pcbGrid)" />
        {/* 横向走线 */}
        {[120, 300, 480, 660, 780].map((y) => (
          <path
            key={y}
            d={`M0 ${y} H420 L456 ${y - 36} H640 L676 ${y + 24} H900 L936 ${y - 18} H1440`}
            fill="none"
            stroke="rgba(94,234,212,0.10)"
            strokeWidth="1.4"
          />
        ))}
        {/* 纵向走线 */}
        {[260, 560, 860, 1160].map((x) => (
          <path
            key={x}
            d={`M${x} 0 V240 L${x + 36} 276 V520 L${x - 24} 556 V900`}
            fill="none"
            stroke="rgba(94,234,212,0.09)"
            strokeWidth="1.4"
          />
        ))}
        {/* 过孔 */}
        {[
          [260, 240], [560, 276], [860, 520], [1160, 556], [420, 120],
          [676, 480], [936, 660],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.2" fill="none" stroke="rgba(94,234,212,0.35)" strokeWidth="1.2" />
        ))}
      </svg>

      {/* 沿主走线流动的数据包 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <circle r="4" fill="#a7f3d0" opacity="0.9">
          <animateMotion dur="6s" repeatCount="indefinite" path="M0 300 H420 L456 264 H640 L676 324 H900 L936 282 H1440" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle r="4" fill="#7dd3fc" opacity="0.9">
          <animateMotion dur="7.5s" begin="1.4s" repeatCount="indefinite" path="M260 0 V240 L296 276 V520 L236 556 V900" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="7.5s" begin="1.4s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <Reveal>
          <SectionHeader kicker={t.data.title} title={t.data.title} description="" />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.data.items.map((item, i) => (
            <StatCard key={item.label} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
