"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "../../i18n";
import { SiteHeader } from "../../components";
import { Glow } from "../../Glow";
import { findSoftwareBySlug, SOFTWARE_CATEGORIES, slugify, logoSrc, pick } from "../software-data";

export default function SoftwareDetailClient() {
  const { t, lang } = useLang();
  const params = useParams();
  const slug = decodeURIComponent(String(params?.slug ?? ""));

  const item = findSoftwareBySlug(slug);

  if (!item) {
    return (
      <>
        <SiteHeader />
        <main className="flex w-full flex-1 flex-col items-center justify-center px-6 py-32 text-center">
          <Glow
            as="h1"
            className="font-display text-3xl font-semibold tracking-tight text-[var(--ink-strong)]"
          >
            {lang === "zh" ? "未找到该软件" : "Software not found"}
          </Glow>
          <p className="mt-3 text-sm text-[var(--ink-body)]">
            {lang === "zh" ? `没有找到 “${slug}” 对应的条目。` : `No entry found for “${slug}”.`}
          </p>
          <Link
            href="/software-center"
            className="mt-6 rounded-full border border-[var(--brand-blue)]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-blue)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/45 hover:bg-[var(--brand-blue)]/5"
          >
            ← {lang === "zh" ? "返回软件中心" : "Back to Software Center"}
          </Link>
        </main>
      </>
    );
  }

  const cat = item.category;

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-24 lg:pt-28">
        {/* 面包屑 + 标题 */}
        <section className="w-full px-6 py-8 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1100px]">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--ink-muted)]">
              <Link href="/software-center" className="hover:text-[var(--brand-blue)]">
                {lang === "zh" ? "软件中心" : "Software Center"}
              </Link>
              <span>/</span>
              <Link
                href={`/software-center#${cat.id}`}
                className="hover:text-[var(--brand-blue)]"
              >
                {pick(cat.title, lang)}
              </Link>
              <span>/</span>
              <span className="text-[var(--ink-strong)]">{pick(item.name, lang)}</span>
            </nav>

            <div className="mt-6 flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-[var(--line-soft)]">
                {item.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoSrc(item.logo)}
                    alt={pick(item.name, lang)}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--brand-blue-soft)]">
                    {pick(item.name, lang)[0]}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Glow
                  as="h1"
                  className="font-display text-3xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-4xl"
                >
                  {pick(item.name, lang)}
                </Glow>
                {item.desc && (
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-body)]">
                    {pick(item.desc, lang)}
                  </p>
                )}
              </div>
            </div>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(0,73,102,0.10),rgba(29,103,132,0.08))] px-5 py-2.5 text-sm font-semibold text-[var(--brand-blue)] ring-1 ring-inset ring-[var(--brand-blue)]/20 transition hover:bg-[linear-gradient(135deg,rgba(0,73,102,0.16),rgba(29,103,132,0.14))] hover:ring-[var(--brand-blue)]/40"
              >
                {lang === "zh" ? "访问官方主页" : "Visit official page"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            )}
          </div>
        </section>

        {/* 支持板卡列表 */}
        {item.boards?.length > 0 && (
          <section className="w-full px-6 pb-24 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-[1100px]">
              <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--ink-strong)]">
                {lang === "zh" ? "支持的 XIAO 板卡" : "Supported XIAO Boards"}
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {lang === "zh"
                  ? `共 ${item.boards.length} 项，点击进入对应 wiki / 文档。`
                  : `${item.boards.length} in total — click to open the wiki / docs.`}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {item.boards.map((b, i) => {
                  const href = b.url && b.url !== '""' ? b.url : null;
                  const Card = href ? "a" : "div";
                  return (
                    <Card
                      key={i}
                      {...(href
                        ? { href, target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={
                        "group flex items-center justify-between gap-3 rounded-xl border border-[var(--line-soft)] bg-white/85 px-4 py-3 backdrop-blur-sm transition " +
                        (href
                          ? "hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/30 hover:shadow-md"
                          : "opacity-70")
                      }
                    >
                      <span className="text-sm font-semibold leading-snug text-[var(--ink-strong)]">
                        {pick(b.name, lang)}
                      </span>
                      {href && (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0 text-[var(--ink-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-blue-soft)]"
                        >
                          <path d="M7 17 17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 同分类其它软件 */}
        <section className="w-full px-6 pb-24 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[1100px]">
            <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--ink-strong)]">
              {lang === "zh" ? `${pick(cat.title, lang)} 中的其它软件` : `More in ${pick(cat.title, lang)}`}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {SOFTWARE_CATEGORIES.find((c) => c.id === cat.id)?.items
                .filter((it) => slugify(it.name) !== slugify(item.name))
                .map((it) => {
                  const s = slugify(it.name);
                  return (
                    <Link
                      key={s}
                      href={`/software-center/${s}`}
                      className="rounded-full border border-[var(--line-soft)] bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[var(--ink-strong)] transition hover:border-[var(--brand-blue)]/40 hover:text-[var(--brand-blue-soft)]"
                    >
                      {pick(it.name, lang)}
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
