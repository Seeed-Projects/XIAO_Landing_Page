import Link from "next/link";
import { navItems } from "./site-data";
import { SiteHeader } from "./site-header";
import { Glow } from "./Glow";

export { SiteHeader };

export function PageShell({ children }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        {children}
      </main>
    </>
  );
}

export function DirectoryCard({ items }) {
  return (
    <aside className="toc-panel rounded-[24px] px-5 py-6">
      <div className="space-y-4">
        <p className="text-sm font-medium text-white/80">Table of Contents</p>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-xl px-3 py-2 text-sm leading-6 text-white/88 transition hover:bg-white/8"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function SectionHeader({ kicker, title, description, align = "center" }) {
  return (
    <div
      className={`space-y-3 ${
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"
      }`}
    >
      <Glow as="h2" className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </Glow>
      {description ? (
        <p className="max-w-xl text-base leading-7 text-[var(--ink-body)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function InfoCard({ title, description, eyebrow, footer }) {
  return (
    <div className="section-shell glow-card rounded-[30px] p-6 sm:p-7">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-[var(--ink-body)]">{description}</p>
      {footer ? (
        <div className="mt-8 flex items-center justify-between border-t border-[var(--line-soft)] pt-4 text-sm font-semibold text-[var(--brand-blue)]">
          <span>{footer}</span>
          <span>→</span>
        </div>
      ) : null}
    </div>
  );
}

export function IntroHero({ title, description, kicker, rightTitle, rightText }) {
  return (
    <section className="hero-orb section-shell soft-grid relative overflow-hidden rounded-[40px] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <Glow as="h1" className="font-display text-balance max-w-4xl text-5xl font-semibold leading-[0.94] tracking-tight text-[var(--ink-strong)] sm:text-6xl lg:text-7xl">
              {title}
            </Glow>
            <p className="max-w-2xl text-lg leading-8 text-[var(--ink-body)] sm:text-xl">
              {description}
            </p>
          </div>
        </div>
        <div className="section-shell rounded-[32px] border border-white/60 bg-white/90 p-5 sm:p-6">
          <div className="rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] p-6 text-white">
            <p className="font-display text-xs uppercase tracking-[0.32em] text-white/72">
              {rightTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-white/90">{rightText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
