"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import { ToolPageIntro } from "../tool-page-intro";
import { withBase } from "../../lib/basePath";
import styles from "./esp-flasher.module.css";

/* 真实固件列表 —— 目前 PoC 提供 XIAO ESP32-S3 的 Blink 示例
   （由 PlatformIO 编译，闪烁 GPIO21 用户 LED 并经串口 115200 输出日志）。
   固件源在项目根 firmware/<板型全名>/ 维护（如 firmware/xiao-esp32-s3/，
   ESP 系列还有 xiao-esp32-c3/c5/c6，按板补 .bin）；
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
];

/* 可选板型（ESP 系列）；PoC 暂仅 ESP32-S3 提供真实固件 */
const ESP_BOARDS = [
  { id: "s3", name: "XIAO ESP32-S3", chip: "ESP32-S3", hint: "Dual Core · Wi-Fi + BLE", hasFw: true },
  { id: "c3", name: "XIAO ESP32-C3", chip: "ESP32-C3", hint: "RISC-V · Wi-Fi 4 + BLE 5", hasFw: false },
  { id: "c6", name: "XIAO ESP32-C6", chip: "ESP32-C6", hint: "RISC-V · Wi-Fi 6 + Thread", hasFw: false },
  { id: "c5", name: "XIAO ESP32-C5", chip: "ESP32-C5", hint: "RISC-V · Wi-Fi 6 + BLE 5", hasFw: false },
];

