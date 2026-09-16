"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "../reveal";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import { PROJECTS } from "../projects-data";
import { pickFeaturedProjects } from "./pick-featured-projects.mjs";
import styles from "./project-hub.module.css";

const HUB_EMBED = "/project-hub-embed.html";
const CONTRIBUTE_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSdiju4D3-h0fZavfZeRrXcOtAh-Lb7Ll8zbrkziB94RCvbZrQ/viewform";
const FEATURED_COUNT = 7;

const T = {
  en: {
    introTagline:
      "Discover what you can build with XIAO through real projects from makers around the world. Find an idea, learn from the build, and make it your own.",
    viewProject: "View project",
    featuredTitle: "Featured Projects",
    featuredDek:
      "Seven community builds drawn from the Home project collection. Refresh the page to see another selection.",
    collectionTitle: "Explore every project",
    collectionDek:
      "Continue into the complete hub to compare boards, categories, sources and publication dates.",
    contributeButton: "Contribute your project",
    loading: "Loading featured projects…",
  },
  zh: {
    introTagline:
      "从世界各地创客的真实作品中，发现 XIAO 可以实现什么。寻找灵感、参考构建过程，再创造属于你的版本。",
    viewProject: "查看项目",
    featuredTitle: "精选项目",
    featuredDek: "从首页项目合集中随机抽取 7 个社区作品。刷新页面可换一批展示。",
    collectionTitle: "浏览全部项目",
    collectionDek:
      "进入完整项目中心，按开发板、应用类别、内容来源和发布日期继续探索。",
    contributeButton: "提交你的项目",
    loading: "正在加载精选项目…",
  },
};

function localize(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return (lang === "en" ? field.en : field.zh) || field.en || field.zh || "";
}

function formatProjectDate(date) {
  if (!date || typeof date !== "string") return "";
  const match = date.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}` : date;
}

function ProjectMeta({ tag, board, date }) {
  return (
    <div className={styles.projectMeta}>
      {tag ? <span className={styles.projectTag}>{tag}</span> : null}
      {board ? <span className={styles.projectBoard}>{board}</span> : null}
      {date ? <span className={styles.projectDate}>{date}</span> : null}
    </div>
  );
}

function FeaturedSkeleton({ label }) {
  return (
    <div className={styles.featuredSkeleton} aria-busy="true" aria-label={label}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonLead}`} />
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
        ))}
      </div>
    </div>
  );
}

export function ProjectHub() {
  const { lang } = useLang();
  const t = T[lang];
  const [featured, setFeatured] = useState(null);
  const [embedHeight, setEmbedHeight] = useState(1400);

  useEffect(() => {
    setFeatured(pickFeaturedProjects(PROJECTS, FEATURED_COUNT));
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "xiao-project-hub-height") return;
      const nextHeight = Number(event.data.height);
      if (!Number.isFinite(nextHeight) || nextHeight < 300) return;
      setEmbedHeight(Math.ceil(nextHeight));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const lead = featured?.[0] ?? null;
  const grid = featured?.slice(1) ?? [];

  return (
    <div className={styles.hub}>
      <div className={styles.noise} />

      <Reveal as="header" className={styles.projectIntro}>
        <div className={styles.introVisual}>
          <Image
            src={withBase("/projecthub-hero.webp")}
            alt=""
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className={styles.introShade} />
        <div className={`page-hero-copy ${styles.introCopy}`}>
          <Glow
            as="h1"
            className="home-type-hero-title text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          >
            XIAO Project Hub
          </Glow>
          <p className="page-hero-description home-type-body text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {t.introTagline}
          </p>
          <div className={styles.introAction}>
            <a
              href={CONTRIBUTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="home-type-action home-filled-action home-primary-cta"
              style={{ color: "#fff" }}
            >
              {t.contributeButton}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </Reveal>

      <main>
        <Reveal as="section" className={`${styles.featuredSection} scroll-mt-24`} id="featured-projects">
          <div className={styles.featuredIntro}>
            <Glow as="h2" className="home-type-title">
              {t.featuredTitle}
            </Glow>
            <p className="home-type-body">{t.featuredDek}</p>
          </div>

          {!featured ? (
            <FeaturedSkeleton label={t.loading} />
          ) : (
            <div className={styles.featuredStage}>
              {lead ? (
                <article className={styles.featuredLead}>
                  <a
                    className={styles.featuredLeadMedia}
                    href={lead.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lead.media_url}
                      alt=""
                      loading="eager"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </a>
                  <div className={styles.featuredLeadCopy}>
                    <ProjectMeta
                      tag={localize(lead.tag, lang)}
                      board={lead.board}
                      date={formatProjectDate(lead.date)}
                    />
                    <h3 className="home-type-title">{localize(lead.title, lang)}</h3>
                    <p className={`home-type-body ${styles.featuredLeadExcerpt}`}>
                      {localize(lead.excerpt, lang)}
                    </p>
                    <p className={styles.featuredAuthor}>
                      {localize(lead.author, lang)}
                    </p>
                    <a
                      className="home-type-action home-filled-action home-primary-cta"
                      href={lead.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fff" }}
                    >
                      {t.viewProject}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              ) : null}

              <div className={styles.featuredGrid}>
                {grid.map((project) => {
                  const title = localize(project.title, lang);
                  return (
                    <a
                      key={`${project.url}-${title}`}
                      className={styles.featuredCard}
                      href={project.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className={styles.featuredCardMedia}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.media_url}
                          alt=""
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className={styles.featuredCardBody}>
                        <ProjectMeta
                          tag={localize(project.tag, lang)}
                          board={project.board}
                          date={formatProjectDate(project.date)}
                        />
                        <h3 className="home-type-subtitle">{title}</h3>
                        <p className={`home-type-body ${styles.featuredCardExcerpt}`}>
                          {localize(project.excerpt, lang)}
                        </p>
                        <span className={`home-type-action home-text-action ${styles.featuredCardAction}`}>
                          {t.viewProject}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </Reveal>

        <Reveal as="section" className={`${styles.browserSection} scroll-mt-24`} id="collection">
          <div className={styles.collectionIntro}>
            <div>
              <Glow as="h2" className="home-type-title">
                {t.collectionTitle}
              </Glow>
            </div>
            <p className="home-type-body">{t.collectionDek}</p>
          </div>
          <div className={styles.browserBody} style={{ height: embedHeight }}>
            <iframe
              className={styles.liveSite}
              src={withBase(HUB_EMBED)}
              title="OSHW XIAO Series 互动网页"
              loading="lazy"
              allow="fullscreen"
              scrolling="no"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </Reveal>
      </main>
    </div>
  );
}
