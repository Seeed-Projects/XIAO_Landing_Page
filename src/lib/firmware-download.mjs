const DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

function defaultWait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDownloadBytes(value) {
  if (!Number.isFinite(value)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDownloadFailure({ received, total, attempts, error }) {
  const reason = error?.message || "Unknown network error";
  const totalText = Number.isFinite(total) && total > 0 ? ` of ${formatDownloadBytes(total)}` : "";
  return `Download interrupted at ${formatDownloadBytes(received)}${totalText} after ${attempts} attempts: ${reason}`;
}

function parseContentRangeTotal(header) {
  const match = /\/(\d+)\s*$/.exec(header || "");
  return match ? Number(match[1]) : null;
}

async function readBodyBytes(response, onBytes) {
  if (!response.body?.getReader) {
    const buffer = new Uint8Array(await response.arrayBuffer());
    onBytes?.(buffer.length);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.length;
    onBytes?.(value.length);
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

// Runs one network attempt and retries it with a linear backoff.
// 执行一次网络请求，失败后按线性退避重试。
async function withRetry(task, { maxAttempts, retryDelayMs, wait, onRetry, getReceived, total }) {
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      return await task();
    } catch (error) {
      if (error?.noRetry) throw error;
      if (attempt >= maxAttempts) {
        throw new Error(formatDownloadFailure({
          received: getReceived(),
          total,
          attempts: attempt,
          error,
        }));
      }
      onRetry?.({ attempt, maxAttempts, received: getReceived(), total, error });
      await wait(retryDelayMs * attempt);
    }
  }
}

function httpError(url, response) {
  const error = new Error(`Failed to download ${url}: HTTP ${response.status}`);
  error.noRetry = response.status >= 400 && response.status < 500;
  return error;
}

function assertExpectedSize(bytes, size) {
  if (size && bytes.length !== size) {
    throw new Error(`Size mismatch: expected ${size}, received ${bytes.length}`);
  }
  return bytes;
}

/**
 * Download firmware in independently retried HTTP ranges, with a streamed fallback.
 * 通过可独立重试的 HTTP 分段下载固件；服务器不支持分段时切换为流式下载。
 */
export async function downloadFirmwareBinary(url, {
  size,
  chunkSize = DEFAULT_CHUNK_SIZE,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  fetchImpl = globalThis.fetch,
  wait = defaultWait,
  onProgress,
  onRetry,
} = {}) {
  let received = 0;
  let total = Number.isFinite(size) && size > 0 ? size : null;
  const retryOptions = {
    maxAttempts,
    retryDelayMs,
    wait,
    onRetry,
    getReceived: () => received,
  };
  const reportProgress = () => onProgress?.({ received, total });
  const fetchRange = (start, end) => fetchImpl(url, {
    cache: "no-store",
    headers: { Range: `bytes=${start}-${end}` },
  });

  const first = await withRetry(async () => {
    const response = await fetchRange(0, chunkSize - 1);
    if (!response.ok) throw httpError(url, response);
    if (response.status !== 206) return { response, chunk: null };
    return { response, chunk: await readBodyBytes(response) };
  }, { ...retryOptions, total });
  const firstResponse = first.response;

  if (firstResponse.status !== 206) {
    const contentLength = Number(firstResponse.headers.get("Content-Length"));
    if (!total && Number.isFinite(contentLength) && contentLength > 0) total = contentLength;
    const bytes = await withRetry(async () => {
      received = 0;
      const response = firstResponse.bodyUsed
        ? await fetchImpl(url, { cache: "no-store" })
        : firstResponse;
      if (!response.ok) throw httpError(url, response);
      return readBodyBytes(response, (count) => {
        received += count;
        reportProgress();
      });
    }, { ...retryOptions, total });
    return assertExpectedSize(bytes, size);
  }

  const rangeTotal = parseContentRangeTotal(firstResponse.headers.get("Content-Range"));
  if (size && rangeTotal && rangeTotal !== size) {
    throw new Error(`Size mismatch: expected ${size}, received ${rangeTotal}`);
  }
  if (!total && rangeTotal) total = rangeTotal;
  if (!total) throw new Error(`Failed to download ${url}: unknown content length`);

  const bytes = new Uint8Array(total);
  bytes.set(first.chunk.subarray(0, total), 0);
  received = Math.min(first.chunk.length, total);
  reportProgress();

  while (received < total) {
    const start = received;
    const end = Math.min(start + chunkSize, total) - 1;
    const chunk = await withRetry(async () => {
      const response = await fetchRange(start, end);
      if (!response.ok) throw httpError(url, response);
      return readBodyBytes(response);
    }, { ...retryOptions, total });

    if (chunk.length === 0) {
      throw new Error(`Failed to download ${url}: server returned an empty range at byte ${start}`);
    }
    bytes.set(chunk.subarray(0, total - start), start);
    received = Math.min(start + chunk.length, total);
    reportProgress();
  }

  return assertExpectedSize(bytes, size);
}