const HA_FLASHER_URL = "https://seeed-projects.github.io/Seeed-Homeassistant-Discovery/flasher/";

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
  const [firmwareId, setFirmwareId] = useState("s3-blink");
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
  const sel = fwList.find((f) => f.id === firmwareId) ?? fwList[0];

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
    const supportTimer = setTimeout(() => {
      setSupported(typeof navigator !== "undefined" && "serial" in navigator);
    }, 0);
    return () => {
      clearTimeout(supportTimer);
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
    h2: lang === "zh" ? "在线烧录" : "Flash",
    p: lang === "zh"
      ? "选择烧录方式，然后按三个步骤完成固件写入。"
      : "Choose a flashing path, then install firmware in three clear steps.",
    espEntry: lang === "zh" ? "ESP 在线烧录" : "Web Flasher",
    espEntryHint: lang === "zh" ? "在浏览器中连接并烧录 XIAO ESP 系列" : "Connect and flash XIAO ESP boards in the browser",
    haEntry: lang === "zh" ? "HA 固件烧录" : "HA Firmware Flasher",
    haEntryHint: lang === "zh" ? "跳转到 Home Assistant 烧录工具" : "Open the Home Assistant flashing tool",
    openExternal: lang === "zh" ? "打开外部烧录页 ↗" : "Open external flasher ↗",
    quickTitle: lang === "zh" ? "三步完成烧录" : "Flash in three steps",
    stepOne: lang === "zh" ? "用 USB 连接设备" : "Connect the board over USB",
    stepOneHint: lang === "zh" ? "使用支持数据传输的 USB 线，并允许浏览器访问串口。" : "Use a data-capable USB cable and allow browser serial access.",
    stepTwo: lang === "zh" ? "选择开发板和固件" : "Choose board and firmware",
    stepTwoHint: lang === "zh" ? "确认你的 XIAO 型号，再选择与它匹配的固件。" : "Match the XIAO model, then choose compatible firmware.",
    stepThree: lang === "zh" ? "开始烧录" : "Flash the firmware",
    stepThreeHint: lang === "zh" ? "确认选择后开始写入，完成前不要拔出设备。" : "Start writing and keep the board connected until it finishes.",
    actionTitle: lang === "zh" ? "准备设备" : "Prepare your board",
    firmwareLabel: lang === "zh" ? "固件" : "Firmware",
    advancedTitle: lang === "zh" ? "烧录详情与串口工具" : "Flash details and serial tools",
    advancedHint: lang === "zh" ? "需要排查问题或查看输出时，再使用这里的信息。" : "Use these details only when you need diagnostics or device output.",
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
      // Browser operation timing is intentionally sampled inside this user action.
      // eslint-disable-next-line react-hooks/purity
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
      // eslint-disable-next-line react-hooks/purity
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
      <ToolPageIntro title={T.h2} description={T.p} />
      <div className={styles.wrap}>
        <nav className={styles.flashEntries} aria-label={lang === "zh" ? "选择烧录方式" : "Choose flashing method"}>
          <a className={`${styles.flashEntry} ${styles.active}`} href="#esp-workflow">
            <span>ESP</span>
            <strong>{T.espEntry}</strong>
            <small>{T.espEntryHint}</small>
          </a>
          <a className={styles.flashEntry} href={HA_FLASHER_URL} target="_blank" rel="noopener noreferrer">
            <span>HA</span>
            <strong>{T.haEntry}</strong>
            <small>{T.haEntryHint} · {T.openExternal}</small>
          </a>
        </nav>

        <section className={styles.quickWorkspace} id="esp-workflow">
          <div className={styles.actionPanel}>
            <div className={styles.actionHead}>
              <div><span className={styles.sectionLabel}>ESP / QUICK FLASH</span><Glow as="h3">{T.quickTitle}</Glow></div>
              <span className={`${styles.connectionState} ${connected ? styles.on : ""}`}>
                {connected ? T.connected : T.disconnected}
              </span>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepIntro}>
                <b>01</b>
                <div><strong>{T.stepOne}</strong><p>{T.stepOneHint}</p></div>
              </div>
              <button
                type="button"
                className={`${styles.connectBtn} ${connected ? styles.connected : ""}`}
                onClick={handleConnect}
                disabled={busy || !supported}
              >
                {connected ? T.disconnect : T.connect}
              </button>
              {!supported && <div className={styles.inlineMessage}>{T.unsupported}</div>}
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepIntro}>
                <b>02</b>
                <div><strong>{T.stepTwo}</strong><p>{T.stepTwoHint}</p></div>
              </div>
              <div className={styles.selectionGrid}>
                <label className={styles.simpleField}>
                  <span>{T.boardLabel}</span>
                  <select
                    value={boardId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setBoardId(next);
                      setFirmwareId(FIRMWARES.find((f) => f.boards.includes(next))?.id ?? "");
                    }}
                    disabled={busy}
                  >
                    {ESP_BOARDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <small>{board.hint}</small>
                </label>

                <label className={styles.simpleField}>
                  <span>{T.firmwareLabel}</span>
                  <select value={sel?.id ?? ""} onChange={(e) => setFirmwareId(e.target.value)} disabled={!fwList.length || busy}>
                    {fwList.length
                      ? fwList.map((f) => <option key={f.id} value={f.id}>{pick(f.name)} · {f.ver}</option>)
                      : <option value="">{T.noFw}</option>}
                  </select>
                  <small>{sel ? pick(sel.desc) : T.noFw}</small>
                </label>
              </div>
            </div>

            <div className={styles.workflowStep}>
              <div className={styles.stepIntro}>
                <b>03</b>
                <div><strong>{T.stepThree}</strong><p>{T.stepThreeHint}</p></div>
              </div>
              <button type="button" className={styles.flashBtn} onClick={() => handleFlash()} disabled={!canFlash}>
                {busy ? T.flashing : T.flash}
              </button>
              {error && <div className={`${styles.inlineMessage} ${styles.error}`}>✗ {error}</div>}
              {flashed && !busy && <div className={`${styles.inlineMessage} ${styles.success}`}>✓ {T.success}</div>}
              {showProgress && (
                <div className={styles.progress}>
                  <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
                  <div className={styles.progressMeta}><span>{busy ? T.writing : T.finished}</span><span>{progress}%</span></div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.advancedSection}>
          <div className={styles.advancedHead}>
            <div><span className={styles.sectionLabel}>DETAILS / SERIAL</span><h3>{T.advancedTitle}</h3></div>
            <p>{T.advancedHint}</p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}><span className={styles.statLabel}>{T.statTime}</span><span className={styles.statValue}>{stats.time}{stats.time !== "—" && stats.time !== "…" ? <small>s</small> : null}</span></div>
            <div className={styles.stat}><span className={styles.statLabel}>{T.statSpeed}</span><span className={styles.statValue}>{stats.speed}{stats.speed !== "—" && stats.speed !== "…" ? <small>KB/s</small> : null}</span></div>
            <div className={styles.stat}><span className={styles.statLabel}>{T.statChip}</span><span className={styles.statValue}>{connected ? chip : "—"}</span></div>
            <div className={styles.stat}><span className={styles.statLabel}>{T.statSize}</span><span className={styles.statValue}>{stats.size}</span></div>
          </div>

          <div className={styles.monitor}>
            <div className={styles.monBar}>
              <div className={styles.monBarLeft}><span className={styles.monDot} data-on={monOn ? "1" : "0"} /><strong>{T.monTitle}</strong></div>
              <div className={styles.monBarRight}>
                <label className={styles.baudPicker}><span>{T.baud}</span><select value={baud} onChange={(e) => setBaud(e.target.value)} disabled={!supported}>{["9600", "115200", "230400", "460800"].map((b) => <option key={b} value={b}>{b}</option>)}</select></label>
                <button type="button" className={styles.monBtn} onClick={toggleMonitor} disabled={!supported || (!connected && !monOn)}>{monOn ? T.monPause : T.readOutput}</button>
                <button type="button" className={`${styles.monBtn} ${styles.monBtnGhost}`} onClick={clearLog} disabled={!logLines.length}>{T.monClear}</button>
              </div>
            </div>
            <div className={styles.monScreen}>
              {logLines.length ? logLines.map((ln, i) => <pre key={i} className={styles.monLine}>{ln}</pre>) : <div className={styles.monEmpty}>{supported ? T.monHint : T.unsupported}</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
