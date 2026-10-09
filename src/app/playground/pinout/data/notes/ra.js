import { n, POWER_NOTES } from "./util.js";

const tol = n(
  "info",
  "RA4M1 I/O is 5 V tolerant on many digital pins, but the ADC still expects ≤ 3.3 V. When in doubt, stay at 3.3 V.",
  "RA4M1 很多数字脚耐 5V，但 ADC 仍然要求 ≤ 3.3V。不确定时一律按 3.3V。",
);

export default {
  byId: {
    ...POWER_NOTES,
    Boot: [n("caution", "MD / BOOT pin. Hold at reset to enter the RA4 ROM bootloader.", "MD / BOOT 脚。复位时按住进入 RA4 ROM 引导程序。")],
    SWCLK: [n("info", "SWD clock.", "SWD 时钟。")],
    SWDIO: [n("info", "SWD data.", "SWD 数据。")],
  },
  byChip: {
    P014: [tol, n("info", "A0 analog.", "A0 模拟。")],
    P000: [tol],
    P001: [tol],
    P002: [tol],
    P206: [n("info", "I2C SDA (D4).", "I2C SDA（D4）。")],
    P100: [n("info", "I2C SCL (D5).", "I2C SCL（D5）。")],
    P302: [n("info", "UART TX (D6).", "UART TX（D6）。")],
    P301: [n("info", "UART RX (D7).", "UART RX（D7）。")],
    RES: POWER_NOTES.RST,
    P201: [n("caution", "BOOT / MD.", "BOOT / MD。")],
    P015: [n("caution", "Battery ADC through a divider. Do not inject 5 V here.", "电池 ADC 经分压。不要往这里灌 5V。")],
    P408: [n("info", "UART9 RX on the back header (D11).", "背面 UART9 RX（D11）。")],
    P409: [n("info", "UART9 TX on the back header (D12).", "背面 UART9 TX（D12）。")],
  },
  byBoard: {},
};
