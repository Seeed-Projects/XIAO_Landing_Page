"use client";

import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/basePath";
import { createStoryPlayback } from "./story-playback.mjs";
import { DIAGRAM_IDS } from "./official-stories.mjs";
import styles from "./software-center.module.css";

/** Shows the software illustration with a static fallback. 显示软件动画及静态备用画面。 */
export function StoryDiagram({ id, lang = "en" }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const controller = useRef(null);
  const [state, setState] = useState({ playing: false, still: false });
  const mediaId = DIAGRAM_IDS.includes(id) ? id : "ha";
  const poster = withBase(`/software-animations/${mediaId}.webp`);
  const source = withBase(`/software-animations/${mediaId}.mp4`);
  const label = state.playing
    ? (lang === "zh" ? "暂停动画" : "Pause animation")
    : (lang === "zh" ? "播放动画" : "Play animation");

  useEffect(() => {
    const playback = createStoryPlayback(videoRef.current, source, setState);
    controller.current = playback;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => playback.setReducedMotion(preference.matches);
    const syncVisibility = () => playback.setPageVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      (entries) => entries.forEach((entry) => playback.setVisible(entry.isIntersecting)),
      { threshold: 0 }
    );
    if (observer) observer.observe(ref.current);
    else playback.setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
      playback.destroy();
      controller.current = null;
    };
  }, [source]);

  return (
    <div ref={ref} className={styles.stage} data-diagram={id}
      data-still={state.still ? "1" : "0"}
      style={{ backgroundImage: `url("${poster}")` }}>
      <video ref={videoRef} className={styles.storyVideo} poster={poster}
        width="1200" height="720" loop muted playsInline preload="none" aria-hidden="true"
        onError={() => controller.current?.fail()} />
      {!state.still && (
        <button type="button" className={styles.motionControl} aria-label={label} title={label}
          onClick={() => controller.current?.toggle()}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            {state.playing
              ? <path d="M6 4v12M14 4v12" stroke="currentColor" strokeWidth="3" />
              : <path d="m6 3 11 7-11 7Z" fill="currentColor" />}
          </svg>
        </button>
      )}
    </div>
  );
}
