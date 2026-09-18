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
  codeName,
  functionKeysForPin,
  getBoard,
  localize,
  pinHasFilter,
  pinMatchesQuery,
} from "./data";
import styles from "./pinout.module.css";
import { placePinCard } from "./placePinCard.js";

const STATUS_LABEL = {
  free: { en: "Free to use", zh: "空闲，可随意使用" },
  conditional: { en: "Use with care", zh: "有条件使用" },
  occupied: { en: "Onboard / occupied", zh: "已被板载占用" },
};

const CAP_LABEL = { adc: "ADC", dac: "DAC", i2c: "I²C", spi: "SPI", uart: "UART", pwm: "PWM", wake: "WAKE", touch: "TOUCH" };
const NOTE_TONE = { danger: styles.noteDanger, caution: styles.noteCaution, info: styles.noteInfo };
const ALT_ORDER = ["adc", "i2c", "spi", "uart", "pwm", "other"];
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
  window.history.replaceState(null, "", url);
}

function onboardLabel(pin) {
  const name = pin.id.replaceAll("_", " ");
  return pin.names.silk && pin.names.silk !== "—" && pin.names.silk !== pin.id ? `${pin.names.silk} · ${name}` : name;
}

function relatedPins(board, pin) {
  const keys = ["i2c", "spi", "uart"].filter((key) => pin.fn === key || pin.caps?.[key]);
  if (!keys.length) return [];
  return board.pins.filter((item) => item.id !== pin.id && keys.some((key) => item.fn === key || item.caps?.[key]));
}

