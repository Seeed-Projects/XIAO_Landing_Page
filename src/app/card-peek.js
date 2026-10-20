"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCardPeekPosition } from "./card-peek-position.mjs";

const CARD_SELECTOR = "[data-card-index]";
const OPEN_DELAY_MS = 160;
const SWITCH_GRACE_MS = 120;
const SCROLL_SETTLE_MS = 180;

/**
 * Show the hovered card's complete details in a floating panel beside it.
 * The panel never receives pointer or wheel input, so page scrolling stays native.
 * 在悬停卡片旁浮出完整详情；面板不接收指针与滚轮，页面滚动始终由浏览器原生处理。
 */
export function CardPeek({ renderPeek, children }) {
  const areaRef = useRef(null);
  const panelRef = useRef(null);
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
    let settleTimer = 0;
    const trackPointer = (event) => {
      pointerRef.current = event.pointerType === "mouse" ? { x: event.clientX, y: event.clientY } : null;
    };
    const forgetPointer = (event) => {
      if (!event.relatedTarget) pointerRef.current = null;
    };
    // Hide while the page scrolls, then restore the keyboard-focused card or the card under the resting cursor.
    // 页面滚动期间收起面板，停止后恢复键盘聚焦的卡片，或识别静止光标下方的卡片。
    const handleScroll = () => {
      scrollingRef.current = true;
      show(null);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        scrollingRef.current = false;
        const area = areaRef.current;
        const focused = document.activeElement;
        const point = pointerRef.current;
        const hovered = point && document.elementFromPoint(point.x, point.y)?.closest(CARD_SELECTOR);
        if (focused?.matches(`${CARD_SELECTOR}:focus-visible`) && area?.contains(focused)) show(focused);
        else if (hovered && area?.contains(hovered)) queue(hovered);
      }, SCROLL_SETTLE_MS);
    };
    const close = () => show(null);
    const handleKey = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("pointermove", trackPointer, { passive: true });
    window.addEventListener("pointerout", forgetPointer, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(timerRef.current);
      window.removeEventListener("pointermove", trackPointer);
      window.removeEventListener("pointerout", forgetPointer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", handleKey);
    };
  }, [queue, show]);

  // Measure before paint so the panel appears directly in its final place; spotlight the source card.
  // 在绘制前完成测量，面板直接出现在最终位置；同时高亮来源卡片。
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const card = activeRef.current?.card;
    if (!active || !panel || !card) return;
    const header = document.getElementById("site-header");
    const { side, left, top, notch } = getCardPeekPosition(
      card.getBoundingClientRect(),
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: document.documentElement.clientWidth, height: window.innerHeight },
      { topInset: header ? Math.max(0, header.getBoundingClientRect().bottom) : 0 },
    );
    panel.dataset.side = side;
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.setProperty("--peek-notch", `${notch}px`);
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
        <div ref={panelRef} key={active.index} className="card-peek-panel" aria-hidden="true">
          {renderPeek(active.index)}
        </div>,
        document.body,
      )}
    </div>
  );
}
