import { column, defineBoard } from "../defineBoard.js";
import frontDiagram from "../diagrams/samd21-front.js";

/**
 * XIAO SAMD21 — reference board for the explicit layout format.
 * Coordinates are percentages of each photo, measured with
 * `node scripts/pinout-pad-scan.mjs samd21`.
 * XIAO SAMD21 —— 显式布局格式的参考板。坐标为各照片的百分比，
 * 由 `node scripts/pinout-pad-scan.mjs samd21` 量出。
 */

const FRONT = {
  ...column(["D0", "D1", "D2", "D3", "D4", "D5", "D6"], 16.16, [22.75, 32.85, 42.85, 52.9, 62.93, 72.91, 82.98], "left"),
  ...column(["5V", "GND", "3V3", "D10", "D9", "D8", "D7"], 85.3, [23.1, 33.18, 43.2, 53.2, 63.26, 73.23, 83.36], "right"),
};

// The back photo mirrors the front, so the power column sits on the left.
// 背面照片与正面镜像，电源列位于左侧。
const BACK = {
  ...column(["5V", "GND", "3V3", "D10", "D9", "D8", "D7"], 14.12, [23.05, 32.92, 42.8, 52.62, 62.45, 72.26, 82.07], "left"),
  ...column(["D0", "D1", "D2", "D3", "D4", "D5", "D6"], 85.75, [23.05, 32.92, 42.8, 52.62, 62.45, 72.26, 82.07], "right"),
};

const header = (id, spec) => ({ id, front: FRONT[id], back: BACK[id], ...spec });

const analog = (id, chip, { caps, ...extra } = {}) => header(id, {
  arduino: id.replace("D", "A"),
  chip,
  fn: "analog",
  caps: { adc: id.replace("D", "A"), pwm: true, ...caps },
  warning: { en: "Input voltage must not exceed 3.3V.", zh: "输入电压不得超过 3.3V。" },
  desc: { en: `Digital ${id.slice(1)} / Analog ${id.slice(1)}`, zh: `数字 ${id.slice(1)} / 模拟 ${id.slice(1)}` },
  code: `int v = analogRead(${id.replace("D", "A")});`,
  ...extra,
});

const bus = (id, alias, fn, chip, spec) => header(id, {
  arduino: alias,
  chip,
  fn,
  caps: { adc: id.replace("D", "A"), [fn]: alias, pwm: true },
  ...spec,
});