function summaryRows(board) {
  const seen = new Set();
  const rows = [];
  for (const face of ["front", "back"]) {
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

/**
 * Official diagram with a click / highlight layer over its label rows.
 * 官方引脚图，叠加一层可点击、可高亮的标签行。
 */
function DiagramStage({ diagram, board, selection, isDim, lang, face, onSelect, frameRatio }) {
  const { crop, width, height, src, rows } = diagram;
  const pinOf = (id) => board.pins.find((pin) => pin.id === id) || null;
  const rowLabel = (pin, id) => (pin ? (pin.kind === "onboard" ? onboardLabel(pin) : pin.names.silk) : id);
  return (
    <div className={styles.diagramFrame} data-diagram-frame="1" style={{ aspectRatio: frameRatio }}>
      <svg
        className={styles.diagram}
        viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={lang === "zh" ? `${board.name} ${face === "front" ? "正面" : "背面"}引脚图` : `${board.name} ${face} pinout`}
      >
      <image href={withBase(src)} width={width} height={height} />
      {rows.map((row, index) => {
        const pin = pinOf(row.id);
        const active = selection?.face === face && selection?.index === index && selection?.id === row.id;
        const dim = pin ? isDim(pin) : false;
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
            className={`${styles.diagramRow} ${active ? styles.diagramRowActive : ""} ${dim ? styles.diagramRowDim : ""}`}
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
              className={styles.diagramMark}
              points={row.side === "left"
                ? `${right + 6},${top - 1} ${right + 14},${(top + bottom) / 2} ${right + 6},${bottom + 1}`
                : `${left - 6},${top - 1} ${left - 14},${(top + bottom) / 2} ${left - 6},${bottom + 1}`}
            />
            {row.boxes.map((box, boxIndex) => (
              <polygon
                key={boxIndex}
                className={styles.diagramBox}
                points={`${box.x + 5},${box.y} ${box.x + box.w},${box.y} ${box.x + box.w},${box.y + box.h} ${box.x},${box.y + box.h} ${box.x},${box.y + 5}`}
              />
            ))}
          </g>
        );
      })}
      </svg>
    </div>
  );
}

function PinCard({
  pin, board, framework, lang, zh, placement, style, onClose, onJump, copied, onCopy, cardRef,
}) {
  const [openGuide, setOpenGuide] = useState("");
  const guides = functionKeysForPin(pin);
  const related = relatedPins(board, pin);
  const links = BOARD_LINKS[board.id] || {};
  const fwName = codeName(pin, framework);
  return (
    <aside
      ref={cardRef}
      className={`${styles.card} ${placement === "sheet" ? styles.cardSheet : styles.cardFloat}`}
      data-pin-card="1"
      style={{ "--pin-color": FN_COLOR[pin.fn], ...style }}
    >
      <div className={styles.cardHead}>
        <div>
          <h2 className="home-type-subtitle">{pin.kind === "onboard" ? onboardLabel(pin) : pin.names.silk}</h2>
          <p className={styles.cardMeta}>
            {pin.names.arduino && pin.names.arduino !== pin.names.silk ? `Arduino ${pin.names.arduino} · ` : ""}
            {zh ? "芯片" : "Chip"} {pin.names.chip}
            {fwName ? ` · ${FRAMEWORK_LABEL[framework] || framework} ${fwName}` : ""}
            {pin.padIndex ? ` · #${pin.padIndex}` : ""}
          </p>
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
            <tr>{ALT_ORDER.filter((key) => pin.alt[key]).map((key) => <th key={key}>{key === "other" ? (zh ? "其它" : "Other") : key.toUpperCase()}</th>)}</tr>
          </thead>
          <tbody>
            <tr>{ALT_ORDER.filter((key) => pin.alt[key]).map((key) => <td key={key}>{altCell(pin.alt[key])}</td>)}</tr>
          </tbody>
        </table>
      )}
      {guides.map((key) => {
        const primer = FUNCTIONS[key];
        const boardNote = BOARD_FUNCTION_NOTES[board.id]?.[key];
        const open = openGuide === key;
        return (
          <div key={key} className={styles.guide}>
            <button type="button" className={styles.guideToggle} onClick={() => setOpenGuide(open ? "" : key)}>
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
  const [tableOpen, setTableOpen] = useState(false);
  const [cardPos, setCardPos] = useState({ top: 12, left: 12, width: 420, maxHeight: 560 });
  const [announce, setAnnounce] = useState("");

  const boardId = boardChoice ?? (BOARDS[urlParams.board] ? urlParams.board : "samd21");
  const board = getBoard(boardId);
  const frameRatio = useMemo(() => {
    const front = board.diagram?.front?.crop;
    const back = board.diagram?.back?.crop;
    const width = Math.max(front?.w || 0, back?.w || 0);
    const height = Math.max(front?.h || 0, back?.h || 0);
    return width && height ? `${width} / ${height}` : "16 / 9";
  }, [board]);
  const activeId = selection?.id ?? activeChoice ?? urlParams.pin;
  const categoryId = categoryChoice ?? categoryOf(boardId);
  const framework = frameworkChoice && board.frameworks.includes(frameworkChoice) ? frameworkChoice : board.frameworks[0];
  const activePin = board.pins.find((pin) => pin.id === activeId) || null;
  const workspaceRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const cardRef = useRef(null);
  const faceRefs = { front: frontRef, back: backRef };
  const menuRef = useRef(null);

  const isDim = useCallback(
    (pin) => Boolean((filter && !pinHasFilter(pin, filter)) || (query && !pinMatchesQuery(pin, query))),
    [filter, query],
  );
  const matches = query ? board.pins.filter((pin) => pinMatchesQuery(pin, query)) : [];

  const findRow = useCallback((id, preferredFace) => {
    for (const face of preferredFace ? [preferredFace, "front", "back"] : ["front", "back"]) {
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
    });
    return () => { preloaded.length = 0; };
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      if (sheetMode || !selection || selection.index < 0) return;
      const workspace = workspaceRef.current;
      const faceEl = faceRefs[selection.face]?.current;
      const diagram = board.diagram?.[selection.face];
      const row = diagram?.rows?.[selection.index];
      if (!workspace || !faceEl || !diagram || !row) return;
      const workBox = workspace.getBoundingClientRect();
      const frameEl = faceEl.querySelector("[data-diagram-frame]");
      const frameBox = (frameEl || faceEl).getBoundingClientRect();
      const next = placePinCard({
        workWidth: workBox.width,
        workHeight: workBox.height,
        workTop: workBox.top,
        frameLeft: frameBox.left - workBox.left,
        frameTop: frameBox.top - workBox.top,
        frameWidth: frameBox.width,
        frameHeight: frameBox.height,
        crop: diagram.crop,
        row,
        side: selection.side,
        viewportHeight: window.innerHeight,
        cardHeight: cardRef.current?.getBoundingClientRect().height,
      });
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
  }, [sheetMode, selection, board, boardId]);

  useLayoutEffect(() => {
    if (!selection || !sheetMode) return;
    faceRefs[selection.face]?.current?.scrollIntoView({ block: "start", inline: "nearest" });
  }, [selection, sheetMode, boardId]);

  const pickBoard = (id) => {
    setBoardId(id);
    setSelection(null);
    setActiveId("");
    setMenuOpen(false);
    setCategoryId(BOARD_CATEGORIES.find((item) => item.boardIds.includes(id))?.id || categoryId);
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
        description={zh
          ? "正面、背面同一页。点一行看注意事项、备用功能和接线说明。"
          : "Front and back on one page. Click a row for notes, alt functions and wiring."}
      />
      <div className={`${styles.wrap} ${sheetMode && selection ? styles.wrapSheet : ""}`}>
        <div className={styles.toolbar}>
          <div className={styles.boardSelect} ref={menuRef}>
            <button
              type="button"
              className={`${styles.boardTrigger} ${menuOpen ? styles.boardTriggerOpen : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
            >
              {board.name}
              <span aria-hidden="true">▾</span>
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

        <div className={styles.facts}>
          <span className={styles.fact}>{zh ? "逻辑电平" : "Logic"} {board.facts.logic}</span>
          <span className={`${styles.fact} ${styles.factWarn}`}>
            {board.facts.fiveVTolerant ? (zh ? "耐 5V" : "5V tolerant") : (zh ? "不耐 5V" : "Not 5V tolerant")}
          </span>
          <span className={styles.fact}>{localize(board.facts.vbus, lang)}</span>
          <span className={styles.fact}>3V3 ≤ {board.facts.v33MaxMa} mA</span>
          <span className={styles.fact}>{batteryFact}</span>
        </div>

        <div className={styles.legend}>
          {LEGEND_ORDER.map((fn) => (
            <button
              key={fn}
              type="button"
              className={`${styles.legendBtn} ${filter === fn ? styles.on : ""}`}
              style={{ color: FN_COLOR[fn] }}
              onClick={() => setFilter((cur) => (cur === fn ? "" : fn))}
            >
              <i style={{ background: FN_COLOR[fn] }} />
              {localize(FN_LABEL[fn], lang)}
            </button>
          ))}
        </div>

        <div
          className={styles.workspace}
          ref={workspaceRef}
          onPointerDown={(event) => {
            if (event.target.closest("[data-pin-row], [data-pin-card], [data-summary], a, button, input")) return;
            setSelection(null);
            setActiveId("");
          }}
        >
          {["front", "back"].map((face) => {
            const diagram = board.diagram?.[face];
            if (!diagram) return null;
            return (
              <div key={face} className={styles.faceBlock} ref={faceRefs[face]}>
                <div className={styles.stageHead}>
                  <span className={styles.stageName}>{board.name}</span>
                  <span className={styles.stageFace}>{face === "front" ? (zh ? "正面" : "Front") : (zh ? "背面" : "Back")}</span>
                </div>
                <DiagramStage
                  diagram={diagram}
                  board={board}
                  selection={selection}
                  isDim={isDim}
                  lang={lang}
                  face={face}
                  frameRatio={frameRatio}
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
              onClose={() => { setSelection(null); setActiveId(""); }}
              onJump={jumpTo}
              copied={copied}
              onCopy={copyCode}
            />
          )}
        </div>

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
                    return (
                      <tr
                        key={`${row.face}-${pin.id}`}
                        className={active ? styles.summaryActive : ""}
                        onClick={() => jumpTo(pin.id)}
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
                        <td>{pin.notes?.[0] ? (lang === "zh" ? pin.notes[0].zh : pin.notes[0].en) : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
