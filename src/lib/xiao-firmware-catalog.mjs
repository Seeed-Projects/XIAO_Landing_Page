const FIRMWARE_GROUPS = new Set(["official", "partner", "community"]);
const REVIEW_STATUSES = new Set(["draft", "approved", "published"]);
const ERASE_POLICIES = new Set(["application-only", "full"]);

function invariant(condition, message) {
  if (!condition) throw new Error(`Invalid firmware manifest: ${message}`);
}

function isLocalizedText(value) {
  return Boolean(value && typeof value === "object" && typeof value.en === "string");
}

export function getPublishedFirmwareEntries(catalog) {
  invariant(catalog?.schemaVersion === 1, "unsupported catalog schema");
  invariant(Array.isArray(catalog.firmwares), "firmwares must be an array");
  return catalog.firmwares.filter((entry) => (
    entry
    && typeof entry.id === "string"
    && FIRMWARE_GROUPS.has(entry.group)
    && REVIEW_STATUSES.has(entry.reviewStatus)
    && entry.reviewStatus === "published"
    && typeof entry.manifest === "string"
  ));
}

/**
 * Validate the public manifest contract shared by official and future community firmware.
 * 校验官方固件与未来社区固件共用的公开清单格式。
 */
export function validateFirmwareManifest(manifest) {
  invariant(manifest?.schemaVersion === 1, "unsupported schema");
  invariant(typeof manifest.id === "string" && manifest.id, "id is required");
  invariant(FIRMWARE_GROUPS.has(manifest.group), "unknown firmware group");
  invariant(REVIEW_STATUSES.has(manifest.reviewStatus), "unknown review status");
  invariant(typeof manifest.version === "string" && manifest.version, "version is required");
  invariant(isLocalizedText(manifest.name), "localized name is required");
  invariant(isLocalizedText(manifest.summary), "localized summary is required");
  invariant(Array.isArray(manifest.builds) && manifest.builds.length > 0, "builds are required");

  for (const build of manifest.builds) {
    invariant(typeof build.boardId === "string" && build.boardId, "boardId is required");
    invariant(typeof build.chipFamily === "string" && build.chipFamily, "chipFamily is required");
    invariant(typeof build.completeImage === "boolean", "completeImage must be boolean");
    invariant(ERASE_POLICIES.has(build.erasePolicy), "unknown erase policy");
    invariant(Array.isArray(build.parts) && build.parts.length > 0, "firmware parts are required");
    if (build.erasePolicy === "full") {
      invariant(build.completeImage, "full erase requires a complete firmware package");
    }
    for (const part of build.parts) {
      invariant(typeof part.path === "string" && part.path, "part path is required");
      invariant(Number.isInteger(part.offset) && part.offset >= 0, "part offset must be a positive integer");
      invariant(Number.isInteger(part.size) && part.size > 0, "part size must be a positive integer");
      invariant(/^[0-9a-f]{64}$/i.test(part.sha256), "part SHA-256 is required");
      invariant(/^[0-9a-f]{32}$/i.test(part.md5), "part MD5 is required");
    }
  }
  return manifest;
}

export function getCompatibleBuild(manifest, chipFamily) {
  return manifest?.builds?.find((build) => build.chipFamily === chipFamily) ?? null;
}

export function canEraseWholeFlash(build) {
  return Boolean(build?.completeImage && build?.erasePolicy === "full");
}

export function buildFlashPlan(build, { eraseAll = false } = {}) {
  invariant(build && Array.isArray(build.parts), "compatible build is required");
  if (eraseAll && !canEraseWholeFlash(build)) {
    throw new Error("Whole-flash erase requires a complete firmware package");
  }
  return {
    eraseAll,
    flashSize: build.flashSize || "keep",
    flashMode: build.flashMode || "dio",
    flashFreq: build.flashFreq || "80m",
    parts: build.parts.map((part) => ({ ...part })),
  };
}

export async function sha256Hex(bytes) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
  return response.json();
}

/**
 * Load only published entries; future Registry data can use the same provider contract.
 * 只加载已发布条目；未来 Registry 数据可直接复用同一提供器接口。
 */
export async function loadPublishedFirmwareCatalog({
  catalogUrl,
  fetchImpl = globalThis.fetch,
  resolveUrl = (value) => value,
} = {}) {
  const catalog = await fetchJson(catalogUrl, fetchImpl);
  const entries = getPublishedFirmwareEntries(catalog);
  return Promise.all(entries.map(async (entry) => {
    const manifestUrl = resolveUrl(entry.manifest);
    const manifest = validateFirmwareManifest(await fetchJson(manifestUrl, fetchImpl));
    invariant(manifest.id === entry.id, `catalog id ${entry.id} does not match manifest id ${manifest.id}`);
    invariant(manifest.group === entry.group, `catalog group does not match ${entry.id}`);
    invariant(manifest.reviewStatus === entry.reviewStatus, `catalog status does not match ${entry.id}`);
    return { ...manifest, manifestUrl };
  }));
}
