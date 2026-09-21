import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { downloadFirmwareBinary } from "./firmware-download.mjs";
import {
  buildFlashPlan,
  getCompatibleBuild,
  getPublishedFirmwareEntries,
  sha256Hex,
  validateFirmwareManifest,
} from "./xiao-firmware-catalog.mjs";

const ROOT = process.cwd();

function fixtureManifest(overrides = {}) {
  return {
    schemaVersion: 1,
    id: "xiao-esp32-s3-blink",
    group: "official",
    reviewStatus: "published",
    version: "1.0.0",
    name: { en: "Blink Demo", zh: "Blink Demo" },
    summary: { en: "Test firmware", zh: "Test firmware" },
    builds: [
      {
        boardId: "s3",
        chipFamily: "ESP32-S3",
        completeImage: false,
        erasePolicy: "application-only",
        flashSize: "keep",
        flashMode: "dio",
        flashFreq: "80m",
        parts: [
          {
            path: "xiao-esp32-s3-blink.bin",
            offset: 0x10000,
            size: 4,
            sha256: "00".repeat(32),
            md5: "00".repeat(16),
          },
        ],
      },
    ],
    ...overrides,
  };
}

test("catalog exposes only approved published firmware", () => {
  const entries = getPublishedFirmwareEntries({
    schemaVersion: 1,
    firmwares: [
      { id: "official", group: "official", reviewStatus: "published", manifest: "/official.json" },
      { id: "draft", group: "community", reviewStatus: "draft", manifest: "/draft.json" },
      { id: "review", group: "partner", reviewStatus: "approved", manifest: "/review.json" },
    ],
  });

  assert.deepEqual(entries.map((entry) => entry.id), ["official"]);
});

test("application-only firmware rejects whole-flash erase", () => {
  const manifest = validateFirmwareManifest(fixtureManifest());
  const build = getCompatibleBuild(manifest, "ESP32-S3");

  assert.throws(
    () => buildFlashPlan(build, { eraseAll: true }),
    /complete firmware package/i,
  );
  assert.equal(buildFlashPlan(build, { eraseAll: false }).eraseAll, false);
});

test("complete firmware packages can opt into whole-flash erase", () => {
  const manifest = validateFirmwareManifest(fixtureManifest({
    builds: [
      {
        ...fixtureManifest().builds[0],
        completeImage: true,
        erasePolicy: "full",
        parts: [
          {
            ...fixtureManifest().builds[0].parts[0],
            path: "merged.bin",
            offset: 0,
          },
        ],
      },
    ],
  }));
  const plan = buildFlashPlan(getCompatibleBuild(manifest, "ESP32-S3"), { eraseAll: true });

  assert.equal(plan.eraseAll, true);
  assert.equal(plan.parts[0].offset, 0);
});

test("firmware downloader validates the expected size", async () => {
  const bytes = Uint8Array.from([1, 2, 3, 4]);
  const fetchImpl = async () => new Response(bytes, {
    status: 200,
    headers: { "Content-Length": String(bytes.length) },
  });

  const result = await downloadFirmwareBinary("https://example.test/firmware.bin", {
    size: bytes.length,
    fetchImpl,
  });
  assert.deepEqual(result, bytes);

  await assert.rejects(
    downloadFirmwareBinary("https://example.test/firmware.bin", { size: 5, fetchImpl }),
    /size mismatch/i,
  );
});

test("firmware downloader retries a temporary server failure", async () => {
  const bytes = Uint8Array.from([5, 6, 7, 8]);
  let requests = 0;
  const fetchImpl = async () => {
    requests += 1;
    if (requests === 1) return new Response("temporary", { status: 503 });
    return new Response(bytes, {
      status: 200,
      headers: { "Content-Length": String(bytes.length) },
    });
  };

  const result = await downloadFirmwareBinary("https://example.test/firmware.bin", {
    size: bytes.length,
    fetchImpl,
    wait: async () => {},
  });

  assert.deepEqual(result, bytes);
  assert.equal(requests, 2);
});

test("sha256 helper reports matching browser-download hashes", async () => {
  const bytes = Uint8Array.from([1, 2, 3, 4]);
  assert.equal(await sha256Hex(bytes), createHash("sha256").update(bytes).digest("hex"));
});

test("published manifests match the firmware binaries stored in public", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "public/firmware/catalog.json"), "utf8"));
  const entries = getPublishedFirmwareEntries(catalog);

  assert.equal(entries.length, 4);
  for (const entry of entries) {
    const manifestPath = path.join(ROOT, "public", entry.manifest.replace(/^\//, ""));
    const manifest = validateFirmwareManifest(JSON.parse(await readFile(manifestPath, "utf8")));
    const manifestDir = path.dirname(manifestPath);

    for (const build of manifest.builds) {
      assert.equal(build.completeImage, true);
      assert.equal(build.erasePolicy, "full");
      assert.equal(build.flashSize, "keep");
      assert.equal(build.flashMode, "keep");
      assert.equal(build.flashFreq, "keep");
      assert.equal(build.parts.length, 1);
      for (const part of build.parts) {
        assert.equal(part.offset, 0);
        assert.match(part.path, /-merged\.bin$/);
        const bytes = await readFile(path.join(manifestDir, part.path));
        assert.equal(bytes.length, part.size);
        assert.equal(createHash("sha256").update(bytes).digest("hex"), part.sha256);
        assert.equal(createHash("md5").update(bytes).digest("hex"), part.md5);
      }
    }
  }
});
