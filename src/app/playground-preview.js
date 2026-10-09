"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/basePath";
import { playgroundBoards } from "./playground-boards.mjs";
import { createPlaygroundMotion } from "./playground-motion.mjs";
import { orbitPosition, orbitProgress } from "./playground-orbit.mjs";

// Displays selectable board artwork with viewport-controlled floating motion.
// 展示可选中的板卡素材，并根据可见区域控制浮动动画。
export function PlaygroundPreview() {
  const ref = useRef(null);
  const motion = useRef(null);
  const positions = useRef(playgroundBoards);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const scene = ref.current;
    const hub = scene.parentElement.querySelector(".home-playground-hub");
    const nodes = [...scene.querySelectorAll(".playground-board-position")];
    const controller = createPlaygroundMotion(scene, playgroundBoards, window, () => positions.current);
    motion.current = controller;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 960px)");
    let scrollFrame = null;
    let inView = false;
    // Measures the reading area and applies scroll positions in one animation frame.
    // 在同一个绘制帧中测量阅读区并更新随滚动变化的板卡位置。
    const updateOrbit = () => {
      scrollFrame = null;
      const rect = scene.getBoundingClientRect();
      const content = hub.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const progress = preference.matches ? 1 : orbitProgress(rect.top, rect.height, window.innerHeight);
      const bounds = { left: content.left - rect.left, top: content.top - rect.top, width: content.width, height: content.height };
      positions.current = playgroundBoards.map((board, index) => {
        const point = orbitPosition(index, rect, bounds, progress, desktop.matches);
        nodes[index].style.left = `${point.x}%`;
        nodes[index].style.top = `${point.y}%`;
        nodes[index].style.setProperty("--scroll-angle", `${point.angle}deg`);
        return { ...board, ...point };
      });
    };
    const scheduleOrbit = () => {
      if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateOrbit);
    };
    const onScroll = () => { if (inView) scheduleOrbit(); };
    const updateMotion = () => {
      controller.setEnabled(inView && !preference.matches);
      scheduleOrbit();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setVisible(entry.isIntersecting);
      updateMotion();
    }, { threshold: 0 });
    observer.observe(ref.current);
    const resize = new ResizeObserver(scheduleOrbit);
    resize.observe(scene);
    resize.observe(hub);
    updateOrbit();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleOrbit);
    preference.addEventListener("change", updateMotion);
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleOrbit);
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      preference.removeEventListener("change", updateMotion);
      controller.dispose();
      motion.current = null;
    };
  }, []);

  return (
    <div ref={ref} className="home-playground-preview" data-visible={visible} role="group" aria-label="XIAO board playground"
      onPointerMove={(event) => motion.current?.move(event.clientX, event.clientY, event.pointerType)}
      onPointerLeave={() => motion.current?.clearPointer()}
      onPointerCancel={() => motion.current?.clearPointer()}
      onKeyDown={(event) => { if (event.key === "Escape") { setSelected(null); motion.current?.reset(); } }}>
      {playgroundBoards.map((board, index) => (
        <div key={board.id} className="playground-board-position" data-orbit-side={index < 4 ? "first" : "second"} style={{ "--board-x": `${[12, 37, 63, 88][index % 4]}%`, "--board-y": index < 4 ? "80px" : "calc(100% - 64px)", "--orbit-row": `${13 + index % 4 * 24}%`, "--board-angle": `${board.angle}deg`, "--board-delay": `${index * -0.65}s`, "--board-duration": `${5 + index * 0.35}s`, "--float-x": `${index % 2 ? 3 : -3}px`, "--float-angle": `${index % 2 ? 0.7 : -0.7}deg`, "--entry-x": "0px", "--entry-y": "10px", "--entry-delay": `${index * 45}ms` }}>
          <div className="playground-board-scroll">
          <div className="playground-board-entry">
            <div className="playground-board-nudge">
              <div className="playground-board-wave">
                <div className="playground-board-float">
                  <button type="button" className="playground-board" aria-label={board.name} aria-pressed={selected === board.id} onClick={() => { setSelected(selected === board.id ? null : board.id); motion.current?.play(index); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={withBase(`/home/playground-boards/${board.id}.webp`)} alt="" width={board.width} height={board.height} draggable="false" />
                    <span className="playground-board-label" aria-hidden="true">{board.name}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}
