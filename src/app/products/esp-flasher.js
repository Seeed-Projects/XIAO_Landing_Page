"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import styles from "./esp-flasher.module.css";

/* 真实固件列表 —— 目前 PoC 提供 XIAO ESP32-S3 的 Blink 示例
   （由 PlatformIO 编译，闪烁 GPIO21 用户 LED 并经串口 115200 输出日志）。
   .bin 放 public/firmware/，前端 fetch 后用 esptool-js 经 Web Serial 烧到 0x10000。 */
const FIRMWARES = [
  {
    id: "s3-blink",
    boards: ["s3"],
    name: { en: "Blink Demo", zh: "Blink 闪烁示例" },
    desc: { en: "Blinks the user LED (GPIO21) + prints over serial", zh: "用户 LED（GPIO21）闪烁 + 串口输出" },
    ver: "v1.0",
    url: "/firmware/xiao-esp32s3-blink.bin",
    address: 0x10000,
  },
];

/* 可选板型（ESP 系列）；PoC 暂仅 ESP32-S3 提供真实固件 */
const ESP_BOARDS = [
  { id: "s3", name: "XIAO ESP32-S3", chip: "ESP32-S3", hint: "Dual Core · Wi-Fi + BLE", hasFw: true },
  { id: "c3", name: "XIAO ESP32-C3", chip: "ESP32-C3", hint: "RISC-V · Wi-Fi 4 + BLE 5", hasFw: false },
  { id: "c6", name: "XIAO ESP32-C6", chip: "ESP32-C6", hint: "RISC-V · Wi-Fi 6 + Thread", hasFw: false },
  { id: "c5", name: "XIAO ESP32-C5", chip: "ESP32-C5", hint: "RISC-V · Wi-Fi 6 + BLE 5", hasFw: false },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function ESPFlasher() {
  const { lang } = useLang();

  const [supported, setSupported] = useState(false); // SSR 与首屏一致 false，挂载后再探测，避免 hydration mismatch
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chip, setChip] = useState("—");
  const [stats, setStats] = useState({ time: "—", speed: "—", size: "—" });
  const [boardId, setBoardId] = useState("s3");
  const [logLines, setLogLines] = useState([]);
  const [monOn, setMonOn] = useState(false);
  const [baud, setBaud] = useState("115200");
  const [error, setError] = useState("");
  const [flashed, setFlashed] = useState(false);

  const portRef = useRef(null);     // Web Serial 端口
  const espRef = useRef(null);      // ESPLoader 实例
  const readerRef = useRef(null);    // 裸串口 reader（监视设备输出）
  const logBufRef = useRef([]);
  const flushRef = useRef(null);

  const board = ESP_BOARDS.find((b) => b.id === boardId) ?? ESP_BOARDS[0];
  const fwList = FIRMWARES.filter((f) => f.boards.includes(boardId));
  const sel = fwList[0];

  /* 日志收集：esptool terminal 与裸串口输出都写到同一缓冲，节流后 flush 到 state */
  const appendLog = useCallback((text) => {
    if (!text) return;
    logBufRef.current.push(text);
    if (logBufRef.current.length > 800) logBufRef.current = logBufRef.current.slice(-800);
    if (!flushRef.current) {
      flushRef.current = setTimeout(() => {
        flushRef.current = null;
        setLogLines([...logBufRef.current]);
      }, 80);
    }
  }, []);
  const clearLog = useCallback(() => { logBufRef.current = []; setLogLines([]); }, []);

  // 卸载时关掉端口/reader
  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "serial" in navigator);
    return () => {
      if (flushRef.current) clearTimeout(flushRef.current);
      try { readerRef.current?.cancel(); } catch {}
    };
  }, []);

  /* esptool-js 的 terminal 对象：clean/write/writeLine，把日志喂给上面缓冲 */
  const makeTerminal = () => ({
    clean() {},
    write(s) { appendLog(s); },
    writeLine(s) { appendLog(s + "\n"); },
  });

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  const T = {
    eyebrow: lang === "zh" ? "ESP 在线烧录" : "ESP Flasher",
    h2: lang === "zh" ? "ESP 在线烧录器" : "ESP Web Flasher",
    p: lang === "zh"
      ? "浏览器内用 Web Serial 直连 ESP 设备真烧录，无需安装 esptool/Arduino。选端口→同步芯片→写固件，实时显示芯片、进度、耗时与速率，烧完硬复位，设备即跑新固件。"
      : "Flash ESP devices straight from the browser via Web Serial. Sync → detect chip → write firmware, with live chip info, progress, timing and speed.",
    connect: lang === "zh" ? "连接设备" : "Connect",
    disconnect: lang === "zh" ? "断开" : "Disconnect",
    flash: lang === "zh" ? "烧录" : "Flash",
    flashing: lang === "zh" ? "烧录中…" : "Flashing…",
    writing: lang === "zh" ? "烧录中" : "Writing",
    finished: lang === "zh" ? "完成" : "Finished",
    connected: lang === "zh" ? "已连接" : "Connected",
    disconnected: lang === "zh" ? "未连接" : "Disconnected",
    statTime: lang === "zh" ? "烧录耗时" : "Flash Time",
    statSpeed: lang === "zh" ? "平均速率" : "Avg Speed",
    statChip: lang === "zh" ? "检测芯片" : "Chip",
    statSize: lang === "zh" ? "固件大小" : "Size",
    notFlashed: lang === "zh" ? "尚未烧录" : "Not flashed yet",
    thisRun: lang === "zh" ? "本次" : "This run",
    fwHead: lang === "zh" ? "固件" : "Firmware",
    fwVer: lang === "zh" ? "版本" : "Version",
    fwSize: lang === "zh" ? "大小" : "Size",
    fwAction: lang === "zh" ? "操作" : "Action",
    flashingRow: lang === "zh" ? "烧录中" : "Flashing",
    boardLabel: lang === "zh" ? "板型" : "Board",
    monTitle: lang === "zh" ? "日志 / 串口" : "Log / Serial",
    monHint: lang === "zh" ? "连接后此处实时显示烧录日志；烧完可读取设备串口输出" : "Live flash log here; read device serial output after flashing",
    baud: lang === "zh" ? "波特率" : "Baud",
    monStart: lang === "zh" ? "读取设备输出" : "Read Output",
    monPause: lang === "zh" ? "停止" : "Stop",
    monClear: lang === "zh" ? "清屏" : "Clear",
    monEmpty: lang === "zh" ? "连接设备后查看实时日志" : "Connect a device to see the live log",
    noFw: lang === "zh" ? "固件准备中（PoC 暂仅 ESP32-S3）" : "Firmware coming soon (PoC: ESP32-S3 only)",
    unsupported: lang === "zh"
      ? "当前浏览器不支持 Web Serial。请用桌面版 Chrome 或 Edge（需 HTTPS 或 localhost 访问）。"
      : "Web Serial is not supported in this browser. Use desktop Chrome or Edge over HTTPS or localhost.",
    connectFirst: lang === "zh" ? "请先连接设备" : "Connect a device first",
    readOutput: lang === "zh" ? "读取设备输出" : "Read Device Output",
    success: lang === "zh" ? "烧录成功，设备已复位并运行新固件" : "Flashed successfully — board reset and running new firmware",
  };

  async function safeClosePort() {
    try { if (portRef.current && portRef.current.readable) await portRef.current.close(); } catch {}
  }
  async function stopReader() {
    try { await readerRef.current?.cancel(); } catch {}
    try { readerRef.current?.releaseLock(); } catch {}
    readerRef.current = null;
  }

  /* 连接：requestPort（需用户手势）→ Transport → ESPLoader.main() 同步检测芯片 */
  async function handleConnect() {
    setError("");
    if (connected) { await disconnect(); return; }
    setBusy(true);
    try {
      const port = await navigator.serial.requestPort();
      portRef.current = port;
      const { ESPLoader, Transport } = await import("esptool-js");
      const transport = new Transport(port);
      const esp = new ESPLoader({
        transport,
        baudrate: 460800,
        romBaudrate: 115200,
        terminal: makeTerminal(),
      });
      espRef.current = esp;
      await esp.main(); // 自动 connect + detectChip + runStub + changeBaud + readFlashId
      setChip(esp.chip.CHIP_NAME);
      setConnected(true);
      setFlashed(false);
      setProgress(0);
      setStats({ time: "—", speed: "—", size: "—" });
      if (esp.chip.CHIP_NAME !== board.chip) {
        appendLog(`⚠ 检测到 ${esp.chip.CHIP_NAME}，所选板型 ${board.chip}，固件可能不兼容\n`);
      }
    } catch (e) {
      const msg = e?.message || String(e);
      setError(msg);
      appendLog("✗ " + msg + "\n");
      try { await espRef.current?.transport?.disconnect(); } catch {}
      await safeClosePort();
      espRef.current = null; portRef.current = null;
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setMonOn(false);
    await stopReader();
    try { await espRef.current?.transport?.disconnect(); } catch {}
    await safeClosePort();
    espRef.current = null; portRef.current = null;
    setConnected(false);
    setChip("—");
    setProgress(0);
    setStats({ time: "—", speed: "—", size: "—" });
    setFlashed(false);
  }

  /* 烧录：fetch 固件 → writeFlash(进度回调) → after(hard_reset) */
  async function handleFlash(fw) {
    if (!connected || busy) return;
    const target = fw ?? sel;
    if (!target) return;
    setError("");
    setBusy(true);
    setProgress(0);
    setFlashed(false);
    setStats({ time: "…", speed: "…", size: "…" });
    try {
      appendLog(`↓ 下载固件 ${target.url}\n`);
      const res = await fetch(withBase(target.url));
      if (!res.ok) throw new Error(`固件下载失败 (HTTP ${res.status})`);
      const data = new Uint8Array(await res.arrayBuffer());
      appendLog(`固件 ${data.length} 字节 → 0x${target.address.toString(16)}\n`);
      const t0 = performance.now();
      await espRef.current.writeFlash({
        fileArray: [{ data, address: target.address }],
        compress: true,
        flashSize: "keep",
        reportProgress: (_i, written, total) => {
          setProgress(total ? Math.round((written / total) * 100) : 0);
        },
      });
      await espRef.current.after("hard_reset");
      const dt = (performance.now() - t0) / 1000;
      const kbps = Math.round(data.length / dt / 1024);
      setStats({ time: dt.toFixed(1), speed: kbps, size: (data.length / 1024).toFixed(0) + " KB" });
      setProgress(100);
      setFlashed(true);
      appendLog("✓ 烧录完成，已硬复位，设备开始运行新固件\n");
    } catch (e) {
      const msg = e?.message || String(e);
      setError(msg);
      appendLog("✗ " + msg + "\n");
    } finally {
      setBusy(false);
    }
  }

  /* 读取设备串口输出：先断开 esptool（释放端口），再以裸 reader 流式读 */
  async function startMonitor() {
    if (!portRef.current) return;
    setMonOn(false);
    await stopReader();
    try { await espRef.current?.transport?.disconnect(); } catch {}
    espRef.current = null;
    setConnected(false);
    await sleep(150);
    try {
      await portRef.current.open({ baudRate: Number(baud) });
    } catch (e) {
      appendLog("✗ 打开串口失败：" + (e?.message || e) + "\n");
      return;
    }
    const reader = portRef.current.readable.getReader();
    readerRef.current = reader;
    setMonOn(true);
    appendLog(`— 读取设备输出 @ ${baud} baud —\n`);
    const dec = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        appendLog(dec.decode(value));
      }
    } catch {}
    setMonOn(false);
    readerRef.current = null;
    try { await portRef.current?.close(); } catch {}
  }

  function toggleMonitor() {
    if (monOn) { stopReader().then(() => setMonOn(false)); }
    else { startMonitor(); }
  }

  const showProgress = busy || progress > 0;
  const canFlash = connected && sel && !busy;

  return (
    <div className={`${styles.flasher} scroll-mt-28`} id="esp-flasher">
      <div className={styles.wrap}>
        <div className={styles.introBlock}>
          <Glow as="h2">{T.h2}</Glow>
          <p>{T.p}</p>
        </div>

        <section className={styles.workspace}>
          <div className={styles.workspaceInner}>
            <div className={styles.topGrid}>
              {/* 左：设备卡 + 工具 */}
              <div className={styles.leftPanel}>
                <div className={styles.deviceCard}>
                  <div className={styles.boardGlyph} />
                  <div className={styles.deviceChip}>{connected ? chip : board.chip}</div>
                  <div className={`${styles.deviceStatus} ${connected ? styles.on : ""}`}>
                    {connected ? T.connected : T.disconnected}
                  </div>
                  <label className={styles.boardPicker}>
                    <span>{T.boardLabel}</span>
                    <select value={boardId} onChange={(e) => setBoardId(e.target.value)} aria-label={T.boardLabel} disabled={connected}>
                      {ESP_BOARDS.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.toolRow}>
                  <button
                    type="button"
                    className={`${styles.connectBtn} ${connected ? styles.connected : ""}`}
                    onClick={handleConnect}
                    disabled={busy || !supported}
                  >
                    {connected ? T.disconnect : T.connect}
                  </button>
                  <button
                    type="button"
                    className={styles.flashBtn}
                    onClick={() => handleFlash()}
                    disabled={!canFlash}
                  >
                    {busy ? T.flashing : T.flash}
                  </button>
                </div>

                {!supported && <div className={styles.monEmpty}>{T.unsupported}</div>}
                {error && <div className={styles.monEmpty} style={{ color: "var(--brand-red, #e1554f)" }}>✗ {error}</div>}
                {flashed && !busy && (
                  <div className={styles.monEmpty} style={{ color: "var(--brand-green, #16b66a)" }}>✓ {T.success}</div>
                )}

                {showProgress && (
                  <div className={styles.progress}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <div className={styles.progressMeta}>
                      <span>{busy ? T.writing : T.finished}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 右：日志 / 串口 */}
              <div className={styles.monitor}>
                <div className={styles.monBar}>
                  <div className={styles.monBarLeft}>
                    <span className={styles.monDot} data-on={monOn ? "1" : "0"} />
                    <strong>{T.monTitle}</strong>
                  </div>
                  <div className={styles.monBarRight}>
                    <label className={styles.baudPicker}>
                      <span>{T.baud}</span>
                      <select value={baud} onChange={(e) => setBaud(e.target.value)} disabled={!supported}>
                        {["9600", "115200", "230400", "460800"].map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className={styles.monBtn}
                      onClick={toggleMonitor}
                      disabled={!supported || (!portRef.current && !monOn)}
                    >
                      {monOn ? T.monPause : T.readOutput}
                    </button>
                    <button
                      type="button"
                      className={`${styles.monBtn} ${styles.monBtnGhost}`}
                      onClick={clearLog}
                      disabled={!logLines.length}
                    >
                      {T.monClear}
                    </button>
                  </div>
                </div>
                <div className={styles.monScreen}>
                  {logLines.length ? (
                    logLines.map((ln, i) => (
                      <pre key={i} className={styles.monLine}>{ln}</pre>
                    ))
                  ) : (
                    <div className={styles.monEmpty}>{supported ? T.monHint : T.unsupported}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 统计卡 */}
            <div className={styles.statsRow}>
              <div className={`${styles.stat} ${stats.time !== "—" && stats.time !== "…" ? styles.accent : ""}`}>
                <span className={styles.statLabel}>{T.statTime}</span>
                <span className={styles.statValue}>{stats.time}{stats.time !== "—" && stats.time !== "…" ? <small>s</small> : null}</span>
                <span className={styles.statHint}>{stats.time === "—" ? T.notFlashed : T.thisRun}</span>
              </div>
              <div className={`${styles.stat} ${stats.speed !== "—" && stats.speed !== "…" ? styles.accent : ""}`}>
                <span className={styles.statLabel}>{T.statSpeed}</span>
                <span className={styles.statValue}>{stats.speed}{stats.speed !== "—" && stats.speed !== "…" ? <small>KB/s</small> : null}</span>
                <span className={styles.statHint}>{stats.speed === "—" ? T.notFlashed : T.thisRun}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{T.statChip}</span>
                <span className={styles.statValue} style={{ fontSize: 22 }}>{connected ? chip : "—"}</span>
                <span className={styles.statHint}>{board.hint}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{T.statSize}</span>
                <span className={styles.statValue} style={{ fontSize: 22 }}>{stats.size}</span>
                <span className={styles.statHint}>{sel ? pick(sel.name) : T.noFw}</span>
              </div>
            </div>

            {/* 固件列表 */}
            <div className={styles.fwList}>
              <div className={styles.fwHead}>
                <span>{T.fwHead}</span>
                <span>{T.fwVer}</span>
                <span>{T.fwSize}</span>
                <span style={{ justifySelf: "end" }}>{T.fwAction}</span>
              </div>
              {fwList.length ? fwList.map((f) => (
                <div key={f.id} className={styles.fwRow}>
                  <div className={styles.fwName}>
                    <strong>{pick(f.name)}</strong>
                    <span>{pick(f.desc)}</span>
                  </div>
                  <span className={styles.fwVer}>{f.ver}</span>
                  <span className={styles.fwSize}>~{(254016 / 1024).toFixed(0)} KB</span>
                  <button
                    type="button"
                    className={styles.fwFlash}
                    onClick={() => handleFlash(f)}
                    disabled={!connected || busy}
                  >
                    {busy ? T.flashingRow : T.flash}
                  </button>
                </div>
              )) : (
                <div className={styles.fwRow}>
                  <div className={styles.fwName}>
                    <strong>{T.noFw}</strong>
                    <span>{board.name}</span>
                  </div>
                  <span className={styles.fwVer}>—</span>
                  <span className={styles.fwSize}>—</span>
                  <button type="button" className={styles.fwFlash} disabled>—</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
