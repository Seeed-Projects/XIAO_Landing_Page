import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { BOARDS } from "../playground/pinout/data/index.js";
import {
  CHIP_FAMILIES,
  COURSE_GROUPS,
  DESIGN_KIT,
  PREVIEW_MODES,
  RESOURCE_KINDS,
  RESOURCE_PRODUCTS,
  SHARED_RESOURCES,
  bakeJobs,
  bakedThumb,
  bakedThumbPath,
  boardItems,
  courseCover,
  familyOf,
  fileCount,
  fuzzyScore,
} from "./resources-data.mjs";
import { resourceArtFor } from "./resource-art.mjs";

const root = fileURLToPath(new URL("../../..", import.meta.url));

test("every board has a photo, a chip family and a real pinout id", () => {
  const ids = new Set();
  for (const board of RESOURCE_PRODUCTS) {
    assert.ok(board.id && board.name && board.chip, board.id);
    assert.ok(!ids.has(board.id), `duplicate board ${board.id}`);
    ids.add(board.id);
    assert.ok(familyOf(board), board.id);
    assert.ok(board.wiki.startsWith("https://"), board.id);
    assert.ok(board.intro.en && board.intro.zh, board.id);
    assert.ok(board.badges.length > 0, board.id);
    assert.ok(fileCount(board) > 0, board.id);
    const photo = path.join(root, "public", board.image.replace(/^\//, ""));
    assert.ok(existsSync(photo), `${board.id} missing ${board.image}`);
    if (board.pinoutId) assert.ok(BOARDS[board.pinoutId], `${board.id} pinout ${board.pinoutId}`);
  }
  assert.equal(RESOURCE_PRODUCTS.find((board) => board.id === "s3cam").pinoutId, null);
  assert.equal(RESOURCE_PRODUCTS[0].id, "s3");
});

test("every chip on a board belongs to exactly one family", () => {
  const chips = new Set(RESOURCE_PRODUCTS.map((board) => board.chip));
  for (const chip of chips) {
    const hits = CHIP_FAMILIES.filter((family) => family.chips.includes(chip));
    assert.equal(hits.length, 1, chip);
  }
});

test("resource rows are complete, unique per board, and previewable only in known modes", () => {
  const sharedUrls = new Set(SHARED_RESOURCES.map((item) => item.url));
  assert.equal(sharedUrls.size, SHARED_RESOURCES.length);
  for (const item of SHARED_RESOURCES) {
    assert.ok(RESOURCE_KINDS.includes(item.kind), item.name);
    assert.equal(item.preview, null);
  }
  for (const board of RESOURCE_PRODUCTS) {
    const urls = [];
    for (const { item } of boardItems(board)) {
      assert.ok(item.name && item.url && item.format, `${board.id} ${item.name}`);
      assert.ok(RESOURCE_KINDS.includes(item.kind), `${item.name} kind ${item.kind}`);
      assert.ok(item.preview === null || PREVIEW_MODES.includes(item.preview), item.name);
      assert.ok(!sharedUrls.has(item.url), `${board.id} still lists a shared file`);
      urls.push(item.url);
    }
    assert.equal(new Set(urls).size, urls.length, `${board.id} duplicate url`);
  }
});

test("every resource kind has a reusable fallback visual", () => {
  const sources = new Set();
  for (const kind of RESOURCE_KINDS) {
    const art = resourceArtFor(kind);
    assert.ok(art.group && art.src, kind);
    assert.ok(existsSync(path.join(root, "public", art.src.replace(/^\//, ""))), `${kind} missing ${art.src}`);
    sources.add(art.src);
  }
  assert.equal(sources.size, 4);
});

test("bake jobs cover drawings and PDFs once per URL with unique file names", () => {
  const jobs = bakeJobs();
  assert.ok(jobs.length > 20);
  const urls = jobs.map((job) => job.url);
  assert.equal(new Set(urls).size, urls.length);
  const files = jobs.map((job) => job.file);
  assert.equal(new Set(files).size, files.length);
  assert.ok(jobs.some((job) => job.preview === "pdf" && job.file.endsWith(".webp")));
  assert.ok(jobs.some((job) => job.preview === "kicad" && job.file.endsWith(".svg")));

  const s3 = RESOURCE_PRODUCTS.find((board) => board.id === "s3");
  const drawing = boardItems(s3).find(({ item }) => item.format === "DXF").item;
  const path = bakedThumbPath(drawing);
  assert.match(path, /^\/res-thumb\/[a-z0-9-]+\.svg$/);
  assert.equal(bakedThumb(drawing, []), null);
  assert.equal(bakedThumb(drawing, [path]), path);
  const model = boardItems(s3).find(({ item }) => item.kind === "model3d").item;
  assert.equal(bakedThumb(model, []), "/res-thumb/s3-3d.png");
  const firmware = boardItems(s3).find(({ item }) => item.kind === "firmware").item;
  assert.equal(bakedThumbPath(firmware), null);
});

test("fuzzy search hits the expected files", () => {
  assert.ok(fuzzyScore("schem", "XIAO ESP32-S3 Schematic") > 0);
  assert.ok(fuzzyScore("kiad", "XIAO ESP32-S3 KiCad Project") > 0);
  assert.equal(fuzzyScore("zzzz", "Schematic"), 0);
});

test("courses keep a board tag, bilingual intro, one featured item and covers", () => {
  const items = COURSE_GROUPS.flatMap((group) => group.items);
  assert.ok(items.length >= 6);
  assert.equal(items.filter((item) => item.featured).length, 1);
  for (const item of items) {
    assert.ok(item.title && item.url && item.boards.length, item.title);
    assert.ok(item.intro.en && item.intro.zh, item.title);
    assert.ok(item.cover || item.coverFromPdf || item.video, `${item.title} has no cover plan`);
    if (item.cover) assert.match(item.cover, /^https:\/\//);
  }
  const pdfItem = items.find((item) => item.coverFromPdf);
  assert.equal(courseCover(pdfItem, []), null);
  const baked = bakedThumbPath({ url: pdfItem.url, preview: "pdf" });
  assert.equal(courseCover(pdfItem, [baked]), baked);
  assert.ok(bakeJobs().some((job) => job.url === pdfItem.url));
});

test("the design kit points at the two shared KiCad libraries", () => {
  assert.equal(DESIGN_KIT.files.length, 2);
  assert.deepEqual(DESIGN_KIT.files.map((file) => file.url), SHARED_RESOURCES.map((item) => item.url));
  for (const file of DESIGN_KIT.files) assert.ok(file.name.en && file.name.zh && file.detail.en && file.detail.zh);
});
