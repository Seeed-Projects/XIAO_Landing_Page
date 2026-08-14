"use client";

import { useLang } from "./i18n";
import { SectionHeader, SiteHeader } from "./components";
import { PartnerMarquee } from "./partner-marquee";
import { NewsCarousel } from "./news-carousel";
import { ProjectsCarousel } from "./projects-carousel";
import { MediaReviewsSection } from "./media-reviews-section";
import { CoCreateSection } from "./co-create-section";
import { EdmSubscribe } from "./edm-subscribe";
import { EcosystemSection } from "./ecosystem-section";
import { Reveal } from "./reveal";
import { Glow } from "./Glow";

export default function Home() {
  const { t } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-24 lg:pt-28">
        {/* Hero - 全屏满宽 */}
        <section
          id="hero"
          className="bg-mod-hero soft-grid relative flex min-h-[100dvh] w-full scroll-mt-24 items-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16 lg:py-24"
        >
          <div className="relative z-10 mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal className="space-y-5">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-[var(--brand-blue-soft)]">
                {t.hero.kicker}
              </p>
              <Glow as="h1" className="font-display text-balance max-w-4xl text-5xl font-semibold leading-[0.94] tracking-tight text-[var(--ink-strong)] sm:text-6xl lg:text-7xl">
                {t.hero.title}
              </Glow>
            </Reveal>
            <Reveal delay={150} className="rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(135deg,rgba(0,73,102,0.96),rgba(8,102,126,0.92),rgba(143,195,31,0.88))] p-6 text-white sm:p-8">
              <p className="font-display text-xs uppercase tracking-[0.32em] text-white/72">
                {t.hero.ecosystemKicker}
              </p>
              <p className="mt-4 text-lg leading-8 text-white/90">
                {t.hero.ecosystemText}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 数据区 - 全屏满宽 */}
        <section
          id="data"
          className="bg-mod-blue relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.data.title} title={t.data.title} description="" />
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {t.data.items.map((item, i) => (
                <Reveal
                  key={item.label}
                  delay={i * 90}
                  className="flex flex-col justify-center rounded-2xl border border-[var(--line-soft)] bg-white/90 px-8 py-10 backdrop-blur-sm transition hover:shadow-md"
                >
                  <div className="font-display text-4xl font-semibold tracking-tight text-[var(--brand-blue)] sm:text-5xl lg:text-[52px] lg:leading-[1.05]">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm font-medium text-[var(--ink-body)] sm:text-base">
                    {item.label}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 开发者区 - 全屏满宽 */}
        <section
          id="developer"
          className="bg-mod-green relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.developer.title} title={t.developer.title} description="" />
            </Reveal>
            <div className="mt-10">
              <PartnerMarquee />
            </div>
          </div>
        </section>

        {/* 生态横幅 + 三入口：资料 / 投票 / 项目中心 */}
        <EcosystemSection />

        {/* 新闻 - 全屏满宽 */}
        <section
          id="news"
          className="bg-mod-mint relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.news.title} title={t.news.title} description="" />
            </Reveal>
            <div className="mt-8">
              <NewsCarousel />
            </div>
          </div>
        </section>

        {/* 热门项目 - 全屏满宽 */}
        <section
          id="projects"
          className="bg-mod-green relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.projects.title} title={t.projects.title} description="" />
            </Reveal>
            <div className="mt-8">
              <ProjectsCarousel />
            </div>
          </div>
        </section>

        {/* 外部媒体 / 社区 review 精选（替换原用户评价） */}
        <section
          id="reviews"
          className="bg-mod-blue relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.mediaReviews.kicker} title={t.mediaReviews.title} description="" />
            </Reveal>
            <div className="mt-10">
              <MediaReviewsSection />
            </div>
          </div>
        </section>

        {/* 生态共创 - 全屏满宽，置于用户评价下方 */}
        <section
          id="cocreate"
          className="bg-mod-green relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <SectionHeader kicker={t.cocreate.kicker} title={t.cocreate.title} description={t.cocreate.description} />
            </Reveal>
            <div className="mt-10">
              <CoCreateSection />
            </div>
          </div>
        </section>

        {/* EDM 订阅 - 全屏满宽 */}
        <section
          id="edm"
          className="bg-mod-mint relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal delay={120}>
              <EdmSubscribe />
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
