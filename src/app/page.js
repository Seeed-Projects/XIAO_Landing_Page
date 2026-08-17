"use client";

import { useLang } from "./i18n";
import { SectionHeader, SiteHeader } from "./components";
import { HeroSection } from "./hero-section";
import { VideoIntroSection } from "./video-intro-section";
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
        {/* Hero - 全屏底图 + 大字 */}
        <HeroSection />
        {/* 视频解说 + 文字 */}
        <VideoIntroSection />

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