const samd21 = defineBoard({
  id: "samd21",
  name: "XIAO SAMD21",
  series: "samd",
  frameworks: ["arduino"],
  images: {
    front: { src: "/xiao-products/dev_boards/samd21-front.webp", width: 720, height: 796 },
    back: { src: "/xiao-products/dev_boards/samd21-back.webp", width: 720, height: 840 },
  },
  // Official pinout diagram; row ids follow the label rows top to bottom on each side.
  // 官方引脚图；行 id 按两侧标签行自上而下的顺序排列。
  diagram: {
    front: {
      src: "/xiao-products/pinout/samd21-front.svg",
      layout: frontDiagram,
      rows: {
        left: ["USER_LED", "POWER_LED", "RST", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
        right: ["TX_LED", "RX_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
      },
    },
  },
  tagline: { en: "SAMD21G18 — Cortex-M0+; the original Seeeduino XIAO flagship.", zh: "SAMD21G18 — Cortex-M0+，初代 Seeeduino XIAO 旗舰。" },
  facts: {
    v33MaxMa: 200,
    battery: {
      en: "No charger onboard; VIN pad on the back accepts 3.3–5V",
      zh: "无充电电路；背面 VIN 焊盘可接 3.3–5V",
    },
  },
  pins: [
    header("5V", {
      chip: "VBUS", fn: "power",
      desc: { en: "5V power in/out (USB VBUS)", zh: "5V 电源输入/输出（USB VBUS）" },
      warning: { en: "From USB; keep peripheral load under 500mA.", zh: "来自 USB，外设勿超 500mA。" },
    }),
    header("GND", { chip: "—", fn: "gnd", desc: { en: "Ground", zh: "地" } }),
    header("3V3", {
      chip: "3V3_OUT", fn: "power",
      desc: { en: "3.3V regulated output", zh: "3.3V 稳压输出" },
      warning: { en: "Max output ~200mA; use a separate supply beyond that.", zh: "最大输出约 200mA，超出请独立供电。" },
    }),
    analog("D0", "PA02", {
      caps: { dac: "DAC0", pwm: false },
      desc: { en: "Digital 0 / Analog 0 — the only DAC output", zh: "数字 0 / 模拟 0 —— 唯一的 DAC 输出" },
      code: "analogWriteResolution(10);\nanalogWrite(A0, 512);",
    }),
    analog("D1", "PA04"),
    analog("D2", "PA10"),
    analog("D3", "PA11"),
    bus("D4", "SDA", "i2c", "PA08", {
      desc: { en: "Digital 4 / Analog 4 / I²C data", zh: "数字 4 / 模拟 4 / I²C 数据" },
      warning: { en: "Onboard pull-ups; extra devices usually need no added pull-up.", zh: "板载上拉，外接多设备一般无需再加。" },
      code: "Wire.begin();",
    }),
    bus("D5", "SCL", "i2c", "PA09", {
      desc: { en: "Digital 5 / Analog 5 / I²C clock", zh: "数字 5 / 模拟 5 / I²C 时钟" },
      warning: { en: "Default 100kHz; can be raised to 400kHz.", zh: "默认 100kHz，可调至 400kHz。" },
      code: "Wire.begin();\nWire.setClock(400000);",
    }),
    bus("D6", "TX", "uart", "PB08", {
      desc: { en: "Digital 6 / Analog 6 / UART transmit", zh: "数字 6 / 模拟 6 / UART 发送" },
      warning: { en: "3.3V logic; level-shift before connecting 5V devices.", zh: "逻辑电平 3.3V，接 5V 设备先电平转换。" },
      code: "Serial1.begin(115200);\nSerial1.println(\"hi\");",
    }),
    bus("D7", "RX", "uart", "PB09", {
      desc: { en: "Digital 7 / Analog 7 / UART receive", zh: "数字 7 / 模拟 7 / UART 接收" },
      code: "Serial1.begin(115200);",
    }),
    bus("D8", "SCK", "spi", "PA07", {
      desc: { en: "Digital 8 / Analog 8 / SPI clock", zh: "数字 8 / 模拟 8 / SPI 时钟" },
      code: "SPI.begin();",
    }),
    bus("D9", "MISO", "spi", "PA05", {
      desc: { en: "Digital 9 / Analog 9 / SPI MISO", zh: "数字 9 / 模拟 9 / SPI 主入从出" },
      code: "SPI.begin();",
    }),
    bus("D10", "MOSI", "spi", "PA06", {
      desc: { en: "Digital 10 / Analog 10 / SPI MOSI", zh: "数字 10 / 模拟 10 / SPI 主出从入" },
      code: "SPI.begin();",
    }),

    // Extra pads on the photo. 板上附加焊盘。
    {
      id: "RST", kind: "pad", silk: "RST", chip: "RESETN", fn: "rst", status: "conditional",
      front: { x: 26.2, y: 26.8, tag: "below" },
      back: { x: 55.97, y: 29.26, tag: "right" },
      desc: { en: "Reset pads: short the pair once to reset, twice quickly to enter the bootloader", zh: "复位焊盘：短接一次复位，快速短接两次进入引导模式" },
      warning: { en: "Active-low; onboard pull-up.", zh: "低电平复位，已板载上拉。" },
    },
    {
      id: "SWCLK", kind: "pad", chip: "PA30", fn: "digital",
      back: { x: 44.32, y: 19.3, tag: "left" },
      desc: { en: "SWD debug clock", zh: "SWD 调试时钟" },
    },
    {
      id: "SWDIO", kind: "pad", chip: "PA31", fn: "digital",
      back: { x: 55.93, y: 19.29, tag: "right" },
      desc: { en: "SWD debug data", zh: "SWD 调试数据" },
    },
    {
      id: "GND_SWD", kind: "pad", silk: "GND", chip: "—", fn: "gnd",
      back: { x: 44.28, y: 29.27, tag: "left" },
      desc: { en: "Ground for the SWD header", zh: "SWD 调试口的地" },
    },
    {
      id: "GND_VIN", kind: "pad", silk: "GND", chip: "—", fn: "gnd",
      back: { x: 43.69, y: 85.76, tag: "left" },
      desc: { en: "Ground for the VIN input", zh: "VIN 输入的地" },
    },
    {
      id: "VIN", kind: "pad", chip: "VBUS", fn: "power", status: "conditional",
      back: { x: 55.27, y: 85.76, tag: "right" },
      desc: { en: "Alternative power input, 3.3–5V", zh: "备用电源输入，3.3–5V" },
      warning: { en: "Bypasses the input diode and has no charger. Feed it from a regulated supply, never a bare LiPo.", zh: "绕过输入二极管且无充电电路。请接稳压电源，不要直接接锂电池。" },
    },

    // Onboard parts. 板载器件。
    {
      id: "USER_LED", silk: "L", arduino: "LED_BUILTIN", chip: "PA17", fn: "digital", status: "occupied",
      anchor: { side: "front", x: 74.5, y: 19.8 },
      desc: { en: "User LED (yellow), Arduino pin 13", zh: "用户 LED（黄色），Arduino 13 号脚" },
      code: "pinMode(LED_BUILTIN, OUTPUT);\ndigitalWrite(LED_BUILTIN, LOW); // on",
    },
    {
      id: "TX_LED", silk: "T", arduino: "PIN_LED_TXL", chip: "PA19", fn: "digital", status: "occupied",
      anchor: { side: "front", x: 78.6, y: 19.8 },
      desc: { en: "USB TX activity LED (blue), Arduino pin 11", zh: "USB 发送指示灯（蓝色），Arduino 11 号脚" },
    },
    {
      id: "POWER_LED", silk: "P", chip: "VBUS", fn: "power", status: "occupied",
      anchor: { side: "front", x: 74.5, y: 26.8 },
      desc: { en: "Power LED (green), hardware only", zh: "电源指示灯（绿色），纯硬件" },
    },
    {
      id: "RX_LED", silk: "R", arduino: "PIN_LED_RXL", chip: "PA18", fn: "digital", status: "occupied",
      anchor: { side: "front", x: 78.6, y: 26.8 },
      desc: { en: "USB RX activity LED (blue), Arduino pin 12", zh: "USB 接收指示灯（蓝色），Arduino 12 号脚" },
    },
  ],
});

export default samd21;
