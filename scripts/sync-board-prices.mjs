import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { PRODUCT_CATALOG } from "../src/app/products/catalog.js";

export const GENERATED_PATH = new URL("../src/app/products/board-prices.json", import.meta.url);
const FETCH_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const MAX_RETRY_AFTER = 30000;
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const SELECTOR_BOARDS = PRODUCT_CATALOG.find((category) => category.id === "dev-boards")
  .subcategories.flatMap((subcategory) => subcategory.items.map((item) => ({ name: item.title, link: item.link })));

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([^\s=<>/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4]])
  );
}

function normalizePrice(amount, currency) {
  if (typeof amount !== "number" && (typeof amount !== "string" || !/^\d+(?:\.\d+)?$/.test(amount.trim()))) return null;
  const price = Number(amount);
  const code = typeof currency === "string" ? currency.trim().toUpperCase() : "";
  return Number.isFinite(price) && price >= 0 && /^[A-Z]{3}$/.test(code) ? { price, currency: code } : null;
}

// Read Product offers from JSON-LD objects, arrays and graphs.
// 从 JSON-LD 对象、数组和图结构中读取 Product 报价。
function productPrice(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const price = productPrice(item);
      if (price) return price;
    }
    return null;
  }
  if ([value["@type"]].flat().some((type) => typeof type === "string" && /(?:^|\/)Product$/.test(type))) {
    for (const offer of [value.offers].flat()) {
      const price = normalizePrice(offer?.price, offer?.priceCurrency);
      if (price) return price;
    }
  }
  return productPrice(value["@graph"]) ?? productPrice(value.mainEntity);
}

export function parseBoardPrice(html) {
  for (const [, tag, json] of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script\s*>/gi)) {
    if (attributes(tag).type?.toLowerCase().split(";")[0].trim() !== "application/ld+json") continue;
    try {
      const price = productPrice(JSON.parse(json));
      if (price) return price;
    } catch {
      continue;
    }
  }

  const meta = Object.fromEntries(
    [...html.matchAll(/<meta\b[^>]*>/gi)]
      .map(([tag]) => attributes(tag))
      .map((attrs) => [(attrs.property || attrs.name || "").toLowerCase(), attrs.content])
  );
  return normalizePrice(meta["product:price:amount"], meta["product:price:currency"]);
}

async function previousSnapshot(outputPath) {
  try {
    const snapshot = JSON.parse(await readFile(outputPath, "utf8"));
    return {
      syncedAt: snapshot.syncedAt ?? null,
      boards: snapshot.boards && typeof snapshot.boards === "object" && !Array.isArray(snapshot.boards) ? snapshot.boards : {},
    };
  } catch {
    return { syncedAt: null, boards: {} };
  }
}

function retryDelay(response, attempt, backoffMs) {
  const retryAfter = response.headers?.get("Retry-After")?.trim() ?? "";
  return /^\d+(?:\.\d+)?$/.test(retryAfter)
    ? Math.min(Number(retryAfter) * 1000, MAX_RETRY_AFTER)
    : backoffMs * 2 ** attempt;
}

export async function syncBoardPrices({
  boards = SELECTOR_BOARDS,
  outputPath = GENERATED_PATH,
  fetchImpl = fetch,
  sleepImpl = sleep,
  delayMs = 1500,
  backoffMs = 5000,
} = {}) {
  const previous = await previousSnapshot(outputPath);
  const snapshot = { syncedAt: previous.syncedAt, boards: { ...previous.boards } };
  const warnings = [];
  let syncedCount = 0;

  // Fetch boards in catalog order, retrying temporary store errors for each board.
  // 按目录顺序逐个抓取开发板价格，遇到临时商城错误时重试当前型号。
  for (const [index, board] of boards.entries()) {
    if (index > 0) await sleepImpl(delayMs);
    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const response = await fetchImpl(board.link, {
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
        if (!response.ok) {
          await response.body?.cancel();
          if ([429, 503].includes(response.status) && attempt < MAX_RETRIES) {
            await sleepImpl(retryDelay(response, attempt, backoffMs));
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        const price = parseBoardPrice(await response.text());
        if (!price) throw new Error("No valid product price and currency found.");
        snapshot.boards[board.name] = price;
        syncedCount++;
        break;
      }
    } catch (error) {
      warnings.push(`Price sync skipped ${board.name} (${board.link}): ${error.message}`);
    }
  }
  if (syncedCount) snapshot.syncedAt = new Date().toISOString();
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return { snapshot, warnings, syncedCount };
}

async function main() {
  const result = await syncBoardPrices();
  result.warnings.forEach((warning) => console.warn(warning));
  console.log(`Synced ${result.syncedCount} of ${SELECTOR_BOARDS.length} board prices; ${Object.keys(result.snapshot.boards).length} prices available.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => console.warn(`Board price sync skipped: ${error.message}`));
}
