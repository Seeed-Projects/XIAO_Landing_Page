import { n, POWER_NOTES } from "./util.js";

const nfc = n(
  "caution",
  "NFC antenna pin on the nRF54 radio. Do not drive it as a fast GPIO while an NFC coil is attached.",
  "nRF54 的 NFC 天线脚。接了线圈时不要当高速 GPIO 驱动。",
);

const samd11 = n(
  "info",
  "Debug pads for the onboard SAMD11 USB-UART bridge. You only need these to reflash the bridge firmware.",
  "板载 SAMD11 USB-串口桥的调试焊盘。只有重刷桥固件时才用得到。",
);

const pmic = n(
  "danger",
  "nPM1300 ship/hibernate pin. A low pulse here can put the board to sleep so it looks dead until you wake it.",
  "nPM1300 的 ship/hibernate 脚。拉低脉冲会让板子休眠，看起来像死机，直到被唤醒。",
);

export default {
  byId: {
    ...POWER_NOTES,
    SHPHLD: [pmic],
    NFC1: [nfc],
    NFC2: [nfc],
    SWCLK: [n("info", "nRF54 SWD clock. Shared silk may also mention SAMD11.", "nRF54 SWD 时钟。丝印上可能同时标了 SAMD11。")],
    SWDIO: [n("info", "nRF54 SWD data.", "nRF54 SWD 数据。")],
    SWCLK2: [samd11],
    SWDIO2: [samd11],
    RST2: [samd11],
    SAMD11_SWCLK: [samd11],
    SAMD11_SWDIO: [samd11],
    SAMD11_RST: [samd11],
    nRST: POWER_NOTES.RST,
  },
  byChip: {
    "P1.02": [nfc],
    "P1.03": [n("info", "On nRF54L15 this is NFC2; on nRF54LM20A the same name is the header I2C SDA.", "nRF54L15 上这是 NFC2；nRF54LM20A 上同名是排针 I2C SDA。")],
    "P1.01": [nfc],
    SHPHLD: [pmic],
    "P0.00": [n("info", "User key on nRF54L15; expanded GPIO on nRF54LM20A.", "nRF54L15 上是用户按键；nRF54LM20A 上是扩展 GPIO。")],
    nRF54_RESET: POWER_NOTES.RST,
    SWDCLK: [n("info", "Serial Wire clock for the nRF54.", "nRF54 的 SWD 时钟。")],
    SWDIO: [n("info", "Serial Wire data for the nRF54.", "nRF54 的 SWD 数据。")],
    PA30: [samd11],
    PA31: [samd11],
    RST2: [samd11],
  },
  byBoard: {
    nrf54lm20a: {
      SHPHLD: [pmic],
    },
    nrf54lm20asense: {
      SHPHLD: [pmic],
      "P0.08": [n("caution", "Onboard IMU SDA. Leave it to the IMU unless you know the address map.", "板载 IMU 的 SDA。除非清楚地址，否则不要挪用。")],
      "P0.07": [n("caution", "Onboard IMU SCL.", "板载 IMU 的 SCL。")],
    },
  },
};
