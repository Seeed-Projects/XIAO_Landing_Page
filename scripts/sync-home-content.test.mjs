import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { normalizeNews, normalizeProjects, syncHomeContent } from "./sync-home-content.mjs";

const project = (overrides = {}) => ({
  name: { en: "Pocket weather station", zh: "Pocket weather station CN" },
  description: { en: "A compact environmental dashboard made with XIAO.", zh: "A compact XIAO dashboard CN." },
  board: "XIAO ESP32-C6",
  category: { en: "Smart Home", zh: "Smart Home CN" },
  year: 2026,
  month: 8,
  author: { en: "Community Maker", zh: "Community Maker CN" },
  link: "https://example.com/weather",
  image: "https://example.com/weather.jpg",
  ...overrides,
});

const newsPost = (overrides = {}) => ({
  title: { rendered: "A &amp; B <strong>XIAO</strong> project" },
  excerpt: { rendered: "<p>A practical build for the community.</p>" },
  date: "2026-08-20T10:00:00",
  link: "https://www.seeedstudio.com/blog/example/",
  _embedded: {
    author: [{ name: "Seeed Author" }],
    "wp:featuredmedia": [{ source_url: "https://www.seeedstudio.com/blog/example.jpg" }],
  },
  ...overrides,
});

test("project normalization applies editorial states, ordering, deduplication, and limits", () => {
  const input = { projects: [
    project({ link: "https://example.com/catalog", homepage: "catalog" }),
    project({ link: "https://example.com/review", homepage: "review" }),
    project({ link: "https://example.com/old", year: 2025 }),
    project({ link: "https://example.com/featured", homepage: "featured", year: 2024 }),
    project({ link: "https://example.com/weather?utm_source=test" }),
  ] };
  const result = normalizeProjects(JSON.stringify(input), 3);
  assert.equal(result.length, 3);
  assert.equal(result[0].url, "https://example.com/featured");
  assert.equal(result[1].url, "https://example.com/weather?utm_source=test");
  assert.equal(result[2].url, "https://example.com/old");
});

test("news normalization strips markup and keeps only cards with usable images", () => {
  const result = normalizeNews([newsPost(), newsPost({ link: "https://www.seeedstudio.com/blog/no-image/", _embedded: {} })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "A & B XIAO project");
  assert.equal(result[0].excerpt, "A practical build for the community.");
});

test("sync preserves the previous half of the snapshot when one source fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-home-sync-"));
  const outputPath = join(directory, "snapshot.json");
  const projectsPath = join(directory, "projects.yaml");
  await writeFile(outputPath, `${JSON.stringify({ projects: [{ title: "Saved project" }], news: [{ title: "Saved news" }] })}\n`);
  await writeFile(projectsPath, `projects:\n  - ${JSON.stringify(project())}\n`);

  const result = await syncHomeContent({ projectSource: projectsPath, newsSource: join(directory, "missing.json"), outputPath });
  const saved = JSON.parse(await readFile(outputPath, "utf8"));
  assert.equal(result.warnings.length, 1);
  assert.equal(saved.projects[0].title.en, "Pocket weather station");
  assert.equal(saved.news[0].title, "Saved news");
});
