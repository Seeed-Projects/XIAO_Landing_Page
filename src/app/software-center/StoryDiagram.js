"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./software-center.module.css";

/**
 * Plays a flagship diagram while it is on screen, and resets it after it leaves.
 * 旗舰示意图在进入画面时播放，离开后回到起点。
 */
export function StoryDiagram({ id, lang = "en" }) {
  const ref = useRef(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setPlay(entry.isIntersecting && entry.intersectionRatio >= 0.28);
        });
      },
      { threshold: [0, 0.28, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Diagram = DIAGRAMS[id] ?? HaDiagram;
  return (
    <div ref={ref} className={styles.stage} data-play={play ? "1" : "0"} data-diagram={id}>
      <Diagram lang={lang} />
    </div>
  );
}

const COPY = {
  en: { temp: "Temp", led: "LED", assist: "Assist", deploy: "Deploy", live: "Live", object: "object", mic: "Mic" },
  zh: { temp: "温度", led: "灯", assist: "助手", deploy: "部署", live: "实况", object: "目标", mic: "麦克风" },
};

function words(lang) {
  return COPY[lang] ?? COPY.en;
}

function Paper({ children }) {
  return (
    <svg viewBox="0 0 720 440" className={styles.art} aria-hidden="true">
      <defs>
        <pattern id="sw-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0v24" className={styles.grid} />
        </pattern>
      </defs>
      <rect width="720" height="440" className={styles.paper} />
      <rect width="720" height="440" fill="url(#sw-grid)" />
      {children}
    </svg>
  );
}

function HaDiagram({ lang }) {
  const text = words(lang);
  return (
    <Paper>
      <g>
        <rect x="44" y="62" width="206" height="300" rx="22" className={styles.device} />
        <text x="66" y="102" className={styles.deviceTitle}>XIAO</text>
        <circle cx="147" cy="170" r="28" className={styles.sensor} />
        <path d="M135 170h24M147 158v24" className={styles.sensorMark} />
        <text x="66" y="232" className={styles.deviceLabel}>{text.temp}</text>
        <text x="66" y="262" className={styles.deviceValue}>23.4°</text>
        <circle cx="86" cy="316" r="14" data-part="led" className={styles.led} />
        <text x="112" y="322" className={styles.deviceLabel}>{text.led}</text>
      </g>

      <g>
        <path d="M274 152c28 18 28 48 0 66" data-part="wave" data-order="1" className={styles.wave} />
        <path d="M292 136c46 28 46 78 0 106" data-part="wave" data-order="2" className={styles.wave} />
        <path d="M310 120c64 38 64 112 0 150" data-part="wave" data-order="3" className={styles.wave} />
        <circle cx="274" cy="188" r="7" data-part="packet" className={styles.packet} />
      </g>

      <g>
        <rect x="392" y="52" width="286" height="330" rx="22" className={styles.screenCard} />
        <path d="M392 74a22 22 0 0 1 22-22h242a22 22 0 0 1 22 22v32H392z" className={styles.screenHead} />
        <circle cx="420" cy="79" r="6" className={styles.dot} />
        <text x="436" y="84" className={styles.onHead}>Home Assistant</text>

        <rect x="416" y="132" width="238" height="78" rx="14" className={styles.row} />
        <text x="434" y="162" className={styles.screenLabel}>{text.temp}</text>
        <text x="434" y="190" data-part="read" data-order="1" className={styles.read}>21.6°</text>
        <text x="434" y="190" data-part="read" data-order="2" className={styles.read}>22.8°</text>
        <text x="434" y="190" data-part="read" data-order="3" className={styles.read}>23.4°</text>

        <rect x="416" y="228" width="238" height="78" rx="14" className={styles.row} />
        <text x="434" y="274" className={styles.screenLabel}>{text.led}</text>
        <rect x="558" y="252" width="70" height="34" rx="17" className={styles.rail} />
        <circle cx="580" cy="269" r="12" data-part="knob" className={styles.knob} />
      </g>
    </Paper>
  );
}

const ZEPHYR_BOARDS = [
  ["SAMD21", true],
  ["52840", true],
  ["nRF54", true],
  ["MG24", true],
  ["2040", true],
  ["2350", true],
  ["C3", true],
  ["S3", true],
  ["C6", true],
  ["RA4", true],
  ["C5", false],
];

function ZephyrDiagram() {
  const cmd = "seeed-zephyr flash xiao_esp32c6";
  return (
    <Paper>
      <rect x="32" y="40" width="396" height="196" rx="18" className={styles.terminal} />
      <circle cx="56" cy="64" r="5" className={styles.termDot} />
      <circle cx="74" cy="64" r="5" className={styles.termDot} />
      <circle cx="92" cy="64" r="5" className={styles.termDot} />
      <text x="52" y="112" className={styles.cmd}>
        <tspan className={styles.prompt}>$ </tspan>
        {cmd.split("").map((ch, index) => (
          <tspan
            key={`${ch}-${index}`}
            data-part="char"
            style={{ animationDelay: `${0.08 + index * 0.045}s` }}
          >
            {ch === " " ? "\u00a0" : ch}
          </tspan>
        ))}
        <tspan data-part="cursor">▍</tspan>
      </text>
      <rect x="52" y="172" width="300" height="12" rx="6" className={styles.trackDark} />
      <rect x="52" y="172" width="300" height="12" rx="6" data-part="bar" className={styles.bar} />

      <rect x="32" y="272" width="168" height="132" rx="18" className={styles.device} />
      <text x="52" y="312" className={styles.deviceTitle}>XIAO</text>
      <circle cx="74" cy="356" r="16" data-part="led" className={styles.led} />
      <text x="100" y="362" className={styles.deviceLabel}>C6</text>

      {ZEPHYR_BOARDS.map(([label, tested], index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 456 + col * 62;
        const y = 40 + row * 96;
        return (
          <g key={label} transform={`translate(${x} ${y})`}>
            <rect width="54" height="78" rx="10" className={tested ? styles.mini : styles.miniWait} />
            <text x="27" y="46" textAnchor="middle" className={styles.miniLabel}>{label}</text>
            {tested ? (
              <path
                d="M18 62l6 6 12-14"
                data-part="mark"
                style={{ animationDelay: `${2.5 + index * 0.12}s` }}
                className={styles.mark}
              />
            ) : (
              <text x="27" y="68" textAnchor="middle" className={styles.waitMark}>–</text>
            )}
          </g>
        );
      })}
    </Paper>
  );
}

function EspHomeDiagram({ lang }) {
  const text = words(lang);
  return (
    <Paper>
      <path d="M78 150c-28 28-28 92 0 120" data-part="mic" data-order="2" className={styles.wave} />
      <path d="M98 168c-18 18-18 64 0 84" data-part="mic" data-order="1" className={styles.wave} />
      <rect x="112" y="176" width="52" height="88" rx="26" className={styles.device} />
      <text x="112" y="292" className={styles.deviceLabel}>{text.mic}</text>

      <rect x="220" y="150" width="170" height="140" rx="20" className={styles.device} />
      <text x="262" y="230" className={styles.deviceTitle}>XIAO</text>
      <circle cx="305" cy="210" r="8" data-part="packet" className={styles.packet} />

      <g data-part="bubble">
        <rect x="430" y="78" width="250" height="100" rx="22" className={styles.screenCard} />
        <path d="M500 178 l16 24 10-24" className={styles.bubbleTail} />
        <text x="458" y="136" className={styles.screenTitle}>{text.assist}</text>
      </g>

      <rect x="470" y="250" width="42" height="78" rx="8" className={styles.device} />
      <path d="M512 258 v62" className={styles.speakerPost} />
      <path d="M530 262c18 16 18 48 0 64" data-part="speak" data-order="1" className={styles.wave} />
      <path d="M552 246c30 24 30 80 0 104" data-part="speak" data-order="2" className={styles.wave} />
    </Paper>
  );
}

function SenseCraftDiagram({ lang }) {
  const text = words(lang);
  return (
    <Paper>
      <rect x="36" y="48" width="300" height="250" rx="18" className={styles.view} />
      <circle cx="168" cy="168" r="46" className={styles.blob} />
      <rect x="108" y="112" width="128" height="112" rx="8" data-part="box" className={styles.box} />
      <text x="116" y="104" data-part="tag" className={styles.tag}>{text.object}</text>
      <text x="52" y="332" className={styles.deviceLabel}>XIAO ESP32S3 Sense</text>

      <rect x="380" y="48" width="300" height="250" rx="18" className={styles.screenCard} />
      <text x="404" y="92" className={styles.screenTitle}>{text.deploy}</text>
      <rect x="404" y="116" width="220" height="14" rx="7" className={styles.rail} />
      <rect x="404" y="116" width="220" height="14" rx="7" data-part="bar" className={styles.bar} />
      <g data-part="preview">
        <rect x="404" y="156" width="220" height="110" rx="12" className={styles.view} />
        <circle cx="500" cy="206" r="24" className={styles.blob} />
        <rect x="468" y="176" width="70" height="60" rx="6" className={styles.boxStatic} />
        <text x="404" y="292" className={styles.screenLabel}>{text.live}</text>
      </g>
    </Paper>
  );
}

const DIAGRAMS = {
  ha: HaDiagram,
  zephyr: ZephyrDiagram,
  esphome: EspHomeDiagram,
  sensecraft: SenseCraftDiagram,
};
