export const ALT_KEYS = ["adc", "i2c", "spi", "uart", "pwm", "other"];

/** Build an alt-function record, dropping empty keys. 构造备用功能表，空键去掉。 */
export function alt(spec = {}) {
  const out = {};
  for (const key of ALT_KEYS) {
    if (spec[key] == null || spec[key] === "") continue;
    out[key] = spec[key];
  }
  return out;
}

export const MATRIX = "any GPIO (matrix)";
export const PWM_LEDC = "LEDC any GPIO";
export const PWM_NRF = "PWM any GPIO";
export const SERCOM = "SERCOM (see pad table)";
