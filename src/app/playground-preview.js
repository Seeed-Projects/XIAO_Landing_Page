"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/basePath";
import { playgroundBoards } from "./playground-boards.mjs";
import { createPlaygroundMotion } from "./playground-motion.mjs";

// Displays selectable board artwork with viewport-controlled floating motion.
// 展示可选中的板卡素材，并根据可见区域控制浮动动画。
export function PlaygroundPreview() {
  const ref = useRef(null);
  const motion = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = createPlaygroundMotion(ref.current, playgroundBoards, window);
    motion.current = controller;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const updateMotion = () => controller.setEnabled(inView && !preference.matches);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      setVisible(entry.isIntersecting);
      updateMotion();
    }, { threshold: 0 });
    observer.observe(ref.current);
    preference.addEventListener("change", updateMotion);
    return () => {
      observer.disconnect();
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
        <div key={board.id} className="playground-board-position" style={{ "--board-x": `${board.x}%`, "--board-y": `${board.y}%`, "--board-angle": `${board.angle}deg`, "--board-delay": `${index * -0.65}s`, "--board-duration": `${5 + index * 0.35}s`, "--entry-x": `${(50 - board.x) * 1.2}px`, "--entry-y": `${(50 - board.y) * 1.2}px`, "--entry-delay": `${index * 45}ms` }}>
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
      ))}
    </div>
  );
}
