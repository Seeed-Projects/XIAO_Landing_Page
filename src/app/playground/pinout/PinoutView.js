"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ToolPageIntro } from "../../tool-page-intro";
import { useLang } from "../../i18n";
import { withBase } from "../../../lib/basePath";
import {
  BOARD_CATEGORIES,
  BOARDS,
  FN_COLOR,
  FN_LABEL,
  LEGEND_ORDER,
  STRIP_COLUMNS,
  STRIP_TITLE,
  STRIP_WIDTH,
  anchorOnSide,
  getBoard,
  laneOnSide,
  localize,
  padOnSide,
  pinHasFilter,
  pinMatchesQuery,
  stripCells,
} from "./data";
import { FLIP_DELAY_MS, FLIP_MS, leaderPoints, roundedOrthogonalPath } from "./geometry";
import styles from "./pinout.module.css";

const STATUS_LABEL = {
  free: { en: "Free to use", zh: "空闲，可随意使用" },
  conditional: { en: "Use with care", zh: "有条件使用" },
  occupied: { en: "Onboard / occupied", zh: "已被板载占用" },
};

const CAP_LABEL = { adc: "ADC", dac: "DAC", i2c: "I²C", spi: "SPI", uart: "UART", pwm: "PWM", wake: "WAKE", touch: "TOUCH" };

/**
 * Grid template for one lane; the left lane reads outward-to-board.
 * Widths scale with `--strip-scale` so narrow desktops can shrink the grid.
 * 单侧标签带网格模板，左侧由外向板；宽度乘以 `--strip-scale`，窄屏桌面可整体缩小。
 */
const laneColumns = (lane) => (lane === "left" ? [...STRIP_COLUMNS].reverse() : STRIP_COLUMNS);
const laneTemplate = (lane) => laneColumns(lane).map((key) => `calc(${STRIP_WIDTH[key]}px * var(--strip-scale, 1))`).join(" ");

function parseParams(search) {
  const params = new URLSearchParams(search);
  return {
    board: params.get("board") || "",
    side: params.get("side") || "",
    pin: params.get("pin") || "",
    calibrate: params.get("calibrate") === "1",
  };
}

// URL search string as an external store: empty during SSR / hydration, live afterwards.
// 把 URL 查询串当作外部数据源：服务端与水合阶段为空，之后读取真实值。
const subscribeNoop = () => () => {};
const readSearch = () => window.location.search;
const readServerSearch = () => "";
const readClient = () => true;
const readServer = () => false;
const categoryOf = (boardId) => BOARD_CATEGORIES.find((item) => item.boardIds.includes(boardId))?.id || "samd";

function writeParams(board, side, pin) {
  const url = new URL(window.location.href);
  url.searchParams.set("board", board);
  url.searchParams.set("side", side);
  if (pin) url.searchParams.set("pin", pin);
  else url.searchParams.delete("pin");
  window.history.replaceState(null, "", url);
}

function cellColor(key, pin) {
  if (key === "silk" || key === "code" || key === "chip") return FN_COLOR[pin.fn];
  if (key === "adc") return FN_COLOR.analog;
  if (key === "i2c") return FN_COLOR.i2c;
  if (key === "spi") return FN_COLOR.spi;
  if (key === "uart") return FN_COLOR.uart;
  return FN_COLOR.digital;
}

function imageRatio(image) {
  return image?.width && image?.height ? image.width / image.height : 0.62;
}

