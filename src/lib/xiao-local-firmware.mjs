function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Parse a hexadecimal flash address such as 0x10000 or 10000.
 * 解析十六进制烧录地址，例如 0x10000 或 10000。
 */
export function parseFlashAddress(input) {
  const text = String(input ?? "").trim();
  if (!/^(0x)?[0-9a-f]+$/i.test(text)) return null;
  const value = Number.parseInt(text.replace(/^0x/i, ""), 16);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Detect the standard merged ESP32 layout from its partition and app signatures.
 * 通过分区表与应用镜像特征识别标准 ESP32 完整镜像布局。
 */
export function isCompleteFirmwareBinary(data) {
  return data?.length > 0x10000
    && data[0x8000] === 0xaa
    && data[0x8001] === 0x50
    && data[0x10000] === 0xe9;
}

/**
 * Suggest the standard ESP32 flash address from a BIN filename and layout.
 * 根据 BIN 文件名和内部布局给出 ESP32 的标准烧录地址建议。
 */
export function inferLocalFlashAddress({ name = "", data } = {}) {
  const normalized = name.toLowerCase();
  if (/boot[_-]?app0/.test(normalized)) return "0xe000";
  if (/partition/.test(normalized)) return "0x8000";
  if (/bootloader/.test(normalized)) return "0x0";
  if (/(merged|factory|complete|full[-_ ]?flash)/.test(normalized) || isCompleteFirmwareBinary(data)) return "0x0";
  return "0x10000";
}

/**
 * Extract the startup regions used by the standard Arduino ESP32 flash layout.
 * 从标准 Arduino ESP32 完整镜像中提取启动区域。
 */
export function createXiaoStartupParts(data, boardId) {
  invariant(data instanceof Uint8Array && data.length >= 0x10000, "Official merged firmware is missing startup regions");
  return [
    { name: `${boardId}-bootloader.bin`, address: "0x0", start: 0x0, end: 0x8000 },
    { name: `${boardId}-partitions.bin`, address: "0x8000", start: 0x8000, end: 0x9000 },
    { name: `${boardId}-boot_app0.bin`, address: "0xe000", start: 0xe000, end: 0x10000 },
  ].map((part, index) => {
    const bytes = data.slice(part.start, part.end);
    return {
      id: `xiao-startup-${boardId}-${index}`,
      name: part.name,
      size: bytes.length,
      data: bytes,
      address: part.address,
      source: "xiao-startup",
      completeImage: false,
    };
  });
}

/**
 * Report whether local firmware parts have invalid or overlapping ranges.
 * 检查本地固件分段的地址是否无效或互相重叠。
 */
export function getLocalFlashPartsIssue(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return "empty";
  const ranges = [];

  for (const part of parts) {
    const address = parseFlashAddress(part.address);
    const size = part?.data?.length ?? part?.size;
    if (address === null) return "address";
    if (!Number.isInteger(size) || size <= 0) return "file";
    ranges.push({ start: address, end: address + size });
  }

  ranges.sort((left, right) => left.start - right.start);
  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index].start < ranges[index - 1].end) return "overlap";
  }

  return null;
}

/**
 * Determine whether a local package contains everything needed after a full erase.
 * 判断本地固件组合是否包含整片擦除后启动所需的完整内容。
 */
export function isCompleteLocalPackage(parts) {
  if (getLocalFlashPartsIssue(parts) !== null) return false;
  if (parts.length === 1) {
    return parseFlashAddress(parts[0].address) === 0 && Boolean(parts[0].completeImage);
  }
  const addresses = new Set(parts.map((part) => parseFlashAddress(part.address)));
  return [0, 0x8000, 0xe000, 0x10000].every((address) => addresses.has(address));
}

/**
 * Convert local files into the build and file arrays consumed by esptool-js.
 * 把本地文件转换为 esptool-js 使用的烧录计划与文件数组。
 */
export function createLocalFirmwareSelection(parts) {
  const issue = getLocalFlashPartsIssue(parts);
  invariant(issue === null, `Invalid local firmware parts: ${issue}`);

  const normalized = parts.map((part) => ({
    ...part,
    offset: parseFlashAddress(part.address),
  }));
  const completeImage = isCompleteLocalPackage(parts);

  return {
    build: {
      completeImage,
      erasePolicy: completeImage ? "full" : "application-only",
      flashSize: "keep",
      flashMode: "dio",
      flashFreq: "80m",
      parts: normalized.map((part) => ({
        path: part.name,
        offset: part.offset,
        size: part.data.length,
      })),
    },
    fileArray: normalized.map((part) => ({ data: part.data, address: part.offset })),
    totalSize: normalized.reduce((sum, part) => sum + part.data.length, 0),
  };
}
