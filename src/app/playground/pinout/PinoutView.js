"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ToolPageIntro } from "../../tool-page-intro";
import { useLang } from "../../i18n";
import { withBase } from "../../../lib/basePath";
import {
  BOARD_CATEGORIES,
  BOARD_FUNCTION_NOTES,
  BOARD_LINKS,
  BOARDS,
  FN_COLOR,
  FN_LABEL,
  FUNCTIONS,
  LEGEND_ORDER,
  NEW_LEGEND_BOARDS,
  NEW_LEGEND_ORDER,
  PTC_LEGEND_BOARDS,
  CAN_LEGEND_BOARDS,
  codeName,
  functionKeysForPin,
  getBoard,
  localize,
  diagramBoxMatchesFilter,
  pinMatchesQuery,
} from "./data";
import styles from "./pinout.module.css";
import { placePinCard } from "./placePinCard.js";
import { boardFrameWidth } from "./diagramScale.js";

// Every board shows the shared keys; the #5c6bc0 chip colour is board-specific
// (PTC touch channels on samd21 series, CAN bus pins on stm32c5) and only the
// boards that carry those chips get the extra key.
const legendOrderFor = (boardId) => [
  ...(NEW_LEGEND_BOARDS.includes(boardId) ? NEW_LEGEND_ORDER : LEGEND_ORDER),
  ...(PTC_LEGEND_BOARDS.includes(boardId) ? ["ptc"] : []),
  ...(CAN_LEGEND_BOARDS.includes(boardId) ? ["can"] : []),
];

const STATUS_LABEL = {
  free: { en: "Free to use", zh: "空闲，可随意使用" },
  conditional: { en: "Use with care", zh: "有条件使用" },
  occupied: { en: "Onboard / occupied", zh: "已被板载占用" },
};

const CAP_LABEL = { adc: "ADC", dac: "DAC", i2c: "I²C", spi: "SPI", uart: "UART", pwm: "PWM", wake: "WAKE", touch: "TOUCH" };
const NOTE_TONE = { danger: styles.noteDanger, caution: styles.noteCaution, info: styles.noteInfo };
const ALT_ORDER = ["adc", "i2c", "spi", "uart", "pwm", "ptc", "can", "i2s", "other"];
const FRAMEWORK_LABEL = { arduino: "Arduino", micropython: "MicroPython", zephyr: "Zephyr", espidf: "ESP-IDF" };

function parseParams(search) {
  const params = new URLSearchParams(search);
  return { board: params.get("board") || "", pin: params.get("pin") || "" };
}

const subscribeNoop = () => () => {};
const readSearch = () => window.location.search;
const readServerSearch = () => "";
const readClient = () => true;
const readServer = () => false;
const categoryOf = (boardId) => BOARD_CATEGORIES.find((item) => item.boardIds.includes(boardId))?.id || "samd";

function writeParams(board, pin) {
  const url = new URL(window.location.href);
  url.searchParams.set("board", board);
  url.searchParams.delete("side");
  if (pin) url.searchParams.set("pin", pin);
  else url.searchParams.delete("pin");
  // Next.js syncs the router on every replaceState call even when the URL is
  // unchanged, and each sync re-renders the page; skipping no-op writes keeps
  // the URL effect from feeding that render loop.
  // Next 在每次 replaceState 时都会同步路由（即使 URL 没变），每次同步都会重渲
  // 页面；跳过无变化的写入，避免 URL 同步 effect 卷入渲染循环。
  if (url.href !== window.location.href) {
    window.history.replaceState(null, "", url);
  }
}

function onboardLabel(pin) {
  const name = pin.id.replaceAll("_", " ");
  return pin.names.silk && pin.names.silk !== "—" && pin.names.silk !== pin.id ? `${pin.names.silk} · ${name}` : name;
}

/**
 * nRF54 diagrams print each pad's MCU name (P1.04) beside its function label,
 * so on those boards the P-name is the primary pin name.
 * nRF54 系列图在每个焊盘旁印有 MCU 引脚名（P1.04），这些板以 P 名为主名称。
 */
const P_NAME_BOARDS = new Set(["nrf54l15", "nrf54l15sense", "nrf54lm20a", "nrf54lm20asense"]);
const isPadName = (value) => /^P\d+\.\d+$/.test(value || "");

/**
 * Debug pads on boards with two SWD ports print short silk (M_CLK / SWCLK2 /
 * S_DIO) that hides which chip the pad talks to; the card and row title show
 * the full "chip + signal" name instead. Only the title changes — pin ids,
 * URLs and deep links keep the short form.
 * 双 SWD 口板子的调试焊盘丝印很短（M_CLK / SWCLK2 / S_DIO），看不出连的是哪颗
 * 芯片；卡片与行标题改用完整的“芯片 + 信号”名。只改标题——引脚 id、URL 与深链
 * 接仍用短名。
 */
