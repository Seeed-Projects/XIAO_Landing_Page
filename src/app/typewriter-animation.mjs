// Creates a replayable character animation; onUpdate receives text and typing state.
// 创建可重播的逐字动画；onUpdate 接收当前文字与输入状态。
export function createTypewriter(text, onUpdate, {
  duration = 3500,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
} = {}) {
  const characters = Array.from(text);
  let frame;
  let startedAt;
  let previousCount;

  function stop() {
    cancelFrame(frame);
    frame = undefined;
  }

  function tick(now) {
    startedAt ??= now;
    const count = Math.min(characters.length, Math.floor((now - startedAt) / duration * characters.length));
    if (count !== previousCount) {
      onUpdate(characters.slice(0, count).join(""), count < characters.length);
      previousCount = count;
    }
    if (count < characters.length) frame = requestFrame(tick);
  }

  return {
    play() {
      stop();
      startedAt = undefined;
      previousCount = -1;
      onUpdate("", characters.length > 0);
      frame = requestFrame(tick);
    },
    reset() {
      stop();
      onUpdate("", false);
    },
    finish() {
      stop();
      onUpdate(text, false);
    },
    stop,
  };
}
