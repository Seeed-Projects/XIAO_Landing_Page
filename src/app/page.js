"use client";

import { useLang } from "./i18n";
import { SectionHeader, SiteHeader } from "./components";
import { HomeCarousel } from "./home-carousel";
import { VideoIntroSection } from "./video-intro-section";
import { PartnerMarquee } from "./partner-marquee";
import { NewsCarousel } from "./news-carousel";
import { ProjectsCarousel } from "./projects-carousel";
import { CoCreateSection } from "./co-create-section";
import { EdmSubscribe } from "./edm-subscribe";
import { Reveal } from "./reveal";
import { FeaturesSection, GlimpseSection, PlaygroundSection, RoadmapCallout } from "./home-ppt-sections";

export default function Home() {
  const { t, lang } = useLang();
  const isEn = lang === "en";
  const OSHW_HUB_URL = "https://seeed-studio.github.io/OSHW-XIAO-Series/";

  return (
    <>
      <SiteHeader />
      {/* 首页商城式横幅轮播：全屏铺满，紧贴页眉，无顶部白边 */}
      <HomeCarousel />
      <main className="flex w-full flex-1 flex-col">
        {/* 视频解说 + 文字 */}
        <VideoIntroSection />
        <FeaturesSection />
        <GlimpseSection />

        {/* 开发者区 - 全屏满宽，跑马灯带铺满 */}
        <section
          id="developer"
          className="bg-mod-green relative flex w-full scroll-mt-24 items-center overflow-hidden py-14"
        >
          <div className="w-full">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
              <Reveal>
                <SectionHeader kicker={t.developer.title} title={t.developer.title} description="" />
              </Reveal>
            </div>
            <div className="mx-auto mt-10 w-full max-w-[1720px] px-8 sm:px-10 lg:px-12">
              <PartnerMarquee />
            </div>
          </div>
        </section>

        <RoadmapCallout />

        {/* 热门项目 - 全屏满宽，跑马灯带铺满 */}
        <section
          id="projects"
          className="bg-mod-green relative flex min-h-[100dvh] w-full scroll-mt-24 items-center py-20 overflow-hidden"
        >
          <div className="w-full">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
              <Reveal>
                <SectionHeader
                  kicker={t.projects.title}
                  title={t.projects.title}
                  description="Projects from GitHub, Youtube, Instructables, Hackster, Hackaday, and more, all well-curated on XIAO Project Hub."
                />
              </Reveal>
            </div>
            <div className="mt-8 w-full">
              <ProjectsCarousel />
            </div>
            {/* Explore More —— 进入 OSHW XIAO Series 开源硬件合集，看更多共创项目 */}
            <div className="mx-auto mt-8 w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
              <div className="flex justify-center">
                <a
                  href={OSHW_HUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--brand-blue)]/20 bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-blue)] shadow-[0_8px_24px_rgba(0,73,102,0.10)] transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)]/45 hover:bg-[var(--brand-blue)]/5"
                >
                  {isEn ? "Explore more" : "探索更多"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <PlaygroundSection />

        {/* 生态共创 - 全屏满宽，置于用户评价下方；原版文案直接放 banner，不再加重复标题 */}
        <section
          id="cocreate"
          className="bg-mod-green relative flex min-h-[100dvh] w-full scroll-mt-24 items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <CoCreateSection />
          </div>
        </section>

        {/* XIAO in the News —— 置于 Co-Create 之后 */}
        <section
          id="news"
          className="relative flex w-full scroll-mt-24 items-center overflow-hidden bg-white py-20"
        >
          <div className="w-full">
            <div className="mx-auto w-full max-w-[1440px] px-6 text-center sm:px-10 lg:px-16">
              <Reveal>
                <h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.035em] text-[#18224f] sm:text-5xl lg:text-[3.5rem]">
                  {isEn ? "XIAO in the News" : "XIAO 新闻动态"}
                </h2>
                <p className="mx-auto mt-4 max-w-3xl text-base leading-[1.65] text-[#526b91] sm:text-lg">
                  {isEn
                    ? "Discover the latest news on XIAO, updates from Seeed and from our community all over the world"
                    : "了解 XIAO 最新资讯，以及来自 Seeed 和全球社区的动态。"}
                </p>
              </Reveal>
            </div>
            <div className="mt-10 w-full">
              <NewsCarousel />
            </div>
          </div>
        </section>

        {/* EDM 订阅 - 全屏满宽 */}
        <section id="edm" className="relative w-full scroll-mt-24">
          <Reveal delay={120}>
            <EdmSubscribe />
          </Reveal>
        </section>
      </main>
    </>
  );
}
