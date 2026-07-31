"use client";

import { useLang } from "./i18n";
import { SectionHeader } from "./components";
import { Reveal } from "./reveal";

export function CoCreateSection() {
  const { t } = useLang();
  const c = t.cocreate;
  const steps = c.steps;

  return (
    <div className="space-y-6">
      {/* 上部：左侧共创主视觉 banner + 右侧三张能力卡 */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 主视觉 banner —— 品牌渐变，带生态轨道动画 */}
        <Reveal className="hero-orb relative overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] p-7 text-white sm:p-9">
          <div className="relative z-10 max-w-xl space-y-5">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-white/72">
              {c.banner.kicker}
            </p>
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

          {/* 生态轨道动画（动图替代） */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 top-1/2 hidden h-64 w-64 -translate-y-1/2 sm:block lg:right-4"
          >
            {/* 轨道圈 */}
            <div className="absolute inset-0 rounded-full border border-white/25" />
            <div className="absolute inset-6 rounded-full border border-white/15" />
            <div className="absolute inset-12 rounded-full border border-white/10" />
            {/* 慢转轨道上的节点 */}
            <div className="absolute inset-0 animate-[cospin_24s_linear_infinite]">
              {c.banner.nodes.map((node, i) => {
                const angle = (i / c.banner.nodes.length) * Math.PI * 2 - Math.PI / 2;
                const r = 120;
                const x = 50 + (Math.cos(angle) * r) / 2.56;
                const y = 50 + (Math.sin(angle) * r) / 2.56;
                return (
                  <span
                    key={node}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/12 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      animation: `cofloat 4s ease-in-out ${i * 0.5}s infinite`,
                    }}
                  >
                    {node}
                  </span>
                );
              })}
            </div>
            {/* 中心脉冲 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="block h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
              <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 animate-[copulse_2.4s_ease-out_infinite]" />
            </div>
          </div>
        </Reveal>

        {/* 右侧三张能力卡 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-1">
          {c.features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 90}
              className="glow-card flex flex-col rounded-3xl border border-[var(--line-soft)] bg-white/90 p-6 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(0,73,102,0.12),rgba(143,195,31,0.16))] text-[var(--brand-blue)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <h4 className="mt-4 font-display text-lg font-semibold tracking-tight text-[var(--ink-strong)]">
                {f.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-body)]">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 下部：4 步共创流程，带流动脉冲连接线（动图替代） */}
      <Reveal delay={120} className="rounded-3xl border border-[var(--line-soft)] bg-white/80 p-6 backdrop-blur-sm sm:p-8">
        <div className="relative">
          {/* 连接线（桌面） */}
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-[var(--line-soft)] lg:block">
            <span className="absolute top-1/2 block h-[3px] w-16 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(143,195,31,0),rgba(143,195,31,0.9),rgba(0,73,102,0.9),rgba(0,73,102,0))] animate-[coflow_4s_linear_infinite]" />
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.label} className="relative flex flex-col items-center text-center">
                <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white font-display text-sm font-bold text-[var(--brand-blue)] shadow-[var(--shadow-card)]">
                  {i + 1}
                </span>
                <p className="mt-4 font-display text-base font-semibold text-[var(--ink-strong)]">
                  {s.label}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
