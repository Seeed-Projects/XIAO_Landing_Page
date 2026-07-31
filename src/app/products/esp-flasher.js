"use client";

import { useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import styles from "./esp-flasher.module.css";

/* 固件列表 —— 第一项为出厂固件 */
const FIRMWARES = [
  { id: "factory", name: { en: "Factory Firmware", zh: "出厂固件" }, desc: { en: "Default factory firmware", zh: "默认出厂烧录" }, ver: "v1.0.0", size: "1.28 MB", ms: 9800, kbps: 412 },
  { id: "blink", name: { en: "Blink Demo", zh: "Blink 闪烁示例" }, desc: { en: "Arduino blink — getting started", zh: "Arduino blink · 入门演示" }, ver: "v1.2.0", size: "0.42 MB", ms: 3600, kbps: 364 },
  { id: "matter", name: { en: "Matter Gateway", zh: "Matter 网关" }, desc: { en: "Matter over Thread — smart home", zh: "Matter over Thread · 智能家居" }, ver: "v0.9.1", size: "1.64 MB", ms: 12400, kbps: 512 },
  { id: "tinyml", name: { en: "TinyML Inference", zh: "TinyML 推理" }, desc: { en: "Person detection — TensorFlow Lite Micro", zh: "Person detection · TensorFlow Lite Micro" }, ver: "v0.3.2", size: "0.86 MB", ms: 6200, kbps: 430 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 可选板型（ESP 系列） */
const ESP_BOARDS = [
  { id: "s3", name: "XIAO ESP32-S3", chip: "ESP32-S3", hint: "Dual Core · Wi-Fi + BLE" },
  { id: "c3", name: "XIAO ESP32-C3", chip: "ESP32-C3", hint: "RISC-V · Wi-Fi 4 + BLE 5" },
  { id: "c6", name: "XIAO ESP32-C6", chip: "ESP32-C6", hint: "RISC-V · Wi-Fi 6 + Thread/Zigbee" },
  { id: "c5", name: "XIAO ESP32-C5", chip: "ESP32-C5", hint: "RISC-V · Wi-Fi 6 + BLE 5" },
];

export function ESPFlasher() {
  const { lang } = useLang();
  const [connected, setConnected] = useState(false);
  const [selId, setSelId] = useState("factory");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ time: "—", speed: "—", chip: "—", size: "—" });
  const [boardId, setBoardId] = useState("s3");
  const board = ESP_BOARDS.find((b) => b.id === boardId) ?? ESP_BOARDS[0];

  const sel = FIRMWARES.find((f) => f.id === selId);
  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  const T = {
    eyebrow: lang === "zh" ? "ESP 在线烧录" : "ESP Flasher",
    h2: lang === "zh" ? "ESP 在线烧录器" : "ESP Flasher",
    p: lang === "zh"
      ? "浏览器内直接给 ESP 设备烧录固件，无需安装工具。选好设备与固件，一键烧录，实时显示耗时、速率与芯片信息。"
      : "Flash ESP devices straight from the browser — no esptool or Arduino IDE. Pick a port, add firmware, hit Flash, and see timing, speed and chip info in real time.",
    connect: lang === "zh" ? "连接" : "Connect",
    disconnect: lang === "zh" ? "断开" : "Disconnect",
    flash: lang === "zh" ? "烧录" : "Flash",
    flashing: lang === "zh" ? "烧录中…" : "Flashing…",
    writing: lang === "zh" ? "烧录中…" : "Writing…",
    finished: lang === "zh" ? "完成" : "Finished",
    connected: lang === "zh" ? "已连接 · /dev/tty.usbmodem" : "Connected · /dev/tty.usbmodem",
    disconnected: lang === "zh" ? "未连接" : "Disconnected",
    chooseFile: lang === "zh" ? "选择文件" : "Choose file",
    noFile: lang === "zh" ? "未选择文件" : "No file chosen",
    addRow: lang === "zh" ? "+ 添加固件分区" : "+ Add firmware partition",
    statTime: lang === "zh" ? "烧录时间" : "Flash Time",
    statSpeed: lang === "zh" ? "烧录速度" : "Flash Speed",
    statChip: lang === "zh" ? "芯片型号" : "Chip",
    statSize: lang === "zh" ? "固件大小" : "Size",
    notFlashed: lang === "zh" ? "尚未烧录" : "Not flashed yet",
    thisRun: lang === "zh" ? "本次耗时" : "This run",
    avgSpeed: lang === "zh" ? "平均速率" : "Average speed",
    fwHead: lang === "zh" ? "固件" : "Firmware",
    fwVer: lang === "zh" ? "版本" : "Version",
    fwSize: lang === "zh" ? "大小" : "Size",
    fwAction: lang === "zh" ? "操作" : "Action",
    flashingRow: lang === "zh" ? "烧录中" : "Flashing",
    boardLabel: lang === "zh" ? "板型" : "Board",
  };

  async function handleConnect() {
    if (busy) return;
    if (connected) {
      setConnected(false);
      setStats({ time: "—", speed: "—", chip: "—", size: "—" });
      setProgress(0);
      return;
    }
    setBusy(true);
    setStats({ time: "—", speed: "—", chip: board.chip, size: "—" });
    await sleep(700);
    setConnected(true);
    setBusy(false);
  }

  async function handleFlash(fw) {
    if (!connected || busy) return;
    const target = fw ?? sel;
    setSelId(target.id);
    setBusy(true);
    setProgress(0);
    setStats({ time: "…", speed: "…", chip: board.chip, size: target.size });
    for (let p = 0; p <= 100; p += 5) {
      await sleep(target.ms / 20);
      setProgress(p);
    }
    setStats({
      time: (target.ms / 1000).toFixed(1),
      speed: target.kbps,
      chip: board.chip,
      size: target.size,
    });
    setBusy(false);
  }

  return (
    <div className={styles.flasher} id="esp-flasher">
      <div className={styles.wrap}>
        <div className={styles.introBlock}>
          <span className={styles.eyebrow}><span className={styles.eyebrowDot} /> {T.eyebrow}</span>
          <Glow as="h2">{T.h2}</Glow>
          <p>{T.p}</p>
        </div>

        <section className={styles.workspace}>
          <div className={styles.workspaceInner}>
            <div className={styles.topGrid}>
              {/* 左：设备预览 + 烧录工具 */}
              <div className={styles.leftPanel}>
                <div className={styles.deviceCard}>
                  <div className={styles.boardGlyph} />
                  <div className={styles.deviceChip}>{board.chip}</div>
                  <div className={`${styles.deviceStatus} ${connected ? styles.on : ""}`}>
                    {connected ? T.connected : T.disconnected}
                  </div>
                  <label className={styles.boardPicker}>
                    <span>{T.boardLabel}</span>
                    <select value={boardId} onChange={(e) => setBoardId(e.target.value)} aria-label={T.boardLabel}>
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
                    disabled={busy}
                  >
                    {connected ? T.disconnect : T.connect}
                  </button>
                  <button
                    type="button"
                    className={styles.flashBtn}
                    onClick={() => handleFlash()}
                    disabled={!connected || busy}
                  >
                    {busy ? T.flashing : T.flash}
                  </button>
                </div>

                {(busy || progress > 0) && (
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

              {/* 右：两列统计 */}
              <div className={styles.rightPanel}>
                <div className={`${styles.stat} ${stats.time !== "—" && stats.time !== "…" ? styles.accent : ""}`}>
                  <span className={styles.statLabel}>{T.statTime}</span>
                  <span className={styles.statValue}>{stats.time}{stats.time !== "—" && stats.time !== "…" ? <small>s</small> : null}</span>
                  <span className={styles.statHint}>{stats.time === "—" ? T.notFlashed : T.thisRun}</span>
                </div>
                <div className={`${styles.stat} ${stats.speed !== "—" && stats.speed !== "…" ? styles.accent : ""}`}>
                  <span className={styles.statLabel}>{T.statSpeed}</span>
                  <span className={styles.statValue}>{stats.speed}{stats.speed !== "—" && stats.speed !== "…" ? <small>KB/s</small> : null}</span>
                  <span className={styles.statHint}>{stats.speed === "—" ? T.notFlashed : T.avgSpeed}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{T.statChip}</span>
                  <span className={styles.statValue} style={{ fontSize: 22 }}>{stats.chip}</span>
                  <span className={styles.statHint}>{board.hint}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>{T.statSize}</span>
                  <span className={styles.statValue} style={{ fontSize: 22 }}>{stats.size}</span>
                  <span className={styles.statHint}>{sel ? pick(sel.name) : "—"}</span>
                </div>
              </div>
            </div>

            {/* 下：固件列表 */}
            <div className={styles.fwList}>
              <div className={styles.fwHead}>
                <span>{T.fwHead}</span>
                <span>{T.fwVer}</span>
                <span>{T.fwSize}</span>
                <span style={{ justifySelf: "end" }}>{T.fwAction}</span>
              </div>
              {FIRMWARES.map((f) => (
                <div key={f.id} className={`${styles.fwRow} ${f.id === selId ? styles.active : ""}`}>
                  <div className={styles.fwName}>
                    <strong>{pick(f.name)}</strong>
                    <span>{pick(f.desc)}</span>
                  </div>
                  <span className={styles.fwVer}>{f.ver}</span>
                  <span className={styles.fwSize}>{f.size}</span>
                  <button
                    type="button"
                    className={styles.fwFlash}
                    onClick={() => handleFlash(f)}
                    disabled={!connected || busy}
                  >
                    {busy && f.id === selId ? T.flashingRow : T.flash}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
