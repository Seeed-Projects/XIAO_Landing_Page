// Maps pointer distance to a bounded outward displacement in scene pixels.
// 将鼠标与板卡的距离换算成场景内有限幅度的向外位移。
export function boardNudge(board, pointer, size) {
  const dx = board.x / 100 * size.width - pointer.x;
  const dy = board.y / 100 * size.height - pointer.y;
  const distance = Math.hypot(dx, dy);
  const radius = Math.max(1, size.width * 0.48);
  const strength = Math.max(0, 1 - distance / radius) ** 2;
  const length = distance + 24;
  return { x: dx / length * strength * 14, y: dy / length * strength * 14, angle: dx / length * strength * 5 };
}

// Returns a distance-ordered response for a board relative to the clicked board.
// 返回当前板卡相对点击板卡的波浪延迟和弹起幅度。
export function boardWave(board, source) {
  const distance = Math.hypot(board.x - source.x, board.y - source.y);
  return { delay: Math.round(distance * 4.5), lift: 8 + 12 * Math.max(0, 1 - distance / 100) };
}

// Coordinates pointer frames and cancellable wave animations for one board scene.
// 管理一个板卡场景的鼠标绘制帧和可取消的波浪动画。
export function createPlaygroundMotion(scene, boards, clock) {
  const nudges = [...scene.querySelectorAll('.playground-board-nudge')];
  const waves = [...scene.querySelectorAll('.playground-board-wave')];
  const animations = new Set();
  let frame = null;
  let pointer = null;
  let enabled = false;

  const clearPointer = () => {
    if (frame !== null) clock.cancelAnimationFrame(frame);
    frame = null;
    pointer = null;
    nudges.forEach(node => node.style.removeProperty('transform'));
  };
  const cancelWaves = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  const reset = () => { clearPointer(); cancelWaves(); };

  return {
    setEnabled(value) { enabled = value; if (!value) reset(); },
    clearPointer,
    reset,
    move(clientX, clientY, pointerType) {
      if (!enabled || pointerType !== 'mouse') return;
      pointer = { x: clientX, y: clientY };
      if (frame !== null) return;
      frame = clock.requestAnimationFrame(() => {
        frame = null;
        const rect = scene.getBoundingClientRect();
        const local = { x: pointer.x - rect.left, y: pointer.y - rect.top };
        boards.forEach((board, index) => {
          const offset = boardNudge(board, local, rect);
          nudges[index].style.transform = `translate(${offset.x}px, ${offset.y}px) rotate(${offset.angle}deg)`;
        });
      });
    },
    play(index) {
      if (!enabled || !boards[index]) return;
      cancelWaves();
      boards.forEach((board, boardIndex) => {
        const { delay, lift } = boardWave(board, boards[index]);
        const animation = waves[boardIndex].animate([
          { transform: 'translateY(0) scale(1)', offset: 0 },
          { transform: 'translateY(3px) scale(0.97)', offset: 0.15 },
          { transform: `translateY(-${lift}px) scale(1.035)`, offset: 0.42 },
          { transform: 'translateY(2px) scale(0.995)', offset: 0.76 },
          { transform: 'translateY(0) scale(1)', offset: 1 },
        ], { duration: 620, delay, easing: 'ease-in-out' });
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => animations.delete(animation);
      });
    },
    dispose() { enabled = false; reset(); },
  };
}
