import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseBoardPrice, syncBoardPrices } from "./sync-board-prices.mjs";

const productHtml = (price = "4.99", currency = "USD") => `<script type="application/ld+json">${JSON.stringify({
  "@type": "Product",
  offers: { "@type": "Offer", price, priceCurrency: currency },
})}</script>`;

test("parser prefers JSON-LD Product offers over meta prices", () => {
  const html = `${productHtml()}
    <meta property="product:price:amount" content="9.99">
    <meta property="product:price:currency" content="EUR">`;
  assert.deepEqual(parseBoardPrice(html), { price: 4.99, currency: "USD" });
});

test("parser reads Product arrays, graphs and offer arrays", () => {
  const html = `<script type='application/ld+json'>[{
    "@graph": [
      {"@type": "Organization", "offers": {"price": "99", "priceCurrency": "USD"}},
      {"@type": ["Thing", "https://schema.org/Product"], "offers": [
        {"price": "invalid", "priceCurrency": "USD"},
        {"price": 0, "priceCurrency": "eur"}
      ]}
    ]
  }]</script>`;
  assert.deepEqual(parseBoardPrice(html), { price: 0, currency: "EUR" });
});

test("parser falls back to product meta tags after malformed JSON-LD", () => {
  const html = `<script type="application/ld+json">invalid JSON</script>
    <META CONTENT='6.50' PROPERTY='product:price:amount'>
    <meta content="USD" property="product:price:currency">`;
  assert.deepEqual(parseBoardPrice(html), { price: 6.5, currency: "USD" });
});

test("parser continues to later JSON-LD blocks after malformed data", () => {
  assert.deepEqual(parseBoardPrice(`<script type="application/ld+json">{</script>${productHtml()}`), { price: 4.99, currency: "USD" });
});

test("parser returns null for missing or invalid prices and currencies", () => {
  for (const html of [
    "<html><title>Store unavailable</title></html>",
    productHtml(null),
    productHtml(""),
    productHtml("-4.99"),
    productHtml("Infinity"),
    productHtml(true),
    productHtml("4.99", ""),
    productHtml("4.99", "US$"),
    '<meta property="product:price:amount" content="4.99">',
  ]) {
    assert.equal(parseBoardPrice(html), null);
  }
});

test("sync merges fresh prices and preserves saved prices on network, HTTP and parse failures", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
  const outputPath = join(directory, "prices.json");
  const previous = {
    syncedAt: "2026-01-01T00:00:00.000Z",
    boards: {
      Updated: { price: 8.99, currency: "USD" },
      Offline: { price: 5.99, currency: "USD" },
      Unavailable: { price: 7.99, currency: "EUR" },
      Missing: { price: 6.99, currency: "USD" },
    },
  };
  await writeFile(outputPath, JSON.stringify(previous));
  const boards = ["Updated", "Offline", "Unavailable", "Missing", "New"].map((name) => ({ name, link: `https://example.com/${name}` }));
  let active = 0;
  let peak = 0;
  const requested = [];
  const waits = [];
  const fetchImpl = async (url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    assert.match(options.headers["User-Agent"], /^Mozilla\/5\.0/);
    requested.push(url);
    active++;
    peak = Math.max(peak, active);
    await Promise.resolve();
    active--;
    if (url.endsWith("/Offline")) throw new Error("Network unavailable");
    if (url.endsWith("/Unavailable")) return { ok: false, status: 404 };
    return { ok: true, text: async () => url.endsWith("/Missing") ? "<html></html>" : productHtml() };
  };

  const result = await syncBoardPrices({ boards, outputPath, fetchImpl, sleepImpl: async (ms) => { waits.push(ms); } });
  const saved = JSON.parse(await readFile(outputPath, "utf8"));
  assert.deepEqual(saved, result.snapshot);
  assert.deepEqual(saved.boards.Updated, { price: 4.99, currency: "USD" });
  assert.deepEqual(saved.boards.New, { price: 4.99, currency: "USD" });
  for (const name of ["Offline", "Unavailable", "Missing"]) {
    assert.deepEqual(saved.boards[name], previous.boards[name]);
    assert.ok(result.warnings.some((warning) => warning.includes(name)));
  }
  assert.equal(result.warnings.length, 3);
  assert.equal(result.syncedCount, 2);
  assert.ok(Number.isFinite(Date.parse(saved.syncedAt)));
  assert.notEqual(saved.syncedAt, previous.syncedAt);
  assert.equal(peak, 1);
  assert.deepEqual(requested, boards.map((board) => board.link));
  assert.deepEqual(waits, [1500, 1500, 1500, 1500]);
});