const MG24_DEBUG_TITLES = { M_CLK: "MG24 SWCLK", M_DIO: "MG24 SWDIO", M_RST: "MG24 RESET", S_CLK: "SAMD11 SWCLK", S_DIO: "SAMD11 SWDIO", S_RST: "SAMD11 RESET" };
const L15_DEBUG_TITLES = { SWCLK: "nRF54L15 SWCLK", SWDIO: "nRF54L15 SWDIO", nRST: "nRF54L15 RESET", SAMD11_SWCLK: "SAMD11 SWCLK", SAMD11_SWDIO: "SAMD11 SWDIO", SAMD11_RST: "SAMD11 RESET" };
const LM20A_DEBUG_TITLES = { SWCLK: "nRF54LM20A SWCLK", SWDIO: "nRF54LM20A SWDIO", RESET: "nRF54LM20A RESET", SWCLK2: "SAMD11 SWCLK", SWDIO2: "SAMD11 SWDIO", RST2: "SAMD11 RESET" };
const DEBUG_PIN_TITLES = {
  mg24: MG24_DEBUG_TITLES,
  mg24sense: MG24_DEBUG_TITLES,
  nrf54l15: L15_DEBUG_TITLES,
  nrf54l15sense: L15_DEBUG_TITLES,
  nrf54lm20a: LM20A_DEBUG_TITLES,
  nrf54lm20asense: LM20A_DEBUG_TITLES,
};

/**
 * Card title must match the row label the user clicked: the diagrams label
 * header pins by pad number (D0-D10 / A0 / SDA), so header pins show the pin
 * id; nRF54 boards print the MCU pad name (P1.04) on every row, so there the
 * pad name is the title; onboard entries keep their diagram label via
 * onboardLabel; dual-SWD debug pads get their full chip + signal name.
 * 卡片标题要与用户点击的行标签一致：图上排针按编号（D0-D10 / A0 / SDA）标注，
 * 排针引脚显示 id；nRF54 系列图上每行都印有焊盘名（P1.04），以焊盘名为标题；
 * 板载项沿用 onboardLabel 的图上名称；双 SWD 调试焊盘显示完整芯片+信号名。
 */
function cardTitle(pin, boardId) {
  if (pin.kind === "onboard") return onboardLabel(pin);
  const debugTitle = DEBUG_PIN_TITLES[boardId]?.[pin.id];
  if (debugTitle) return debugTitle;
  if (P_NAME_BOARDS.has(boardId) && isPadName(pin.names.chip)) return pin.names.chip;
  return pin.id.replaceAll("_", " ");
}

function relatedPins(board, pin) {
  const keys = ["i2c", "spi", "uart"].filter((key) => pin.fn === key || pin.caps?.[key]);
  if (!keys.length) return [];
  return board.pins.filter((item) => item.id !== pin.id && keys.some((key) => item.fn === key || item.caps?.[key]));
}

function summaryRows(board) {
  const seen = new Set();
  const rows = [];
  // "module" only exists on s3sense (Sense expansion board) and appends after
  // the two main-board faces; every other board skips it.
  // module 面仅 s3sense（Sense 扩展板）有，排在主板正反面之后；其他板自动跳过。
  for (const face of ["front", "back", "module"]) {
    for (const row of board.diagram?.[face]?.rows || []) {
      if (seen.has(row.id)) continue;
      const pin = board.pins.find((item) => item.id === row.id);
      if (!pin) continue;
      seen.add(row.id);
      rows.push({ pin, face, side: row.side });
    }
  }
  return rows;
}

function altCell(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(" · ");
  return value || "";
}

function sampleCode(pin, primer, framework) {
  if (pin.code) return pin.code;
  return primer?.code?.[framework] || primer?.code?.arduino || "";
}

/** Fit the full printed label inside its artwork box at the current font metrics.
 * 按当前字体尺寸将完整印刷标签缩放到原图框内。 */
function DiagramLabel({ box, visible, color }) {
  const textRef = useRef(null);
  const fontSize = box.h * 0.58;
  useLayoutEffect(() => {
    const label = textRef.current;
    if (!label) return;
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      label.setAttribute("font-size", fontSize);
      const width = label.getComputedTextLength();
      const available = Math.max(1, box.w - 12);
      if (width > available) label.setAttribute("font-size", fontSize * available / width);
    };
    fit();
    document.fonts.ready.then(fit);
    return () => { cancelled = true; };
  }, [box.text, box.w, fontSize]);
  return (
    <text
      ref={textRef}
      className={styles.diagramLabel}
      x={box.x + box.w / 2}
      y={box.y + box.h / 2}
      fontSize={fontSize}
      style={{ fill: color, opacity: visible ? 1 : 0 }}
      textAnchor="middle"
      dominantBaseline="central"
      aria-hidden="true"
    >
      {box.text}
    </text>
  );
}

/** Pick the higher-contrast label ink for the shared legend background.
 * 为共享图例底色选择对比度更高的标签文字颜色。 */
