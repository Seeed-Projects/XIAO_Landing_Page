import { n, POWER_NOTES } from "./util.js";

const dualSwd = n(
  "info",
  "Two debug ports: M_* talks to the MG24 radio MCU, S_* talks to the SAMD11 USB bridge.",
  "两套调试口：M_* 连 MG24 射频 MCU，S_* 连 SAMD11 USB 桥。",
);

const rf = n(
  "info",
  "RF switch selects the onboard antenna or U.FL. Leave it to the BSP unless you are testing antennas.",
  "射频开关在板载天线和 U.FL 之间切换。一般交给板级包，测天线时再自己控。",
);

export default {
  byId: {
    ...POWER_NOTES,
    M_CLK: [dualSwd],
    M_DIO: [dualSwd],
    M_RST: [dualSwd, n("caution", "MG24 reset. Pulse low to reboot the radio MCU.", "MG24 复位。拉低脉冲重启射频 MCU。")],
    S_CLK: [dualSwd],
    S_DIO: [dualSwd],
    S_RST: [dualSwd],
    RF_SW: [rf],
    RF_SW_PWR: [rf],
  },
  byChip: {
    PC04: [n("info", "Default I2C SDA (D4).", "默认 I2C SDA（D4）。")],
    PC05: [n("info", "Default I2C SCL (D5).", "默认 I2C SCL（D5）。")],
    PC06: [n("info", "Default UART TX (D6).", "默认 UART TX（D6）。")],
    PC07: [n("info", "Default UART RX (D7).", "默认 UART RX（D7）。")],
    PA03: [n("info", "SPI SCK (D8).", "SPI SCK（D8）。")],
    RESET: POWER_NOTES.RST,
    PB04: [rf],
    PB05: [rf],
    PD04: [n("caution", "Battery ADC. Enable the measure path before reading.", "电池 ADC。读数前先打开测量通路。")],
    "MG24 SWCLK": [dualSwd],
    "MG24 SWDIO": [dualSwd],
    "MG24 RESET": [dualSwd],
    "SAMD11 SWCLK": [dualSwd],
    "SAMD11 SWDIO": [dualSwd],
    "SAMD11 RESET": [dualSwd],
  },
  byBoard: {},
};
