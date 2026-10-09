import { n, POWER_NOTES } from "./util.js";

const dac = n(
  "info",
  "Only PA02 (D0 / A0) has a true DAC. Other analog pins are ADC-only.",
  "只有 PA02（D0 / A0）有真正的 DAC。其它模拟脚只能做 ADC。",
);

const sercom = n(
  "info",
  "SAMD21 routes I2C / SPI / UART through SERCOM pads. The Arduino core already assigns the XIAO defaults; changing them means picking the matching PAD.",
  "SAMD21 的 I2C / SPI / UART 走 SERCOM 焊盘。Arduino 核心已经排好 XIAO 默认脚；改脚就要对上对应 PAD。",
);

const usb5v = n(
  "caution",
  "VIN / VBUS follows USB 5 V. The SAMD21 I/O is 3.3 V only.",
  "VIN / VBUS 跟随 USB 5V。SAMD21 的 IO 只有 3.3V。",
);

export default {
  byId: {
    ...POWER_NOTES,
    "5V": [...POWER_NOTES["5V"], usb5v],
    VIN: [usb5v],
    SWCLK: [n("info", "SWD clock on PA30. Use with SWDIO to load firmware via a debug probe.", "SWD 时钟，PA30。配合 SWDIO 用调试器下载固件。")],
    SWDIO: [n("info", "SWD data on PA31.", "SWD 数据，PA31。")],
    GND_SWD: [n("info", "Ground next to the SWD pads. Tie the debugger ground here.", "SWD 旁边的地。调试器地线接这里。")],
    GND_VIN: [n("info", "Ground next to VIN.", "VIN 旁边的地。")],
  },
  byChip: {
    PA02: [dac, n("caution", "ADC and DAC share this pin. Do not analogWrite and analogRead at the same time.", "ADC 和 DAC 共用这只脚。不要同时 analogWrite 和 analogRead。")],
    PA04: [n("info", "ADC A1 (AIN4).", "ADC A1（AIN4）。")],
    PA08: [sercom, n("info", "Default I2C SDA (SERCOM0/2 PAD0) and AIN16.", "默认 I2C SDA（SERCOM0/2 PAD0），兼 AIN16。")],
    PA09: [sercom, n("info", "Default I2C SCL (SERCOM0/2 PAD1) and AIN17.", "默认 I2C SCL（SERCOM0/2 PAD1），兼 AIN17。")],
    PB08: [sercom, n("caution", "UART TX (D6). The native USB Serial object is USB, not this pin.", "UART TX（D6）。USB 的 Serial 对象走 USB，不是这只脚。")],
    PB09: [sercom],
    PA07: [sercom],
    PA05: [sercom],
    PA06: [sercom],
    PA17: [n("info", "User LED on SAMD21; SCL1 on SAMD21 Plus back header (D13).", "SAMD21 上是用户 LED；SAMD21 Plus 背面 D13 是 SCL1。")],
    PA16: [n("info", "I2C1 SDA on SAMD21 Plus (D14).", "SAMD21 Plus 的 I2C1 SDA（D14）。")],
    PA30: [n("info", "SWCLK.", "SWCLK。")],
    PA31: [n("info", "SWDIO.", "SWDIO。")],
    RESETN: POWER_NOTES.RST,
  },
  byBoard: {
    samd21plus: {
      PA16: [n("info", "Second I2C data on the Plus back header.", "Plus 背面第二组 I2C 数据。")],
      PA17: [n("info", "Second I2C clock on the Plus back header.", "Plus 背面第二组 I2C 时钟。")],
    },
  },
};
