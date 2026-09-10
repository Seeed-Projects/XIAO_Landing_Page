"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/basePath";
import { playgroundBoards } from "./playground-boards.mjs";

// Displays selectable board artwork with viewport-controlled floating motion.
// 展示可选中的板卡素材，并根据可见区域控制浮动动画。
export function PlaygroundPreview() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="home-playground-preview" data-visible={visible} role="group" aria-label="XIAO board playground" onKeyDown={(event) => { if (event.key === "Escape") setSelected(null); }}>
      {playgroundBoards.map((board, index) => (
        <div key={board.id} className="playground-board-position" style={{ "--board-x": `${board.x}%`, "--board-y": `${board.y}%`, "--board-angle": `${board.angle}deg`, "--board-delay": `${index * -0.65}s`, "--board-duration": `${5 + index * 0.35}s` }}>
          <div className="playground-board-float">
            <button type="button" className="playground-board" aria-label={board.name} aria-pressed={selected === board.id} onClick={() => setSelected(selected === board.id ? null : board.id)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(`/home/playground-boards/${board.id}.webp`)} alt="" width={board.width} height={board.height} draggable="false" />
              <span className="playground-board-label" aria-hidden="true">{board.name}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
