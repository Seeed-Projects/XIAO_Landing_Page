"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import styles from "./esp-flasher.module.css";

/* 真实固件列表 —— 全部 4 款可选 ESP 板型均提供 Blink 示例
   （由 PlatformIO + arduino-esp32 3.3.7 编译，闪烁板载/外接 LED 并经串口 115200 输出日志）。
   固件源在项目根 firmware/<板型全名>/ 维护（xiao-esp32-s3/c3/c5/c6，各含 blink.ino 与编译好的 .bin）；
   服务副本在 public/firmware/<板型全名>/，前端 fetch 后用 esptool-js 经 Web Serial 烧到 0x10000。 */
const FIRMWARES = [
  {
    id: "s3-blink",
    boards: ["s3"],
    name: { en: "Blink Demo", zh: "Blink 闪烁示例" },
    desc: { en: "Blinks the user LED (GPIO21) + prints over serial", zh: "用户 LED（GPIO21）闪烁 + 串口输出" },
    ver: "v1.0",
    url: "/firmware/xiao-esp32-s3/xiao-esp32-s3-blink.bin",
    address: 0x10000,
  },
  {
    id: "c3-blink",
    boards: ["c3"],
    name: { en: "Blink Demo", zh: "Blink 闪烁示例" },
    desc: { en: "Blinks D0 (GPIO2) — connect an external LED + prints over serial", zh: "D0（GPIO2）闪烁 —— 需外接 LED + 串口输出" },
    ver: "v1.0",
    url: "/firmware/xiao-esp32-c3/xiao-esp32-c3-blink.bin",
    address: 0x10000,
  },
  {
    id: "c6-blink",
    boards: ["c6"],
    name: { en: "Blink Demo", zh: "Blink 闪烁示例" },
    desc: { en: "Blinks the onboard user LED (GPIO15) + prints over serial", zh: "板载用户 LED（GPIO15）闪烁 + 串口输出" },
    ver: "v1.0",
    url: "/firmware/xiao-esp32-c6/xiao-esp32-c6-blink.bin",
    address: 0x10000,
  },
  {
    id: "c5-blink",
    boards: ["c5"],
    name: { en: "Blink Demo", zh: "Blink 闪烁示例" },
    desc: { en: "Blinks the onboard user LED (GPIO27, yellow) + prints over serial", zh: "板载用户 LED（GPIO27，黄色）闪烁 + 串口输出" },
    ver: "v1.0",
    url: "/firmware/xiao-esp32-c5/xiao-esp32-c5-blink.bin",
    address: 0x10000,
  },
];

/* 可选板型（ESP 系列）；4 款均有 Blink 示例固件 */
const ESP_BOARDS = [
  { id: "s3", name: "XIAO ESP32-S3", chip: "ESP32-S3", hint: "Dual Core · Wi-Fi + BLE" },
  { id: "c3", name: "XIAO ESP32-C3", chip: "ESP32-C3", hint: "RISC-V · Wi-Fi 4 + BLE 5" },
  { id: "c6", name: "XIAO ESP32-C6", chip: "ESP32-C6", hint: "RISC-V · Wi-Fi 6 + Thread" },
  { id: "c5", name: "XIAO ESP32-C5", chip: "ESP32-C5", hint: "RISC-V · Wi-Fi 6 + BLE 5" },
];

const HA_FLASHER_URL = "https://seeed-projects.github.io/Seeed-Homeassistant-Discovery/flasher/";
const BAUD_RATES = ["9600", "74880", "115200", "230400", "460800", "921600"];
const CUSTOM_ID = "custom";
const DEFAULT_ADDRESS = "0x10000";
const MAX_LOG_LINES = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pad = (value, size = 2) => String(value).padStart(size, "0");

/**
 * Format a timestamp for the log gutter as HH:MM:SS.mmm.
 * 把时间格式化成日志左侧的 时:分:秒.毫秒 时间戳。
 */
function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

/** Format a timestamp as HH:MM:SS for the narrow log gutter. 日志栏内显示的紧凑时间戳。 */
function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Parse a flash address written as hex ("0x10000" or "10000").
 * 解析十六进制烧录地址，非法输入返回 null。
 * @returns {number|null}
 */