function Strip({ pin, framework, active, dim, retract, lane, delay, onSelect, silkRef }) {
  const cells = stripCells(pin, framework);
  return (
    <div
      className={`${styles.strip} ${active ? styles.stripActive : ""} ${dim ? styles.stripDim : ""} ${retract ? styles.stripRetract : ""}`}
      style={{ gridTemplateColumns: laneTemplate(lane), transitionDelay: retract ? "0ms" : `${delay}ms` }}
    >
      {laneColumns(lane).map((key) => {
        const value = cells[key];
        const isSilk = key === "silk";
        return (
          <button
            key={key}
            type="button"
            ref={isSilk ? silkRef : undefined}
            className={`${styles.cell} ${styles[`cell_${key}`] || ""} ${value ? "" : styles.cellEmpty} ${isSilk ? styles.cellSilk : ""} ${isSilk ? styles[pin.status] || "" : ""} ${value && !isSilk && key !== "code" && key !== "chip" ? styles.cellCap : ""}`}
            style={{ "--cell-color": value ? cellColor(key, pin) : undefined }}
            onClick={() => onSelect(pin.id)}
            tabIndex={isSilk ? 0 : -1}
            aria-label={isSilk ? `${pin.names.silk}, ${pin.names.chip}, ${pin.fn}, ${pin.status}` : undefined}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

/** Display name for an onboard part: silk mark plus readable id. 板载器件显示名：丝印加可读 id。 */
function onboardLabel(pin) {
  const name = pin.id.replaceAll("_", " ");
  return pin.names.silk && pin.names.silk !== "—" && pin.names.silk !== pin.id ? `${pin.names.silk} · ${name}` : name;
}

function LaneHead({ lane, lang }) {
  return (
    <div className={styles.laneHead} style={{ gridTemplateColumns: laneTemplate(lane) }} aria-hidden="true">
      {laneColumns(lane).map((key) => (
        <span key={key}>{localize(STRIP_TITLE[key], lang)}</span>
      ))}
    </div>
  );
}

/**
 * Official pinout diagram with a click / highlight layer over its label rows.
 * 官方引脚图，叠加一层可点击、可高亮的标签行。
 *
 * diagram: { src, width, height, crop, rows: [{ id, side, y, boxes }] } (image pixels)
 * diagram：{ src, width, height, crop, rows }，坐标均为图片像素。
 */
function DiagramStage({ diagram, board, activeId, isDim, retract, lang, onSelect }) {
  const { crop, width, height, src, rows } = diagram;
  const pinOf = (id) => board.pins.find((pin) => pin.id === id) || null;
  const rowLabel = (pin, id) => {
    if (!pin) return id;
    return pin.kind === "onboard" ? onboardLabel(pin) : pin.names.silk;
  };
  return (
    <svg
      className={`${styles.diagram} ${retract ? styles.overlayHidden : ""}`}
      viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`}
      style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
      role="group"
      aria-label={lang === "zh" ? `${board.name} 引脚图` : `${board.name} pinout diagram`}
    >
      <image href={withBase(src)} width={width} height={height} />
      {rows.map((row) => {
        const pin = pinOf(row.id);
        const active = row.id === activeId;
        const dim = pin ? isDim(pin) : false;
        const left = Math.min(...row.boxes.map((box) => box.x));
        const right = Math.max(...row.boxes.map((box) => box.x + box.w));
        const top = Math.min(...row.boxes.map((box) => box.y));
        const bottom = Math.max(...row.boxes.map((box) => box.y + box.h));
        const activate = (event) => {
          if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect(row.id);
        };
        return (
          <g
            key={row.id}
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
            {row.boxes.map((box, index) => (
              <polygon
                key={index}
                className={styles.diagramBox}
                points={`${box.x + 5},${box.y} ${box.x + box.w},${box.y} ${box.x + box.w},${box.y + box.h} ${box.x},${box.y + box.h} ${box.x},${box.y + 5}`}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function PinoutView() {
  const { lang } = useLang();
  const zh = lang === "zh";
  // User choices override URL parameters; null means "not chosen yet".
  // 用户选择优先于 URL 参数；null 表示尚未选择。
  const hydrated = useSyncExternalStore(subscribeNoop, readClient, readServer);
  const search = useSyncExternalStore(subscribeNoop, readSearch, readServerSearch);
  const urlParams = useMemo(() => parseParams(search), [search]);
  const [boardChoice, setBoardId] = useState(null);
  const [sideChoice, setSide] = useState(null);
  const [activeChoice, setActiveId] = useState(null);
  const [categoryChoice, setCategoryId] = useState(null);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [frameworkChoice, setFramework] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [retract, setRetract] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lines, setLines] = useState([]);
  const [calibrated, setCalibrated] = useState({});
  const [reduceMotion, setReduceMotion] = useState(false);
  const [announce, setAnnounce] = useState("");

  const boardId = boardChoice ?? (BOARDS[urlParams.board] ? urlParams.board : "samd21");
  const side = sideChoice ?? (urlParams.side === "back" ? "back" : "front");
  const activeId = activeChoice ?? urlParams.pin;
  const categoryId = categoryChoice ?? categoryOf(boardId);
  const calibrateOn = urlParams.calibrate && process.env.NODE_ENV !== "production";

  const board = getBoard(boardId);
  const framework = frameworkChoice && board.frameworks.includes(frameworkChoice) ? frameworkChoice : board.frameworks[0];
  const workspaceRef = useRef(null);
  const overlayRef = useRef(null);
  const padRefs = useRef({});
  const silkRefs = useRef({});
  const menuRef = useRef(null);
  const flipTimer = useRef([]);

  // Pins with a pad on the current face, carrying that face's lane / order.
  // 当前面上有焊盘的引脚，并带上该面的标签带侧与顺序。
  const facePins = useMemo(() => {
    return board.pins
      .map((pin) => ({ ...pin, _pad: padOnSide(pin, side), ...laneOnSide(pin, side) }))
      .filter((pin) => pin._pad)
      .sort((a, b) => a.order - b.order);
  }, [board, side]);

  const stripPins = useMemo(() => facePins.filter((pin) => pin.kind === "header" && pin.lane), [facePins]);
  const tagPins = facePins.filter((pin) => !(pin.kind === "header" && pin.lane));
  const leftPins = stripPins.filter((pin) => pin.lane === "left");
  const rightPins = stripPins.filter((pin) => pin.lane === "right");
  const onboardPins = useMemo(() => board.pins.filter((pin) => pin.kind === "onboard" && (anchorOnSide(pin, side) || (!pin.anchor && side === "front"))), [board, side]);
  const activePin = board.pins.find((pin) => pin.id === activeId) || null;
  const matches = query ? board.pins.filter((pin) => pinMatchesQuery(pin, query)) : [];
  const isDim = useCallback(
    (pin) => Boolean((filter && !pinHasFilter(pin, filter)) || (query && !pinMatchesQuery(pin, query))),
    [filter, query],
  );

  const frontRatio = imageRatio(board.images.front);
  const backRatio = imageRatio(board.images.back);
  const stageRatio = Math.min(frontRatio, backRatio);

  const backOnly = useMemo(() => {
    return board.pins
      .filter((pin) => pin.pads?.back && !pin.pads?.front)
      .map((pin) => pin.names.silk)
      .filter((name, index, all) => name && name !== "—" && all.indexOf(name) === index)
      .slice(0, 6)
      .join(" · ");
  }, [board]);

  const clearFlipTimers = () => {
    flipTimer.current.forEach((id) => window.clearTimeout(id));
    flipTimer.current = [];
  };

  const flipTo = useCallback((next, pinAfter) => {
    if (next === side) {
      if (pinAfter) setActiveId(pinAfter);
      return;
    }
    if (flipping) return;
    const stays = activePin && (padOnSide(activePin, next) || activePin.kind === "onboard");
    const keep = pinAfter || (stays ? activePin.id : "");
    const message = next === "back" ? (zh ? "已翻到背面" : "Showing the back") : (zh ? "已翻到正面" : "Showing the front");
    if (reduceMotion) {
      setSide(next);
      setActiveId(keep);
      setAnnounce(message);
      return;
    }
    setFlipping(true);
    setRetract(true);
    if (!keep) setActiveId("");
    clearFlipTimers();
    flipTimer.current.push(window.setTimeout(() => setSide(next), FLIP_DELAY_MS));
    flipTimer.current.push(window.setTimeout(() => {
      setRetract(false);
      setFlipping(false);
      if (keep) setActiveId(keep);
      setAnnounce(message);
    }, FLIP_DELAY_MS + FLIP_MS));
  }, [side, flipping, activePin, reduceMotion, zh]);

  const setActive = useCallback((id) => {
    if (!id || id === activeId) {
      setActiveId("");
      return;
    }
    const pin = board.pins.find((item) => item.id === id);
    if (!pin) return;
    if (pin.kind === "onboard") {
      const anchorSide = pin.anchor?.side;
      if (anchorSide && anchorSide !== "both" && anchorSide !== side) {
        flipTo(anchorSide, id);
        return;
      }
      setActiveId(id);
      return;
    }
    if (!padOnSide(pin, side)) {
      flipTo(side === "front" ? "back" : "front", id);
      return;
    }
    setActiveId(id);
  }, [activeId, board, side, flipTo]);

  useEffect(() => () => clearFlipTimers(), []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeParams(boardId, side, activeId);
  }, [hydrated, boardId, side, activeId]);

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
        setActiveId("");
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

  // Leader lines run from each pad centre to the inner edge of its strip.
  // 引出线从焊盘圆心连到标签带靠板一侧的边。
  useLayoutEffect(() => {
    const measure = () => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      const box = workspace.getBoundingClientRect();
      const next = stripPins.map((pin) => {
        const padEl = padRefs.current[pin.id];
        const silkEl = silkRefs.current[pin.id];
        if (!padEl || !silkEl) return null;
        const padBox = padEl.getBoundingClientRect();
        const silkBox = silkEl.getBoundingClientRect();
        const from = { x: padBox.left + padBox.width / 2 - box.left, y: padBox.top + padBox.height / 2 - box.top };
        const to = {
          x: pin.lane === "left" ? silkBox.right - box.left : silkBox.left - box.left,
          y: silkBox.top + silkBox.height / 2 - box.top,
        };
        return {
          id: pin.id,
          d: roundedOrthogonalPath(leaderPoints(from, to, pin.lane)),
          color: FN_COLOR[pin.fn],
          active: pin.id === activeId,
          dim: isDim(pin),
        };
      }).filter(Boolean);
      setLines(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (workspaceRef.current) observer.observe(workspaceRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stripPins, isDim, activeId, side, retract, boardId]);

  const pickBoard = (id) => {
    setBoardId(id);
    setActiveId("");
    setSide("front");
    setMenuOpen(false);
    setCategoryId(BOARD_CATEGORIES.find((item) => item.boardIds.includes(id))?.id || categoryId);
  };

  const onSearchKey = (event) => {
    if (event.key === "Enter" && matches[0]) setActive(matches[0].id);
    if (event.key === "Escape") setQuery("");
  };

  const onCalibrateClick = (event) => {
    if (!calibrateOn || !overlayRef.current) return;
    const box = overlayRef.current.getBoundingClientRect();
    const x = Number((((event.clientX - box.left) / box.width) * 100).toFixed(2));
    const y = Number((((event.clientY - box.top) / box.height) * 100).toFixed(2));
    const pending = facePins.find((pin) => !calibrated[`${boardId}:${side}:${pin.id}`]);
    if (!pending) return;
    setCalibrated((prev) => ({ ...prev, [`${boardId}:${side}:${pending.id}`]: { id: pending.id, x, y } }));
  };

  const copyCode = async () => {
    if (!activePin?.code) return;
    await navigator.clipboard.writeText(activePin.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const category = BOARD_CATEGORIES.find((item) => item.id === categoryId) || BOARD_CATEGORIES[0];
  const drawerOpen = Boolean(activePin);
  const nextCalibrate = facePins.find((pin) => !calibrated[`${boardId}:${side}:${pin.id}`]);
  const batteryFact = board.facts.battery === "back"
    ? (zh ? "电池焊盘在背面" : "Battery pads on the back")
    : localize(board.facts.battery, lang);
  const diagram = board.diagram?.[side] || null;
  const flipRow = (
    <div className={styles.flipRow}>
      <button
        type="button"
        className={styles.flipBtn}
        disabled={flipping}
        onClick={() => flipTo(side === "front" ? "back" : "front")}
        aria-label={side === "front" ? (zh ? "当前显示正面，按下翻到背面" : "Front showing, press to flip to back") : (zh ? "当前显示背面，按下翻到正面" : "Back showing, press to flip to front")}
      >
        {side === "front" ? (zh ? "查看背面" : "Show back") : (zh ? "查看正面" : "Show front")}
      </button>
      {side === "front" && backOnly && (
        <p className={styles.backHint}>{zh ? "背面还有" : "Also on back"} {backOnly}</p>
      )}
    </div>
  );

  return (
    <section className={styles.page} id="top">
      <ToolPageIntro
        id="pinout"
        title={zh ? "XIAO 引脚对照" : "XIAO Pinout"}
        description={zh
          ? "对照丝印、代码名与芯片名，看清每个焊盘能做什么、能不能用。"
          : "Match silkscreen, code names and chip names. See what each pad can do, and whether you can use it."}
      />
      <div className={styles.wrap}>
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
          <div className={styles.faceSwitch}>
            <button type="button" className={side === "front" ? styles.active : ""} disabled={flipping} onClick={() => flipTo("front")}>
              {zh ? "正面" : "Front"}
            </button>
            <button type="button" className={side === "back" ? styles.active : ""} disabled={flipping} onClick={() => flipTo("back")}>
              {zh ? "背面" : "Back"}
            </button>
          </div>
          {board.frameworks.length > 1 && (
            <div className={styles.fwSwitch}>
              {board.frameworks.map((item) => (
                <button key={item} type="button" className={framework === item ? styles.active : ""} onClick={() => setFramework(item)}>
                  {item === "micropython" ? "MicroPython" : item === "zephyr" ? "Zephyr" : "Arduino"}
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

        <div className={`${styles.body} ${drawerOpen ? (diagram ? styles.bodyInline : styles.bodyDocked) : ""}`}>
          {diagram ? (
            <div className={`${styles.workspace} ${styles.workspaceDiagram}`} ref={workspaceRef}>
              <div className={styles.stageHead}>
                <span className={styles.stageName}>{board.name}</span>
                <span className={styles.stageFace}>{side === "front" ? (zh ? "正面" : "Front") : (zh ? "背面" : "Back")}</span>
              </div>
              <DiagramStage
                diagram={diagram}
                board={board}
                activeId={activeId}
                isDim={isDim}
                retract={retract}
                lang={lang}
                onSelect={setActive}
              />
              {flipRow}
            </div>
          ) : (
          <div className={styles.workspace} ref={workspaceRef}>
            <svg className={styles.leaders} aria-hidden="true">
              {lines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  className={`${line.active ? styles.activeLine : ""} ${line.dim ? styles.dimLine : ""}`}
                  style={{ "--pin-color": line.color }}
                />
              ))}
            </svg>

            <div className={`${styles.col} ${styles.colLeft}`}>
              {leftPins.length > 0 && <LaneHead lane="left" lang={lang} />}
              {leftPins.map((pin, index) => (
                <Strip
                  key={pin.id}
                  pin={pin}
                  framework={framework}
                  active={pin.id === activeId}
                  dim={isDim(pin)}
                  retract={retract}
                  lane="left"
                  delay={index * 30}
                  onSelect={setActive}
                  silkRef={(node) => { silkRefs.current[pin.id] = node; }}
                />
              ))}
            </div>

            <div className={styles.stageCol}>
              <div className={styles.onboardRow}>
                {onboardPins.map((pin) => (
                  <button
                    key={pin.id}
                    type="button"
                    className={`${styles.onboardChip} ${pin.id === activeId ? styles.onboardChipActive : ""} ${isDim(pin) ? styles.padDim : ""}`}
                    style={{ "--pin-color": FN_COLOR[pin.fn] }}
                    onClick={() => setActive(pin.id)}
                  >
                    <i />
                    {onboardLabel(pin)}
                  </button>
                ))}
              </div>

              <div className={styles.stage3d} style={{ aspectRatio: stageRatio }} onClick={calibrateOn ? onCalibrateClick : undefined}>
                <div className={`${styles.flipper} ${side === "back" ? styles.back : ""}`}>
                  <div className={`${styles.face} ${board.frontRotated ? styles.rotated : ""}`}>
                    <div className={styles.photo} style={{ aspectRatio: frontRatio }}>
                      <img src={withBase(board.images.front.src)} alt="" />
                    </div>
                  </div>
                  <div className={`${styles.face} ${styles.faceBack}`}>
                    <div className={styles.photo} style={{ aspectRatio: backRatio }}>
                      <img src={withBase(board.images.back.src)} alt="" />
                    </div>
                  </div>
                </div>

                <div
                  ref={overlayRef}
                  className={`${styles.overlay} ${retract ? styles.overlayHidden : ""}`}
                  style={{ aspectRatio: side === "back" ? backRatio : frontRatio }}
                >
                  {facePins.map((pin) => (
                    <button
                      key={pin.id}
                      type="button"
                      ref={(node) => { padRefs.current[pin.id] = node; }}
                      className={`${styles.pad} ${pin.id === activeId ? styles.padActive : ""} ${isDim(pin) ? styles.padDim : ""}`}
                      style={{ left: `${pin._pad.x}%`, top: `${pin._pad.y}%`, "--pin-color": FN_COLOR[pin.fn] }}
                      onClick={() => setActive(pin.id)}
                      aria-label={pin.names.silk}
                    />
                  ))}
                  {tagPins.map((pin) => (
                    <span
                      key={`tag-${pin.id}`}
                      className={`${styles.tag} ${styles[`tag${(pin._pad.tag || "right")[0].toUpperCase()}${(pin._pad.tag || "right").slice(1)}`] || styles.tagRight} ${pin.id === activeId ? styles.tagActive : ""} ${isDim(pin) ? styles.padDim : ""}`}
                      style={{ left: `${pin._pad.x}%`, top: `${pin._pad.y}%`, "--pin-color": FN_COLOR[pin.fn] }}
                      aria-hidden="true"
                    >
                      {pin.names.silk}
                    </span>
                  ))}
                  {onboardPins.filter((pin) => anchorOnSide(pin, side)).map((pin) => (
                    <button
                      key={`anchor-${pin.id}`}
                      type="button"
                      className={`${styles.anchor} ${pin.id === activeId ? styles.anchorActive : ""} ${isDim(pin) ? styles.padDim : ""}`}
                      style={{ left: `${pin.anchor.x}%`, top: `${pin.anchor.y}%`, "--pin-color": FN_COLOR[pin.fn] }}
                      onClick={() => setActive(pin.id)}
                      aria-label={onboardLabel(pin)}
                    />
                  ))}
                </div>
              </div>

              {flipRow}
            </div>

            <div className={`${styles.col} ${styles.colRight}`}>
              {rightPins.length > 0 && <LaneHead lane="right" lang={lang} />}
              {rightPins.map((pin, index) => (
                <Strip
                  key={pin.id}
                  pin={pin}
                  framework={framework}
                  active={pin.id === activeId}
                  dim={isDim(pin)}
                  retract={retract}
                  lane="right"
                  delay={index * 30}
                  onSelect={setActive}
                  silkRef={(node) => { silkRefs.current[pin.id] = node; }}
                />
              ))}
            </div>
          </div>
          )}

          <div className={styles.list}>
            <LaneHead lane="right" lang={lang} />
            {[...leftPins, ...rightPins, ...tagPins].map((pin) => (
              <Strip
                key={pin.id}
                pin={pin}
                framework={framework}
                active={pin.id === activeId}
                dim={isDim(pin)}
                retract={false}
                lane="right"
                delay={0}
                onSelect={setActive}
              />
            ))}
          </div>

          <aside
            className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
            hidden={!drawerOpen}
            style={{ "--pin-color": activePin ? FN_COLOR[activePin.fn] : undefined }}
          >
            {activePin && (
              <>
                <div className={styles.drawerHead}>
                  <div>
                    <h2 className="home-type-subtitle">{activePin.kind === "onboard" ? onboardLabel(activePin) : activePin.names.silk}</h2>
                    <span className={`${styles.status} ${styles[activePin.status] || ""}`}>{localize(STATUS_LABEL[activePin.status], lang)}</span>
                  </div>
                  <button type="button" className={styles.close} onClick={() => setActiveId("")} aria-label={zh ? "关闭" : "Close"}>×</button>
                </div>
                <p className={`home-type-body ${styles.drawerDesc}`}>{localize(activePin.desc, lang)}</p>
                <table className={styles.names}>
                  <tbody>
                    <tr><th>{zh ? "丝印" : "Silkscreen"}</th><td>{activePin.names.silk}</td></tr>
                    {activePin.names.arduino && activePin.names.arduino !== activePin.names.silk && <tr><th>Arduino</th><td>{activePin.names.arduino}</td></tr>}
                    {activePin.names.micropython && <tr><th>MicroPython</th><td>{activePin.names.micropython}</td></tr>}
                    {activePin.names.zephyr && <tr><th>Zephyr</th><td>{activePin.names.zephyr}</td></tr>}
                    <tr><th>{zh ? "芯片" : "Chip"}</th><td>{activePin.names.chip}</td></tr>
                  </tbody>
                </table>
                <div className={styles.caps}>
                  <span className={styles.cap} style={{ background: FN_COLOR[activePin.fn], color: "#fff" }}>{localize(FN_LABEL[activePin.fn], lang)}</span>
                  {Object.entries(activePin.caps).filter(([, value]) => value).map(([key, value]) => (
                    <span key={key} className={styles.cap}>{CAP_LABEL[key] || key.toUpperCase()}{value === true ? "" : ` ${value}`}</span>
                  ))}
                </div>
                {localize(activePin.warning, lang) && <p className={styles.warning}>{localize(activePin.warning, lang)}</p>}
                {activePin.code && (
                  <>
                    <pre className={styles.code}>{activePin.code}</pre>
                    <button type="button" className={`home-type-action home-filled-action home-primary-cta ${styles.copy}`} onClick={copyCode}>
                      {copied ? (zh ? "已复制" : "Copied") : (zh ? "复制代码" : "Copy code")}
                    </button>
                  </>
                )}
              </>
            )}
          </aside>
        </div>

        {calibrateOn && (
          <div className={styles.calibrate}>
            <p className="home-type-body">
              {zh ? "校准模式：点击板图上的下一个焊盘。" : "Calibrate mode: click the next pad on the photo."}
              {" "}
              {nextCalibrate ? `${zh ? "下一个" : "Next"}: ${nextCalibrate.id}` : (zh ? "本面已完成" : "This face is done")}
            </p>
            <pre>{JSON.stringify(Object.values(calibrated).filter((item) => calibrated[`${boardId}:${side}:${item.id}`]), null, 2)}</pre>
          </div>
        )}
        <div className={styles.live} aria-live="polite">{announce}</div>
      </div>
    </section>
  );
}
