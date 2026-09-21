"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import { downloadFirmwareBinary, formatDownloadBytes } from "../../lib/firmware-download.mjs";
import { createCompatibleEspLoader } from "../../lib/xiao-esptool-compat.mjs";
import {
  buildFlashPlan,
  canEraseWholeFlash,
  getCompatibleBuild,
  loadPublishedFirmwareCatalog,
  sha256Hex,
} from "../../lib/xiao-firmware-catalog.mjs";
import styles from "./esp-flasher.module.css";

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
const CATALOG_URL = "/firmware/catalog.json";
const RECONNECT_ATTEMPTS = 20;
const RECONNECT_DELAY_MS = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pad = (value, size = 2) => String(value).padStart(size, "0");

/** Load the current published catalog without reusing an open tab's old metadata. 读取当前发布清单，不复用已打开页面中的旧元数据。 */
function loadCurrentFirmwareCatalog() {
  return loadPublishedFirmwareCatalog({
    catalogUrl: withBase(CATALOG_URL),
    resolveUrl: withBase,
  });
}

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
  // Connection lifecycle: idle → connecting → monitoring/flashing → restarting → reconnecting.
  // 连接生命周期：未连接 → 连接 → 监听/烧录 → 重启 → 重连；暂停与错误是可恢复状态。
  const [phase, setPhase] = useState("idle");
  const [device, setDevice] = useState(null);
  const [firmwares, setFirmwares] = useState([]);
  const [catalogState, setCatalogState] = useState("loading");
  const [boardId, setBoardId] = useState("");
  const [firmwareId, setFirmwareId] = useState("");
  const [localFile, setLocalFile] = useState(null);
  const [localImageKind, setLocalImageKind] = useState("application");
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
  const boardIdRef = useRef("");
  const expectedDisconnectRef = useRef(false);
  const intentionalDisconnectRef = useRef(false);

  const board = ESP_BOARDS.find((item) => item.id === boardId) ?? null;
  const boardFirmwares = useMemo(
    () => (boardId
      ? firmwares.filter((item) => item.builds.some((build) => build.boardId === boardId))
      : []),
    [boardId, firmwares],
  );
  const builtIn = boardFirmwares.find((item) => item.id === firmwareId) ?? null;
  const builtInBuild = builtIn && device ? getCompatibleBuild(builtIn, device.chip) : null;
  const usingLocal = firmwareId === CUSTOM_ID && Boolean(localFile);
  const connected = Boolean(device) && !["idle", "error"].includes(phase);
  const busy = ["connecting", "flashing", "restarting", "reconnecting"].includes(phase);
  const flashStarted = Boolean(progress);
  const flashComplete = progress?.status === "complete";
  const localAddressValue = parseAddress(localAddress);
  const localIsComplete = usingLocal && localImageKind === "merged" && localAddressValue === 0;
  const canEraseSelected = usingLocal ? localIsComplete : canEraseWholeFlash(builtInBuild);

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
      ? "连接 XIAO 并选择串口；页面会自动识别型号并开始监听。"
      : "Connect XIAO and choose its port; the page detects the model and starts monitoring automatically.",
    step1TroubleTitle: zh ? "连接不上？" : "Trouble connecting?",
    step1Trouble: zh
      ? "1. 换一条支持数据传输的 USB-C 线（部分线材只能充电）。\n2. 按住板子上的 BOOT 键再插入 USB，或按住 BOOT 点一下 RESET，进入下载模式后重试。\n3. macOS 与 Windows 都无需额外驱动；若仍看不到串口，换一个 USB 口或直连电脑而不经扩展坞。"
      : "1. Try another data-capable USB-C cable — some cables only carry power.\n2. Hold BOOT while plugging in USB, or hold BOOT and tap RESET, to enter download mode and retry.\n3. No driver is needed on macOS or Windows; if no port shows up, try another USB port or plug straight into the computer instead of a hub.",
    connect: zh ? "连接设备" : "Connect",
    connecting: zh ? "连接中…" : "Connecting…",
    disconnect: zh ? "断开连接" : "Disconnect",
    factBoard: zh ? "型号" : "Board",
    factChip: zh ? "芯片" : "Chip",
    factMac: "MAC",
    factPort: zh ? "串口" : "Port",
    unsupportedChip: zh ? "暂不支持这个芯片" : "This chip is not supported yet",

    step2: zh ? "选择固件" : "Choose firmware",
    step2Hint: zh
      ? "选用经过校验的官方固件，或上传自己的 .bin 文件。"
      : "Choose a verified official firmware or upload your own .bin file.",
    firmwareWaiting: zh
      ? "连接设备后会自动加载与型号匹配的示例固件。"
      : "Connect a board to load the matching sample firmware.",
    catalogLoading: zh ? "正在加载官方固件清单…" : "Loading the official firmware catalog…",
    catalogError: zh ? "官方固件清单加载失败，请刷新页面重试。" : "The official firmware catalog could not load. Refresh and try again.",
    localTitle: zh ? "本地固件 .bin" : "Local .bin file",
    localHint: zh ? "把 .bin 拖到这里，或点击选择文件" : "Drop a .bin here, or click to browse",
    localPick: zh ? "选择文件" : "Browse",
    localReplace: zh ? "更换文件" : "Replace",
    localRemove: zh ? "移除" : "Remove",
    localAddress: zh ? "烧录地址" : "Flash address",
    localImageKind: zh ? "固件类型" : "Image type",
    localApplication: zh ? "应用程序镜像" : "Application image",
    localMerged: zh ? "完整合并镜像" : "Complete merged image",
    localAddressHint: zh
      ? "Arduino / PlatformIO 导出的应用固件填 0x10000；含 bootloader 的整合固件填 0x0。"
      : "Application images from Arduino or PlatformIO go to 0x10000; merged images that include the bootloader go to 0x0.",
    localMergedHint: zh
      ? "完整合并镜像从 0x0 写入，并可安全使用整片擦除。"
      : "A complete merged image writes from 0x0 and can safely use whole-flash erase.",
    localAddressBad: zh ? "地址需为十六进制，例如 0x10000" : "Address must be hex, for example 0x10000",

    step3: zh ? "开始烧录" : "Flash the firmware",
    step3Hint: zh
      ? "页面会在写入前校验文件，并在写入后核对设备中的内容。"
      : "The file is checked before writing and verified on the device afterward.",
    flash: zh ? "烧录固件" : "Flash firmware",
    eraseFlash: zh ? "擦除并烧录" : "Erase & flash",
    flashing: zh ? "烧录中…" : "Flashing…",
    erasing: zh ? "擦除并烧录中…" : "Erasing & flashing…",
    writing: zh ? "正在写入" : "Writing",
    eraseWriting: zh ? "正在擦除并写入" : "Erasing and writing",
    needConnect: zh ? "请先完成第 1 步连接设备" : "Complete step 1 and connect a board first",
    needFirmware: zh ? "请先选择固件" : "Choose a firmware first",
    success: zh ? "烧录完成，设备已复位并运行新固件。" : "Flash complete — the board reset into the new firmware.",
    eraseUnavailable: zh
      ? "当前固件只是应用程序镜像，不包含启动文件和分区表，因此不会提供整片擦除。"
      : "This is an application image without the bootloader and partition table, so whole-flash erase is unavailable.",
    stagePreparing: zh ? "准备固件" : "Preparing firmware",
    stageDownloading: zh ? "下载固件" : "Downloading firmware",
    stageChecking: zh ? "校验下载文件" : "Checking downloaded firmware",
    stageConnecting: zh ? "重新连接烧录模式" : "Connecting in flash mode",
    stageErasing: zh ? "擦除 Flash" : "Erasing Flash",
    stageWriting: zh ? "写入固件" : "Writing firmware",
    stageVerifying: zh ? "校验设备内容" : "Verifying device contents",
    stageRestarting: zh ? "重启设备" : "Restarting device",
    stageReconnecting: zh ? "恢复串口连接" : "Restoring serial connection",
    stageComplete: zh ? "烧录与校验完成" : "Flash and verification complete",
    reconnectManual: zh ? "固件已写入，请点击“开始监听”重新连接串口。" : "Firmware was written. Select Start listening to reconnect the serial port.",

    monitorTitle: zh ? "串口监视器" : "Serial Monitor",
    monitorLead: zh
      ? "烧录日志与设备输出都带时间戳记录在这里，复制或下载后即可发给技术支持。"
      : "Flash logs and device output are timestamped here — copy or download them to share with support.",
    phaseIdle: zh ? "未连接" : "Not connected",
    phaseConnecting: zh ? "连接中" : "Connecting",
    phaseMonitoring: zh ? "监听中" : "Listening",
    phaseFlashing: zh ? "烧录中" : "Flashing",
    phaseRestarting: zh ? "重启中" : "Restarting",
    phaseReconnecting: zh ? "重连中" : "Reconnecting",
    phasePaused: zh ? "已暂停" : "Paused",
    phaseError: zh ? "需要处理" : "Needs attention",
    baud: zh ? "波特率" : "Baud",
    reopening: zh ? "设备复位后串口重新枚举，正在重新打开…" : "The port re-enumerated after reset — reopening…",
    startMonitor: zh ? "开始监听" : "Start listening",
    pauseMonitor: zh ? "暂停监听" : "Pause",
    resetDevice: zh ? "重启设备" : "Reset device",
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

  useEffect(() => {
    let active = true;
    loadCurrentFirmwareCatalog().then((items) => {
      if (!active) return;
      setFirmwares(items);
      const detectedBoardId = boardIdRef.current;
      if (detectedBoardId) {
        setFirmwareId((current) => (
          current === CUSTOM_ID
            ? current
            : items.find((item) => item.builds.some((build) => build.boardId === detectedBoardId))?.id ?? ""
        ));
      }
      setCatalogState("ready");
    }).catch((catalogError) => {
      if (!active) return;
      setCatalogState("error");
      appendLog("error", `Firmware catalog: ${catalogError?.message || catalogError}\n`);
    });
    return () => { active = false; };
  }, [appendLog]);

  useEffect(() => () => {
    if (flushRef.current) clearTimeout(flushRef.current);
    monitorClosedRef.current = true;
    intentionalDisconnectRef.current = true;
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
    const loader = createCompatibleEspLoader(ESPLoader, {
      transport: transportRef.current,
      baudrate: 460800,
      romBaudrate: 115200,
      terminal: makeTerminal(),
    });
    const description = await loader.main();
    loaderRef.current = loader;
    await loader.flashId();
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
   * Reopen the same authorized USB device after a reset and re-enumeration.
   * 设备复位并重新枚举后，在授权串口中寻找相同设备并重新打开。
   */
  const openPortForMonitor = useCallback(async (baudRate, attempts = 1) => {
    const transport = transportRef.current;
    if (!transport) throw new Error("No serial port");
    const wanted = transport.device?.getInfo?.() ?? {};
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const ports = await navigator.serial.getPorts();
      const match = ports.find((port) => {
        const info = port.getInfo?.() ?? {};
        return info.usbVendorId === wanted.usbVendorId && info.usbProductId === wanted.usbProductId;
      });
      if (match) transport.updateDevice(match);
      try {
        await transport.connect(baudRate);
        return;
      } catch (error) {
        lastError = error;
        if (attempt === 1) appendLog("system", `${T.reopening} (${error?.message || error})\n`);
        if (attempt < attempts) await sleep(RECONNECT_DELAY_MS);
      }
    }

    throw lastError || new Error("Serial port did not return after reset");
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
      await openPortForMonitor(baudRate, expectedDisconnectRef.current ? RECONNECT_ATTEMPTS : 1);
    } catch (e) {
      setPhase("paused");
      appendLog("error", `${e?.message || e}\n`);
      expectedDisconnectRef.current = false;
      return false;
    }
    const session = monitorSessionRef.current;
    monitorClosedRef.current = false;
    expectedDisconnectRef.current = false;
    setPhase("monitoring");
    appendLog("system", `— ${T.monitorTitle} @ ${baudRate} baud —\n`);
    const decoder = new TextDecoder();
    void transport.rawRead(
      (data) => appendLog("device", decoder.decode(data, { stream: true })),
      () => monitorClosedRef.current || monitorSessionRef.current !== session,
    ).then(() => {
      if (monitorSessionRef.current !== session) return;
      monitorClosedRef.current = true;
      setPhase((current) => (current === "monitoring" ? "paused" : current));
    }).catch((error) => {
      if (monitorSessionRef.current !== session) return;
      monitorClosedRef.current = true;
      appendLog("error", `${error?.message || error}\n`);
      setPhase((current) => (current === "monitoring" ? "paused" : current));
    });
    return true;
  }, [appendLog, openPortForMonitor, stopMonitor, T.monitorTitle]);

  async function handleConnect() {
    if (connected) {
      await handleDisconnect();
      return;
    }
    setError("");
    setPhase("connecting");
    try {
      intentionalDisconnectRef.current = false;
      expectedDisconnectRef.current = false;
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x303a },
          { usbVendorId: 0x10c4 },
          { usbVendorId: 0x1a86 },
        ],
      });
      const { Transport } = await import("esptool-js");
      const transport = new Transport(port, false);
      transport.setDeviceLostCallback(() => {
        monitorClosedRef.current = true;
        loaderRef.current = null;
        if (intentionalDisconnectRef.current) return;
        if (expectedDisconnectRef.current) {
          setPhase("reconnecting");
          appendLog("system", `${T.stageReconnecting}\n`);
          return;
        }
        transportRef.current = null;
        setPhase("idle");
        setDevice(null);
        setBoardId("");
        boardIdRef.current = "";
        setFirmwareId((current) => (current === CUSTOM_ID ? current : ""));
        setProgress(null);
        appendLog("error", `${zh ? "设备已断开" : "Device disconnected"}\n`);
      });
      transportRef.current = transport;
      appendLog("system", `${zh ? "正在识别芯片…" : "Detecting chip…"}\n`);
      const info = await attachLoader();
      const matched = ESP_BOARDS.find((item) => item.chip === info.chip);
      if (!matched) {
        setBoardId("");
        boardIdRef.current = "";
        setFirmwareId((current) => (current === CUSTOM_ID ? current : ""));
        throw new Error(`${T.unsupportedChip}: ${info.chip || info.description}`);
      }
      setBoardId(matched.id);
      boardIdRef.current = matched.id;
      let currentFirmwares = [];
      try {
        setCatalogState("loading");
        currentFirmwares = await loadCurrentFirmwareCatalog();
        setFirmwares(currentFirmwares);
        setCatalogState("ready");
      } catch (catalogError) {
        setFirmwares([]);
        setCatalogState("error");
        appendLog("error", `Firmware catalog: ${catalogError?.message || catalogError}\n`);
      }
      setFirmwareId((current) => (
        current === CUSTOM_ID
          ? current
          : currentFirmwares.find((fw) => fw.builds.some((build) => build.boardId === matched.id))?.id ?? ""
      ));
      appendLog("success", `${zh ? "已连接" : "Connected"} · ${info.description} · MAC ${info.mac}\n`);
      expectedDisconnectRef.current = true;
      setPhase("restarting");
      await loaderRef.current.after("hard_reset");
      await detachLoader();
      setPhase("reconnecting");
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
      expectedDisconnectRef.current = false;
      setDevice(null);
      setBoardId("");
      boardIdRef.current = "";
      setFirmwareId((current) => (current === CUSTOM_ID ? current : ""));
      setProgress(null);
      setPhase("idle");
    }
  }

  async function handleDisconnect() {
    intentionalDisconnectRef.current = true;
    expectedDisconnectRef.current = false;
    await stopMonitor();
    await detachLoader();
    transportRef.current = null;
    setDevice(null);
    setBoardId("");
    boardIdRef.current = "";
    setFirmwareId((current) => (current === CUSTOM_ID ? current : ""));
    setPhase("idle");
    setProgress(null);
    appendLog("system", `${zh ? "已断开连接" : "Disconnected"}\n`);
    intentionalDisconnectRef.current = false;
  }

  /** Resolve, download and verify every part before the device is modified. 在改动设备前准备并校验全部固件。 */
  async function resolveFirmwarePackage(eraseAll) {
    if (firmwareId === CUSTOM_ID) {
      if (!localFile) throw new Error(T.needFirmware);
      if (localAddressValue === null) throw new Error(T.localAddressBad);
      const build = {
        completeImage: localImageKind === "merged" && localAddressValue === 0,
        erasePolicy: localImageKind === "merged" && localAddressValue === 0 ? "full" : "application-only",
        flashSize: "keep",
        flashMode: "dio",
        flashFreq: "80m",
        parts: [{ path: localFile.name, offset: localAddressValue, size: localFile.data.length }],
      };
      const plan = buildFlashPlan(build, { eraseAll });
      return {
        label: localFile.name,
        chipFamily: device?.chip,
        plan,
        fileArray: [{ data: localFile.data, address: localAddressValue }],
        verifyParts: [],
        totalSize: localFile.data.length,
      };
    }
    if (!builtIn) throw new Error(T.needFirmware);
    const build = getCompatibleBuild(builtIn, device?.chip);
    if (!build) throw new Error(`${T.unsupportedChip}: ${device?.chip || "unknown"}`);
    const plan = buildFlashPlan(build, { eraseAll });
    const totalSize = plan.parts.reduce((sum, part) => sum + part.size, 0);
    const manifestHref = new URL(builtIn.manifestUrl, window.location.href).href;
    const baseUrl = manifestHref.substring(0, manifestHref.lastIndexOf("/") + 1);
    const fileArray = [];
    let completedBytes = 0;

    for (const part of plan.parts) {
      const partUrl = new URL(part.path, baseUrl).href;
      appendLog("system", `Downloading ${part.path}\n`);
      const data = await downloadFirmwareBinary(partUrl, {
        size: part.size,
        onProgress: ({ received }) => {
          const written = Math.min(completedBytes + received, totalSize);
          const percent = totalSize ? 5 + Math.round((written / totalSize) * 20) : 5;
          setProgress({ status: "active", stage: T.stageDownloading, percent, written, total: totalSize });
        },
        onRetry: ({ attempt, maxAttempts, received, error: retryError }) => {
          appendLog(
            "system",
            `Download retry ${attempt + 1}/${maxAttempts} at ${formatDownloadBytes(received)}: ${retryError?.message || retryError}\n`,
          );
        },
      });
      setProgress({ status: "active", stage: T.stageChecking, percent: 27, written: completedBytes + data.length, total: totalSize });
      const actualSha256 = await sha256Hex(data);
      if (actualSha256.toLowerCase() !== part.sha256.toLowerCase()) {
        throw new Error(`${part.path} SHA-256 verification failed`);
      }
      appendLog("success", `Verified download ${part.path}\n`);
      fileArray.push({ data, address: part.offset });
      completedBytes += data.length;
    }

    return {
      label: `${pick(builtIn.name)} v${builtIn.version}`,
      chipFamily: build.chipFamily,
      plan,
      fileArray,
      verifyParts: plan.parts,
      totalSize,
    };
  }

  async function handleFlash(eraseAll) {
    if (!connected || busy) return;
    if (eraseAll && !canEraseSelected) {
      setError(T.eraseUnavailable);
      return;
    }
    setError("");
    setFlashErase(eraseAll);
    setPhase("flashing");
    setProgress({ status: "active", stage: T.stagePreparing, percent: 1, written: 0, total: 0 });
    let installSessionPromise = null;
    try {
      const firmwarePackage = await resolveFirmwarePackage(eraseAll);
      await stopMonitor();
      await detachLoader();
      await sleep(120);
      setProgress((current) => ({ ...current, stage: T.stageConnecting, percent: 30 }));
      await attachLoader();
      if (loaderRef.current?.chip?.CHIP_NAME !== firmwarePackage.chipFamily) {
        throw new Error(`${T.unsupportedChip}: ${loaderRef.current?.chip?.CHIP_NAME || "unknown"}`);
      }
      if (builtIn && globalThis.XiaoFirmwareInstallStats?.beginInstall) {
        installSessionPromise = Promise.resolve(globalThis.XiaoFirmwareInstallStats.beginInstall({
          firmwareId: builtIn.id,
          version: builtIn.version,
          boardId,
        })).catch(() => null);
      }
      appendLog(
        "system",
        `${eraseAll ? "Erasing and writing" : "Writing"} ${firmwarePackage.label} · ${formatKB(firmwarePackage.totalSize)}\n`,
      );
      const startedAt = performance.now();
      if (firmwarePackage.plan.eraseAll) {
        setProgress((current) => ({ ...current, stage: T.stageErasing, percent: 34 }));
        await loaderRef.current.eraseFlash();
        appendLog("success", "Whole-flash erase completed\n");
      }
      const fileProgress = new Array(firmwarePackage.fileArray.length).fill(0);
      setProgress((current) => ({ ...current, stage: T.stageWriting, percent: 36 }));
      await loaderRef.current.writeFlash({
        fileArray: firmwarePackage.fileArray,
        flashSize: firmwarePackage.plan.flashSize,
        flashMode: firmwarePackage.plan.flashMode,
        flashFreq: firmwarePackage.plan.flashFreq,
        eraseAll: false,
        compress: true,
        reportProgress: (index, written, total) => {
          const sourceSize = firmwarePackage.fileArray[index]?.data.length || 0;
          fileProgress[index] = total > 0 ? Math.min(written / total, 1) * sourceSize : 0;
          const writtenBytes = fileProgress.reduce((sum, value) => sum + value, 0);
          const ratio = firmwarePackage.totalSize ? writtenBytes / firmwarePackage.totalSize : 0;
          setProgress({
            status: "active",
            stage: T.stageWriting,
            percent: 36 + Math.round(ratio * 52),
            written: Math.round(writtenBytes),
            total: firmwarePackage.totalSize,
          });
        },
      });

      setProgress((current) => ({ ...current, stage: T.stageVerifying, percent: 90 }));
      for (const part of firmwarePackage.verifyParts) {
        const actualMd5 = await loaderRef.current.flashMd5sum(part.offset, part.size);
        if (String(actualMd5).toLowerCase() !== part.md5.toLowerCase()) {
          throw new Error(`${part.path} device verification failed`);
        }
        appendLog("success", `Verified device region ${part.path}\n`);
      }

      const seconds = (performance.now() - startedAt) / 1000;
      const kbps = Math.round(firmwarePackage.totalSize / seconds / 1024);
      expectedDisconnectRef.current = true;
      setPhase("restarting");
      setProgress((current) => ({ ...current, stage: T.stageRestarting, percent: 96 }));
      const loader = loaderRef.current;
      await loader.after("hard_reset");
      await detachLoader();
      setPhase("reconnecting");
      setProgress((current) => ({ ...current, stage: T.stageReconnecting, percent: 98 }));
      const monitorRestored = await startMonitor(Number(baud));
      if (installSessionPromise && globalThis.XiaoFirmwareInstallStats?.completeInstall) {
        void installSessionPromise.then((token) => {
          if (token) return globalThis.XiaoFirmwareInstallStats.completeInstall(token);
          return null;
        }).catch(() => null);
      }
      setProgress({
        status: "complete",
        stage: monitorRestored ? T.stageComplete : T.reconnectManual,
        percent: 100,
        written: firmwarePackage.totalSize,
        total: firmwarePackage.totalSize,
      });
      appendLog("success", `${T.success} ${seconds.toFixed(1)}s · ${kbps} KB/s\n`);
    } catch (e) {
      const message = e?.message || String(e);
      expectedDisconnectRef.current = false;
      setError(message);
      appendLog("error", `${message}\n`);
      setProgress((current) => current ? { ...current, status: "error", stage: message } : null);
      setPhase(transportRef.current ? "paused" : "error");
    }
  }

  async function resetDevice() {
    const transport = transportRef.current;
    if (!transport || busy) return;
    setError("");
    expectedDisconnectRef.current = true;
    setPhase("restarting");
    appendLog("system", "Resetting device with RTS\n");
    try {
      await stopMonitor();
      const port = transport.device;
      if (!port.readable && !port.writable) await port.open({ baudRate: Number(baud) });
      await port.setSignals({ dataTerminalReady: false, requestToSend: false });
      await sleep(50);
      await port.setSignals({ dataTerminalReady: false, requestToSend: true });
      await sleep(100);
      await port.setSignals({ dataTerminalReady: false, requestToSend: false });
      await port.close();
      setPhase("reconnecting");
      await startMonitor(Number(baud));
    } catch (resetError) {
      expectedDisconnectRef.current = false;
      const message = resetError?.message || String(resetError);
      setError(message);
      setPhase("paused");
      appendLog("error", `${message}\n`);
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
      `detected board: ${board?.name || "—"}`,
      `detected chip: ${device ? `${device.description} (MAC ${device.mac})` : "—"}`,
      `firmware: ${usingLocal ? `${localFile.name} (${localImageKind}) @ ${localAddress}` : builtIn ? `${pick(builtIn.name)} v${builtIn.version} (${builtIn.id})` : "—"}`,
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
    restarting: T.phaseRestarting,
    reconnecting: T.phaseReconnecting,
    paused: T.phasePaused,
    error: T.phaseError,
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
          <article
            className={styles.step}
            data-current={connected ? "0" : "1"}
            data-done={connected ? "1" : "0"}
          >
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
                  {board && <div><dt>{T.factBoard}</dt><dd>{board.name}</dd></div>}
                  <div><dt>{T.factChip}</dt><dd>{device.description}</dd></div>
                  <div><dt>{T.factMac}</dt><dd>{device.mac}</dd></div>
                  <div><dt>{T.factPort}</dt><dd>{phaseLabel}</dd></div>
                </dl>
              )}
              {error && !connected && <p className={`${styles.note} ${styles.noteError}`}>{error}</p>}
              <details className={styles.trouble}>
                <summary>{T.step1TroubleTitle}</summary>
                <p>{T.step1Trouble}</p>
              </details>
            </div>
          </article>

          <article
            className={styles.step}
            data-current={connected && !flashStarted ? "1" : "0"}
            data-done={connected && flashStarted ? "1" : "0"}
          >
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>02</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step2}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step2Hint}</p>
              </div>
            </div>
            <div className={styles.stepBody}>
              {boardFirmwares.length > 0 ? (
                <div className={styles.fwList}>
                  {boardFirmwares.map((fw) => {
                    const fwBuild = getCompatibleBuild(fw, device?.chip);
                    const firstPart = fwBuild?.parts?.[0];
                    return (
                      <label key={fw.id} className={styles.fwItem} data-on={fw.id === firmwareId ? "1" : "0"}>
                        <input
                          type="radio"
                          name="xiao-firmware"
                          checked={fw.id === firmwareId}
                          onChange={() => setFirmwareId(fw.id)}
                          disabled={busy}
                        />
                        <span className={styles.fwCopy}>
                          <strong>{pick(fw.name)}<em>v{fw.version}</em></strong>
                          <small>{pick(fw.summary)}</small>
                        </span>
                        {firstPart && <code>0x{firstPart.offset.toString(16)}</code>}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.stepWaiting}>
                  {catalogState === "loading" ? T.catalogLoading : catalogState === "error" ? T.catalogError : T.firmwareWaiting}
                </p>
              )}

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
                      <span>{T.localImageKind}</span>
                      <select
                        value={localImageKind}
                        onChange={(event) => {
                          const nextKind = event.target.value;
                          setLocalImageKind(nextKind);
                          setLocalAddress(nextKind === "merged" ? "0x0" : DEFAULT_ADDRESS);
                        }}
                        disabled={busy}
                      >
                        <option value="application">{T.localApplication}</option>
                        <option value="merged">{T.localMerged}</option>
                      </select>
                    </label>
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
                    {localAddressValue === null
                      ? T.localAddressBad
                      : localImageKind === "merged"
                        ? T.localMergedHint
                        : T.localAddressHint}
                  </p>
                )}
              </div>
            </div>
          </article>

          <article
            className={styles.step}
            data-current={connected && flashStarted && !flashComplete ? "1" : "0"}
            data-done={flashComplete ? "1" : "0"}
          >
            <div className={styles.stepHead}>
              <span className={styles.stepIndex}>03</span>
              <div>
                <h2 className={`${styles.stepTitle} home-type-subtitle`}>{T.step3}</h2>
                <p className={`${styles.stepHint} home-type-body`}>{T.step3Hint}</p>
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
                  disabled={!canFlash || !canEraseSelected}
                  title={!connected ? T.needConnect : !canEraseSelected ? T.eraseUnavailable : undefined}
                >
                  {phase === "flashing" && flashErase ? T.erasing : T.eraseFlash}
                </button>
              </div>
              {!canEraseSelected && (builtIn || usingLocal) && (
                <p className={`${styles.note} ${styles.noteWarn}`}>{T.eraseUnavailable}</p>
              )}
              {progress && (
                <div className={styles.progress}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                  </div>
                  <div className={styles.progressMeta}>
                    <span>{progress.stage}</span>
                    <span>{progress.percent}%{progress.total ? ` · ${formatKB(progress.written)} / ${formatKB(progress.total)}` : ""}</span>
                  </div>
                </div>
              )}
              {error && connected && <p className={`${styles.note} ${styles.noteError}`}>{error}</p>}
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
              <button type="button" className={styles.toolBtn} onClick={resetDevice} disabled={!connected || busy}>
                {T.resetDevice}
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
