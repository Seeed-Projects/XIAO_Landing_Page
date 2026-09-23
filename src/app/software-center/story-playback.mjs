/** Controls a loop from viewport, tab and motion preferences. 按可见性和动态偏好控制循环。 */
export function createStoryPlayback(video, source, onChange = () => {}) {
  let visible = false;
  let pageVisible = true;
  let reducedMotion = false;
  let userPaused = false;
  let failed = false;
  let destroyed = false;
  let version = 0;

  const report = (playing) => onChange({ playing, still: reducedMotion || failed });
  function update() {
    const request = ++version;
    if (!visible || !pageVisible || reducedMotion || userPaused || failed) {
      video.pause();
      report(false);
      return;
    }
    if (video.getAttribute("src") !== source) video.setAttribute("src", source);
    video.play().then(() => {
      if (!destroyed && request === version) report(true);
    }).catch(() => {
      if (!destroyed && request === version) report(false);
    });
  }

  return {
    setVisible(value) {
      visible = value;
      if (!value && video.readyState > 0) video.currentTime = 0;
      update();
    },
    setPageVisible(value) { pageVisible = value; update(); },
    setReducedMotion(value) { reducedMotion = value; update(); },
    toggle() {
      userPaused = !video.paused;
      update();
    },
    fail() { failed = true; update(); },
    destroy() {
      destroyed = true;
      version += 1;
      video.pause();
    },
  };
}