function diagramLabelColor(color) {
  const channels = color.slice(1).match(/.{2}/g).map((hex) => {
    const channel = parseInt(hex, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? "#18222f" : "#fff";
}

/**
 * Official diagram with a click / highlight layer over its label rows.
 * 官方引脚图，叠加一层可点击、可高亮的标签行。
 */
function DiagramStage({ diagram, board, selection, filter, query, lang, face, onSelect }) {
  const { crop, width, height, src, rows } = diagram;
  const filterColor = FN_COLOR[filter] || "#fff";
  const labelColor = diagramLabelColor(filterColor);
  const pinOf = (id) => board.pins.find((pin) => pin.id === id) || null;
  const rowLabel = (pin, id) => (pin ? cardTitle(pin, board.id) : id);
  return (
    <div className={styles.diagramStack}>
    <div className={styles.diagramFrame} data-diagram-frame="1" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
      <svg
        className={styles.diagram}
        viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={lang === "zh" ? `${board.name} ${face === "front" ? "正面" : face === "back" ? "背面" : "扩展板"}引脚图` : `${board.name} ${face === "module" ? "Sense module" : face} pinout`}
      >
      <image href={withBase(src)} width={width} height={height} />
      {rows.map((row, index) => {
        const pin = pinOf(row.id);
        const active = selection?.face === face && selection?.index === index && selection?.id === row.id;
        const queryDim = Boolean(query && (!pin || !pinMatchesQuery(pin, query)));
        const filterMatch = row.boxes.some((box) => diagramBoxMatchesFilter(box.cat, filter));
        const dim = queryDim || !filterMatch;
        const left = Math.min(...row.boxes.map((box) => box.x));
        const right = Math.max(...row.boxes.map((box) => box.x + box.w));
        const top = Math.min(...row.boxes.map((box) => box.y));
        const bottom = Math.max(...row.boxes.map((box) => box.y + box.h));
        const activate = (event) => {
          if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect({ face, side: row.side, index, id: row.id });
        };
        return (
          <g
            key={`${row.side}-${index}-${row.id}`}
            data-pin-row="1"
            className={`${styles.diagramRow} ${active ? styles.diagramRowActive : ""} ${filter && !dim ? styles.diagramRowFiltered : ""}`}
            style={{ "--pin-color": FN_COLOR[pin?.fn] || "#0f172a" }}
            role="button"
            tabIndex={0}
            aria-label={rowLabel(pin, row.id)}
            aria-pressed={active}
            onClick={activate}
            onKeyDown={activate}
          >
            <path
              className={styles.diagramBand}
              d={row.side === "left"
                ? `M ${left - 4} ${top - 3} H ${right + 8} L ${right + 14} ${(top + bottom) / 2} L ${right + 8} ${bottom + 3} H ${left - 4} Z`
                : `M ${left - 8} ${top - 3} H ${right + 4} V ${bottom + 3} H ${left - 8} L ${left - 14} ${(top + bottom) / 2} Z`}
            />
            <polygon
              className={`${styles.diagramMark} ${dim ? styles.diagramMarkDim : ""}`}
              points={row.side === "left"
                ? `${right + 6},${top - 1} ${right + 14},${(top + bottom) / 2} ${right + 6},${bottom + 1}`
                : `${left - 6},${top - 1} ${left - 14},${(top + bottom) / 2} ${left - 6},${bottom + 1}`}
            />
            {row.boxes.map((box, boxIndex) => {
              const repaint = Boolean(filter && !dim && diagramBoxMatchesFilter(box.cat, filter));
              return (
                <g key={boxIndex}>
                  <polygon
                    className={`${styles.diagramBox} ${dim ? styles.diagramBoxDim : ""}`}
                    points={`${box.x + 5},${box.y} ${box.x + box.w},${box.y} ${box.x + box.w},${box.y + box.h} ${box.x},${box.y + box.h} ${box.x},${box.y + 5}`}
                  />
                  <rect
                    className={styles.diagramBox}
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx={box.rx}
                    ry={box.ry}
                    style={{ fill: filterColor, opacity: repaint ? 1 : 0 }}
                    aria-hidden="true"
                  />
                  <DiagramLabel box={box} visible={repaint} color={labelColor} />
                </g>
              );
            })}
          </g>
        );
      })}
      </svg>
    </div>
    </div>
  );
}

function PinCard({
  pin, board, framework, lang, zh, placement, style, onClose, onJump, copied, onCopy, cardRef,
  onCardDragStart, onCardDragMove, onCardDragEnd, pinned,
}) {
  const guides = functionKeysForPin(pin);
  const [openGuides, setOpenGuides] = useState(() => new Set());
  const related = relatedPins(board, pin);
  const links = BOARD_LINKS[board.id] || {};
  const fwName = codeName(pin, framework);
  const titleText = cardTitle(pin, board.id);
  // Names already shown in the title (or equal to it) stay out of the meta
  // line so the alias never duplicates what the user just read. When the
  // title shows the pad name (P1.04), the pin id is a useful alias instead of
  // a duplicate, so it no longer suppresses the meta line.
  // 已在标题里出现过的名字不再进入 meta 行，避免别名与标题重复。标题显示焊盘
  // 名（P1.04）时，引脚 id 是有效别名而非重复，不再从 meta 行里隐藏。
  const shownNames = new Set([...titleText.split(" · "), ...(titleText === pin.names.chip ? [] : [pin.id])]
    .filter(Boolean)
    .map((value) => value.replaceAll(" ", "").toUpperCase()));
  const chipName = pin.names.chip;
  const metaParts = [
    chipName && chipName !== "—" && !shownNames.has(chipName.replaceAll(" ", "").toUpperCase())
      ? `${zh ? "芯片" : "Chip"} ${chipName}` : "",
    fwName && fwName !== "—" && !shownNames.has(fwName.replaceAll(" ", "").toUpperCase())
      ? `${FRAMEWORK_LABEL[framework] || framework} ${fwName}` : "",
    pin.padIndex ? `#${pin.padIndex}` : "",
  ].filter(Boolean);
  return (
    <aside
      ref={cardRef}
      className={`${styles.card} ${placement === "sheet" ? styles.cardSheet : `${styles.cardFloat}${pinned ? ` ${styles.cardPinned}` : ""}`}`}
      data-pin-card="1"
      style={{ "--pin-color": FN_COLOR[pin.fn], ...style }}
    >
      <div
        className={styles.cardHead}
        onPointerDown={onCardDragStart}
        onPointerMove={onCardDragMove}
        onPointerUp={onCardDragEnd}
        onPointerCancel={onCardDragEnd}
      >
        <div>
          <h2 className="home-type-subtitle">{titleText}</h2>
          {metaParts.length > 0 && (
            <p className={styles.cardMeta}>{metaParts.join(" · ")}</p>
          )}
          <span className={`${styles.status} ${styles[pin.status] || ""}`}>{localize(STATUS_LABEL[pin.status], lang)}</span>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label={zh ? "关闭" : "Close"}>×</button>
      </div>
      <p className={`home-type-body ${styles.cardDesc}`}>{localize(pin.desc, lang)}</p>
      {pin.notes?.length > 0 && (
        <ul className={styles.notes}>
          {pin.notes.map((note) => (
            <li key={note.en} className={NOTE_TONE[note.level] || styles.noteInfo}>{lang === "zh" ? note.zh : note.en}</li>
          ))}
        </ul>
      )}
      {Object.keys(pin.alt || {}).length > 0 && (
        <table className={styles.altTable}>
          <thead>
            <tr>{ALT_ORDER.filter((key) => pin.alt[key]).map((key) => <th key={key}>{key === "other" ? (zh ? "其它" : "Other") : key === "i2s" ? "I²S" : key.toUpperCase()}</th>)}</tr>
          </thead>
          <tbody>
            <tr>{ALT_ORDER.filter((key) => pin.alt[key]).map((key) => <td key={key}>{altCell(pin.alt[key])}</td>)}</tr>
          </tbody>
        </table>
      )}
      {guides.map((key) => {
        const primer = FUNCTIONS[key];
        const boardNote = BOARD_FUNCTION_NOTES[board.id]?.[key];
        const open = openGuides.has(key);
        return (
          <div key={key} className={styles.guide}>
            <button type="button" className={styles.guideToggle} onClick={() => setOpenGuides((cur) => {
              const next = new Set(cur);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            })}>
              {localize(primer.title, lang)}
              <span>{open ? "−" : "+"}</span>
            </button>
            {open && (
              <div className={styles.guideBody}>
                <p className="home-type-body">{localize(primer.intro, lang)}</p>
                <p className="home-type-body">{localize(primer.wiring, lang)}</p>
                {boardNote && <p className={styles.boardNote}>{localize(boardNote, lang)}</p>}
                {primer.pitfalls?.map((item) => (
                  <p key={item.en} className={styles.pitfall}>{localize(item, lang)}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {(() => {
        const primer = FUNCTIONS[guides[0]];
        const code = sampleCode(pin, primer, framework);
        if (!code) return null;
        return (
          <>
            <pre className={styles.code}>{code}</pre>
            <button type="button" className={`home-type-action home-filled-action home-primary-cta ${styles.copy}`} onClick={() => onCopy(code)}>
              {copied ? (zh ? "已复制" : "Copied") : (zh ? "复制代码" : "Copy code")}
            </button>
          </>
        );
      })()}
      {related.length > 0 && (
        <div className={styles.related}>
          <p className={styles.relatedLabel}>{zh ? "同总线相关引脚" : "Same bus"}</p>
          <div className={styles.relatedList}>
            {related.map((item) => (
              <button key={item.id} type="button" onClick={() => onJump(item.id)}>{item.names.silk}</button>
            ))}
          </div>
        </div>
      )}
      <div className={styles.cardLinks}>
        {links.wiki && <a href={links.wiki} target="_blank" rel="noreferrer">{zh ? "Wiki 文档" : "Board wiki"}</a>}
        {links.schematic && <a href={links.schematic} target="_blank" rel="noreferrer">{zh ? "原理图" : "Schematic"}</a>}
      </div>
    </aside>
  );
}

export function PinoutView() {
  const { lang } = useLang();
  const zh = lang === "zh";
  const hydrated = useSyncExternalStore(subscribeNoop, readClient, readServer);
  const search = useSyncExternalStore(subscribeNoop, readSearch, readServerSearch);
  const urlParams = useMemo(() => parseParams(search), [search]);
  const [boardChoice, setBoardId] = useState(null);
  const [activeChoice, setActiveId] = useState(null);
  const [selection, setSelection] = useState(null);
  const [categoryChoice, setCategoryId] = useState(null);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [frameworkChoice, setFramework] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sheetMode, setSheetMode] = useState(false);
  const [tableOpen, setTableOpen] = useState(true);
  const [cardPos, setCardPos] = useState({ top: 12, left: 12, width: 560, maxHeight: 720 });
  // Once the user drags the card it pins to the viewport, so it can park in
  // the blank page margins beside the diagram column and stay put while
  // scrolling. Closing the card unpins it.
  // 用户拖动后卡片固定于视口：可停靠在图列两侧的页面空白区，滚动时不再跟随；
  // 关闭卡片后恢复默认就近弹出。
  const [cardFixed, setCardFixed] = useState(false);
  const [diagramMaxW, setDiagramMaxW] = useState(null);
  const [announce, setAnnounce] = useState("");

  const boardId = boardChoice ?? (BOARDS[urlParams.board] ? urlParams.board : "samd21");
  const board = getBoard(boardId);
  const activeId = selection?.id ?? activeChoice ?? urlParams.pin;
  const categoryId = categoryChoice ?? categoryOf(boardId);
  const framework = frameworkChoice && board.frameworks.includes(frameworkChoice) ? frameworkChoice : board.frameworks[0];
  const activePin = board.pins.find((pin) => pin.id === activeId) || null;
  const workspaceRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const moduleRef = useRef(null);
  const cardRef = useRef(null);
  const faceRefs = { front: frontRef, back: backRef, module: moduleRef };
  const menuRef = useRef(null);

  const matches = query ? board.pins.filter((pin) => pinMatchesQuery(pin, query)) : [];

  const findRow = useCallback((id, preferredFace) => {
    const faces = preferredFace
      ? [preferredFace, "front", "back", "module"]
      : ["front", "back", "module"];
    for (const face of faces) {
      const rows = board.diagram?.[face]?.rows || [];
      const index = rows.findIndex((row) => row.id === id);
      if (index >= 0) return { face, side: rows[index].side, index, id };
    }
    return id ? { face: "front", side: "right", index: -1, id } : null;
  }, [board]);

  const selectPin = useCallback((next) => {
    if (!next?.id || (selection && selection.id === next.id && selection.face === next.face && selection.index === next.index)) {
      setSelection(null);
      setActiveId("");
      return;
    }
    setSelection(next);
    setActiveId(next.id);
  }, [selection]);

  const jumpTo = useCallback((id) => {
    const next = findRow(id, selection?.face);
    if (next) selectPin(next);
  }, [findRow, selectPin, selection]);

  useEffect(() => {
    if (!hydrated) return;
    writeParams(boardId, activeId);
  }, [hydrated, boardId, activeId]);

  useEffect(() => {
    if (!hydrated || !urlParams.pin) return;
    setSelection((current) => {
      if (current?.id === urlParams.pin) return current;
      return findRow(urlParams.pin) || current;
    });
  }, [hydrated, boardId, findRow, urlParams.pin]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setSelection(null);
        setActiveId("");
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Anywhere outside a pin row, the card itself or the board table closes the card.
   * Bound to click so a touch scroll that starts on the page never dismisses it.
   * 点击引脚行、卡片与总表之外的任意位置即收起引脚卡片；
   * 使用 click 事件，触摸滚动的起手动作不会误触发收起。
   */
  useEffect(() => {
    const onOutside = (event) => {
      if (event.target.closest("[data-pin-row], [data-pin-card], [data-summary], a, button, input")) return;
      setSelection(null);
      setActiveId("");
    };
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 899px)");
    const sync = () => setSheetMode(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const preloaded = [];
    Object.values(BOARDS).forEach((item) => {
      [item.images.front, item.images.back].forEach((image) => {
        const img = new Image();
        img.src = withBase(image.src);
        preloaded.push(img);
      });
      // s3sense carries a third, expansion-board face.
      if (item.diagram?.module?.src) {
        const img = new Image();
        img.src = withBase(item.diagram.module.src);
        preloaded.push(img);
      }
    });
    return () => { preloaded.length = 0; };
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      if (sheetMode || !selection || selection.index < 0) return;
      // A pinned card stays where the user parked it.
      // 已停靠的卡片保持在用户放置的位置。
      if (cardFixed) return;
      const workspace = workspaceRef.current;
      const faceEl = faceRefs[selection.face]?.current;
      const diagram = board.diagram?.[selection.face];
      const row = diagram?.rows?.[selection.index];
      if (!workspace || !faceEl || !diagram || !row) return;
      const workBox = workspace.getBoundingClientRect();
      const frameEl = faceEl.querySelector("[data-diagram-frame]");
      const frameBox = (frameEl || faceEl).getBoundingClientRect();
      // The card's top follows the clicked row's screen position: map the
      // row's y inside the crop onto the rendered frame.
      // 卡片顶部跟随点击行的屏幕位置：把行在裁剪区内的 y 映射到渲染后的画框上。
      const yScale = frameBox.height / diagram.crop.h;
      const rowTop = Math.min(...row.boxes.map((box) => box.y));
      const pinTop = frameBox.top + (rowTop - diagram.crop.y) * yScale;
      const next = placePinCard({
        workWidth: workBox.width,
        workTop: workBox.top,
        frameLeft: frameBox.left - workBox.left,
        frameWidth: frameBox.width,
        crop: diagram.crop,
        row,
        side: selection.side,
        pinTop,
        viewportHeight: window.innerHeight,
      });
      // The clamped height keeps the card on screen, but it must never cut the
      // card's own content mid-row: when the pin's rows are taller than the
      // allowance, show the card in full and let the page scroll instead.
      // 钳制高度让卡片留在屏内，但绝不能把卡片内容拦腰截断：行内容超过可用高度时
      // 完整展示卡片，滚动页面即可看到全部文字。
      const cardEl = cardRef.current;
      if (cardEl && cardEl.scrollHeight > next.maxHeight) {
        next.maxHeight = cardEl.scrollHeight;
      }
      setCardPos((prev) => (
        prev.top === next.top
        && prev.left === next.left
        && prev.width === next.width
        && prev.maxHeight === next.maxHeight
          ? prev
          : next
      ));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (workspaceRef.current) observer.observe(workspaceRef.current);
    if (cardRef.current) observer.observe(cardRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [sheetMode, selection, board, boardId, cardFixed]);

  /**
   * The floating pin card can be dragged by its header. Dragging pins it to
   * the viewport (outside the diagram column, into the page margins) where
   * it stays while scrolling.
   * 浮动引脚卡可按住标题栏拖动。拖动后卡片固定到视口（可拖出图列、停在页面
   * 两侧空白区），滚动时保持原位。
   */
  const cardDragRef = useRef(null);
  const startCardDrag = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("button, a, input, textarea, select, table, [role='button']")) return;
    const card = cardRef.current;
    const workspace = workspaceRef.current;
    if (!card || !workspace) return;
    const cardBox = card.getBoundingClientRect();
    cardDragRef.current = {
      pointerId: event.pointerId,
      grabX: event.clientX - cardBox.left,
      grabY: event.clientY - cardBox.top,
      width: cardBox.width,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    // Pin to the viewport at the card's current on-screen spot (no jump).
    // 以卡片当前屏幕位置为基准固定到视口（不产生跳动）。
    setCardFixed(true);
    setCardPos((prev) => (prev.top === Math.round(cardBox.top) && prev.left === Math.round(cardBox.left)
      ? prev
      : { ...prev, top: Math.round(cardBox.top), left: Math.round(cardBox.left) }));
  };
  const moveCardDrag = (event) => {
    const info = cardDragRef.current;
    if (!info || event.pointerId !== info.pointerId) return;
    const left = Math.round(Math.max(8, Math.min(event.clientX - info.grabX, window.innerWidth - 8 - info.width)));
    const top = Math.round(Math.max(8, Math.min(event.clientY - info.grabY, window.innerHeight - 88)));
    setCardPos((prev) => (prev.top === top && prev.left === left ? prev : { ...prev, top, left }));
  };
  const endCardDrag = (event) => {
    if (cardDragRef.current && event.pointerId !== cardDragRef.current.pointerId) return;
    cardDragRef.current = null;
  };
  // Closing the card (or anything that clears the selection) unpins it, so
  // the next card opens beside its row again.
  // 关闭卡片（或任何清空选中的操作）后取消停靠，下一张卡重新就近弹出。
  useEffect(() => { if (!selection) setCardFixed(false); }, [selection]);

  useLayoutEffect(() => {
    if (!selection || !sheetMode) return;
    faceRefs[selection.face]?.current?.scrollIntoView({ block: "start", inline: "nearest" });
  }, [selection, sheetMode, boardId]);

  /**
   * Every board photo renders at one shared size: each face gets its own
   * frame width from its measured board width, and the box grows instead of
   * shrinking the XIAO when a face needs more room.
   * 所有板身照片按同一尺寸渲染：按各面板身实测宽度分别给出图框宽度，
   * 需要更多空间时扩大展示盒子，而不是缩小 XIAO。
   */
  useLayoutEffect(() => {
    const fit = () => {
      const el = workspaceRef.current;
      if (!el) return;
      if (window.innerWidth < 900) {
        setDiagramMaxW(null);
        return;
      }
      const workW = Math.max(160, el.clientWidth - 24);
      const next = {};
      for (const face of ["front", "back", "module"]) {
        const faceDiagram = board.diagram?.[face];
        // Faces with a trimmed horizontal crop (board-centring override) map
        // fewer SVG units to the same frame, so the crop width — not the raw
        // canvas width — sets the board photo's render size.
        // 水平裁剪收窄的面（板身居中覆盖）映射到同宽图框的 SVG 单位更少，
        // 板身渲染尺寸由裁剪宽而非画布宽决定。
        next[face] = boardFrameWidth({ workWidth: workW, figureWidth: faceDiagram?.figure?.fw, imageWidth: faceDiagram?.crop?.w });
      }
      setDiagramMaxW((prev) => (
        prev?.front === next.front && prev?.back === next.back && prev?.module === next.module ? prev : next
      ));
    };
    fit();
    const node = workspaceRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [board, boardId]);

  const faceMaxW = (face) => {
    const value = diagramMaxW?.[face];
    return value ? { "--diagram-max-w": `${value}px` } : undefined;
  };

  const pickBoard = (id) => {
    setBoardId(id);
    setSelection(null);
    setActiveId("");
    setMenuOpen(false);
    setCategoryId(BOARD_CATEGORIES.find((item) => item.boardIds.includes(id))?.id || categoryId);
    // A filter from the previous board's legend may not exist on the next one.
    // 上一块板的筛选项在下一块板上可能不存在。
    setFilter((cur) => (cur && !legendOrderFor(id).includes(cur) ? "" : cur));
    setAnnounce(BOARDS[id].name);
  };

  const onSearchKey = (event) => {
    if (event.key === "Enter" && matches[0]) jumpTo(matches[0].id);
    if (event.key === "Escape") setQuery("");
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const category = BOARD_CATEGORIES.find((item) => item.id === categoryId) || BOARD_CATEGORIES[0];
  const batteryFact = board.facts.battery === "back"
    ? (zh ? "电池焊盘在背面" : "Battery pads on the back")
    : localize(board.facts.battery, lang);
  const table = summaryRows(board);

  return (
    <section className={styles.page} id="top">
      <ToolPageIntro
        id="pinout"
        title={zh ? "XIAO 引脚对照" : "XIAO Pinout"}
        description={board.diagram?.module
          ? (zh
            ? "正面、背面与 Sense 扩展板同一页。点一行看注意事项、备用功能和接线说明。"
            : "Front, back and the Sense module on one page. Click a row for notes, alt functions and wiring.")
          : (zh
            ? "正面、背面同一页。点一行看注意事项、备用功能和接线说明。"
            : "Front and back on one page. Click a row for notes, alt functions and wiring.")}
      />
      <div className={`${styles.wrap} ${sheetMode && selection ? styles.wrapSheet : ""}`}>
        <div className={styles.controls}>
          <div className={styles.toolbar}>
            <div className={styles.boardSelect} ref={menuRef}>
              <button
                type="button"
                data-board-trigger="1"
                className={`${styles.boardTrigger} ${menuOpen ? styles.boardTriggerOpen : ""}`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
              >
                {board.name}
                <span aria-hidden="true">
                  <svg viewBox="0 0 12 12" width="12" height="12">
                    <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {menuOpen && (
                <div className={styles.boardMenu}>
                  <div className={styles.boardCats}>
                    {BOARD_CATEGORIES.map((item) => (
                      <button key={item.id} type="button" className={categoryId === item.id ? styles.active : ""} onClick={() => setCategoryId(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.boardModels}>
                    {category.boardIds.map((id) => (
                      <button key={id} type="button" className={boardId === id ? styles.active : ""} onClick={() => pickBoard(id)}>
                        {BOARDS[id].name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {board.frameworks.length > 1 && (
              <div className={styles.fwSwitch}>
                {board.frameworks.map((item) => (
                  <button key={item} type="button" className={framework === item ? styles.active : ""} onClick={() => setFramework(item)}>
                    {FRAMEWORK_LABEL[item] || item}
                  </button>
                ))}
              </div>
            )}
            <input
              className={styles.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKey}
              placeholder={zh ? "搜索 SDA、PA08、A0…" : "Search SDA, PA08, A0…"}
              aria-label={zh ? "搜索引脚" : "Search pins"}
            />
          </div>

          <div className={styles.legend} data-filtered={filter ? "1" : "0"}>
            {legendOrderFor(boardId).map((fn) => (
              <button
                key={fn}
                type="button"
                className={`${styles.legendBtn} ${filter === fn ? styles.on : ""}`}
                style={{ "--fn-color": FN_COLOR[fn] }}
                aria-pressed={filter === fn}
                onClick={() => setFilter((cur) => (cur === fn ? "" : fn))}
              >
                {FN_LABEL[fn]}
              </button>
            ))}
          </div>
        </div>

        <div
          className={styles.workspace}
          ref={workspaceRef}
        >
          {["front", "back", "module"].map((face) => {
            const diagram = board.diagram?.[face];
            if (!diagram) return null;
            const faceLabel = face === "front"
              ? (zh ? "正面" : "Front")
              : face === "back"
                ? (zh ? "背面" : "Back")
                : (zh ? "扩展板" : "Sense Module");
            return (
              <div key={face} className={styles.faceBlock} ref={faceRefs[face]} style={faceMaxW(face)}>
                <div className={styles.stageHead} aria-hidden="true">
                  <span className={styles.stageRule} />
                  <span className={styles.stageFace}>{faceLabel}</span>
                  <span className={styles.stageRule} />
                </div>
                <DiagramStage
                  diagram={diagram}
                  board={board}
                  selection={selection}
                  filter={filter}
                  query={query}
                  lang={lang}
                  face={face}
                  onSelect={selectPin}
                />
              </div>
            );
          })}
          {activePin && selection && !sheetMode && (
            <PinCard
              key={activePin.id}
              pin={activePin}
              board={board}
              framework={framework}
              lang={lang}
              zh={zh}
              placement="float"
              style={{ top: cardPos.top, left: cardPos.left, width: cardPos.width, maxHeight: cardPos.maxHeight }}
              cardRef={cardRef}
              onCardDragStart={startCardDrag}
              onCardDragMove={moveCardDrag}
              onCardDragEnd={endCardDrag}
              pinned={cardFixed}
              onClose={() => { setSelection(null); setActiveId(""); }}
              onJump={jumpTo}
              copied={copied}
              onCopy={copyCode}
            />
          )}
        </div>

        <div className={styles.reference}>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>{zh ? "逻辑电平" : "Logic level"}</dt>
              <dd>{board.facts.logic}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{zh ? "5V 耐受" : "5V tolerance"}</dt>
              <dd className={board.facts.fiveVTolerant ? "" : styles.factWarn}>
                {board.facts.fiveVTolerant ? (zh ? "耐 5V" : "Tolerant") : (zh ? "不耐 5V" : "Not tolerant")}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>{zh ? "3V3 电流上限" : "3V3 budget"}</dt>
              <dd>≤ {board.facts.v33MaxMa} mA</dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>VBUS</dt>
              <dd>{localize(board.facts.vbus, lang)}</dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>{zh ? "电池" : "Battery"}</dt>
              <dd>{batteryFact}</dd>
            </div>
          </dl>

          <div className={styles.tableWrap} data-summary="1">
            <button type="button" className={styles.tableToggle} onClick={() => setTableOpen((open) => !open)}>
              {zh ? "全板总表" : "Board table"}
              <span>{tableOpen ? "−" : "+"}</span>
            </button>
            {tableOpen && (
              <div className={styles.tableScroll}>
                <table className={styles.summary}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{zh ? "丝印" : "Silk"}</th>
                      <th>Arduino</th>
                      <th>{zh ? "芯片" : "Chip"}</th>
                      <th>ADC</th>
                      <th>I²C</th>
                      <th>SPI</th>
                      <th>UART</th>
                      <th>PWM</th>
                      <th>{zh ? "其它" : "Other"}</th>
                      <th>{zh ? "注意" : "Note"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row) => {
                      const pin = row.pin;
                      const active = pin.id === activeId;
                      const note = pin.notes?.[0] ? (lang === "zh" ? pin.notes[0].zh : pin.notes[0].en) : "";
                      return (
                        <tr
                          key={`${row.face}-${pin.id}`}
                          className={active ? styles.summaryActive : ""}
                        >
                          <td>{pin.padIndex || "—"}</td>
                          <td>{pin.names.silk}</td>
                          <td>{pin.names.arduino}</td>
                          <td>{pin.names.chip}</td>
                          <td>{altCell(pin.alt.adc)}</td>
                          <td>{altCell(pin.alt.i2c)}</td>
                          <td>{altCell(pin.alt.spi)}</td>
                          <td>{altCell(pin.alt.uart)}</td>
                          <td>{altCell(pin.alt.pwm)}</td>
                          <td>{altCell(pin.alt.other)}</td>
                          <td title={note}>{note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {activePin && selection && sheetMode && (
          <PinCard
            key={`sheet-${activePin.id}`}
            pin={activePin}
            board={board}
            framework={framework}
            lang={lang}
            zh={zh}
            placement="sheet"
            onClose={() => { setSelection(null); setActiveId(""); }}
            onJump={jumpTo}
            copied={copied}
            onCopy={copyCode}
          />
        )}
        <div className={styles.live} aria-live="polite">{announce}</div>
      </div>
    </section>
  );
}
