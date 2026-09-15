export const DEFAULT_REEL_CYCLES = 2;

// Builds complete digit cycles followed by the exact target digit.
// 生成完整数字循环，并在目标数字上结束。
export function createDigitReel(digit, cycles = DEFAULT_REEL_CYCLES) {
  const target = Number.parseInt(digit, 10);
  if (!Number.isInteger(target) || target < 0 || target > 9) return [];
  const reel = [];
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    for (let value = 0; value <= 9; value += 1) reel.push(value);
  }
  for (let value = 0; value <= target; value += 1) reel.push(value);
  return reel;
}

export function rollingTargetStep(digit, cycles = DEFAULT_REEL_CYCLES) {
  return cycles * 10 + Number.parseInt(digit, 10);
}
