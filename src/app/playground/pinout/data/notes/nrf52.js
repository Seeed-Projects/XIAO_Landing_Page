import { n, POWER_NOTES } from "./util.js";

const nfc = n(
  "caution",
  "NFC antenna pad (P0.09 / P0.10). If you use it as GPIO, do not also attach an NFC coil. Sense Plus maps these to UART1 on the extra header.",
  "NFC 天线焊盘（P0.09 / P0.10）。当 GPIO 用时就不要再接 NFC 线圈。Sense Plus 把它们映射到扩展排针上的 UART1。",
);

const ain = n(
  "caution",
  "SAADC analog input. The pin is not 5 V tolerant. Use the internal 1:14 battery divider only on the dedicated VBAT pin.",
  "SAADC 模拟输入。不耐 5V。电池分压只走专用 VBAT 脚。",
);

const swd = n(
  "info",
  "SWD debug pad. Needed for a hardware debugger or recovering a bricked bootloader. Leave unconnected in normal use.",
  "SWD 调试焊盘。硬件调试或救砖时用。平时可以悬空。",
);

export default {
  byId: {
    ...POWER_NOTES,
    "BAT+": [
      ...POWER_NOTES["BAT+"],
      n("caution", "Onboard charger is about 100 mA (P0.13 charge control). P0.17 drives the charge LED.", "板载充电大约 100 mA（P0.13 控制）。P0.17 驱动充电指示灯。"),
    ],
    NFC1: [nfc],
    NFC2: [nfc],
    SWCLK: [swd],
    SWDIO: [swd],
    RST: [
      ...POWER_NOTES.RST,
      n("info", "Reset is P0.18 on nRF52840. It is also a GPIO, but treating it as reset is safer.", "nRF52840 复位是 P0.18。它也能当 GPIO，但当作复位更稳妥。"),
    ],
  },
  byChip: {
    "P0.02": [ain, n("info", "AIN0 on D0.", "D0 上的 AIN0。")],
    "P0.03": [ain, n("info", "AIN1 on D1.", "D1 上的 AIN1。")],
    "P0.28": [ain],
    "P0.29": [ain],
    "P0.04": [n("info", "Default I2C SDA (D4) and AIN2.", "默认 I2C SDA（D4），兼 AIN2。")],
    "P0.05": [n("info", "Default I2C SCL (D5) and AIN3.", "默认 I2C SCL（D5），兼 AIN3。")],
    "P0.09": [nfc],
    "P0.10": [nfc],
    "P0.14": [n("caution", "Battery measure enable / analog path. Do not drive it as a random GPIO while measuring VBAT.", "电池测量使能/模拟通路。测电池时不要当普通 GPIO 乱推。")],
    "P0.18": POWER_NOTES.RST,
    "P0.15": [n("info", "Plus back pad D11 / I2S_SD.", "Plus 背面 D11 / I2S_SD。")],
    "P0.31": [ain, n("info", "AIN7 battery sense on Plus (D16).", "Plus 上 AIN7 电池检测（D16）。")],
    SWCLK: [swd],
    SWDIO: [swd],
  },
  byBoard: {
    nrf52840plus: {
      "P0.09": [n("caution", "NFC1 is brought out as D14 / UART1 RX on the Plus header. Pick NFC or UART, not both.", "NFC1 在 Plus 排针上是 D14 / UART1 RX。NFC 和 UART 二选一。")],
      "P0.10": [n("caution", "NFC2 is brought out as D15 / UART1 TX on the Plus header.", "NFC2 在 Plus 排针上是 D15 / UART1 TX。")],
    },
    nrf52840senseplus: {
      "P0.09": [n("caution", "NFC1 is brought out as D14 / UART1 RX on the Plus header. Pick NFC or UART, not both.", "NFC1 在 Plus 排针上是 D14 / UART1 RX。NFC 和 UART 二选一。")],
      "P0.10": [n("caution", "NFC2 is brought out as D15 / UART1 TX on the Plus header.", "NFC2 在 Plus 排针上是 D15 / UART1 TX。")],
    },
  },
};
