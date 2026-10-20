"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCardPeekPosition } from "./card-peek-position.mjs";

const CARD_SELECTOR = "[data-card-index]";
const OPEN_DELAY_MS = 160;
const SWITCH_GRACE_MS = 120;
const SCROLL_SETTLE_MS = 180;
const SPOT_PADDING = 6;

function sourceHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Standard peek layout: optional image, label row, full title and description, badge and source host.
 * 标准详情布局：可选图片、标签行、完整标题与描述、徽标与来源域名。
 */
export function CardPeekContent({ image, tag, meta, title, description, badge, url }) {
  const host = sourceHost(url);
  return (
    <>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="card-peek-image" src={image} alt="" decoding="async" />
      )}
      {(tag || meta) && (
        <div className="mb-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {tag && <span className="card-peek-tag">{tag}</span>}
          {meta && <span className="card-peek-meta">{meta}</span>}
        </div>
      )}
      {title && <p className="home-type-subtitle card-peek-title">{title}</p>}
      {description && <p className="home-type-body card-peek-body mt-2">{description}</p>}
      {(badge || host) && (
        <div className="card-peek-footer mt-4 flex items-center justify-between gap-3 pt-3">
          {badge && <span className="card-peek-board min-w-0 truncate">{badge}</span>}
          {host && (
            <span className="card-peek-meta ml-auto inline-flex shrink-0 items-center gap-1">
              {host}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </span>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Show the hovered card's complete details in a floating panel beside it.
 * Cards inside `children` carry `data-card-index`; `renderPeek(index)` returns the panel content.
 * The panel and the spotlight veil are pointer-transparent, so the wheel always scrolls the page.
 * 在悬停卡片旁浮出完整详情。`children` 中的卡片带有 `data-card-index`，
 * `renderPeek(index)` 返回面板内容；面板与聚光遮罩对指针透明，滚轮始终滚动页面。
 */
export function CardPeek({ renderPeek, children }) {
  const areaRef = useRef(null);
  const panelRef = useRef(null);
  const veilRef = useRef(null);
  const spotRef = useRef(null);
  const timerRef = useRef(0);
  const pendingRef = useRef(null);
  const activeRef = useRef(null);
  const pointerRef = useRef(null);
  const scrollingRef = useRef(false);
  const [active, setActive] = useState(null);

  const show = useCallback((card) => {
    window.clearTimeout(timerRef.current);
    pendingRef.current = card;
    if ((activeRef.current?.card ?? null) === card) return;
    activeRef.current = card ? { card, index: Number(card.dataset.cardIndex) } : null;
    setActive(activeRef.current);
  }, []);

  // Open after a short hover pause; switch at once while a panel is visible.
  // 首次悬停稍作停留再打开；面板已显示时，移到相邻卡片立即切换。
  const queue = useCallback((card) => {
    if (pendingRef.current === card) return;
    window.clearTimeout(timerRef.current);
    pendingRef.current = card;
    const delay = card ? (activeRef.current ? 0 : OPEN_DELAY_MS) : SWITCH_GRACE_MS;
    if (delay) timerRef.current = window.setTimeout(() => show(card), delay);
    else show(card);
  }, [show]);

  useEffect(() => {
    const area = areaRef.current;
    let settleTimer = 0;
    const trackPointer = (event) => {
      pointerRef.current = event.pointerType === "mouse" ? { x: event.clientX, y: event.clientY } : null;
    };
    const forgetPointer = (event) => {
      if (!event.relatedTarget) pointerRef.current = null;
    };
    // Hide while the page or a card track scrolls, then restore the keyboard-focused card
    // or the card under the resting cursor.
    // 页面或卡片轨道滚动期间收起面板，停止后恢复键盘聚焦的卡片，或识别静止光标下方的卡片。
    const handleScroll = () => {
      scrollingRef.current = true;
      show(null);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        scrollingRef.current = false;
        const focused = document.activeElement;
        const point = pointerRef.current;
        const hovered = point && document.elementFromPoint(point.x, point.y)?.closest(CARD_SELECTOR);
        if (focused?.matches(`${CARD_SELECTOR}:focus-visible`) && area.contains(focused)) show(focused);
        else if (hovered && area.contains(hovered)) queue(hovered);
      }, SCROLL_SETTLE_MS);
    };
    const close = () => show(null);
    const handleKey = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerout", forgetPointer, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    area.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(timerRef.current);
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerout", forgetPointer);
      window.removeEventListener("scroll", handleScroll);
      area.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", handleKey);
    };
  }, [queue, show]);

  // Measure before paint: place the panel, cover the card area with the veil, and cut the spotlight around the card.
  // 在绘制前完成测量：放置面板，用遮罩覆盖卡片区域，并在来源卡片处留出聚光窗口。
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const veil = veilRef.current;
    const spot = spotRef.current;
    const card = activeRef.current?.card;
    if (!active || !panel || !veil || !spot || !card) return;
    const cardRect = card.getBoundingClientRect();
    const areaRect = areaRef.current.getBoundingClientRect();
    const header = document.getElementById("site-header");
    const { side, left, top, notch } = getCardPeekPosition(
      cardRect,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: document.documentElement.clientWidth, height: window.innerHeight },
      { topInset: header ? Math.max(0, header.getBoundingClientRect().bottom) : 0 },
    );
    panel.dataset.side = side;
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.setProperty("--peek-notch", `${notch}px`);
    Object.assign(veil.style, {
      left: `${areaRect.left}px`,
      top: `${areaRect.top}px`,
      width: `${areaRect.width}px`,
      height: `${areaRect.height}px`,
    });
    Object.assign(spot.style, {
      left: `${cardRect.left - areaRect.left - SPOT_PADDING}px`,
      top: `${cardRect.top - areaRect.top - SPOT_PADDING}px`,
      width: `${cardRect.width + SPOT_PADDING * 2}px`,
      height: `${cardRect.height + SPOT_PADDING * 2}px`,
    });
    card.setAttribute("data-peek-active", "");
    return () => card.removeAttribute("data-peek-active");
  }, [active]);

  const handlePointerOver = (event) => {
    if (event.pointerType !== "mouse") return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (!scrollingRef.current) queue(event.target.closest(CARD_SELECTOR));
  };

  const handleFocus = (event) => {
    const card = event.target.closest(CARD_SELECTOR);
    if (card && event.target.matches(":focus-visible")) show(card);
  };

  const handleBlur = (event) => {
    if (!event.relatedTarget?.closest?.(CARD_SELECTOR)) show(null);
  };

  return (
    <div
      ref={areaRef}
      className="card-peek-area"
      data-peek-open={active ? "" : undefined}
      onPointerOver={handlePointerOver}
      onPointerLeave={() => show(null)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {active && createPortal(
        <>
          <div ref={veilRef} className="card-peek-veil" aria-hidden="true">
            <div ref={spotRef} className="card-peek-spot" />
          </div>
          <div ref={panelRef} key={active.index} className="card-peek-panel" aria-hidden="true">
            {renderPeek(active.index)}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
