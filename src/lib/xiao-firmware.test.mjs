import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { downloadFirmwareBinary } from "./firmware-download.mjs";
import { createCompatibleEspLoader } from "./xiao-esptool-compat.mjs";
import {
  createLocalFirmwareSelection,
  createXiaoStartupParts,
  getLocalFlashPartsIssue,
  inferLocalFlashAddress,
  isCompleteLocalPackage,
  parseFlashAddress,
} from "./xiao-local-firmware.mjs";
import { pulseTransportReset } from "./xiao-serial-reset.mjs";
import {
  buildFlashPlan,
  getCompatibleBuild,
  getPublishedFirmwareEntries,
  loadPublishedFirmwareCatalog,
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

test("catalog refresh bypasses stale browser metadata", async () => {
  let version = "1.0.0";
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    const body = url.endsWith("catalog.json")
      ? {
          schemaVersion: 1,
          firmwares: [
            {
              id: "xiao-esp32-s3-blink",
              group: "official",
              reviewStatus: "published",
              manifest: "/manifest.json",
            },
          ],
        }
      : fixtureManifest({ version });
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const first = await loadPublishedFirmwareCatalog({
    catalogUrl: "/catalog.json",
    fetchImpl,
  });
  version = "1.1.0";
  const refreshed = await loadPublishedFirmwareCatalog({
    catalogUrl: "/catalog.json",
    fetchImpl,
  });

  assert.equal(first[0].version, "1.0.0");
  assert.equal(refreshed[0].version, "1.1.0");
  assert.ok(requests.every(({ options }) => options.cache === "no-store"));
});

test("C5 and C6 use Espressif's corrected SPI register base", async () => {
  class FakeEspLoader {
    constructor(options) {
      this.options = options;
      this.chip = null;
    }

    async runSpiflashCommand() {
      return this.chip.SPI_REG_BASE;
    }
  }

  for (const chipName of ["ESP32-C5", "ESP32-C6"]) {
    const loader = createCompatibleEspLoader(FakeEspLoader, {});
    loader.chip = { CHIP_NAME: chipName, SPI_REG_BASE: 0x60002000 };
    assert.equal(await loader.runSpiflashCommand(), 0x60003000);
  }

  const c3Loader = createCompatibleEspLoader(FakeEspLoader, {});
  c3Loader.chip = { CHIP_NAME: "ESP32-C3", SPI_REG_BASE: 0x60002000 };
  assert.equal(await c3Loader.runSpiflashCommand(), 0x60002000);
});

test("post-flash reset drives RTS low and high before monitoring", async () => {
  const events = [];
  const transport = {
    device: {
      async setSignals(value) {
        events.push(["signals", value]);
      },
    },
  };

  await pulseTransportReset(transport, async (duration) => {
    events.push(["wait", duration]);
  });

  assert.deepEqual(events, [
    ["signals", { dataTerminalReady: false, requestToSend: false }],
    ["wait", 50],
    ["signals", { dataTerminalReady: false, requestToSend: true }],
    ["wait", 100],
    ["signals", { dataTerminalReady: false, requestToSend: false }],
  ]);
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

test("local firmware keeps each BIN and its selected address", () => {
  const parts = [
    { name: "bootloader.bin", address: "0x0", data: Uint8Array.from([1, 2]) },
    { name: "partitions.bin", address: "0x8000", data: Uint8Array.from([3, 4, 5]) },
    { name: "application.bin", address: "0x10000", data: Uint8Array.from([6, 7, 8, 9]) },
  ];
  const selection = createLocalFirmwareSelection(parts);

  assert.deepEqual(selection.fileArray.map(({ address }) => address), [0, 0x8000, 0x10000]);
  assert.deepEqual(selection.build.parts.map(({ path, offset }) => [path, offset]), [
    ["bootloader.bin", 0],
    ["partitions.bin", 0x8000],
    ["application.bin", 0x10000],
  ]);
  assert.equal(selection.totalSize, 9);
  assert.equal(selection.build.erasePolicy, "application-only");
});

test("local BIN addresses are suggested without asking for an image type", () => {
  assert.equal(inferLocalFlashAddress({ name: "bootloader.bin", size: 32000 }), "0x0");
  assert.equal(inferLocalFlashAddress({ name: "partitions.bin", size: 4096 }), "0x8000");
  assert.equal(inferLocalFlashAddress({ name: "boot_app0.bin", size: 8192 }), "0xe000");
  assert.equal(inferLocalFlashAddress({ name: "application.bin", size: 280000 }), "0x10000");
  assert.equal(inferLocalFlashAddress({ name: "large-application.bin", size: 4194304 }), "0x10000");
  assert.equal(inferLocalFlashAddress({ name: "firmware-merged.bin", size: 4194304 }), "0x0");
  const mergedData = new Uint8Array(0x10001);
  mergedData[0x8000] = 0xaa;
  mergedData[0x8001] = 0x50;
  mergedData[0x10000] = 0xe9;
  assert.equal(inferLocalFlashAddress({ name: "firmware.bin", size: mergedData.length, data: mergedData }), "0x0");
});

test("startup files plus an application form a complete erasable package", () => {
  const parts = [
    { address: "0x0", data: new Uint8Array(0x8000) },
    { address: "0x8000", data: new Uint8Array(0x1000) },
    { address: "0xe000", data: new Uint8Array(0x2000) },
    { address: "0x10000", data: new Uint8Array(4) },
  ];
  assert.equal(isCompleteLocalPackage(parts), true);
  assert.equal(createLocalFirmwareSelection(parts).build.erasePolicy, "full");
});

test("XIAO startup import extracts fixed boot regions from a verified merged image", () => {
  const source = new Uint8Array(0x10000);
  source[0] = 0xe9;
  source[0x8000] = 0xaa;
  source[0xe000] = 0x01;
  const parts = createXiaoStartupParts(source, "s3");

  assert.deepEqual(parts.map((part) => [part.name, part.address, part.size]), [
    ["s3-bootloader.bin", "0x0", 0x8000],
    ["s3-partitions.bin", "0x8000", 0x1000],
    ["s3-boot_app0.bin", "0xe000", 0x2000],
  ]);
  assert.equal(parts[0].data[0], 0xe9);
  assert.equal(parts[1].data[0], 0xaa);
  assert.equal(parts[2].data[0], 0x01);
});

test("custom local firmware rejects invalid and overlapping address ranges", () => {
  assert.equal(parseFlashAddress("0x10000"), 0x10000);
  assert.equal(parseFlashAddress("not-an-address"), null);
  assert.equal(getLocalFlashPartsIssue([
    { address: "0x1000", data: new Uint8Array(0x200) },
    { address: "0x1100", data: new Uint8Array(0x200) },
  ]), "overlap");
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
