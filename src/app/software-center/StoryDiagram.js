"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const gridId = useId();
  return (
    <svg viewBox="0 0 720 440" className={styles.art} aria-hidden="true">
      <defs>
        <pattern id={gridId} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0v24" className={styles.grid} />
        </pattern>
      </defs>
      <rect width="720" height="440" className={styles.paper} />
      <rect width="720" height="440" fill={`url(#${gridId})`} />
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

/** Draws a shared software workspace connected to three hardware outcomes. 软件工作区连接三类硬件用途。 */
function PlatformDiagram({ title, lines, targets, footer, display = false }) {
  return (
    <Paper>
      <rect x="36" y="88" width="320" height="250" rx="18" className={styles.terminal} />
      <circle cx="60" cy="112" r="5" className={styles.termDot} />
      <circle cx="78" cy="112" r="5" className={styles.termDot} />
      <circle cx="96" cy="112" r="5" className={styles.termDot} />
      <text x="58" y="156" className={styles.deviceTitle}>{title}</text>
      {lines.map((line, index) => (
        <text key={line} x="58" y={194 + index * 30} className={styles.cmd}
          data-part="char" style={{ animationDelay: `${index * 0.35}s` }}>{line}</text>
      ))}
      <rect x="58" y="304" width="270" height="8" rx="4" className={styles.trackDark} />
      <rect x="58" y="304" width="270" height="8" rx="4" data-part="progress" className={styles.bar} />
      <path d="M356 212H410M410 100V324M410 100H468M410 212H468M410 324H468"
        className={styles.connection} />
      {targets.map(([name, detail], index) => (
        <g key={name} transform={`translate(468 ${56 + index * 112})`}>
          <rect width="214" height="88" rx="14" className={styles.device} />
          {display ? (
            <>
              <rect x="14" y="17" width="54" height="50" rx="5" className={styles.screenCard} />
              <rect x="21" y="25" width="40" height="6" rx="2" className={styles.bar} />
              <path d="M22 52l9-10 9 7 15-13" data-part="mark"
                style={{ animationDelay: `${1 + index * 0.3}s` }} className={styles.mark} />
            </>
          ) : (
            <>
              <rect x="20" y="22" width="38" height="42" rx="5" className={styles.mini} />
              <path d="M14 28h6m-6 12h6m-6 12h6m38-24h6m-6 12h6m-6 12h6" className={styles.sensorMark} />
              <path d="M29 43l6 6 12-14" data-part="mark"
                style={{ animationDelay: `${1 + index * 0.3}s` }} className={styles.mark} />
            </>
          )}
          <text x="80" y="38" className={styles.onHead}>{name}</text>
          <text x="80" y="61" className={styles.deviceLabel}>{detail}</text>
        </g>
      ))}
      <text x="360" y="407" textAnchor="middle" className={styles.deviceLabel}>{footer}</text>
    </Paper>
  );
}

function ZephyrDiagram() {
  return <PlatformDiagram title="VS Code + Zephyr"
    lines={["Select XIAO", "Create from example", "Build  /  Flash  /  Monitor"]}
    targets={[["XIAO nRF", "Nordic"], ["XIAO ESP32", "Espressif"], ["XIAO RP", "Raspberry Pi"]]}
    footer="One development platform. Different chip families." />;
}

function GfxDiagram() {
  return <PlatformDiagram title="Seeed GFX2"
    lines={["Text + images", "Graphics + sprites", "Seeed_GFX API"]}
    targets={[["LCD", "Color UI"], ["OLED", "Compact UI"], ["E-paper", "Low power"]]}
    footer="One graphics interface across Seeed display products." display />;
}

function EspHomeDiagram() {
  return <PlatformDiagram title="XIAO + ESPHome"
    lines={["Product configuration", "Drivers + components", "Firmware installation"]}
    targets={[["Soil monitor", "Plant care"], ["IoT button", "Home controls"], ["Energy meter", "Power monitoring"]]}
    footer="Product firmware that brings gadgets into Home Assistant." />;
}

function MicroPythonDiagram() {
  return <PlatformDiagram title="MicroPython / REPL"
    lines={[">>> from machine import Pin", ">>> led = Pin(1, Pin.OUT)", ">>> led.value(1)"]}
    targets={[["XIAO", "Board firmware"], ["Sensors", "Drivers + examples"], ["Prototype", "Test + iterate"]]}
    footer="Write Python. Try it on hardware. Refine your idea." />;
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
  gfx2: GfxDiagram,
  esphome: EspHomeDiagram,
  micropython: MicroPythonDiagram,
  sensecraft: SenseCraftDiagram,
};
