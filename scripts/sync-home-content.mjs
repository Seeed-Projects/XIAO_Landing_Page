import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { parse } from "yaml";

export const PROJECT_LIMIT = 48;
export const NEWS_LIMIT = 12;
export const PROJECTS_URL = "https://raw.githubusercontent.com/Seeed-Studio/OSHW-XIAO-Series/main/projects.yaml";
export const BLOG_TAG_URL = "https://www.seeedstudio.com/blog/wp-json/wp/v2/tags?slug=seeed-studio-xiao";
export const GENERATED_PATH = new URL("../src/app/home-content.generated.json", import.meta.url);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function localized(value) {
  if (typeof value === "string") return { en: value.trim(), zh: value.trim() };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { en: "", zh: "" };
  const en = typeof value.en === "string" ? value.en.trim() : "";
  const zh = typeof value.zh === "string" ? value.zh.trim() : "";
  return { en: en || zh, zh: zh || en };
}

function plainText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function projectDate(project) {
  if (typeof project.release_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(project.release_date)) return project.release_date;
  if (Number.isInteger(project.year) && Number.isInteger(project.month)) return `${project.year}-${String(project.month).padStart(2, "0")}-01`;
  return "0000-00-00";
}

function canonicalUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    for (const name of [...url.searchParams.keys()]) {
      if (name.startsWith("utm_") || ["mc_cid", "mc_eid"].includes(name)) url.searchParams.delete(name);
    }
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
}

export function normalizeProjects(yamlText, limit = PROJECT_LIMIT) {
  const projects = parse(yamlText, { maxAliasCount: 50 })?.projects;
  if (!Array.isArray(projects)) throw new Error("The project feed does not contain a projects array.");

  const seen = new Set();
  return projects
    .map((project, sourceIndex) => ({ project, sourceIndex }))
    .filter(({ project }) => project.homepage !== "catalog" && project.homepage !== "review")
    .filter(({ project }) => typeof project.image === "string" && /^https:\/\//.test(project.image))
    .map(({ project, sourceIndex }) => {
      const url = canonicalUrl(project.link);
      return {
        title: localized(project.name),
        excerpt: localized(project.description),
        author: localized(project.author),
        tag: localized(project.category || project.board),
        board: typeof project.board === "string" ? project.board : "",
        url: typeof project.link === "string" ? project.link : "",
        media_url: project.image,
        date: projectDate(project),
        featured: project.homepage === "featured",
        sourceIndex,
        identity: url,
      };
    })
    .filter((project) => project.identity && project.url && project.title.en)
    .filter((project) => {
      if (seen.has(project.identity)) return false;
      seen.add(project.identity);
      return true;
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date) || a.sourceIndex - b.sourceIndex)
    .slice(0, limit)
    .map(({ identity, sourceIndex, ...project }) => project);
}

export function normalizeNews(posts, limit = NEWS_LIMIT) {
  if (!Array.isArray(posts)) throw new Error("The news feed is not an array.");
  const seen = new Set();
  return posts
    .map((post) => ({
      title: plainText(post?.title?.rendered),
      excerpt: plainText(post?.excerpt?.rendered),
      date: typeof post?.date === "string" ? post.date.slice(0, 10) : "",
      url: typeof post?.link === "string" ? post.link : "",
      media_url: post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "",
      source: plainText(post?._embedded?.author?.[0]?.name) || "Seeed Studio",
      tag: "Seeed Blog",
    }))
    .filter((post) => post.title && /^https:\/\//.test(post.url) && /^https:\/\//.test(post.media_url))
    .filter((post) => {
      const identity = canonicalUrl(post.url);
      if (!identity || seen.has(identity)) return false;
      seen.add(identity);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "XIAO-Landing-Content-Sync/1.0" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

export async function fetchProjectFeed(sourcePath = "") {
  const text = sourcePath ? await readFile(sourcePath, "utf8") : await fetchText(PROJECTS_URL);
  const projects = normalizeProjects(text);
  if (!projects.length) throw new Error("The project feed produced no homepage cards.");
  return projects;
}

export async function fetchNewsFeed(sourcePath = "") {
  let posts;
  if (sourcePath) {
    posts = JSON.parse(await readFile(sourcePath, "utf8"));
  } else {
    const tags = await fetchJson(BLOG_TAG_URL);
    const tagId = Array.isArray(tags) ? tags[0]?.id : null;
    if (!tagId) throw new Error("The Seeed Studio XIAO blog tag was not found.");
    posts = await fetchJson(`https://www.seeedstudio.com/blog/wp-json/wp/v2/posts?tags=${tagId}&per_page=${NEWS_LIMIT}&_embed=1`);
  }
  const news = normalizeNews(posts);
  if (!news.length) throw new Error("The news feed produced no homepage cards.");
  return news;
}

async function previousSnapshot(outputPath) {
  try {
    const snapshot = JSON.parse(await readFile(outputPath, "utf8"));
    return {
      projects: Array.isArray(snapshot.projects) ? snapshot.projects : [],
      news: Array.isArray(snapshot.news) ? snapshot.news : [],
    };
  } catch {
    return { projects: [], news: [] };
  }
}

export async function syncHomeContent({ projectSource = "", newsSource = "", outputPath = GENERATED_PATH } = {}) {
  const previous = await previousSnapshot(outputPath);
  const [projectResult, newsResult] = await Promise.allSettled([
    fetchProjectFeed(projectSource),
    fetchNewsFeed(newsSource),
  ]);
  const projects = projectResult.status === "fulfilled" ? projectResult.value : previous.projects;
  const news = newsResult.status === "fulfilled" ? newsResult.value : previous.news;

  if (!projects.length || !news.length) {
    const failures = [projectResult, newsResult]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason.message)
      .join(" ");
    throw new Error(`No safe content snapshot is available. ${failures}`.trim());
  }

  const snapshot = { projects, news };
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return {
    snapshot,
    warnings: [
      projectResult.status === "rejected" ? `Projects kept the previous snapshot: ${projectResult.reason.message}` : "",
      newsResult.status === "rejected" ? `News kept the previous snapshot: ${newsResult.reason.message}` : "",
    ].filter(Boolean),
  };
}

async function main() {
  const result = await syncHomeContent({
    projectSource: argument("--projects-file"),
    newsSource: argument("--news-file"),
    outputPath: argument("--output") || GENERATED_PATH,
  });
  console.log(`Synced ${result.snapshot.projects.length} projects and ${result.snapshot.news.length} news posts.`);
  result.warnings.forEach((warning) => console.warn(warning));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
