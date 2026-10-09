/**
 * Download resource files and write static thumbnails for the /res/ page.
 * 下载资源文件，为 /res/ 页面生成静态缩略图。
 *
 * DXF, KiCad and XLSX sources become SVG through the in-repo parsers.
 * PDF first pages become WebP through pdf.js running in a local Chrome.
 * The list of written files is saved to src/app/res/res-thumbs.generated.mjs.
 *
 * Run: npm run bake:res-thumbs
 * Optional: CHROME_PATH=/path/to/chrome to pick the browser used for PDF pages.
 * Optional: BAKE_ONLY=pdf or BAKE_ONLY=drawings to refresh one kind of thumbnail.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { strFromU8, unzipSync } from "fflate";
import { bakeJobs } from "../src/app/res/resources-data.mjs";
import { renderDxfSvg } from "../src/lib/parseDxf.js";
import { renderPcbSvg } from "../src/lib/parseKicadPcb.js";
import { parseXlsx, renderSheetSvg } from "../src/lib/parseXlsx.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const thumbDir = path.join(root, "public", "res-thumb");
const manifestFile = path.join(root, "src", "app", "res", "res-thumbs.generated.mjs");
const pdfjsDir = path.join(root, "node_modules", "pdfjs-dist", "build");
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

mkdirSync(thumbDir, { recursive: true });

const jobs = bakeJobs();
const only = process.env.BAKE_ONLY;
const drawingJobs = jobs.filter((job) => job.preview !== "pdf" && only !== "pdf");
const pdfJobs = jobs.filter((job) => job.preview === "pdf" && only !== "drawings");
const written = new Set();
const failures = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

function largestEntry(archive, pattern) {
  let best = null;
  let size = -1;
  for (const [name, data] of Object.entries(archive)) {
    if (!pattern.test(name) || data.length <= size) continue;
    best = data;
    size = data.length;
  }
  if (!best) throw new Error(`no file matching ${pattern}`);
  return best;
}

function renderDrawing(job, bytes) {
  if (job.preview === "dxf") return renderDxfSvg(new TextDecoder().decode(bytes));
  if (job.preview === "xlsx") return renderSheetSvg(parseXlsx(bytes, { maxRows: 12 }).sheets[0]);
  const archive = unzipSync(bytes);
  if (job.preview === "dxf-zip") return renderDxfSvg(strFromU8(largestEntry(archive, /\.dxf$/i)));
  return renderPcbSvg(strFromU8(largestEntry(archive, /\.kicad_pcb$/i)));
}

function save(job, content) {
  writeFileSync(path.join(root, job.file.replace(/^\//, "public/")), content);
  written.add(job.file);
  console.log(`ok ${job.file}`);
}

async function runDrawings() {
  let cursor = 0;
  async function worker() {
    while (cursor < drawingJobs.length) {
      const job = drawingJobs[cursor];
      cursor += 1;
      try {
        const svg = renderDrawing(job, await download(job.url));
        if (!svg?.startsWith("<svg")) throw new Error("renderer returned no svg");
        save(job, svg);
      } catch (error) {
        failures.push(`${job.boardId} / ${job.name}: ${error.message}`);
        console.error(`fail ${job.boardId} / ${job.name}: ${error.message}`);
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
}

/**
 * Serve pdf.js and a render page so Chrome can draw PDF page one onto a canvas.
 * 起一个本地服务提供 pdf.js 和渲染页，让 Chrome 把 PDF 首页画到画布上。
 */
const renderPage = `<!doctype html><meta charset="utf-8"><script type="module">
import * as pdfjs from "/pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
window.renderPdf = async (url) => {
  const pdf = await pdfjs.getDocument({ url, disableRange: true, disableStream: true, disableAutoFetch: true }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: 720 / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  await pdf.cleanup?.();
  return canvas.toDataURL("image/webp", 0.82);
};
window.renderReady = true;
</script>`;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      const file = request.url === "/" ? null : path.join(pdfjsDir, path.basename(request.url));
      if (!file) {
        response.writeHead(200, { "content-type": "text/html" });
        response.end(renderPage);
        return;
      }
      if (!existsSync(file)) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.writeHead(200, { "content-type": "text/javascript" });
      response.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function openChrome(pageUrl) {
  const chromePath = chromeCandidates.find(existsSync);
  if (!chromePath) return null;
  const port = 9222 + Math.floor(Math.random() * 500);
  const child = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(root, ".trash", "bake-chrome-profile")}`,
    "--no-first-run",
    "about:blank",
  ], { stdio: "ignore" });
  for (let i = 0; i < 40; i += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break;
    } catch {}
    await sleep(250);
  }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: "PUT" })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 0;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });
  await new Promise((resolve) => socket.addEventListener("open", resolve));
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  };
  await send("Runtime.enable");
  for (let i = 0; i < 40 && !(await evaluate("window.renderReady === true")); i += 1) await sleep(250);
  return {
    evaluate,
    close() {
      socket.close();
      child.kill();
    },
  };
}

async function runPdfs() {
  if (!pdfJobs.length) return;
  const server = await startServer();
  const pageUrl = `http://127.0.0.1:${server.address().port}/`;
  const chrome = await openChrome(pageUrl);
  if (!chrome) {
    console.log("skip PDF pages: no Chrome found (set CHROME_PATH to enable)");
    server.close();
    return;
  }
  for (const job of pdfJobs) {
    try {
      const dataUrl = await Promise.race([
        chrome.evaluate(`renderPdf(${JSON.stringify(job.url)})`),
        sleep(45000).then(() => { throw new Error("timeout"); }),
      ]);
      if (!dataUrl?.startsWith("data:image/webp")) throw new Error("no image");
      save(job, Buffer.from(dataUrl.split(",")[1], "base64"));
    } catch (error) {
      console.log(`skip ${job.boardId} / ${job.name}: ${error.message.split("\n")[0]}`);
    }
  }
  chrome.close();
  server.close();
}

await runDrawings();
await runPdfs();

const present = readdirSync(thumbDir)
  .filter((name) => /\.(svg|webp)$/i.test(name))
  .map((name) => `/res-thumb/${name}`)
  .filter((file) => jobs.some((job) => job.file === file))
  .sort();

writeFileSync(
  manifestFile,
  [
    "// Generated by scripts/bake-res-thumbs.mjs. Lists thumbnails present in public/res-thumb.",
    "// 由 scripts/bake-res-thumbs.mjs 生成，记录 public/res-thumb 里已有的缩略图。",
    `export const BAKED_THUMBS = ${JSON.stringify(present, null, 2)};`,
    "",
  ].join("\n"),
);

console.log(`\n${written.size} thumbnails written this run, ${present.length} listed in the manifest`);
if (failures.length) {
  console.error(`${failures.length} drawing thumbnails failed`);
  process.exitCode = 1;
}