function parseAddress(input) {
  const text = String(input ?? "").trim();
  if (!/^(0x)?[0-9a-f]+$/i.test(text)) return null;
  const value = Number.parseInt(text.replace(/^0x/i, ""), 16);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

const formatKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

export function ESPFlasher() {
  const { lang } = useLang();
  const zh = lang === "zh";

  // SSR 与首屏一致 false，挂载后再探测 Web Serial，避免 hydration mismatch
  const [supported, setSupported] = useState(false);
  // idle 未授权端口 / connecting 连接中 / monitoring 监视设备输出 / flashing 烧录中 / paused 已连接但暂停读取
  const [phase, setPhase] = useState("idle");
  const [device, setDevice] = useState(null);
  const [boardId, setBoardId] = useState("s3");
  const [firmwareId, setFirmwareId] = useState("s3-blink");
  const [localFile, setLocalFile] = useState(null);
  const [localAddress, setLocalAddress] = useState(DEFAULT_ADDRESS);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(null);
  const [flashErase, setFlashErase] = useState(false);
  const [error, setError] = useState("");
  const [baud, setBaud] = useState("115200");
  const [autoScroll, setAutoScroll] = useState(true);
  const [logLines, setLogLines] = useState([]);
  const [copied, setCopied] = useState(false);

  const transportRef = useRef(null);   // esptool-js Transport，包装 Web Serial 端口
  const loaderRef = useRef(null);      // ESPLoader 实例，只在烧录/识别芯片期间挂载
  const monitorClosedRef = useRef(true);
  const monitorSessionRef = useRef(0);
  const fileInputRef = useRef(null);
  const bodyRef = useRef(null);
  const linesRef = useRef([]);         // 已成行的日志
  const tailRef = useRef(null);        // 尚未遇到换行的半行
  const seqRef = useRef(0);
  const flushRef = useRef(null);

  const board = ESP_BOARDS.find((item) => item.id === boardId) ?? ESP_BOARDS[0];
  const boardFirmwares = useMemo(() => FIRMWARES.filter((item) => item.boards.includes(boardId)), [boardId]);
  const builtIn = boardFirmwares.find((item) => item.id === firmwareId) ?? null;
  const usingLocal = firmwareId === CUSTOM_ID && Boolean(localFile);
  const connected = phase !== "idle";
  const busy = phase === "connecting" || phase === "flashing";
  const localAddressValue = parseAddress(localAddress);

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  const T = {
    eyebrow: zh ? "XIAO PLAYGROUND · ESP32 网页烧录" : "XIAO PLAYGROUND · ESP32 WEB FLASHER",
    title: zh ? "XIAO ESP32 系列网页烧录器" : "XIAO ESP32 Series Web Flasher",
    lead: zh
      ? "面向 XIAO ESP32 系列：连接开发板、选择固件并写入，串口监视器全程记录过程与设备输出。"
      : "For the XIAO ESP32 series: connect a board, choose firmware and write it, with a serial monitor recording the flash and everything the board prints.",
    envWarn: zh ? "当前浏览器不支持 Web Serial" : "Web Serial unavailable",
    envHint: zh
      ? "请使用桌面版 Chrome 或 Edge，并通过 HTTPS 或 localhost 打开本页。"
      : "Use desktop Chrome or Edge and open this page over HTTPS or localhost.",
    haLead: zh
      ? "要把 XIAO 用作 Home Assistant 设备？请到 Home Assistant 固件烧录页操作。"
      : "Want to use a XIAO as a Home Assistant device? Flash it on the Home Assistant flasher.",
    haAction: zh ? "打开 Home Assistant 烧录页" : "Open Home Assistant flasher",

    step1: zh ? "连接设备" : "Connect the board",
    step1Hint: zh
      ? "用数据线连接 XIAO 并在浏览器弹窗中选择串口，随后自动识别芯片并开始监听。"
      : "Connect the XIAO with a data cable and pick its port in the browser dialog. The chip is detected automatically and the monitor starts.",
    step1TroubleTitle: zh ? "连接不上？" : "Trouble connecting?",
    step1Trouble: zh
      ? "1. 换一条支持数据传输的 USB-C 线（部分线材只能充电）。\n2. 按住板子上的 BOOT 键再插入 USB，或按住 BOOT 点一下 RESET，进入下载模式后重试。\n3. macOS 与 Windows 都无需额外驱动；若仍看不到串口，换一个 USB 口或直连电脑而不经扩展坞。"
      : "1. Try another data-capable USB-C cable — some cables only carry power.\n2. Hold BOOT while plugging in USB, or hold BOOT and tap RESET, to enter download mode and retry.\n3. No driver is needed on macOS or Windows; if no port shows up, try another USB port or plug straight into the computer instead of a hub.",
    connect: zh ? "连接设备" : "Connect",
    connecting: zh ? "连接中…" : "Connecting…",
    disconnect: zh ? "断开连接" : "Disconnect",
    factChip: zh ? "芯片" : "Chip",
    factMac: "MAC",
    factPort: zh ? "串口" : "Port",

    step2: zh ? "选择开发板" : "Choose your board",
    step2Hint: zh
      ? "选择手上的型号；连接后会按识别到的芯片自动选中。"
      : "Pick the model you are holding; connecting selects the detected chip for you.",

    step3: zh ? "选择固件" : "Choose firmware",
    step3Hint: zh
      ? "使用官方编译的示例固件，或上传自己的 .bin 并填写地址。"
      : "Use an official sample image, or upload your own .bin with its address.",
    localTitle: zh ? "本地固件 .bin" : "Local .bin file",
    localHint: zh ? "把 .bin 拖到这里，或点击选择文件" : "Drop a .bin here, or click to browse",
    localPick: zh ? "选择文件" : "Browse",
    localReplace: zh ? "更换文件" : "Replace",
    localRemove: zh ? "移除" : "Remove",
    localAddress: zh ? "烧录地址" : "Flash address",
    localAddressHint: zh
      ? "Arduino / PlatformIO 导出的应用固件填 0x10000；含 bootloader 的整合固件填 0x0。"
      : "Application images from Arduino or PlatformIO go to 0x10000; merged images that include the bootloader go to 0x0.",
    localAddressBad: zh ? "地址需为十六进制，例如 0x10000" : "Address must be hex, for example 0x10000",

    step4: zh ? "开始烧录" : "Flash the firmware",
    step4Hint: zh
      ? "直接写入，或先擦除整片 Flash 再写入；完成后设备会自动复位。"
      : "Write the image, or erase the chip first and then write. The board resets when it finishes.",
    flash: zh ? "烧录固件" : "Flash firmware",
    eraseFlash: zh ? "擦除并烧录" : "Erase & flash",
    flashing: zh ? "烧录中…" : "Flashing…",
    erasing: zh ? "擦除并烧录中…" : "Erasing & flashing…",
    writing: zh ? "正在写入" : "Writing",
    eraseWriting: zh ? "正在擦除并写入" : "Erasing and writing",
    needConnect: zh ? "请先完成第 1 步连接设备" : "Complete step 1 and connect a board first",
    needFirmware: zh ? "请先选择固件" : "Choose a firmware first",
    success: zh ? "烧录完成，设备已复位并运行新固件。" : "Flash complete — the board reset into the new firmware.",

    monitorTitle: zh ? "串口监视器" : "Serial Monitor",
    monitorLead: zh
      ? "烧录日志与设备输出都带时间戳记录在这里，复制或下载后即可发给技术支持。"
      : "Flash logs and device output are timestamped here — copy or download them to share with support.",
    phaseIdle: zh ? "未连接" : "Not connected",
    phaseConnecting: zh ? "连接中" : "Connecting",
    phaseMonitoring: zh ? "监听中" : "Listening",
    phaseFlashing: zh ? "烧录中" : "Flashing",
    phasePaused: zh ? "已暂停" : "Paused",
    baud: zh ? "波特率" : "Baud",
    reopening: zh ? "设备复位后串口重新枚举，正在重新打开…" : "The port re-enumerated after reset — reopening…",
    startMonitor: zh ? "开始监听" : "Start listening",
    pauseMonitor: zh ? "暂停监听" : "Pause",
    copy: zh ? "复制" : "Copy",
    copied: zh ? "已复制" : "Copied",
    download: zh ? "下载" : "Download",
    clear: zh ? "清空" : "Clear",
    autoScroll: zh ? "自动滚动" : "Auto-scroll",
    lineCount: zh ? "行" : "lines",
    emptyTitle: zh ? "等待设备输出" : "Waiting for device output",
    emptyBody: zh
      ? "连接设备后，这里会依次记录芯片识别、固件下载与写入进度、复位结果，以及设备通过串口打印的运行日志。"
      : "Once a board is connected this panel records chip detection, download and write progress, the reset result, and everything the board prints over serial.",
  };

  /* 日志：按行存储，60ms 节流后整体刷新到 state，避免高频串口输出压垮渲染 */
  const scheduleFlush = useCallback(() => {
    if (flushRef.current) return;
    flushRef.current = setTimeout(() => {
      flushRef.current = null;
      setLogLines(tailRef.current ? [...linesRef.current, tailRef.current] : [...linesRef.current]);
    }, 60);
  }, []);

  const appendLog = useCallback((kind, chunk) => {
    const text = String(chunk ?? "").replace(/\r/g, "");
    if (!text) return;
    if (tailRef.current && tailRef.current.kind !== kind) {
      linesRef.current.push(tailRef.current);
      tailRef.current = null;
    }
    const segments = text.split("\n");
    let carry = tailRef.current;
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      if (carry) {
        carry = { ...carry, text: carry.text + segment };
        if (!isLast) {
          linesRef.current.push(carry);
          carry = null;
        }
        return;
      }
      if (!isLast) {
        if (segment.trim()) linesRef.current.push({ id: ++seqRef.current, at: new Date(), kind, text: segment });
        return;
      }
      if (segment) carry = { id: ++seqRef.current, at: new Date(), kind, text: segment };
    });
    tailRef.current = carry;
    if (linesRef.current.length > MAX_LOG_LINES) linesRef.current = linesRef.current.slice(-MAX_LOG_LINES);
    scheduleFlush();
  }, [scheduleFlush]);

  const clearLog = useCallback(() => {
    linesRef.current = [];
    tailRef.current = null;
    setLogLines([]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSupported(typeof navigator !== "undefined" && "serial" in navigator);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (flushRef.current) clearTimeout(flushRef.current);
    monitorClosedRef.current = true;
    const transport = transportRef.current;
    if (transport) transport.disconnect().catch(() => {});
  }, []);

  useEffect(() => {
    if (!autoScroll || !bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [logLines, autoScroll]);

  /* esptool-js 的 terminal 接口：clean / write / writeLine */
  const makeTerminal = useCallback(() => ({
    clean() {},
    write(text) { appendLog("flash", text); },
    writeLine(text) { appendLog("flash", `${text}\n`); },
  }), [appendLog]);

  /**
   * Attach an ESPLoader to the transport and detect the chip.
   * 挂载 ESPLoader 并识别芯片；返回芯片描述字符串。
   */
  const attachLoader = useCallback(async () => {
    const { ESPLoader } = await import("esptool-js");
    const loader = new ESPLoader({
      transport: transportRef.current,
      baudrate: 460800,
      romBaudrate: 115200,
      terminal: makeTerminal(),
    });
    const description = await loader.main();
    loaderRef.current = loader;
    const mac = await loader.chip.readMac(loader);
    const info = { chip: loader.chip.CHIP_NAME, description, mac };
    setDevice(info);
    return info;
  }, [makeTerminal]);

  /** Release the loader so the raw serial stream is free. 释放烧录器，让串口回到普通读取模式。 */
  const detachLoader = useCallback(async () => {
    try { await transportRef.current?.disconnect(); } catch {}
    try { await transportRef.current?.waitForUnlock(200); } catch {}
    loaderRef.current = null;
  }, []);

  /**
   * Open the port at the monitor baud rate, re-resolving the device once
   * when a USB-CDC board re-enumerates after reset.
   * 以监视波特率打开串口；USB-CDC 板复位后端口会重新枚举，此处重试一次并换用同一 VID/PID 的新端口。
   */
  const openPortForMonitor = useCallback(async (baudRate) => {
    const transport = transportRef.current;
    if (!transport) throw new Error("No serial port");
    try {
      await transport.connect(baudRate);
      return;
    } catch (firstError) {
      appendLog("system", `${T.reopening} (${firstError?.message || firstError})\n`);
      await sleep(1200);
      const wanted = transport.device?.getInfo?.() ?? {};
      const ports = await navigator.serial.getPorts();
      const match = ports.find((port) => {
        const info = port.getInfo?.() ?? {};
        return info.usbVendorId === wanted.usbVendorId && info.usbProductId === wanted.usbProductId;
      });
      if (match) transport.updateDevice(match);
      await transport.connect(baudRate);
    }
  }, [appendLog, T.reopening]);

  const stopMonitor = useCallback(async () => {
    monitorClosedRef.current = true;
    monitorSessionRef.current += 1;
    try { await transportRef.current?.disconnect(); } catch {}
  }, []);

  /** Stream raw serial output into the log until stopped. 持续把串口原始输出写入日志。 */
  const startMonitor = useCallback(async (baudRate) => {
    const transport = transportRef.current;
    if (!transport) return;
    await stopMonitor();
    await sleep(120);
    try {
      await openPortForMonitor(baudRate);
    } catch (e) {
      setPhase("paused");
      appendLog("error", `${e?.message || e}\n`);
      return;
    }
    const session = monitorSessionRef.current;
    monitorClosedRef.current = false;
    setPhase("monitoring");
    appendLog("system", `— ${T.monitorTitle} @ ${baudRate} baud —\n`);
    const decoder = new TextDecoder();
    await transport.rawRead(
      (data) => appendLog("device", decoder.decode(data, { stream: true })),
      () => monitorClosedRef.current || monitorSessionRef.current !== session,
    );
    if (monitorSessionRef.current !== session) return;
    monitorClosedRef.current = true;
    setPhase((current) => (current === "monitoring" ? "paused" : current));
  }, [appendLog, openPortForMonitor, stopMonitor, T.monitorTitle]);

  async function handleConnect() {
    if (connected) {
      await handleDisconnect();
      return;
    }
    setError("");
    setPhase("connecting");
    try {
      const port = await navigator.serial.requestPort();
      const { Transport } = await import("esptool-js");
      const transport = new Transport(port, false);
      transport.setDeviceLostCallback(() => {
        monitorClosedRef.current = true;
        loaderRef.current = null;
        transportRef.current = null;
        setPhase("idle");
        setDevice(null);
        appendLog("error", `${zh ? "设备已断开" : "Device disconnected"}\n`);
      });
      transportRef.current = transport;
      appendLog("system", `${zh ? "正在识别芯片…" : "Detecting chip…"}\n`);
      const info = await attachLoader();
      const matched = ESP_BOARDS.find((item) => item.chip === info.chip);
      if (matched) {
        setBoardId(matched.id);
        setFirmwareId((current) => (current === CUSTOM_ID ? current : FIRMWARES.find((fw) => fw.boards.includes(matched.id))?.id ?? current));
      }
      appendLog("success", `${zh ? "已连接" : "Connected"} · ${info.description} · MAC ${info.mac}\n`);
      await loaderRef.current.after("hard_reset");
      await detachLoader();
      await startMonitor(Number(baud));
    } catch (e) {
      const message = e?.message || String(e);
      // 用户在浏览器串口弹窗点了取消：不算错误，静默回到未连接状态
      const cancelled = e?.name === "NotFoundError";
      if (!cancelled) {
        setError(message);
        appendLog("error", `${message}\n`);
      }
      await detachLoader();
      transportRef.current = null;
      setDevice(null);
      setPhase("idle");
    }
  }

  async function handleDisconnect() {
    await stopMonitor();
    await detachLoader();
    transportRef.current = null;
    setDevice(null);
    setPhase("idle");
    setProgress(null);
    appendLog("system", `${zh ? "已断开连接" : "Disconnected"}\n`);
  }

  /** Resolve the bytes to write for the current selection. 取出当前选择要写入的固件数据。 */
  async function resolveImage() {
    if (firmwareId === CUSTOM_ID) {
      if (!localFile) throw new Error(T.needFirmware);
      if (localAddressValue === null) throw new Error(T.localAddressBad);
      return { data: localFile.data, address: localAddressValue, label: localFile.name };
    }
    if (!builtIn) throw new Error(T.needFirmware);
    appendLog("system", `${zh ? "下载固件" : "Downloading"} ${builtIn.url}\n`);
    const response = await fetch(withBase(builtIn.url));
    if (!response.ok) throw new Error(`${zh ? "固件下载失败" : "Firmware download failed"} (HTTP ${response.status})`);
    return {
      data: new Uint8Array(await response.arrayBuffer()),
      address: builtIn.address,
      label: `${pick(builtIn.name)} ${builtIn.ver}`,
    };
  }

  async function handleFlash(eraseAll) {
    if (!connected || busy) return;
    setError("");
    setFlashErase(eraseAll);
    setPhase("flashing");
    setProgress({ percent: 0, written: 0, total: 0 });
    try {
      const image = await resolveImage();
      await stopMonitor();
      await detachLoader();
      await sleep(120);
      await attachLoader();
      appendLog(
        "system",
        `${eraseAll ? (zh ? "先擦除整片 Flash，再写入" : "Erasing the whole flash, then writing") : (zh ? "写入" : "Writing")} ${image.label} · ${formatKB(image.data.length)} → 0x${image.address.toString(16)}\n`,
      );
      const startedAt = performance.now();
      await loaderRef.current.writeFlash({
        fileArray: [{ data: image.data, address: image.address }],
        flashSize: "keep",
        eraseAll,
        compress: true,
        reportProgress: (_index, written, total) => {
          setProgress({ percent: total ? Math.round((written / total) * 100) : 0, written, total });
        },
      });
      await loaderRef.current.after("hard_reset");
      const seconds = (performance.now() - startedAt) / 1000;
      const kbps = Math.round(image.data.length / seconds / 1024);
      setProgress({ percent: 100, written: image.data.length, total: image.data.length });
      appendLog("success", `${T.success} ${seconds.toFixed(1)}s · ${kbps} KB/s\n`);
      await detachLoader();
      await startMonitor(Number(baud));
    } catch (e) {
      const message = e?.message || String(e);
      setError(message);
      appendLog("error", `${message}\n`);
      setPhase(transportRef.current ? "paused" : "idle");
    }
  }

  async function toggleMonitor() {
    if (busy) return;
    if (phase === "monitoring") {
      await stopMonitor();
      setPhase("paused");
      return;
    }
    if (!transportRef.current) return;
    await startMonitor(Number(baud));
  }

  async function handleBaudChange(value) {
    setBaud(value);
    if (phase === "monitoring") {
      await stopMonitor();
      await sleep(120);
      await startMonitor(Number(value));
    }
  }

  function selectBoard(nextId) {
    setBoardId(nextId);
    if (firmwareId === CUSTOM_ID) return;
    setFirmwareId(FIRMWARES.find((fw) => fw.boards.includes(nextId))?.id ?? "");
  }

  async function acceptFile(file) {
    if (!file) return;
    const data = new Uint8Array(await file.arrayBuffer());
    setLocalFile({ name: file.name, size: file.size, data });
    setFirmwareId(CUSTOM_ID);
    setError("");
    appendLog("system", `${zh ? "已载入本地固件" : "Loaded local firmware"} ${file.name} · ${formatKB(data.length)}\n`);
  }

  /** Build a support-ready transcript with environment details. 生成带环境信息的日志文本，便于发给技术支持。 */
  function buildTranscript() {
    const head = [
      "XIAO ESP32 Series Web Flasher log",
      `generated: ${new Date().toISOString()}`,
      `browser: ${typeof navigator === "undefined" ? "unknown" : navigator.userAgent}`,
      `selected board: ${board.name}`,
      `detected chip: ${device ? `${device.description} (MAC ${device.mac})` : "—"}`,
      `firmware: ${usingLocal ? `${localFile.name} @ ${localAddress}` : builtIn ? `${pick(builtIn.name)} ${builtIn.ver} (${builtIn.url})` : "—"}`,
      `monitor baud: ${baud}`,
      "----",
    ].join("\n");
    const body = logLines.map((line) => `[${formatTime(line.at)}] ${line.text}`).join("\n");
    return `${head}\n${body}\n`;
  }

  async function copyLog() {
    try {
      await navigator.clipboard.writeText(buildTranscript());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  function downloadLog() {
    const blob = new Blob([buildTranscript()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `xiao-flasher-${Date.now()}.log`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const phaseLabel = {
    idle: T.phaseIdle,
    connecting: T.phaseConnecting,
    monitoring: T.phaseMonitoring,
    flashing: T.phaseFlashing,
    paused: T.phasePaused,
  }[phase];

  const canFlash = connected && !busy && (usingLocal ? localAddressValue !== null : Boolean(builtIn));

  return (
    <div className={styles.shell} id="esp-flasher">
      <header className={styles.topbar}>
        <div className={styles.topbarCopy}>
          <span className={styles.eyebrow}>{T.eyebrow}</span>
          <h1 className={`${styles.pageTitle} home-type-hero-title`}>{T.title}</h1>
          <p className={`${styles.pageLead} home-type-body`}>{T.lead}</p>
        </div>
        {!supported && (
          <span className={`${styles.envBadge} ${styles.envWarn}`}>{T.envWarn}</span>
        )}
      </header>

      <aside className={styles.haBanner} aria-label={T.haAction}>
        <p className={`${styles.haLead} home-type-body`}>{T.haLead}</p>
        <a className={`${styles.haLink} home-type-action`} href={HA_FLASHER_URL} target="_blank" rel="noopener noreferrer">
          {T.haAction} ↗
        </a>
      </aside>

      <div className={styles.workbench}>
        <section className={styles.steps} aria-label={T.title}>
          <article className={styles.step} data-done={connected ? "1" : "0"}>
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>01</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step1}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step1Hint}</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <button
                type="button"
                className={`${styles.primaryBtn} ${connected ? styles.dangerBtn : ""} home-type-action`}
                onClick={handleConnect}
                disabled={!supported || busy}
              >
                {phase === "connecting" ? T.connecting : connected ? T.disconnect : T.connect}
              </button>
              {!supported && <p className={`${styles.note} ${styles.noteWarn}`}>{T.envHint}</p>}
              {device && (
                <dl className={styles.facts}>
                  <div><dt>{T.factChip}</dt><dd>{device.description}</dd></div>
                  <div><dt>{T.factMac}</dt><dd>{device.mac}</dd></div>
                  <div><dt>{T.factPort}</dt><dd>{phaseLabel}</dd></div>
                </dl>
              )}
              <details className={styles.trouble}>
                <summary>{T.step1TroubleTitle}</summary>
                <p>{T.step1Trouble}</p>
              </details>
            </div>
          </article>

          <article className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>02</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step2}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step2Hint}</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <div className={styles.boardGrid} role="radiogroup" aria-label={T.step2}>
                {ESP_BOARDS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={item.id === boardId}
                    className={styles.boardTile}
                    data-on={item.id === boardId ? "1" : "0"}
                    onClick={() => selectBoard(item.id)}
                    disabled={busy}
                  >
                    <strong>{item.name}</strong>
                    <small>{item.hint}</small>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>03</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step3}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step3Hint}</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <div className={styles.fwList}>
                {boardFirmwares.map((fw) => (
                  <label key={fw.id} className={styles.fwItem} data-on={fw.id === firmwareId ? "1" : "0"}>
                    <input
                      type="radio"
                      name="xiao-firmware"
                      checked={fw.id === firmwareId}
                      onChange={() => setFirmwareId(fw.id)}
                      disabled={busy}
                    />
                    <span className={styles.fwCopy}>
                      <strong>{pick(fw.name)}<em>{fw.ver}</em></strong>
                      <small>{pick(fw.desc)}</small>
                    </span>
                    <code>0x{fw.address.toString(16)}</code>
                  </label>
                ))}
              </div>

              <div
                className={styles.dropZone}
                data-on={firmwareId === CUSTOM_ID ? "1" : "0"}
                data-drag={dragOver ? "1" : "0"}
                onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  acceptFile(event.dataTransfer.files?.[0]);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".bin"
                  className={styles.fileInput}
                  onChange={(event) => acceptFile(event.target.files?.[0])}
                />
                <div className={styles.dropHead}>
                  <label className={styles.dropCopy}>
                    <input
                      type="radio"
                      name="xiao-firmware"
                      checked={firmwareId === CUSTOM_ID}
                      onChange={() => setFirmwareId(CUSTOM_ID)}
                      disabled={!localFile || busy}
                    />
                    <span>
                      <strong>{T.localTitle}</strong>
                      <small>{localFile ? `${localFile.name} · ${formatKB(localFile.size)}` : T.localHint}</small>
                    </span>
                  </label>
                  <button type="button" className={styles.ghostBtn} onClick={() => fileInputRef.current?.click()} disabled={busy}>
                    {localFile ? T.localReplace : T.localPick}
                  </button>
                </div>
                {localFile && (
                  <div className={styles.addressRow}>
                    <label className={styles.addressField}>
                      <span>{T.localAddress}</span>
                      <input
                        value={localAddress}
                        onChange={(event) => setLocalAddress(event.target.value)}
                        spellCheck={false}
                        disabled={busy}
                        data-bad={localAddressValue === null ? "1" : "0"}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => {
                        setLocalFile(null);
                        if (firmwareId === CUSTOM_ID) setFirmwareId(boardFirmwares[0]?.id ?? "");
                      }}
                      disabled={busy}
                    >
                      {T.localRemove}
                    </button>
                  </div>
                )}
                {localFile && (
                  <p className={styles.dropHint} data-bad={localAddressValue === null ? "1" : "0"}>
                    {localAddressValue === null ? T.localAddressBad : T.localAddressHint}
                  </p>
                )}
              </div>
            </div>
          </article>

          <article className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>04</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step4}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step4Hint}</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              <div className={styles.flashActions}>
                <button
                  type="button"
                  className={`${styles.primaryBtn} home-type-action`}
                  onClick={() => handleFlash(false)}
                  disabled={!canFlash}
                  title={connected ? undefined : T.needConnect}
                >
                  {phase === "flashing" && !flashErase ? T.flashing : T.flash}
                </button>
                <button
                  type="button"
                  className={`${styles.secondaryBtn} home-type-action`}
                  onClick={() => handleFlash(true)}
                  disabled={!canFlash}
                  title={connected ? undefined : T.needConnect}
                >
                  {phase === "flashing" && flashErase ? T.erasing : T.eraseFlash}
                </button>
              </div>
              {progress && (
                <div className={styles.progress}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                  </div>
                  <div className={styles.progressMeta}>
                    <span>{phase === "flashing" ? (flashErase ? T.eraseWriting : T.writing) : T.success}</span>
                    <span>{progress.percent}%{progress.total ? ` · ${formatKB(progress.written)} / ${formatKB(progress.total)}` : ""}</span>
                  </div>
                </div>
              )}
              {error && <p className={`${styles.note} ${styles.noteError}`}>{error}</p>}
            </div>
          </article>
        </section>

        <section className={styles.console} aria-label={T.monitorTitle}>
          <header className={styles.consoleHead}>
            <div className={styles.consoleTitle}>
              <span className={styles.statusDot} data-phase={phase} />
              <strong>{T.monitorTitle}</strong>
              <span className={styles.phaseTag}>{phaseLabel}</span>
              <label className={styles.baudField}>
                <span>{T.baud}</span>
                <select value={baud} onChange={(event) => handleBaudChange(event.target.value)} disabled={busy}>
                  {BAUD_RATES.map((rate) => <option key={rate} value={rate}>{rate}</option>)}
                </select>
              </label>
            </div>
            <div className={styles.consoleTools}>
              <button type="button" className={styles.toolBtn} onClick={toggleMonitor} disabled={!connected || busy}>
                {phase === "monitoring" ? T.pauseMonitor : T.startMonitor}
              </button>
              <button type="button" className={styles.toolBtn} onClick={copyLog} disabled={!logLines.length}>
                {copied ? T.copied : T.copy}
              </button>
              <button type="button" className={styles.toolBtn} onClick={downloadLog} disabled={!logLines.length}>
                {T.download}
              </button>
              <button type="button" className={styles.toolBtn} onClick={clearLog} disabled={!logLines.length}>
                {T.clear}
              </button>
            </div>
          </header>
          <p className={styles.consoleLead}>{T.monitorLead}</p>
          <div className={styles.consoleBody} ref={bodyRef}>
            {logLines.length ? (
              logLines.map((line) => (
                <div key={line.id} className={styles.logLine} data-kind={line.kind}>
                  <time title={formatTime(line.at)}>{formatClock(line.at)}</time>
                  <span>{line.text}</span>
                </div>
              ))
            ) : (
              <div className={styles.consoleEmpty}>
                <strong>{T.emptyTitle}</strong>
                <p>{T.emptyBody}</p>
              </div>
            )}
          </div>
          <footer className={styles.consoleFoot}>
            <span className={styles.lineCount}>
              {logLines.length} {zh ? T.lineCount : logLines.length === 1 ? "line" : T.lineCount}
            </span>
            <label className={styles.checkInline}>
              <input type="checkbox" checked={autoScroll} onChange={(event) => setAutoScroll(event.target.checked)} />
              {T.autoScroll}
            </label>
          </footer>
        </section>
      </div>
    </div>
  );
}