test("sync retries HTTP 429 successfully and honors numeric Retry-After up to 30 seconds", async () => {
  for (const [retryAfter, expectedWait] of [["2", 2000], ["60", 30000], ["0", 0], ["1.5", 1500]]) {
    const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
    const outputPath = join(directory, "prices.json");
    const waits = [];
    let attempts = 0;
    const result = await syncBoardPrices({
      boards: [{ name: "Retried", link: "https://example.com/retried" }],
      outputPath,
      sleepImpl: async (ms) => { waits.push(ms); },
      fetchImpl: async () => {
        attempts++;
        return attempts === 1
          ? new Response("Rate limited", { status: 429, headers: { "Retry-After": retryAfter } })
          : new Response(productHtml());
      },
    });
    const saved = JSON.parse(await readFile(outputPath, "utf8"));
    assert.deepEqual(saved.boards.Retried, { price: 4.99, currency: "USD" });
    assert.equal(result.syncedCount, 1);
    assert.deepEqual(result.warnings, []);
    assert.equal(attempts, 2);
    assert.deepEqual(waits, [expectedWait]);
  }
});

test("sync keeps the previous price and one warning after three HTTP 429 retries", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
  const outputPath = join(directory, "prices.json");
  const previous = { syncedAt: "2026-01-01T00:00:00.000Z", boards: { Saved: { price: 8.99, currency: "USD" } } };
  await writeFile(outputPath, JSON.stringify(previous));
  const waits = [];
  let attempts = 0;
  const result = await syncBoardPrices({
    boards: [{ name: "Saved", link: "https://example.com/saved" }],
    outputPath,
    sleepImpl: async (ms) => { waits.push(ms); },
    fetchImpl: async () => {
      attempts++;
      return new Response("Rate limited", { status: 429 });
    },
  });
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), previous);
  assert.equal(result.syncedCount, 0);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Saved.*HTTP 429/);
  assert.equal(attempts, 4);
  assert.deepEqual(waits, [5000, 10000, 20000]);
});

test("sync retries HTTP 503 before the next board with configurable backoff and request delays", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
  const outputPath = join(directory, "prices.json");
  const boards = ["Retried", "Next"].map((name) => ({ name, link: `https://example.com/${name}` }));
  const events = [];
  const retryHeaders = [null, "Wed, 21 Oct 2026 07:28:00 GMT", "invalid"];
  let attempts = 0;
  const result = await syncBoardPrices({
    boards,
    outputPath,
    delayMs: 7,
    backoffMs: 10,
    sleepImpl: async (ms) => { events.push(ms); },
    fetchImpl: async (url) => {
      events.push(url);
      if (url === boards[0].link && attempts++ < retryHeaders.length) {
        const retryAfter = retryHeaders[attempts - 1];
        return new Response("Temporarily unavailable", {
          status: 503,
          headers: retryAfter ? { "Retry-After": retryAfter } : {},
        });
      }
      return new Response(productHtml());
    },
  });
  assert.deepEqual(events, [boards[0].link, 10, boards[0].link, 20, boards[0].link, 40, boards[0].link, 7, boards[1].link]);
  assert.equal(result.syncedCount, 2);
  assert.deepEqual(result.warnings, []);
  const saved = JSON.parse(await readFile(outputPath, "utf8"));
  assert.deepEqual(saved.boards.Retried, { price: 4.99, currency: "USD" });
  assert.deepEqual(saved.boards.Next, { price: 4.99, currency: "USD" });
});

test("sync keeps the complete snapshot and timestamp when every request fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
  const outputPath = join(directory, "prices.json");
  const previous = { syncedAt: "2026-01-01T00:00:00.000Z", boards: { Saved: { price: 4.99, currency: "USD" } } };
  await writeFile(outputPath, JSON.stringify(previous));
  const result = await syncBoardPrices({
    boards: [{ name: "Saved", link: "https://example.com/saved" }],
    outputPath,
    fetchImpl: async () => { throw new Error("Request timed out"); },
  });
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), previous);
  assert.equal(result.syncedCount, 0);
  assert.equal(result.warnings.length, 1);
});

test("first sync writes an empty snapshot when the store is unreachable", async () => {
  const directory = await mkdtemp(join(tmpdir(), "xiao-price-sync-"));
  const outputPath = join(directory, "prices.json");
  const result = await syncBoardPrices({
    boards: [{ name: "New", link: "https://example.com/new" }],
    outputPath,
    fetchImpl: async () => { throw new Error("Network unavailable"); },
  });
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), { syncedAt: null, boards: {} });
  assert.equal(result.warnings.length, 1);
});
