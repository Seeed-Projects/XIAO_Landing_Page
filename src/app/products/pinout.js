"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useLang } from "../i18n";
import { ToolPageIntro } from "../tool-page-intro";
import { withBase } from "../../lib/basePath";
import styles from "./pinout.module.css";

/* 功能色 */
const FN_COLOR = {
  power: "#e1554f",
  gnd: "#3a423d",
  rst: "#d8a13a",
  digital: "#16b66a",
  analog: "#2f73f1",
  i2c: "#8b5cf6",
  spi: "#f59e0b",
  uart: "#ec4899",
};

/* SAMD21 板载指示项：独立排在板图上方，不覆盖产品图。 */
const SAMD21_FRONT_MARKERS = [
  { id: "TX_LED", label: "TX LED" },
  { id: "RX_LED", label: "RX LED" },
  { id: "POWER_LED", label: "POWER" },
  { id: "USER_LED", label: "USER LED" },
];
const SAMD21_FRONT_MARKER_ALIASES = {
  D11: "TX_LED",
  D12: "RX_LED",
  D13: "USER_LED",
};
const SAMD21_LEFT_DETAIL_IDS = new Set(["TX_LED", "RX_LED", "D11", "D12"]);
const SAMD21_CAPABILITIES = {
  D0: ["GPIO", "ADC", "DAC"],
  D1: ["GPIO", "ADC", "PWM"], D2: ["GPIO", "ADC", "PWM"], D3: ["GPIO", "ADC", "PWM"],
  D4: ["GPIO", "ADC", "PWM", "I²C SDA"], D5: ["GPIO", "ADC", "PWM", "I²C SCL"],
  D6: ["GPIO", "ADC", "PWM", "UART TX"], D7: ["GPIO", "ADC", "PWM", "UART RX"],
  D8: ["GPIO", "ADC", "PWM", "SPI SCK"], D9: ["GPIO", "ADC", "PWM", "SPI MISO"],
  D10: ["GPIO", "ADC", "PWM", "SPI MOSI"],
  D11: ["TX LED", "ACTIVE LOW"], TX_LED: ["TX LED", "ACTIVE LOW"],
  D12: ["RX LED", "ACTIVE LOW"], RX_LED: ["RX LED", "ACTIVE LOW"],
  D13: ["USER LED", "ACTIVE LOW"], USER_LED: ["USER LED", "ACTIVE LOW"],
  POWER_LED: ["POWER LED", "3.3V RAIL"],
  "5V": ["VBUS", "POWER"], GND: ["GROUND"], "3V3": ["3.3V OUT", "POWER"],
  RST: ["RESET", "ACTIVE LOW"], SWDIO: ["SWD", "DEBUG"], SWCLK: ["SWD", "DEBUG"],
};

/* 由正交点列生成带圆角的折线路径：保持电路走线感，同时避免生硬直角。 */
const roundedOrthogonalPath = (points, maxRadius = 12) => {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const incomingLength = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outgoingLength = Math.hypot(next.x - current.x, next.y - current.y);
    const radius = Math.min(maxRadius, incomingLength / 2, outgoingLength / 2);
    const before = {
      x: current.x - ((current.x - previous.x) / incomingLength) * radius,
      y: current.y - ((current.y - previous.y) / incomingLength) * radius,
    };
    const after = {
      x: current.x + ((next.x - current.x) / outgoingLength) * radius,
      y: current.y + ((next.y - current.y) / outgoingLength) * radius,
    };
    path += ` L ${before.x} ${before.y} Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
};

const boardInfo = {
  name: "XIAO nRF54LM20",
  tagline: {
    en: "nRF54LM20A + nPM1300 + SAMD11 — ultra-low-power wireless controller",
    zh: "nRF54LM20A + nPM1300 + SAMD11，超低功耗无线主控",
  },
};

/* 引脚分组 —— 数据来自真实 Pin Map；desc/note 双语 */
const nrf54Groups = [
  { cat: "power", label: { en: "Power Pins", zh: "电源引脚" }, pins: [
    { id: "VBUS", xiao: "VBUS", fn: "power", chip: "—", desc: { en: "5V Power Input/Output", zh: "5V 电源输入/输出" }, note: { en: "From USB VBus; keep peripheral load under 500mA.", zh: "来自 USB VBus，外设供电勿超过 500mA。" }, code: "" },
    { id: "GND", xiao: "GND", fn: "gnd", chip: "—", desc: { en: "Ground", zh: "地" }, note: { en: "Share a common ground with all peripherals.", zh: "所有外设务必共地。" }, code: "" },
    { id: "3V3", xiao: "3V3", fn: "power", chip: "3V3-OUT", desc: { en: "3.3V Power Output", zh: "3.3V 电源输出" }, note: { en: "Max output ~300mA; use a separate supply beyond that.", zh: "最大输出约 300mA，超出请独立供电。" }, code: "" },
    { id: "BAT+", xiao: "BAT+", fn: "power", chip: "BAT+", desc: { en: "Battery Input (monitored by nPM1300 via I²C)", zh: "电池输入（由 nPM1300 经 I²C 监测）" }, note: { en: "Connect to LiPo positive; charge level monitored by nPM1300.", zh: "接锂电池正极，电量由 nPM1300 监测。" }, code: "" },
    { id: "BAT-", xiao: "BAT-", fn: "gnd", chip: "BAT-", desc: { en: "Battery Negative Terminal", zh: "电池负极" }, note: { en: "Connect to battery negative; common with GND.", zh: "接电池负极，与 GND 共地。" }, code: "" },
    { id: "SHPHLD", xiao: "SHPHLD", fn: "rst", chip: "SHPHLD", desc: { en: "PMIC Ship/Hibernate Mode Control (ultra-low-power shipping state)", zh: "PMIC Ship/Hibernate 模式控制（超低功耗运输状态）" }, note: { en: "Pull low to enter ship mode; saves power in shipping/storage.", zh: "拉低进入 ship 模式，运输/仓储时省电。" }, code: "" },
  ] },
  { cat: "system", label: { en: "System & Control", zh: "系统与控制" }, pins: [
    { id: "RESET", xiao: "RESET", fn: "rst", chip: "—", desc: { en: "Board Reset", zh: "板载复位" }, note: { en: "Active-low reset; onboard pull-up.", zh: "低电平复位，已板载上拉。" }, code: "" },
    { id: "SWCLK", xiao: "SWCLK", fn: "digital", chip: "nRF54LM20A / SAMD11 SWCLK", desc: { en: "Serial Wire Clock (for nRF54 and SAMD11)", zh: "串行调试时钟（用于 nRF54 和 SAMD11）" }, note: { en: "SWD debug clock; can be reused as GPIO in production.", zh: "SWD 调试时钟，量产可复用为 GPIO。" }, code: "" },
    { id: "SWDIO", xiao: "SWDIO", fn: "digital", chip: "nRF54LM20A / SAMD11 SWDIO", desc: { en: "Serial Wire Data (for nRF54 and SAMD11)", zh: "串行调试数据（用于 nRF54 和 SAMD11）" }, note: { en: "SWD debug data line.", zh: "SWD 调试数据线。" }, code: "" },
    { id: "SAMD11_RESET", xiao: "SAMD11_RESET", fn: "rst", chip: "SAMD11 RESET", desc: { en: "SAMD11 Co-processor Reset", zh: "SAMD11 协处理器复位" }, note: { en: "Resets the onboard USB co-processor.", zh: "复位板载 USB 协处理器。" }, code: "" },
  ] },
  { cat: "userled", label: { en: "User & LED", zh: "用户与 LED" }, pins: [
    { id: "USER_BUTTON", xiao: "—", fn: "digital", chip: "P0.09", desc: { en: "User Button Input", zh: "用户按键输入" }, note: { en: "Onboard button; pulled to ground on press, use INPUT_PULLUP.", zh: "板载按键，按下接地，建议 INPUT_PULLUP。" }, code: "pinMode(BUTTON, INPUT_PULLUP);\nif (!digitalRead(BUTTON)) { /* pressed */ }" },
    { id: "RGB_B", xiao: "—", fn: "digital", chip: "P1.23", desc: { en: "Onboard RGB LED Blue Channel", zh: "板载 RGB LED 蓝色通道" }, note: { en: "PWM to dim the blue channel.", zh: "PWM 调蓝通道亮度。" }, code: "ledcWrite(CH_B, 128);" },
    { id: "RGB_G", xiao: "—", fn: "digital", chip: "P1.24", desc: { en: "Onboard RGB LED Green Channel", zh: "板载 RGB LED 绿色通道" }, note: "", code: "ledcWrite(CH_G, 128);" },
    { id: "RGB_R", xiao: "—", fn: "digital", chip: "P1.22", desc: { en: "Onboard RGB LED Red Channel", zh: "板载 RGB LED 红色通道" }, note: "", code: "ledcWrite(CH_R, 128);" },
  ] },
  { cat: "adc", label: { en: "Analog Input (ADC)", zh: "模拟输入 (ADC)" }, pins: [
    { id: "A0", xiao: "A0", fn: "analog", chip: "AIN0 / P1.00", desc: { en: "Analog Input 0 / GPIO", zh: "模拟输入 0 / GPIO" }, note: { en: "Input voltage must not exceed 3.3V.", zh: "输入电压不得超过 3.3V。" }, code: "int v = analogRead(A0);  // 0–4095" },
    { id: "A1", xiao: "A1", fn: "analog", chip: "AIN1 / P1.31", desc: { en: "Analog Input 1 / GPIO", zh: "模拟输入 1 / GPIO" }, note: "", code: "int v = analogRead(A1);" },
    { id: "A2", xiao: "A2", fn: "analog", chip: "AIN2 / P1.30", desc: { en: "Analog Input 2 / GPIO", zh: "模拟输入 2 / GPIO" }, note: "", code: "int v = analogRead(A2);" },
    { id: "A3", xiao: "A3", fn: "analog", chip: "AIN3 / P1.29", desc: { en: "Analog Input 3 / GPIO", zh: "模拟输入 3 / GPIO" }, note: "", code: "int v = analogRead(A3);" },
    { id: "A7", xiao: "A7", fn: "analog", chip: "AIN7 / P1.03", desc: { en: "Analog Input 7 / GPIO", zh: "模拟输入 7 / GPIO" }, note: "", code: "int v = analogRead(A7);" },
  ] },
  { cat: "i2c", label: { en: "I2C", zh: "I2C" }, pins: [
    { id: "SDA", xiao: "SDA", fn: "i2c", chip: "P1.03", desc: { en: "I2C Data Line (IMU & Peripheral)", zh: "I2C 数据线（IMU 与外设）" }, note: { en: "Onboard pull-ups; extra devices usually need no added pull-up.", zh: "板载上拉，外接多设备一般无需再加。" }, code: "Wire.begin(SDA, SCL);" },
    { id: "SCL", xiao: "SCL", fn: "i2c", chip: "P1.07", desc: { en: "I2C Clock Line (IMU & Peripheral)", zh: "I2C 时钟线（IMU 与外设）" }, note: { en: "Default 100kHz; can be raised to 400kHz.", zh: "默认 100kHz，可调至 400kHz。" }, code: "Wire.begin(SDA, SCL);" },
    { id: "BAT_SDA", xiao: "—", fn: "i2c", chip: "P1.18", desc: { en: "Battery Monitor I2C SDA (nPM1300)", zh: "电池监测 I2C SDA（nPM1300）" }, note: { en: "Internally wired to nPM1300; do not reuse.", zh: "内部已接 nPM1300，勿复用。" }, code: "" },
    { id: "BAT_SCL", xiao: "—", fn: "i2c", chip: "P1.17", desc: { en: "Battery Monitor I2C SCL (nPM1300)", zh: "电池监测 I2C SCL（nPM1300）" }, note: "", code: "" },
  ] },
  { cat: "uart", label: { en: "UART", zh: "UART" }, pins: [
    { id: "TX", xiao: "TX", fn: "uart", chip: "P1.08", desc: { en: "UART Transmit", zh: "UART 发送" }, note: { en: "3.3V logic; level-shift before connecting 5V devices.", zh: "逻辑电平 3.3V，接 5V 设备先电平转换。" }, code: "Serial1.begin(115200);\nSerial1.println(\"hi\");" },
    { id: "RX", xiao: "RX", fn: "uart", chip: "P1.09", desc: { en: "UART Receive", zh: "UART 接收" }, note: "", code: "Serial1.begin(115200);" },
  ] },
  { cat: "spi", label: { en: "SPI", zh: "SPI" }, pins: [
    { id: "MOSI", xiao: "MOSI", fn: "spi", chip: "P1.06", desc: { en: "SPI Master Out Slave In", zh: "SPI 主出从入" }, note: "", code: "SPI.begin(SCK, MISO, MOSI, CS);" },
    { id: "MISO", xiao: "MISO", fn: "spi", chip: "P1.05", desc: { en: "SPI Master In Slave Out", zh: "SPI 主入从出" }, note: { en: "May be left floating in single-master single-slave setups.", zh: "单主单从时可悬空。" }, code: "SPI.begin(SCK, MISO, MOSI, CS);" },
    { id: "SCK", xiao: "SCK", fn: "spi", chip: "P1.04", desc: { en: "SPI Serial Clock", zh: "SPI 串行时钟" }, note: { en: "Start with a low clock rate when debugging.", zh: "时钟频率先低后高调试。" }, code: "SPI.begin(SCK, MISO, MOSI, CS);" },
  ] },
  { cat: "onboard", label: { en: "Onboard Peripheral", zh: "板载外设" }, pins: [
    { id: "MIC_DAT", xiao: "—", fn: "digital", chip: "P1.14", desc: { en: "Microphone Data Line", zh: "麦克风数据线" }, note: { en: "Onboard PDM microphone; pre-wired.", zh: "板载 PDM 麦克风，已布线。" }, code: "" },
    { id: "MIC_CLK", xiao: "—", fn: "digital", chip: "P1.13", desc: { en: "Microphone Clock Line", zh: "麦克风时钟线" }, note: "", code: "" },
    { id: "IMU_SDA", xiao: "—", fn: "i2c", chip: "P0.08", desc: { en: "IMU I2C SDA (Onboard IMU)", zh: "IMU I2C SDA（板载 IMU）" }, note: { en: "Internally wired to the IMU; do not repurpose.", zh: "内部已接 IMU，勿挪用。" }, code: "" },
    { id: "IMU_SCL", xiao: "—", fn: "i2c", chip: "P0.07", desc: { en: "IMU I2C SCL (Onboard IMU)", zh: "IMU I2C SCL（板载 IMU）" }, note: "", code: "" },
    { id: "IMU_CS", xiao: "—", fn: "digital", chip: "P3.12", desc: { en: "IMU Chip Select", zh: "IMU 片选" }, note: "", code: "" },
    { id: "IMU_INT1", xiao: "—", fn: "digital", chip: "P0.06", desc: { en: "IMU Interrupt 1", zh: "IMU 中断 1" }, note: "", code: "" },
    { id: "NFC1", xiao: "N1", fn: "digital", chip: "P1.02", desc: { en: "NFC Antenna Pin 1", zh: "NFC 天线引脚 1" }, note: { en: "Connects to one side of the NFC antenna.", zh: "连接 NFC 天线的一端。" }, code: "" },
    { id: "NFC2", xiao: "N2", fn: "digital", chip: "P1.01", desc: { en: "NFC Antenna Pin 2", zh: "NFC 天线引脚 2" }, note: { en: "Connects to the other side of the NFC antenna.", zh: "连接 NFC 天线的另一端。" }, code: "" },
    { id: "GRTC", xiao: "—", fn: "digital", chip: "P0.04 / P0.05", desc: { en: "General Purpose RTC Pins", zh: "通用 RTC 引脚" }, note: "", code: "" },
  ] },
  { cat: "expanded", label: { en: "Expanded / Inner Pads", zh: "夹缝 / 贴片引脚" }, pins: [
    ...[
      ["P3.00", "D11"], ["P3.01", "D12"], ["P3.02", "D13"], ["P3.03", "D14"],
      ["P3.04", "D15"], ["P3.05", "D16"], ["P3.06", "D17"], ["P3.07", "D18"],
      ["P3.11", "P3.11"], ["P3.10", "P3.10"], ["P3.09", "P3.09"],
      ["P0.00", "P0.00"], ["P0.01", "P0.01"], ["P0.02", "P0.02"],
      ["P0.03", "P0.03"], ["P0.04", "P0.04"], ["P0.05", "P0.05"],
    ].map(([id, xiao]) => ({
      id, xiao, fn: "digital", chip: id,
      desc: { en: "Expanded GPIO pad", zh: "扩展 GPIO 贴片引脚" },
      note: { en: "Solder pad on the rear/inner row.", zh: "位于背面或内侧夹缝焊盘。" }, code: "",
    })),
  ] },
];

/* ──────────────────────────────────────────────────────────────────────────
   标准封装板（SAMD21 / nRF52840 / nRF54L15 / RP2040 / RP2350 / RA4M1 / MG24
   / ESP32-S3·C3·C5·C6）的引脚数据 —— 逐板按各自 Seeed Wiki 的 Pin Map 重建。
   每块板的 ADC 能力、引脚功能、芯片 GPIO 编号都不同，不复用同一份模板。
   数据来源：各板 Seeed Wiki「Pin Map」表。 */

/* 引脚构造小工具：P() 造引脚（adc=true 时描述后缀「 · ADC」）；grp() 包成分组 */
const P = (id, xiao, fn, chip, en, zh, o = {}) => {
  const a = o.adc ? " · ADC" : "";
  return {
    id, xiao, fn, chip,
    desc: { en: en + a, zh: zh + a },
    note: o.n ? { en: o.n, zh: o.nz || o.n } : "",
    code: o.c || "",
  };
};
const grp = (cat, en, zh, ...pins) => ({ cat, label: { en, zh }, pins });

/* 电源组与复位组（标准封装板共用；复位芯片号因板而异） */
const powerGroup = () => grp("power", "Power", "电源",
  P("5V", "5V", "power", "VBUS", "5V Power Input/Output (USB VBus)", "5V 电源输入/输出（USB VBus）", { n: "From USB; keep peripheral load under 500mA.", nz: "来自 USB，外设勿超 500mA。" }),
  P("GND", "GND", "gnd", "—", "Ground", "地", { n: "Common ground for all peripherals.", nz: "所有外设共地。" }),
  P("3V3", "3V3", "power", "3V3_OUT", "3.3V Power Output", "3.3V 电源输出", { n: "Max output ~200mA; use a separate supply beyond that.", nz: "最大输出约 200mA，超出请独立供电。" }),
);
const systemGroup = (chip) => grp("system", "System", "系统",
  P("RST", "RST", "rst", chip, "Board Reset", "板载复位", { n: "Active-low reset; onboard pull-up.", nz: "低电平复位，已板载上拉。" }),
);

/* 模拟脚（ADC）：带 3.3V 输入警告与 analogRead 示例 */
const ap = (id, xiao, chip, en, zh) =>
  P(id, xiao, "analog", chip, en, zh, { n: "Input voltage must not exceed 3.3V.", nz: "输入电压不得超过 3.3V。", c: `int v = analogRead(${xiao});` });

/* 总线脚：adc 标记该脚是否同时支持 ADC（按各板 wiki Description 标注） */
const sda = (chip, adc) => P("D4", "SDA", "i2c", chip, "I2C Data Line", "I2C 数据线", { adc, n: "Onboard pull-ups; extra devices usually need no added pull-up.", nz: "板载上拉，外接多设备一般无需再加。", c: "Wire.begin(SDA, SCL);" });
const scl = (chip, adc) => P("D5", "SCL", "i2c", chip, "I2C Clock Line", "I2C 时钟线", { adc, n: "Default 100kHz; can be raised to 400kHz.", nz: "默认 100kHz，可调至 400kHz。", c: "Wire.begin(SDA, SCL);" });
const tx = (chip, adc) => P("D6", "TX", "uart", chip, "UART Transmit", "UART 发送", { adc, n: "3.3V logic; level-shift before connecting 5V devices.", nz: "逻辑电平 3.3V，接 5V 设备先电平转换。", c: "Serial1.begin(115200);\nSerial1.println(\"hi\");" });
const rx = (chip, adc) => P("D7", "RX", "uart", chip, "UART Receive", "UART 接收", { adc, c: "Serial1.begin(115200);" });
const sck = (chip, adc) => P("D8", "SCK", "spi", chip, "SPI Serial Clock", "SPI 串行时钟", { adc, n: "Start with a low clock rate when debugging.", nz: "时钟频率先低后高调试。", c: "SPI.begin(SCK, MISO, MOSI, CS);" });
const miso = (chip, adc) => P("D9", "MISO", "spi", chip, "SPI Master In Slave Out", "SPI 主入从出", { adc, c: "SPI.begin(SCK, MISO, MOSI, CS);" });
const mosi = (chip, adc) => P("D10", "MOSI", "spi", chip, "SPI Master Out Slave In", "SPI 主出从入", { adc, c: "SPI.begin(SCK, MISO, MOSI, CS);" });

/* 数字脚（非 ADC）：用于 A 丝印但本板不具备 ADC 的引脚（如 C5 的 A1/A2/A3） */
const dp = (id, xiao, chip, en, zh) => P(id, xiao, "digital", chip, en, zh, {});

/* 板载外设脚与分组 */
const ob = (id, chip, en, zh, fn = "digital") => P(id, "—", fn, chip, en, zh, {});
const onboard = (...pins) => grp("onboard", "Onboard", "板载", ...pins);
const backBatteryGroup = () => grp("back-power", "Back power pads", "背面电源焊盘",
  P("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘"),
  P("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘"),
);
const backDebugGroup = (...pins) => grp("back-debug", "Back debug pads", "背面调试焊盘", ...pins);

/* 按各板 wiki Pin Map 组装分组；extra 追加额外分组（JTAG/SWD 等） */
const buildBoard = (rst, s, ...extra) => {
  const g = [powerGroup(), systemGroup(rst)];
  if (s.analog?.length) g.push(grp("analog", "Analog / Digital", "模拟 / 数字", ...s.analog));
  if (s.digital?.length) g.push(grp("digital", "Digital", "数字", ...s.digital));
  if (s.i2c?.length) g.push(grp("i2c", "I2C", "I2C", ...s.i2c));
  if (s.uart?.length) g.push(grp("uart", "UART", "UART", ...s.uart));
  if (s.spi?.length) g.push(grp("spi", "SPI", "SPI", ...s.spi));
  if (s.onboard?.length) g.push(onboard(...s.onboard));
  for (const eg of extra) if (eg) g.push(eg);
  return g;
};

const stdLeft = ["D0", "D1", "D2", "D3", "D4", "D5", "D6"];
const stdRight = ["5V", "GND", "3V3", "D10", "D9", "D8", "D7"];

/* 标准封装板焊盘在正面图上的中心 Y%（距图顶 0–100），左右长边各 7 个。
   用来把引脚标签按真实焊盘高度绝对定位，使连线落在板子图的焊盘上。
   均匀分布作起点，按线上效果逐个微调即可。 */
const STD_PAD_Y = {
  /* 以透明板图的实际焊盘圆心测量，不是等分猜测值。 */
  left:  [22.5, 33.1, 43.4, 53.7, 64.1, 74.4, 84.7],
  right: [22.5, 33.1, 43.4, 53.7, 64.1, 74.4, 84.7],
};
/* ESP32-S3 Sense 正面图（USB 朝上，由像素检测的实际焊盘圆心 Y%） */
const S3_PAD_Y = {
  left:  [19.94, 29.76, 39.58, 49.4, 59.23, 69.05, 78.87],
  right: [20.24, 30.06, 39.88, 49.7, 59.52, 69.35, 79.17],
};

/* ESP32-S3：D0-D5、D8-D12 均为 ADC（D4/D5 兼 I2C，D8-D10 兼 SPI）；JTAG: MTDO/MTDI/MTCK/MTMS */
const s3Groups = buildBoard("CHIP_PU", {
  analog: [
    ap("D0", "A0", "GPIO1", "Digital 0 / Analog 0", "数字 0 / 模拟 0"),
    ap("D1", "A1", "GPIO2", "Digital 1 / Analog 1", "数字 1 / 模拟 1"),
    ap("D2", "A2", "GPIO3", "Digital 2 / Analog 2", "数字 2 / 模拟 2"),
    ap("D3", "A3", "GPIO4", "Digital 3 / Analog 3", "数字 3 / 模拟 3"),
    ap("D11", "A11", "GPIO42", "Digital 11 / Analog 11", "数字 11 / 模拟 11"),
    ap("D12", "A12", "GPIO41", "Digital 12 / Analog 12", "数字 12 / 模拟 12"),
  ],
  i2c: [ sda("GPIO5", true), scl("GPIO6", true) ],
  uart: [ tx("GPIO43"), rx("GPIO44") ],
  spi: [ sck("GPIO7", true), miso("GPIO8", true), mosi("GPIO9", true) ],
  onboard: [
    ob("USER_LED", "GPIO21", "User Light LED", "用户指示灯"),
    ob("Boot", "GPIO0", "Boot Button", "Boot 按键", "rst"),
    ob("UFL_ANT", "LNA_IN", "U.FL Antenna", "U.FL 天线"),
    ob("CHARGE_LED", "VCC_3V3", "Charging Indicator LED", "充电指示灯"),
  ],
}, grp("jtag", "JTAG", "JTAG",
  ob("MTDO", "GPIO40", "JTAG TDO", "JTAG TDO"),
  ob("MTDI", "GPIO41", "JTAG TDI (shares D12/GPIO41)", "JTAG TDI（与 D12/GPIO41 共用）"),
  ob("MTCK", "GPIO39", "JTAG TCK", "JTAG TCK"),
  ob("MTMS", "GPIO42", "JTAG TMS (shares D11/GPIO42)", "JTAG TMS（与 D11/GPIO42 共用）"),
));

/* ESP32-C3：D0-D3 为 ADC；D4/D5 仅 I2C，D8-D10 仅 SPI，均不兼 ADC */
const c3Groups = buildBoard("CHIP_EN", {
  analog: [
    ap("D0", "A0", "GPIO2", "Digital 0 / Analog 0", "数字 0 / 模拟 0"),
    ap("D1", "A1", "GPIO3", "Digital 1 / Analog 1", "数字 1 / 模拟 1"),
    ap("D2", "A2", "GPIO4", "Digital 2 / Analog 2", "数字 2 / 模拟 2"),
    ap("D3", "A3", "GPIO5", "Digital 3 / Analog 3", "数字 3 / 模拟 3"),
  ],
  i2c: [ sda("GPIO6", false), scl("GPIO7", false) ],
  uart: [ tx("GPIO21"), rx("GPIO20") ],
  spi: [ sck("GPIO8", false), miso("GPIO9", false), mosi("GPIO10", false) ],
  onboard: [
    ob("Boot", "GPIO9", "Boot Button (shares D9/GPIO9)", "Boot 按键（与 D9/GPIO9 共用）", "rst"),
    ob("UFL_ANT", "LNA_IN", "U.FL Antenna", "U.FL 天线"),
    ob("CHARGE_LED", "VCC_3V3", "Charging Indicator LED", "充电指示灯"),
  ],
}, grp("jtag", "JTAG", "JTAG",
  ob("MTDO", "GPIO7", "JTAG TDO (shares D5/GPIO7)", "JTAG TDO（与 D5/GPIO7 共用）"),
  ob("MTDI", "GPIO5", "JTAG TDI (shares D3/GPIO5)", "JTAG TDI（与 D3/GPIO5 共用）"),
  ob("MTCK", "GPIO6", "JTAG TCK (shares D4/GPIO6)", "JTAG TCK（与 D4/GPIO6 共用）"),
  ob("MTMS", "GPIO4", "JTAG TMS (shares D2/GPIO4)", "JTAG TMS（与 D2/GPIO4 共用）"),
));

/* ESP32-C5：仅 D0 为 ADC；A1/A2/A3 丝印但不具 ADC，归入 Digital */
const c5Groups = buildBoard("CHIP_EN", {
  analog: [
    ap("D0", "A0", "GPIO1", "Digital 0 / Analog 0", "数字 0 / 模拟 0"),
  ],
  digital: [
    dp("D1", "A1", "GPIO0", "Digital 1 (GPIO, no ADC)", "数字 1（GPIO，无 ADC）"),
    dp("D2", "A2", "GPIO25", "Digital 2 (GPIO, no ADC)", "数字 2（GPIO，无 ADC）"),
    dp("D3", "A3", "GPIO7", "Digital 3 (GPIO, no ADC)", "数字 3（GPIO，无 ADC）"),
  ],
  i2c: [ sda("GPIO23", false), scl("GPIO24", false) ],
  uart: [ tx("GPIO11"), rx("GPIO12") ],
  spi: [ sck("GPIO8", false), miso("GPIO9", false), mosi("GPIO10", false) ],
  onboard: [
    ob("USER_LED", "GPIO27", "User Light LED (Yellow)", "用户指示灯（黄色）"),
    ob("ADC_BAT", "GPIO6", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("ADC_CRL", "GPIO26", "Controls measurement circuit (enable/disable) to save power", "控制测量电路启用/禁用以省电", "analog"),
    ob("Boot", "GPIO28", "Boot Button", "Boot 按键", "rst"),
    ob("UFL_ANT", "LNA_IN", "U.FL Antenna", "U.FL 天线"),
    ob("CHARGE_LED", "VCC_3V3", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
  ],
}, grp("jtag", "JTAG", "JTAG",
  ob("MTDO", "GPIO5", "JTAG TDO", "JTAG TDO"),
  ob("MTDI", "GPIO3", "JTAG TDI", "JTAG TDI"),
  ob("MTCK", "GPIO4", "JTAG TCK", "JTAG TCK"),
  ob("MTMS", "GPIO2", "JTAG TMS", "JTAG TMS"),
));

/* ESP32-C6：D0-D2 为 ADC；D3 为 Digital（非 ADC）；RF 开关两脚 */
const c6Groups = buildBoard("CHIP_PU", {
  analog: [
    ap("D0", "A0", "GPIO0", "Digital 0 / Analog 0", "数字 0 / 模拟 0"),
    ap("D1", "A1", "GPIO1", "Digital 1 / Analog 1", "数字 1 / 模拟 1"),
    ap("D2", "A2", "GPIO2", "Digital 2 / Analog 2", "数字 2 / 模拟 2"),
  ],
  digital: [
    dp("D3", "A3", "GPIO21", "Digital 3 (GPIO, no ADC)", "数字 3（GPIO，无 ADC）"),
  ],
  i2c: [ sda("GPIO22", false), scl("GPIO23", false) ],
  uart: [ tx("GPIO16"), rx("GPIO17") ],
  spi: [ sck("GPIO19", false), miso("GPIO20", false), mosi("GPIO18", false) ],
  onboard: [
    ob("USER_LED", "GPIO15", "User Light LED", "用户指示灯"),
    ob("Boot", "GPIO9", "Boot Button", "Boot 按键", "rst"),
    ob("RF_SW_PORT", "GPIO14", "RF Switch Port Select (onboard/UFL)", "射频开关端口选择（板载/UFL）"),
    ob("RF_SW_PWR", "GPIO3", "RF Switch Power", "射频开关电源"),
  ],
}, grp("jtag", "JTAG", "JTAG",
  ob("MTDO", "GPIO7", "JTAG TDO", "JTAG TDO"),
  ob("MTDI", "GPIO5", "JTAG TDI", "JTAG TDI"),
  ob("MTCK", "GPIO6", "JTAG TCK", "JTAG TCK"),
  ob("MTMS", "GPIO4", "JTAG TMS", "JTAG TMS"),
));

/* nRF52840：D0-D3 为 ADC；D4/D5 兼 ADC */
const nrf52Groups = buildBoard("P0.18", {
  analog: [
    ap("D0", "A0", "P0.02", "Analog Input 0 (AIN0)", "模拟输入 0（AIN0）"),
    ap("D1", "A1", "P0.03", "Analog Input 1 (AIN1)", "模拟输入 1（AIN1）"),
    ap("D2", "A2", "P0.28", "Analog Input 2 (AIN4)", "模拟输入 2（AIN4）"),
    ap("D3", "A3", "P0.29", "Analog Input 3 (AIN5)", "模拟输入 3（AIN5）"),
  ],
  i2c: [ sda("P0.04", true), scl("P0.05", true) ],
  uart: [ tx("P1.11"), rx("P1.12") ],
  spi: [ sck("P1.13", false), miso("P1.14", false), mosi("P1.15", false) ],
  onboard: [
    ob("USER_LED_R", "P0.26", "RGB LED Red", "RGB LED 红"),
    ob("USER_LED_G", "P0.30", "RGB LED Green", "RGB LED 绿"),
    ob("USER_LED_B", "P0.06", "RGB LED Blue", "RGB LED 蓝"),
    ob("NFC1", "P0.09", "NFC Antenna 1", "NFC 天线 1"),
    ob("NFC2", "P0.10", "NFC Antenna 2", "NFC 天线 2"),
    ob("ADC_BAT", "P0.14", "Battery Voltage ADC Enable", "电池电压 ADC 使能", "analog"),
    ob("RF_SW_PORT", "P2.05", "RF Switch Port Select (onboard antenna)", "射频开关端口选择（板载天线）"),
    ob("RF_SW_PWR", "P2.03", "RF Switch Power", "射频开关电源"),
    ob("CHARGE_LED", "P0.17", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
  ],
});

/* nRF54L15：D0-D3 为 ADC；背面 D11/D12 为 I2C1，D13-D15 为 GPIO */
const nrf54l15Groups = buildBoard("nRF54_RESET", {
  analog: [
    ap("D0", "A0", "P1.04", "Analog Input 0", "模拟输入 0"),
    ap("D1", "A1", "P1.05", "Analog Input 1", "模拟输入 1"),
    ap("D2", "A2", "P1.06", "Analog Input 2", "模拟输入 2"),
    ap("D3", "A3", "P1.07", "Analog Input 3", "模拟输入 3"),
  ],
  i2c: [ sda("P1.10", false), scl("P1.11", false) ],
  uart: [ tx("P2.08"), rx("P2.07") ],
  spi: [ sck("P2.01", false), miso("P2.04", false), mosi("P2.02", false) ],
  digital: [
    dp("D11", "SCL1", "P0.03", "I2C1 Clock (back pad)", "I2C1 时钟（背面焊盘）"),
    dp("D12", "SDA1", "P0.04", "I2C1 Data (back pad)", "I2C1 数据（背面焊盘）"),
    dp("D13", "D13", "P2.10", "Digital 13", "数字 13"),
    dp("D14", "D14", "P2.09", "Digital 14", "数字 14"),
    dp("D15", "D15", "P2.06", "Digital 15", "数字 15"),
  ],
  onboard: [
    ob("USER_LED", "P2.00", "User Light LED", "用户指示灯"),
    ob("USER_KEY", "P0.00", "User Button", "用户按键"),
    ob("NFC1", "P1.02", "NFC Antenna 1", "NFC 天线 1"),
    ob("NFC2", "P1.03", "NFC Antenna 2", "NFC 天线 2"),
    ob("AIN7_VBAT", "P1.14", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("RF_SW_PORT", "P2.05", "RF Switch Port Select", "射频开关端口选择"),
    ob("RF_SW_PWR", "P2.03", "RF Switch Power", "射频开关电源"),
    ob("CHARGE_LED", "charge_LED", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
    ob("SWCLK", "SWDCLK", "nRF54L15 SWD Clock", "nRF54L15 SWD 时钟"),
    ob("SWDIO", "SWDIO", "nRF54L15 SWD Data", "nRF54L15 SWD 数据"),
    ob("nRST", "RST", "nRF54L15 Reset (debug)", "nRF54L15 复位（调试）", "rst"),
    ob("SAMD11_SWCLK", "PA30", "SAMD11 SWD Clock", "SAMD11 SWD 时钟"),
    ob("SAMD11_SWDIO", "PA31", "SAMD11 SWD Data", "SAMD11 SWD 数据"),
    ob("SAMD11_RST", "RST2", "SAMD11 Reset (debug)", "SAMD11 复位（调试）", "rst"),
  ],
});

/* RP2040：D0-D3 为 ADC（ADC0-3）；其余总线脚不兼 ADC */
const rp2040Groups = buildBoard("RUN", {
  analog: [
    ap("D0", "A0", "GPIO26", "Analog Input 0 (ADC0)", "模拟输入 0（ADC0）"),
    ap("D1", "A1", "GPIO27", "Analog Input 1 (ADC1)", "模拟输入 1（ADC1）"),
    ap("D2", "A2", "GPIO28", "Analog Input 2 (ADC2)", "模拟输入 2（ADC2）"),
    ap("D3", "A3", "GPIO29", "Analog Input 3 (ADC3)", "模拟输入 3（ADC3）"),
  ],
  i2c: [ sda("GPIO6", false), scl("GPIO7", false) ],
  uart: [ tx("GPIO0"), rx("GPIO1") ],
  spi: [ sck("GPIO2", false), miso("GPIO4", false), mosi("GPIO3", false) ],
  onboard: [
    ob("USER_LED_R", "GPIO17", "RGB LED Red", "RGB LED 红"),
    ob("USER_LED_G", "GPIO16", "RGB LED Green", "RGB LED 绿"),
    ob("USER_LED_B", "GPIO25", "RGB LED Blue", "RGB LED 蓝"),
    ob("Boot", "RP2040_BOOT", "Boot Button", "Boot 按键", "rst"),
    ob("SWDIO", "SWDIO", "SWD Debug Data", "SWD 调试数据"),
    ob("SWCLK", "SWCLK", "SWD Debug Clock", "SWD 调试时钟"),
  ],
});

/* RP2350：仅 D0-D2 为 ADC（3 路）；D3 为 SPI0 片选，D4/D5 为 I2C1，与标准封装有别 */
/* RP2350：D0-D2 为 ADC；D3 作 SPI0 片选；背面 D11-D18 为 UART1/I2C0/SPI1 复用 */
const rp2350Groups = buildBoard("RUN", {
  analog: [
    ap("D0", "A0", "GPIO26", "Analog Input 0 (ADC)", "模拟输入 0（ADC）"),
    ap("D1", "A1", "GPIO27", "Analog Input 1 (ADC)", "模拟输入 1（ADC）"),
    ap("D2", "A2", "GPIO28", "Analog Input 2 (ADC)", "模拟输入 2（ADC）"),
  ],
  i2c: [ sda("GPIO6", false), scl("GPIO7", false) ],
  uart: [ tx("GPIO0", false), rx("GPIO1", false) ],
  spi: [
    P("D3", "CS", "spi", "GPIO5", "SPI0 Chip Select", "SPI0 片选", { n: "RP2350 routes D3 to SPI0 CS instead of analog.", nz: "RP2350 将 D3 用作 SPI0 片选，非模拟。", c: "SPI.begin(SCK, MISO, MOSI, CS);" }),
    sck("GPIO2", false),
    miso("GPIO4", false),
    mosi("GPIO3", false),
  ],
  digital: [
    dp("D11", "D11", "GPIO21", "Digital 11 (UART1 RX)", "数字 11（UART1 接收）"),
    dp("D12", "D12", "GPIO20", "Digital 12 (UART1 TX)", "数字 12（UART1 发送）"),
    dp("D13", "D13", "GPIO17", "Digital 13 (I2C0 SCL)", "数字 13（I2C0 时钟）"),
    dp("D14", "D14", "GPIO16", "Digital 14 (I2C0 SDA)", "数字 14（I2C0 数据）"),
    dp("D15", "D15", "GPIO11", "Digital 15 (SPI1 MOSI)", "数字 15（SPI1 主出从入）"),
    dp("D16", "D16", "GPIO12", "Digital 16 (SPI1 MISO)", "数字 16（SPI1 主入从出）"),
    dp("D17", "D17", "GPIO10", "Digital 17 (SPI1 SCK)", "数字 17（SPI1 时钟）"),
    dp("D18", "D18", "GPIO9", "Digital 18 (SPI1 CS)", "数字 18（SPI1 片选）"),
  ],
  onboard: [
    ob("RGB_LED", "GPIO22", "Onboard RGB LED (WS2812)", "板载 RGB LED（WS2812）"),
    ob("USER_LED", "GPIO25", "User LED (Yellow)", "用户 LED（黄）"),
    ob("ADC_BAT", "GPIO29", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("ADC_BAT_EN", "GPIO19", "Battery Voltage Measure Enable", "电池电压检测使能", "analog"),
    ob("Boot", "RP2350_BOOT", "Boot Button", "Boot 按键", "rst"),
    ob("CHARGE_LED", "NCHG", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
  ],
});

/* RA4M1：D0-D3 为 ADC；D5(SCL1) 兼 ADC；D6/D7 兼 I2C2 */
const ra4Groups = buildBoard("RES", {
  analog: [
    ap("D0", "A0", "P014", "Analog Input 0 (AN009)", "模拟输入 0（AN009）"),
    ap("D1", "A1", "P000", "Analog Input 1 (AN000)", "模拟输入 1（AN000）"),
    ap("D2", "A2", "P001", "Analog Input 2 (AN001)", "模拟输入 2（AN001）"),
    ap("D3", "A3", "P002", "Analog Input 3 (AN002)", "模拟输入 3（AN002）"),
  ],
  i2c: [ sda("P206", false), scl("P100", true) ],
  uart: [
    P("D6", "TX", "uart", "P302", "UART Transmit", "UART 发送", { n: "3.3V logic; also I2C2 SDA2.", nz: "逻辑电平 3.3V；兼 I2C2 SDA2。", c: "Serial1.begin(115200);\nSerial1.println(\"hi\");" }),
    P("D7", "RX", "uart", "P301", "UART Receive", "UART 接收", { n: "Also I2C2 SCL2.", nz: "兼 I2C2 SCL2。", c: "Serial1.begin(115200);" }),
  ],
  spi: [ sck("P111", false), miso("P110", false), mosi("P109", false) ],
  digital: [
    dp("D11", "D11", "P408", "Digital 11 (UART9 RX)", "数字 11（UART9 RX）"),
    dp("D12", "D12", "P409", "Digital 12 (UART9 TX)", "数字 12（UART9 TX）"),
    dp("D13", "D13", "P013", "Digital 13", "数字 13"),
    dp("D14", "D14", "P012", "Digital 14", "数字 14"),
    dp("D15", "D15", "P101", "Digital 15 (UART0 TX / I2C0 SDA)", "数字 15（UART0 TX / I2C0 SDA）"),
    dp("D16", "D16", "P104", "Digital 16 (UART0 RX / I2C0 SCL)", "数字 16（UART0 RX / I2C0 SCL）"),
    dp("D17", "D17", "P102", "Digital 17 (UART / SPI0 SCK)", "数字 17（UART / SPI0 SCK）"),
    dp("D18", "D18", "P103", "Digital 18 (SPI / ADC)", "数字 18（SPI / ADC）"),
  ],
  onboard: [
    ob("USER_LED", "P011", "User LED (Yellow)", "用户 LED（黄）"),
    ob("RGB_LED", "P112", "Onboard RGB LED", "板载 RGB LED"),
    ob("RGB_LED_EN", "P500", "RGB LED Enable", "RGB LED 使能"),
    ob("ADC_BAT", "P015", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("Boot", "P201", "Boot Button", "Boot 按键", "rst"),
    ob("CHARGE_LED", "VBUS", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
  ],
});

/* SAMD21：D0-D3 为 ADC（D0 兼 DAC）；D4-D10 几乎全兼 ADC */
const samdGroups = buildBoard("RESETN", {
  analog: [
    ap("D0", "A0", "PA02", "Digital 0 / Analog 0 (DAC0)", "数字 0 / 模拟 0（DAC0）"),
    ap("D1", "A1", "PA04", "Digital 1 / Analog 1 (AIN4)", "数字 1 / 模拟 1（AIN4）"),
    ap("D2", "A2", "PA10", "Digital 2 / Analog 2 (AIN18)", "数字 2 / 模拟 2（AIN18）"),
    ap("D3", "A3", "PA11", "Digital 3 / Analog 3 (AIN19)", "数字 3 / 模拟 3（AIN19）"),
  ],
  i2c: [ sda("PA08", true), scl("PA09", true) ],
  uart: [ tx("PB08", true), rx("PB09", true) ],
  spi: [ sck("PA07", true), miso("PA05", true), mosi("PA06", true) ],
  digital: [
    dp("D11", "TX_LED", "PA19", "Digital 11 (TX LED)", "数字 11（TX 指示灯）"),
    dp("D12", "RX_LED", "PA18", "Digital 12 (RX LED)", "数字 12（RX 指示灯）"),
    dp("D13", "USER_LED", "PA17", "Digital 13 (USER LED / SCL1)", "数字 13（用户 LED / SCL1）"),
  ],
  onboard: [
    ob("USER_LED", "PA17", "User LED (Yellow)", "用户 LED（黄）"),
    ob("TX_LED", "PA19", "TX Indicator LED", "TX 指示灯"),
    ob("RX_LED", "PA18", "RX Indicator LED", "RX 指示灯"),
    ob("SWDIO", "PA31", "SWD Debug Data", "SWD 调试数据"),
    ob("SWCLK", "PA30", "SWD Debug Clock", "SWD 调试时钟"),
    ob("POWER_LED", "3V3", "Power Indicator LED (hardware)", "电源指示灯（硬件）", "power"),
  ],
});

/* MG24：D0-D3 为 ADC；D4-D10 几乎全兼 ADC（与 SAMD11 共生） */
const mg24Groups = buildBoard("RESET", {
  analog: [
    ap("D0", "A0", "PC00", "Analog Input 0", "模拟输入 0"),
    ap("D1", "A1", "PC01", "Analog Input 1", "模拟输入 1"),
    ap("D2", "A2", "PC02", "Analog Input 2", "模拟输入 2"),
    ap("D3", "A3", "PC03", "Analog Input 3 (also SPI)", "模拟输入 3（兼 SPI）"),
  ],
  i2c: [ sda("PC04", true), scl("PC05", true) ],
  uart: [ tx("PC06", true), rx("PC07", true) ],
  spi: [ sck("PA03", true), miso("PA04", true), mosi("PA05", true) ],
  digital: [
    dp("D11", "D11", "PA09", "Digital 11 (SAMD11 UART RX)", "数字 11（SAMD11 UART RX）"),
    dp("D12", "D12", "PA08", "Digital 12 (SAMD11 UART TX)", "数字 12（SAMD11 UART TX）"),
    dp("D13", "D13", "PB02", "Digital 13 (I2C1 SCL)", "数字 13（I2C1 SCL）"),
    dp("D14", "D14", "PB03", "Digital 14 (I2C1 SDA)", "数字 14（I2C1 SDA）"),
    dp("D15", "D15", "PB00", "Digital 15 (SPI1 MOSI)", "数字 15（SPI1 MOSI）"),
    dp("D16", "D16", "PB01", "Digital 16 (SPI1 MISO)", "数字 16（SPI1 MISO）"),
    dp("D17", "D17", "PA00", "Digital 17 (SPI1 SCK)", "数字 17（SPI1 SCK）"),
    dp("D18", "D18", "PD02", "Digital 18 (SPI CS)", "数字 18（SPI 片选）"),
  ],
  onboard: [
    ob("USER_LED", "PA07", "User LED (Yellow)", "用户指示灯（黄色）"),
    ob("ADC_BAT", "PD04", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("RF_SW", "PB04", "RF Antenna Switch (onboard/UFL)", "射频天线开关（板载/UFL）"),
    ob("RF_SW_PWR", "PB05", "RF Switch Power", "射频开关电源"),
    ob("CHARGE_LED", "VBUS", "Charging Indicator LED (Red)", "充电指示灯（红色）"),
  ],
});

/* Plus 系列：映射来自 picture/flash/产品表格.md 的 PIN OUT 区域。
   标准 14 脚仍显示在正面，Plus 独有扩展焊盘、调试焊盘和电池焊盘显示在背面。 */
const s3PlusGroups = buildBoard("CHIP_PU", {
  analog: [
    ap("D0", "A0", "GPIO1", "Digital 0 / Analog 0", "数字 0 / 模拟 0"),
    ap("D1", "A1", "GPIO2", "Digital 1 / Analog 1", "数字 1 / 模拟 1"),
    ap("D2", "A2", "GPIO3", "Digital 2 / Analog 2", "数字 2 / 模拟 2"),
    ap("D3", "A3", "GPIO4", "Digital 3 / Analog 3", "数字 3 / 模拟 3"),
    ap("D11", "D11", "GPIO38", "Plus expansion GPIO / ADC", "Plus 扩展 GPIO / ADC"),
    ap("D12", "D12", "GPIO39", "Plus expansion GPIO / ADC", "Plus 扩展 GPIO / ADC"),
  ],
  i2c: [sda("GPIO5", true), scl("GPIO6", true)],
  uart: [tx("GPIO43"), rx("GPIO44")],
  spi: [sck("GPIO7", true), miso("GPIO8", true), mosi("GPIO9", true)],
  digital: [
    dp("D13", "D13", "GPIO40", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D14", "D14", "GPIO41", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D15", "D15", "GPIO42", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D16", "D16", "GPIO10", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D17", "D17", "GPIO13", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D18", "D18", "GPIO12", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    dp("D19", "D19", "GPIO11", "Plus expansion GPIO", "Plus 扩展 GPIO"),
  ],
  onboard: [
    ob("Boot", "GPIO0", "Boot Button", "Boot 按键", "rst"),
    ob("ADC_BAT", "GPIO10", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("UFL_ANT", "LNA_IN", "U.FL Antenna", "U.FL 天线"),
    ob("CHARGE_LED", "VCC_3V3", "Charging Indicator LED", "充电指示灯"),
    ob("USER_LED", "GPIO21", "User Light", "用户指示灯"),
  ],
}, grp("back-plus", "Back expansion pads", "背面扩展焊盘",
  P("MTDO", "MTDO", "digital", "GPIO40", "JTAG TDO", "JTAG TDO"),
  P("MTDI", "MTDI", "digital", "GPIO41", "JTAG TDI / ADC", "JTAG TDI / ADC"),
  P("MTCK", "MTCK", "digital", "GPIO39", "JTAG TCK / ADC", "JTAG TCK / ADC"),
  P("MTMS", "MTMS", "digital", "GPIO42", "JTAG TMS / ADC", "JTAG TMS / ADC"),
  P("USB_D+", "D+", "digital", "USB_DP", "USB data positive", "USB 数据正"),
  P("USB_D-", "D-", "digital", "USB_DM", "USB data negative", "USB 数据负"),
  P("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘"),
  P("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘"),
));

const rp2040PlusGroups = buildBoard("RUN", {
  analog: [
    ap("D0", "A0", "GPIO26", "Analog Input 0 (ADC0)", "模拟输入 0（ADC0）"),
    ap("D1", "A1", "GPIO27", "Analog Input 1 (ADC1)", "模拟输入 1（ADC1）"),
    ap("D2", "A2", "GPIO28", "Analog Input 2 (ADC2)", "模拟输入 2（ADC2）"),
    ap("D3", "A3", "GPIO29", "Analog Input 3 (ADC3)", "模拟输入 3（ADC3）"),
  ],
  i2c: [sda("GPIO6", false), scl("GPIO7", false)],
  uart: [tx("GPIO0"), rx("GPIO1")],
  spi: [sck("GPIO2", false), miso("GPIO4", false), mosi("GPIO3", false)],
  digital: [
    dp("D12", "D12", "GPIO18", "Plus-only expansion GPIO", "Plus 专属扩展 GPIO"),
    P("D13", "SCL1", "i2c", "GPIO21", "Plus-only I2C1 clock", "Plus 专属 I2C1 时钟"),
    P("D14", "SDA1", "i2c", "GPIO20", "Plus-only I2C1 data", "Plus 专属 I2C1 数据"),
    ...[["D15", "GPIO19"], ["D16", "GPIO22"], ["D17", "GPIO23"], ["D19", "GPIO5"],
      ["D20", "GPIO13"], ["D21", "GPIO14"], ["D22", "GPIO15"], ["D23", "GPIO16"],
      ["D24", "GPIO17"], ["D25", "GPIO10"], ["D26", "GPIO9"], ["D27", "GPIO8"]]
      .map(([id, chip]) => dp(id, id, chip, "Plus-only expansion GPIO", "Plus 专属扩展 GPIO")),
  ],
  onboard: [
    ob("Boot", "RP2040_BOOT", "Bootloader Button", "Bootloader 按键", "rst"),
    ob("RGB_LED", "GPIO12 / NEOPIX", "WS2812B RGB LED data", "WS2812B RGB LED 数据"),
    ob("RGB_EN", "GPIO11", "WS2812B Power Enable", "WS2812B 电源使能"),
    ob("USER_LED", "GPIO25", "User-controlled LED", "用户指示灯"),
    ob("BAT_EN", "GPIO24", "Battery Power Control", "电池电源控制"),
    ob("CHARGE_LED", "—", "Hardware Charging Indicator", "硬件充电指示灯"),
  ],
}, grp("back-plus", "Back expansion pads", "背面扩展焊盘",
  P("SWDIO", "SWDIO", "digital", "RP2040_SWDIO", "SWD Debug Data", "SWD 调试数据"),
  P("SWCLK", "SWCLK", "digital", "RP2040_SWCLK", "SWD Debug Clock", "SWD 调试时钟"),
  P("USB_D+", "D+", "digital", "USB_DP", "USB data positive", "USB 数据正"),
  P("USB_D-", "D-", "digital", "USB_DM", "USB data negative", "USB 数据负"),
  P("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘"),
  P("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘"),
));

const samd21PlusGroups = buildBoard("RESETN", {
  analog: [
    ap("D0", "A0 / DAC", "PA02", "Digital 0 / Analog 0 / DAC", "数字 0 / 模拟 0 / DAC"),
    ap("D1", "A1", "PA04", "Digital 1 / Analog 1", "数字 1 / 模拟 1"),
    ap("D2", "A2", "PA10", "Digital 2 / Analog 2", "数字 2 / 模拟 2"),
    ap("D3", "A3", "PA11", "Digital 3 / Analog 3", "数字 3 / 模拟 3"),
  ],
  i2c: [sda("PA08", true), scl("PA09", true)],
  uart: [tx("PB08", true), rx("PB09", true)],
  spi: [sck("PA07", true), miso("PA05", true), mosi("PA06", true)],
  digital: [
    dp("D12", "D12", "PA28", "Plus expansion GPIO", "Plus 扩展 GPIO"),
    P("D13", "SCL1", "i2c", "PA17", "Plus expansion GPIO / I2C1 clock", "Plus 扩展 GPIO / I2C1 时钟"),
    P("D14", "SDA1", "i2c", "PA16", "Plus expansion GPIO / I2C1 data", "Plus 扩展 GPIO / I2C1 数据"),
    ...[["D15", "PA15"], ["D16", "PA14"], ["D17", "PA13"], ["D18", "PA12"],
      ["D19", "PA19"], ["D20", "PA20"], ["D21", "PA21"], ["D22", "PB10"],
      ["D23", "PB11"], ["D24", "PB23"], ["D25", "PA23"], ["D26", "PB2"], ["D27", "PA18"]]
      .map(([id, chip]) => dp(id, id, chip, "Plus expansion GPIO", "Plus 扩展 GPIO")),
  ],
  onboard: [
    ob("RGB_LED", "PA27", "WS2812B RGB LED data", "WS2812B RGB LED 数据"),
    ob("USER_BUTTON", "PB22", "User Button (active low)", "用户按键（低电平有效）", "rst"),
    ob("VBAT_EN", "PB02", "Battery ADC Enable", "电池 ADC 使能"),
    ob("AIN11_VBAT", "PB03 / AIN11", "Battery Voltage ADC", "电池电压 ADC", "analog"),
    ob("CHARGE_LED", "—", "Hardware Charging Indicator", "硬件充电指示灯"),
  ],
}, grp("back-plus", "Back expansion pads", "背面扩展焊盘",
  P("SWDIO", "SWDIO", "digital", "PA31", "SWD Debug Data", "SWD 调试数据"),
  P("SWCLK", "SWCLK", "digital", "PA30", "SWD Debug Clock", "SWD 调试时钟"),
  P("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘"),
  P("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘"),
));

const nrf52840PlusGroups = buildBoard("P0.18", {
  analog: [
    ap("D0", "A0", "P0.02", "Analog Input 0", "模拟输入 0"),
    ap("D1", "A1", "P0.03", "Analog Input 1", "模拟输入 1"),
    ap("D2", "A2", "P0.28", "Analog Input 2", "模拟输入 2"),
    ap("D3", "A3", "P0.29", "Analog Input 3", "模拟输入 3"),
  ],
  i2c: [sda("P0.04", true), scl("P0.05", true)],
  uart: [tx("P1.11"), rx("P1.12")],
  spi: [sck("P1.13", false), miso("P1.14", false), mosi("P1.15", false)],
  digital: [
    P("D11", "I2S_SD", "digital", "P0.15", "I2S data / ADC", "I2S 数据 / ADC"),
    P("D12", "I2S_SCK", "digital", "P0.19", "I2S clock / ADC", "I2S 时钟 / ADC"),
    P("D13", "I2S_WS", "digital", "P1.01", "I2S word select / ADC", "I2S 字选择 / ADC"),
    P("D14", "RX1", "uart", "P0.09", "UART1 receive / NFC1 / ADC", "UART1 接收 / NFC1 / ADC"),
    P("D15", "TX1", "uart", "P0.10", "UART1 transmit / NFC2 / ADC", "UART1 发送 / NFC2 / ADC"),
    P("D16", "AIN7_BAT", "analog", "P0.31", "Battery Voltage ADC", "电池电压 ADC"),
    P("D17", "SCK1", "spi", "P1.03", "SPI1 Clock", "SPI1 时钟"),
    P("D18", "MISO1", "spi", "P1.05", "SPI1 Data Input", "SPI1 数据输入"),
    P("D19", "MOSI1", "spi", "P1.07", "SPI1 Data Output", "SPI1 数据输出"),
  ],
  onboard: [
    ob("ADC_BAT", "P0.14", "Battery Voltage Read Enable", "电池电压读取使能", "analog"),
    ob("IMU_PWR", "P1.08", "6-axis IMU Power Switch", "六轴 IMU 电源开关"),
    ob("IMU_INT1", "P0.11", "6-axis IMU Interrupt 1", "六轴 IMU 中断 1"),
    ob("MIC_DATA", "P0.16", "PDM Microphone Data", "PDM 麦克风数据"),
    ob("MIC_CLK", "P1.00", "PDM Microphone Clock", "PDM 麦克风时钟"),
    ob("RF_SW_PORT", "P2.05", "RF Switch Port Select", "射频开关端口选择"),
    ob("RF_SW_PWR", "P2.03", "RF Switch Power", "射频开关电源"),
    ob("CHARGE_LED", "P0.17", "Charging Indicator LED", "充电指示灯"),
    ob("USER_LED_R", "P0.26", "User RGB LED Red", "用户 RGB LED 红"),
    ob("USER_LED_B", "P0.06", "User RGB LED Blue", "用户 RGB LED 蓝"),
    ob("USER_LED_G", "P0.30", "User RGB LED Green", "用户 RGB LED 绿"),
  ],
}, grp("back-plus", "Back expansion pads", "背面扩展焊盘",
  P("SWDIO", "SWDIO", "digital", "SWDIO", "SWD Debug Data", "SWD 调试数据"),
  P("SWCLK", "SWCLK", "digital", "SWCLK", "SWD Debug Clock", "SWD 调试时钟"),
  P("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘"),
  P("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘"),
));

/* 选型下拉：XIAO 板型 → 板信息 + 引脚数据 + 板图两列 */
const BOARDS = {
  nrf54: {
    name: "XIAO nRF54LM20",
    figureLabel: ["XIAO", "nRF54LM20"],
    figureSub: "nRF54LM20A · nPM1300 · SAMD11",
    figureImg: "/xiao-products/dev_boards/nrf54-front.webp",
    figureImgBack: "/xiao-products/dev_boards/nrf54-back.webp",
    tagline: { en: "nRF54LM20A + nPM1300 + SAMD11 — ultra-low-power wireless controller", zh: "nRF54LM20A + nPM1300 + SAMD11，超低功耗无线主控" },
    groups: nrf54Groups,
    leftColIds: ["A0", "A1", "A2", "A3", "SDA", "SCL", "TX"],
    rightColIds: ["VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX"],
    padY: STD_PAD_Y,
    frontBottomIds: ["MIC_DAT", "MIC_CLK", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1"],
    backPins: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P3.06", "P3.05", "P3.04", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT-", "BAT+"],
      padY: {
        left: [7, 14, 21, 28, 36, 43, 50, 57, 65, 72, 79, 91],
        right: [5, 10, 15, 20, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 86, 90, 94, 98],
      },
    },
    backGroups: [backDebugGroup(
      P("SWCLK2", "SWCLK2", "digital", "SAMD11 SWCLK", "SAMD11 debug clock", "SAMD11 调试时钟"),
      P("SWDIO2", "SWDIO2", "digital", "SAMD11 SWDIO", "SAMD11 debug data", "SAMD11 调试数据"),
      P("RST2", "RST2", "rst", "SAMD11 RESET", "SAMD11 reset", "SAMD11 复位"),
    )],
    gpioNote: false,
  },
  s3: {
    name: "XIAO ESP32-S3",
    figureLabel: ["XIAO", "ESP32-S3"],
    figureSub: "ESP32-S3 · Wi-Fi + BLE",
    figureImg: "/xiao-products/dev_boards/s3-front.webp",
    figureImgBack: "/xiao-products/dev_boards/s3-back.webp",
    rotateFront: true,
    tagline: { en: "ESP32-S3 — Wi-Fi + BLE workhorse with plenty of GPIO and PSRAM.", zh: "ESP32-S3 — Wi-Fi + BLE 主力，GPIO 多、带 PSRAM。" },
    groups: s3Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: S3_PAD_Y, gpioNote: false,
    backPins: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+"], padY: { left: [20, 30, 40, 50], right: [20, 30, 40, 70, 80] } },
    backGroups: [backBatteryGroup()],
  },
  s3plus: {
    name: "XIAO ESP32-S3 Plus",
    figureLabel: ["XIAO", "ESP32-S3 Plus"],
    figureSub: "ESP32-S3 · Wi-Fi + BLE · 27 GPIO",
    figureImg: "/xiao-products/dev_boards/s3plus-front.webp",
    figureImgBack: "/xiao-products/dev_boards/s3plus-back.webp",
    tagline: { en: "ESP32-S3 Plus — expanded GPIO, battery pads and native USB on the XIAO footprint.", zh: "ESP32-S3 Plus — 在 XIAO 封装上扩展 GPIO、电池焊盘与原生 USB。" },
    groups: s3PlusGroups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["MTDO", "MTCK", "USB_D+", "D11", "D12", "D13", "D14"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "D15", "D16", "D17", "D18", "D19", "BAT-", "BAT+"],
      padY: { left: [12, 23, 34, 46, 56, 66, 76], right: [10, 18, 26, 34, 43, 50, 57, 64, 71, 82, 90] },
    },
  },
  c3: {
    name: "XIAO ESP32-C3",
    figureLabel: ["XIAO", "ESP32-C3"],
    figureSub: "ESP32-C3 · Wi-Fi 4 + BLE 5",
    figureImg: "/xiao-products/dev_boards/c3-front.webp",
    figureImgBack: "/xiao-products/dev_boards/c3-back.webp",
    tagline: { en: "ESP32-C3 — compact RISC-V for Wi-Fi + BLE basics.", zh: "ESP32-C3 — RISC-V 小巧，Wi-Fi + BLE 入门。" },
    groups: c3Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+", "Boot"], padY: { left: [17, 27, 37, 47], right: [17, 27, 37, 57, 67, 91] } },
    backGroups: [backBatteryGroup()],
  },
  c6: {
    name: "XIAO ESP32-C6",
    figureLabel: ["XIAO", "ESP32-C6"],
    figureSub: "ESP32-C6 · Wi-Fi 6 + BLE + Thread/Zigbee",
    figureImg: "/xiao-products/dev_boards/c6-front.webp",
    figureImgBack: "/xiao-products/dev_boards/c6-back.webp",
    tagline: { en: "ESP32-C6 — Wi-Fi 6, BLE, and Thread/Zigbee for Matter smart-home.", zh: "ESP32-C6 — Wi-Fi 6 + BLE + Thread/Zigbee，适合 Matter 智能家居。" },
    groups: c6Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"], padY: { left: [19, 29, 39, 49], right: [19, 29, 39, 49, 69, 79] } },
    backGroups: [backBatteryGroup()],
  },
  c5: {
    name: "XIAO ESP32-C5",
    figureLabel: ["XIAO", "ESP32-C5"],
    figureSub: "ESP32-C5 · Wi-Fi 6 + BLE 5",
    figureImg: "/xiao-products/dev_boards/c5-front.webp",
    figureImgBack: "/xiao-products/dev_boards/c5-back.webp",
    tagline: { en: "ESP32-C5 — Wi-Fi 6 + BLE 5 on the XIAO footprint.", zh: "ESP32-C5 — XIAO 封装上的 Wi-Fi 6 + BLE 5。" },
    groups: c5Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"], padY: { left: [19, 29, 39, 49], right: [19, 29, 39, 49, 69, 79] } },
    backGroups: [backBatteryGroup()],
  },
  nrf54l15: {
    name: "XIAO nRF54L15",
    figureLabel: ["XIAO", "nRF54L15"],
    figureSub: "nRF54L15 · BLE 5.4 · NFC",
    figureImg: "/xiao-products/dev_boards/nrf54l15-front.webp",
    figureImgBack: "/xiao-products/dev_boards/nrf54l15-back.webp",
    tagline: { en: "nRF54L15 — 128MHz Cortex-M33, low-power BLE 5.4 + NFC.", zh: "nRF54L15 — 128MHz Cortex-M33，低功耗 BLE 5.4 + NFC。" },
    groups: nrf54l15Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "GND", "SAMD11_SWCLK", "3V3", "D11", "D12"],
      right: ["SWDIO", "nRST", "SAMD11_SWDIO", "SAMD11_RST", "D15", "D14", "D13", "BAT-", "BAT+"],
      padY: { left: [13, 23, 34, 44, 54, 64], right: [13, 23, 34, 44, 54, 62, 69, 78, 86] },
    },
    backGroups: [backBatteryGroup()],
  },
  nrf52: {
    name: "XIAO nRF52840",
    figureLabel: ["XIAO", "nRF52840"],
    figureSub: "nRF52840 · BLE 5.4 · NFC",
    figureImg: "/xiao-products/dev_boards/nrf52-front.webp",
    figureImgBack: "/xiao-products/dev_boards/nrf52-back.webp",
    tagline: { en: "nRF52840 — BLE 5.4, NFC, battery charging; the first wireless XIAO.", zh: "nRF52840 — BLE 5.4、NFC、电池充电，首款无线 XIAO。" },
    groups: nrf52Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: { left: [], right: ["NFC1", "NFC2", "BAT-", "BAT+"], padY: { left: [], right: [74, 86, 42, 54] } },
    backGroups: [backBatteryGroup()],
  },
  nrf52840plus: {
    name: "XIAO nRF52840 Plus",
    figureLabel: ["XIAO", "nRF52840 Plus"],
    figureSub: "nRF52840 · BLE · NFC · IMU/PDM",
    figureImg: "/xiao-products/dev_boards/nrf52840plus-front.webp",
    figureImgBack: "/xiao-products/dev_boards/nrf52840plus-back.webp",
    tagline: { en: "nRF52840 Plus — expanded GPIO with NFC, IMU, PDM microphone and battery support.", zh: "nRF52840 Plus — 扩展 GPIO，并提供 NFC、IMU、PDM 麦克风与电池支持。" },
    groups: nrf52840PlusGroups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "D11", "D12", "D13", "D16", "D17"],
      right: ["SWDIO", "RST", "D14", "D15", "D18", "D19", "BAT-", "BAT+"],
      padY: { left: [13, 29, 41, 53, 68, 78], right: [13, 23, 35, 47, 59, 69, 80, 90] },
    },
  },
  rp2040: {
    name: "XIAO RP2040",
    figureLabel: ["XIAO", "RP2040"],
    figureSub: "RP2040 · dual M0+ · 133MHz",
    figureImg: "/xiao-products/dev_boards/rp2040-front.webp",
    figureImgBack: "/xiao-products/dev_boards/rp2040-back.webp",
    tagline: { en: "RP2040 — dual Cortex-M0+ 133MHz; the smallest Raspberry Pi Pico.", zh: "RP2040 — 双核 Cortex-M0+ 133MHz，最小的树莓派 Pico。" },
    groups: rp2040Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: { left: ["SWCLK", "GND", "Boot"], right: ["SWDIO", "RST", "5V"], padY: { left: [18, 89, 94], right: [18, 94, 89] } },
  },
  rp2040plus: {
    name: "XIAO RP2040 Plus",
    figureLabel: ["XIAO", "RP2040 Plus"],
    figureSub: "RP2040 · dual M0+ · expanded GPIO",
    figureImg: "/xiao-products/dev_boards/rp2040plus-front.webp",
    figureImgBack: "/xiao-products/dev_boards/rp2040plus-back.webp",
    tagline: { en: "RP2040 Plus — dual Cortex-M0+ with expanded GPIO, USB and battery control.", zh: "RP2040 Plus — 双核 Cortex-M0+，增加扩展 GPIO、USB 与电池控制。" },
    groups: rp2040PlusGroups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "USB_D+", "D12", "D13", "D14", "D19", "D20", "D21", "D22"],
      right: ["SWDIO", "RST", "USB_D-", "Boot", "D17", "D16", "D15", "D23", "D24", "D25", "D26", "D27", "BAT-", "BAT+"],
      padY: { left: [7, 15, 27, 36, 45, 55, 63, 71, 79], right: [6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 96] },
    },
  },
  rp2350: {
    name: "XIAO RP2350",
    figureLabel: ["XIAO", "RP2350"],
    figureSub: "RP2350 · M33 + RISC-V · 150MHz",
    figureImg: "/xiao-products/dev_boards/rp2350-front.webp",
    figureImgBack: "/xiao-products/dev_boards/rp2350-back.webp",
    tagline: { en: "RP2350 — dual Cortex-M33 150MHz + Hazard3 RISC-V, RGB LED, 19 GPIO.", zh: "RP2350 — 双核 Cortex-M33 150MHz + Hazard3 RISC-V，RGB LED，19 GPIO。" },
    groups: rp2350Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "GND", "D11", "D12", "D13", "D14"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT-", "BAT+"],
      padY: { left: [16, 25, 34, 43, 52, 61], right: [12, 20, 28, 38, 46, 54, 62, 74, 84] },
    },
    backGroups: [backBatteryGroup(), backDebugGroup(
      P("SWCLK", "SWCLK", "digital", "SWCLK", "SWD debug clock", "SWD 调试时钟"),
      P("SWDIO", "SWDIO", "digital", "SWDIO", "SWD debug data", "SWD 调试数据"),
    )],
  },
  ra4: {
    name: "XIAO RA4M1",
    figureLabel: ["XIAO", "RA4M1"],
    figureSub: "RA4M1 · Cortex-M4 · 48MHz",
    figureImg: "/xiao-products/dev_boards/ra4-front.webp",
    figureImgBack: "/xiao-products/dev_boards/ra4-back.webp",
    tagline: { en: "RA4M1 — Cortex-M4 48MHz; same chip as Arduino Uno R4.", zh: "RA4M1 — Cortex-M4 48MHz，与 Arduino Uno R4 同芯。" },
    groups: ra4Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "GND", "D11", "D12", "D13", "D14"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT-", "BAT+"],
      padY: { left: [16, 25, 34, 43, 52, 61], right: [12, 20, 28, 38, 46, 54, 62, 74, 84] },
    },
    backGroups: [backBatteryGroup(), backDebugGroup(
      P("SWCLK", "SWCLK", "digital", "SWCLK", "SWD debug clock", "SWD 调试时钟"),
      P("SWDIO", "SWDIO", "digital", "SWDIO", "SWD debug data", "SWD 调试数据"),
    )],
  },
  samd21: {
    name: "XIAO SAMD21",
    figureLabel: ["XIAO", "SAMD21"],
    figureSub: "SAMD21G18 · Cortex-M0+",
    figureImg: "/xiao-products/dev_boards/samd21-front.webp",
    figureImgBack: "/xiao-products/dev_boards/samd21-back.webp",
    tagline: { en: "SAMD21G18 — Cortex-M0+; the original Seeeduino XIAO flagship.", zh: "SAMD21G18 — Cortex-M0+，初代 Seeeduino XIAO 旗舰。" },
    groups: samdGroups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "GND"],
      right: ["SWDIO", "RST", "5V"],
      padY: { left: [18, 82], right: [18, 31, 82] },
    },
  },
  samd21plus: {
    name: "XIAO SAMD21 Plus",
    figureLabel: ["XIAO", "SAMD21 Plus"],
    figureSub: "SAMD21G18 · Cortex-M0+ · expanded GPIO",
    figureImg: "/xiao-products/dev_boards/samd21plus-front.webp",
    figureImgBack: "/xiao-products/dev_boards/samd21plus-back.webp",
    tagline: { en: "SAMD21 Plus — the original XIAO architecture with expanded GPIO, RGB and battery sensing.", zh: "SAMD21 Plus — 初代 XIAO 架构，增加扩展 GPIO、RGB 与电池检测。" },
    groups: samd21PlusGroups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["SWCLK", "D18", "D12", "D13", "D14", "D19", "D20", "D21", "D22"],
      right: ["SWDIO", "RST", "D17", "D16", "D15", "D23", "D24", "D25", "D26", "D27", "BAT-", "BAT+"],
      padY: { left: [7, 18, 30, 39, 48, 57, 65, 73, 81], right: [7, 15, 25, 34, 43, 52, 60, 68, 76, 84, 91, 97] },
    },
  },
  mg24: {
    name: "XIAO MG24",
    figureLabel: ["XIAO", "MG24"],
    figureSub: "EFR32MG24 · Cortex-M33 · 802.15.4",
    figureImg: "/xiao-products/dev_boards/mg24-front.webp",
    figureImgBack: "/xiao-products/dev_boards/mg24-back.webp",
    tagline: { en: "EFR32MG24 — Cortex-M33 with Zigbee/Thread for Matter.", zh: "EFR32MG24 — Cortex-M33，Zigbee/Thread，适合 Matter。" },
    groups: mg24Groups,
    leftColIds: stdLeft, rightColIds: stdRight, padY: STD_PAD_Y, gpioNote: false,
    backPins: {
      left: ["M_CLK", "GND", "M_RST", "3V3", "S_CLK", "D11", "D12", "D13", "D14"],
      right: ["M_DIO", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT-", "BAT+"],
      /* 中部焊盘很密，标签在两侧错开，连线仍按背面图的上下顺序。 */
      padY: { left: [10, 19, 28, 37, 46, 55, 64, 73, 82], right: [10, 20, 30, 40, 50, 60, 70, 81, 91] },
    },
    backGroups: [backBatteryGroup(), backDebugGroup(
      P("M_CLK", "M_CLK", "digital", "MG24 SWCLK", "MG24 debug clock", "MG24 调试时钟"),
      P("M_DIO", "M_DIO", "digital", "MG24 SWDIO", "MG24 debug data", "MG24 调试数据"),
      P("M_RST", "M_RST", "rst", "MG24 RESET", "MG24 reset", "MG24 复位"),
      P("S_CLK", "S_CLK", "digital", "SAMD11 SWCLK", "SAMD11 debug clock", "SAMD11 调试时钟"),
      P("S_DIO", "S_DIO", "digital", "SAMD11 SWDIO", "SAMD11 debug data", "SAMD11 调试数据"),
      P("S_RST", "S_RST", "rst", "SAMD11 RESET", "SAMD11 reset", "SAMD11 复位"),
    )],
  },
};
const BOARD_CATEGORIES = [
  { id: "esp32", label: "Espressif ESP32 Series", boardIds: ["s3", "s3plus", "c3", "c6", "c5"] },
  { id: "nrf52", label: "Nordic nRF52 Series", boardIds: ["nrf52", "nrf52840plus"] },
  { id: "nrf54", label: "Nordic nRF54 Series", boardIds: ["nrf54", "nrf54l15"] },
  { id: "rp", label: "Raspberry Pi RP Series", boardIds: ["rp2040", "rp2040plus", "rp2350"] },
  { id: "mg", label: "Silicon Labs MG Series", boardIds: ["mg24"] },
  { id: "samd", label: "Microchip SAMD Series", boardIds: ["samd21", "samd21plus"] },
  { id: "ra", label: "Renesas RA Series", boardIds: ["ra4"] },
];
const BOARD_PLACEHOLDERS = {};

export function Pinout() {
  const { lang } = useLang();
  const [boardId, setBoardId] = useState("samd21");
  const [face, setFace] = useState("front");
  const [selId, setSelId] = useState("D0");
  const [copied, setCopied] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const initialCategory = BOARD_CATEGORIES.find((category) => category.boardIds.includes(boardId))?.id || BOARD_CATEGORIES[0].id;
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory);
  const copyTimer = useRef(null);
  const boardMenuRef = useRef(null);
  const stageRef = useRef(null);
  const detailCardRef = useRef(null);
  const detailHeadRef = useRef(null);
  const activeStagePinRef = useRef(null);
  const [connector, setConnector] = useState(null);
  const board = BOARDS[boardId];
  const groups = [...board.groups, ...(board.backGroups || [])];
  const allPins = groups.flatMap((g) => g.pins);
  const pinById = (id) => allPins.find((p) => p.id === id);
  const activeId = pinById(selId) ? selId : allPins[0].id;
  const pin = pinById(activeId);
  const c = FN_COLOR[pin.fn];
  const isSamd21 = boardId === "samd21";
  const inferredLedIds = [...new Set(allPins
    .filter((item) => item.id.includes("LED") || item.id.startsWith("RGB_"))
    .map((item) => item.id))];
  const frontTopMarkers = isSamd21
    ? SAMD21_FRONT_MARKERS
    : inferredLedIds.map((id) => ({ id, label: id.replaceAll("_", " ") }));
  const frontMarkerIds = frontTopMarkers.map((marker) => marker.id);
  const resetPin = ["RST", "RESET", "nRST"].map(pinById).find(Boolean);
  const bootPin = ["Boot", "BOOT"].map(pinById).find(Boolean);
  const frontCornerMarkers = [
    resetPin && { id: resetPin.id, label: "RST", side: "left" },
    bootPin && { id: bootPin.id, label: "BOOT", side: "right" },
  ].filter(Boolean);
  const frontBottomIds = board.frontBottomIds || [];
  const frontAuxIds = [...frontTopMarkers.map((marker) => marker.id), ...frontCornerMarkers.map((marker) => marker.id), ...frontBottomIds];
  const activeLeftIds = face === "back" && board.backPins ? board.backPins.left : board.leftColIds;
  const selectedCornerMarker = frontCornerMarkers.find((marker) => marker.id === activeId);
  const detailOnLeft = selectedCornerMarker?.side === "left" || activeLeftIds.includes(activeId) || (
    isSamd21 && face === "front" && SAMD21_LEFT_DETAIL_IDS.has(activeId)
  );
  const pick = (field) => (field && field[lang]) || (field && field.en) || "";
  const activeCategory = BOARD_CATEGORIES.find((category) => category.id === activeCategoryId) || BOARD_CATEGORIES[0];

  useEffect(() => {
    if (!boardMenuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!boardMenuRef.current?.contains(event.target)) setBoardMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setBoardMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [boardMenuOpen]);

  /* 板图都很小（约 16–88KB），首屏后一次预加载全部正反面，
     后续切型号/翻面只做 DOM 替换，不再等待网络请求。 */
  useEffect(() => {
    const preloaded = [];
    Object.values(BOARDS).forEach((item) => {
      [item.figureImg, item.figureImgBack].filter(Boolean).forEach((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = withBase(src);
        preloaded.push(img);
      });
    });
    return () => { preloaded.length = 0; };
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const card = detailCardRef.current;
      const detailHead = detailHeadRef.current;
      const pinButton = activeStagePinRef.current;
      const pinDot = pinButton?.querySelector(`.${styles.pinPad}`);
      if (!stage || !card || !detailHead || !pinDot) {
        setConnector(null);
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const detailHeadRect = detailHead.getBoundingClientRect();
      const pinRect = pinDot.getBoundingClientRect();
      const startX = (detailOnLeft ? cardRect.right : cardRect.left) - stageRect.left;
      const startY = detailHeadRect.top - stageRect.top + detailHeadRect.height / 2;
      const endX = pinRect.left - stageRect.left + pinRect.width / 2;
      const endY = pinRect.top - stageRect.top + pinRect.height / 2;
      const horizontalGap = endX - startX;
      const elbowOffset = Math.min(62, Math.max(22, Math.abs(horizontalGap) * 0.34));
      const elbowX = startX + Math.sign(horizontalGap || 1) * Math.min(Math.abs(horizontalGap) / 2, elbowOffset);
      const markerId = SAMD21_FRONT_MARKER_ALIASES[activeId] || activeId;
      const approach = pinButton.dataset.connectorApproach;
      const verticalApproachY = approach === "top" ? endY - 30 : endY + 30;
      const isVerticalMarker = face === "front" && (
        approach === "top" || approach === "bottom" || SAMD21_FRONT_MARKERS.some((marker) => marker.id === markerId)
      );
      const pathPoints = isVerticalMarker
        ? [
          { x: startX, y: startY },
          { x: elbowX, y: startY },
          { x: elbowX, y: verticalApproachY },
          { x: endX, y: verticalApproachY },
          { x: endX, y: endY },
        ]
        : [
          { x: startX, y: startY },
          { x: elbowX, y: startY },
          { x: elbowX, y: endY },
          { x: endX, y: endY },
        ];

      setConnector({
        width: stageRect.width,
        height: stageRect.height,
        path: roundedOrthogonalPath(pathPoints),
        startX,
        startY,
      });
    };

    measure();
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    if (detailCardRef.current) observer.observe(detailCardRef.current);
    if (activeStagePinRef.current) observer.observe(activeStagePinRef.current);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeId, boardId, detailOnLeft, face]);

  const selectBoard = (id) => {
    setBoardId(id);
    setFace("front");
    setSelId(BOARDS[id].leftColIds[0]);
    setBoardMenuOpen(false);
  };

  const selectPinFromList = (id, sourceFace = null) => {
    const frontIds = new Set([
      ...board.leftColIds,
      ...board.rightColIds,
      ...frontAuxIds,
      ...(boardId === "samd21" ? [...frontMarkerIds, ...Object.keys(SAMD21_FRONT_MARKER_ALIASES)] : []),
    ]);
    const backIds = new Set(board.backPins ? [...board.backPins.left, ...board.backPins.right] : []);

    if (sourceFace === "back") setFace("back");
    else if (sourceFace === "front") setFace("front");
    else if (backIds.has(id) && !frontIds.has(id)) setFace("back");
    else if (frontIds.has(id)) setFace("front");
    setSelId(id);
  };

  const T = {
    eyebrow: lang === "zh" ? "引脚定义" : "Pinout",
    h2: lang === "zh" ? "引脚定义" : "Pin Out",
    p: lang === "zh"
      ? "点击左侧引脚列表或板子上的焊盘，查看每个引脚的功能、芯片引脚、注意事项与初始化代码。"
      : "Click a pin in the list or a pad on the board to see its function, chip pin, notes and init code.",
    listLabel: lang === "zh" ? "引脚列表" : "Pin List",
    detailLabel: lang === "zh" ? "引脚详情" : "Pin Details",
    fn: lang === "zh" ? "功能" : "Function",
    chipPin: lang === "zh" ? "芯片引脚" : "Chip Pin",
    capabilities: lang === "zh" ? "引脚特性" : "Capabilities",
    note: lang === "zh" ? "注意事项" : "Note",
    codeHead: lang === "zh" ? "初始化代码" : "Initialization",
    codeEmpty: lang === "zh" ? "// 电源 / 内部引脚，无需用户初始化" : "// Power / internal pin — no user init needed",
    copy: lang === "zh" ? "复制" : "Copy",
    copied: lang === "zh" ? "已复制" : "Copied",
    boardLabel: lang === "zh" ? "板型" : "Board",
    front: lang === "zh" ? "正面引脚" : "Front pins",
    back: lang === "zh" ? "背面焊盘" : "Back pads",
    gpioNote: lang === "zh" ? "GPIO 编号以 Seeed Wiki 对应板型为准" : "GPIO numbers per Seeed Wiki for each board",
  };

  const noteText = pin.note ? pick(pin.note) : "";
  const samdExtraNotes = lang === "zh" ? {
    D0: "D0 支持真正的 DAC 输出，但不支持硬件 PWM。",
    D5: "D5 与 D7 不能同时作为外部中断使用。",
    D7: "D5 与 D7 不能同时作为外部中断使用。",
    USER_LED: "板载用户灯为低电平点亮。", D13: "板载用户灯为低电平点亮。",
    "5V-back": "背面 VIN/GND 焊盘不能直接连接锂电池；需要外部电池管理电路。",
    "GND-back": "背面 VIN/GND 焊盘不能直接连接锂电池；需要外部电池管理电路。",
  } : {
    D0: "D0 provides a true DAC output, but it has no hardware PWM.",
    D5: "D5 and D7 cannot be used as external interrupts at the same time.",
    D7: "D5 and D7 cannot be used as external interrupts at the same time.",
    USER_LED: "The onboard user LED is active-low.", D13: "The onboard user LED is active-low.",
    "5V-back": "The rear VIN/GND pads are not a direct LiPo input; use external battery management.",
    "GND-back": "The rear VIN/GND pads are not a direct LiPo input; use external battery management.",
  };
  const samdExtraNote = isSamd21 ? (samdExtraNotes[`${activeId}-${face}`] || samdExtraNotes[activeId] || "") : "";
  const detailNoteText = [noteText, samdExtraNote].filter(Boolean).join(" ");
  const genericCapabilities = {
    power: ["POWER"], gnd: ["GROUND"], rst: ["RESET"], digital: ["GPIO"],
    analog: ["GPIO", "ADC"], i2c: ["I²C"], spi: ["SPI"], uart: ["UART"],
  };
  const capabilities = isSamd21
    ? (SAMD21_CAPABILITIES[activeId] || genericCapabilities[pin.fn] || [])
    : (genericCapabilities[pin.fn] || []);

  function fallbackCopy(text, done) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch {}
  }

  const handleCopy = useCallback(() => {
    const text = pin.code || T.codeEmpty;
    const done = () => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }, [pin.code, T.codeEmpty]);

  return (
    <div className={`${styles.pinout} scroll-mt-28`} id="pinout">
      <ToolPageIntro title={T.h2} description={T.p} />
      <div className={styles.wrap}>
        <div className={styles.boardBar}>
          <label className={styles.boardBarLabel}>{T.boardLabel}</label>
          <div className={styles.boardSelect} ref={boardMenuRef}>
            <button
              type="button"
              className={`${styles.boardSelectTrigger} ${boardMenuOpen ? styles.boardSelectTriggerOpen : ""}`}
              aria-label={T.boardLabel}
              aria-haspopup="menu"
              aria-expanded={boardMenuOpen}
              onClick={() => {
                const category = BOARD_CATEGORIES.find((item) => item.boardIds.includes(boardId));
                if (category) setActiveCategoryId(category.id);
                setBoardMenuOpen((open) => !open);
              }}
            >
              <span>{board.name}</span><i aria-hidden="true" />
            </button>
            {boardMenuOpen && (
              <div className={styles.boardMenu} role="menu">
                <div className={styles.boardMenuCategories}>
                  {BOARD_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={category.id === activeCategory.id ? styles.boardCategoryActive : ""}
                      onMouseEnter={() => setActiveCategoryId(category.id)}
                      onFocus={() => setActiveCategoryId(category.id)}
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      <span>{category.label}</span><small>{category.boardIds.length}</small>
                    </button>
                  ))}
                </div>
                <div className={styles.boardMenuModels}>
                  <div className={styles.boardMenuTitle}>{activeCategory.label}</div>
                  {activeCategory.boardIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={id === boardId}
                      disabled={!BOARDS[id]}
                      className={`${id === boardId ? styles.boardModelActive : ""} ${!BOARDS[id] ? styles.boardModelPending : ""}`}
                      onClick={() => BOARDS[id] && selectBoard(id)}
                    >
                      <span>{BOARDS[id]?.name || BOARD_PLACEHOLDERS[id]?.name || id}</span>
                      {!BOARDS[id] && <small>{lang === "zh" ? "Pinout 待补充" : "Pinout pending"}</small>}
                      {id === boardId && <b aria-hidden="true">✓</b>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {board.backPins && (
            <div className={styles.faceSwitch} aria-label={lang === "zh" ? "选择板子正反面" : "Choose board face"}>
              <button type="button" className={face === "front" ? styles.faceActive : ""} onClick={() => { setFace("front"); setSelId(board.leftColIds[0]); }}>{T.front}</button>
              <button type="button" className={face === "back" ? styles.faceActive : ""} onClick={() => { setFace("back"); setSelId(board.backPins.left[0] || board.backPins.right[0]); }}>{T.back}</button>
            </div>
          )}
          {board.gpioNote && <span className={styles.gpioNote}>{T.gpioNote}</span>}
        </div>

        <section className={styles.workspace}>
          <div className={`${styles.grid} ${styles.samdLayout} ${boardId === "nrf54" ? styles.lm20Layout : ""} ${boardId.endsWith("plus") ? styles.plusLayout : ""} ${detailOnLeft ? styles.samdDetailLeft : styles.samdDetailRight}`}>
            {/* 左：分组引脚列表 */}
            <aside className={styles.leftPanel}>
              <div className={styles.panelLabel}>{T.listLabel}</div>
              <div className={styles.pinList}>
                {groups.map((g) => (
                  <div key={g.cat} className={styles.pinGroup}>
                    <div className={styles.groupLabel}>{pick(g.label)}</div>
                    {g.pins.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`${styles.pinItem} ${p.id === activeId ? styles.pinItemActive : ""}`}
                        onClick={() => selectPinFromList(p.id, g.cat.startsWith("back-") ? "back" : null)}
                        data-pin={p.id}
                      >
                        <span className={styles.pinDot} style={{ background: FN_COLOR[p.fn] }} />
                        <span className={styles.pinItemName}>{p.id}</span>
                        <span className={styles.pinItemFunc}>{p.xiao !== "—" ? p.xiao : pick(p.desc).split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </aside>

            <div className={styles.pinStage} ref={stageRef}>
            {/* 中：CSS 板子示意图（左右两列引脚） */}
            <div className={styles.centerPanel}>
              <div className={styles.boardFigure}>
                <div className={`${styles.pinCol} ${styles.pinColLeft}`}>
                  {(face === "back" && board.backPins ? board.backPins.left : board.leftColIds).map((id, i) => {
                    const p = pinById(id);
                    if (!p) return null;
                    const active = id === activeId;
                    const ids = face === "back" && board.backPins ? board.backPins.left : board.leftColIds;
                    const y = (face === "back" && board.backPins ? board.backPins.padY?.left?.[i] : board.padY?.left?.[i]) ?? ((i + 1) / (ids.length + 1) * 100);
                    return (
                      <button key={id} type="button"
                        className={`${styles.pinRow} ${active ? styles.pinRowActive : ""}`}
                        style={{ top: `${y}%`, color: FN_COLOR[p.fn] }}
                        onClick={() => setSelId(id)}
                        ref={active ? activeStagePinRef : null}
                      >
                        <span className={styles.pinName}>{p.id}</span>
                        <span className={styles.pinFunc}>{p.xiao !== "—" ? p.xiao : ""}</span>
                        <span className={styles.pinLead} style={active ? { background: FN_COLOR[p.fn] } : null} />
                        <span className={styles.pinPad} style={{ background: FN_COLOR[p.fn] }} />
                      </button>
                    );
                  })}
                </div>

                <div className={`${styles.boardBody} ${board.figureImg ? styles.boardBodyImg : ""}`}>
                  {board.figureImg ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={withBase(face === "back" ? board.figureImgBack : board.figureImg)}
                        alt={`${board.name} ${face}`}
                        className={`${styles.boardFigureImg} ${face === "front" && board.rotateFront ? styles.boardFigureImgRotated : ""}`}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                      />
                      {face === "front" && frontTopMarkers.length > 0 && (
                        <div className={styles.samdTopMarkers}>
                          {frontTopMarkers.map((marker) => {
                            const markerPin = pinById(marker.id);
                            if (!markerPin) return null;
                            const active = marker.id === activeId || SAMD21_FRONT_MARKER_ALIASES[activeId] === marker.id;
                            return (
                              <button
                                key={marker.id}
                                type="button"
                                className={`${styles.samdBoardMarker} ${active ? styles.samdBoardMarkerActive : ""}`}
                                style={{ color: FN_COLOR[markerPin.fn] }}
                                onClick={() => setSelId(marker.id)}
                                ref={active ? activeStagePinRef : null}
                                data-connector-approach="top"
                                aria-label={marker.id}
                              >
                                <span>{marker.label}</span>
                                <span className={styles.pinPad} style={{ background: FN_COLOR[markerPin.fn] }} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {face === "front" && frontCornerMarkers.map((marker) => {
                        const markerPin = pinById(marker.id);
                        const active = marker.id === activeId;
                        return (
                          <button
                            key={`${marker.side}-${marker.id}`}
                            type="button"
                            className={`${styles.frontCornerMarker} ${marker.side === "left" ? styles.frontCornerMarkerLeft : styles.frontCornerMarkerRight} ${active ? styles.frontAuxMarkerActive : ""}`}
                            style={{ color: FN_COLOR[markerPin.fn] }}
                            onClick={() => setSelId(marker.id)}
                            ref={active ? activeStagePinRef : null}
                          >
                            <span>{marker.label}</span>
                            <span className={styles.pinPad} style={{ background: FN_COLOR[markerPin.fn] }} />
                          </button>
                        );
                      })}
                      {face === "front" && frontBottomIds.length > 0 && (
                        <div className={styles.frontBottomMarkers}>
                          {frontBottomIds.map((id) => {
                            const markerPin = pinById(id);
                            if (!markerPin) return null;
                            const active = id === activeId;
                            return (
                              <button
                                key={id}
                                type="button"
                                className={`${styles.frontBottomMarker} ${active ? styles.frontAuxMarkerActive : ""}`}
                                style={{ color: FN_COLOR[markerPin.fn] }}
                                onClick={() => setSelId(id)}
                                ref={active ? activeStagePinRef : null}
                                data-connector-approach="bottom"
                              >
                                <span className={styles.pinPad} style={{ background: FN_COLOR[markerPin.fn] }} />
                                <span>{id.replaceAll("_", " ")}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className={styles.boardChip}>{board.figureLabel[0]}<br />{board.figureLabel[1]}</div>
                      <div className={styles.boardSub}>{board.figureSub}</div>
                    </>
                  )}
                </div>

                <div className={`${styles.pinCol} ${styles.pinColRight}`}>
                  {(face === "back" && board.backPins ? board.backPins.right : board.rightColIds).map((id, i) => {
                    const p = pinById(id);
                    if (!p) return null;
                    const active = id === activeId;
                    const ids = face === "back" && board.backPins ? board.backPins.right : board.rightColIds;
                    const y = (face === "back" && board.backPins ? board.backPins.padY?.right?.[i] : board.padY?.right?.[i]) ?? ((i + 1) / (ids.length + 1) * 100);
                    return (
                      <button key={id} type="button"
                        className={`${styles.pinRow} ${active ? styles.pinRowActive : ""}`}
                        style={{ top: `${y}%`, color: FN_COLOR[p.fn] }}
                        onClick={() => setSelId(id)}
                        ref={active ? activeStagePinRef : null}
                      >
                        <span className={styles.pinName}>{p.id}</span>
                        <span className={styles.pinFunc}>{p.xiao !== "—" ? p.xiao : ""}</span>
                        <span className={styles.pinLead} style={active ? { background: FN_COLOR[p.fn] } : null} />
                        <span className={styles.pinPad} style={{ background: FN_COLOR[p.fn] }} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.boardMeta}>
                <h3>{board.name}</h3>
                <p>{pick(board.tagline)}</p>
              </div>
              <div className={styles.pinLegend} aria-label={lang === "zh" ? "引脚功能图例" : "Pin function legend"}>
                {[
                  ["power", lang === "zh" ? "电源" : "Power"], ["gnd", "GND"],
                  ["digital", "Digital GPIO"], ["analog", "ADC"], ["i2c", "I2C"],
                  ["spi", "SPI"], ["uart", "UART"], ["rst", lang === "zh" ? "系统" : "System"],
                ].map(([fn, label]) => (
                  <span key={fn}><i style={{ background: FN_COLOR[fn] }} />{label}</span>
                ))}
              </div>
            </div>

            {/* 右：选中引脚详情 */}
            <aside className={styles.rightPanel}>
              <div className={styles.detailCard} ref={detailCardRef}>
                <div className={styles.detailToolbar}>
                  <div className={styles.panelLabel}>{T.detailLabel}</div>
                </div>
                <div className={styles.detailHead} ref={detailHeadRef}>
                  <span className={styles.detailDot} style={{ background: c }} />
                  <h3 className={styles.detailName}>{pin.id.replaceAll("_", " ")}</h3>
                  <span className={styles.detailXiao}>{pin.xiao}</span>
                </div>

                <dl className={styles.specList}>
                  <div className={styles.specRow}><dt>{T.fn}</dt><dd>{pick(pin.desc)}</dd></div>
                  <div className={styles.specRow}><dt>{T.chipPin}</dt><dd className={styles.mono}>{pin.chip}</dd></div>
                </dl>

                {capabilities.length > 0 && (
                  <div className={styles.capabilityBlock}>
                    <div className={styles.capabilityLabel}>{T.capabilities}</div>
                    <div className={styles.capabilityList}>
                      {capabilities.map((item) => <span key={item}>{item}</span>)}
                    </div>
                  </div>
                )}

                {detailNoteText && (
                  <div className={styles.noteBox}>
                    <strong>{T.note}</strong>
                    {detailNoteText}
                  </div>
                )}

                <div className={styles.codeBlock}>
                  <div className={styles.codeHead}>
                    <span className={styles.codeHeadLabel}>{T.codeHead}</span>
                    <button
                      type="button"
                      className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
                      onClick={handleCopy}
                      aria-label={T.copy}
                      title={T.copy}
                    >
                      {copied ? T.copied : T.copy}
                    </button>
                  </div>
                  <pre><code>{pin.code || T.codeEmpty}</code></pre>
                </div>
              </div>
            </aside>
            {connector && (
              <svg className={styles.samdConnector} viewBox={`0 0 ${connector.width} ${connector.height}`} preserveAspectRatio="none" aria-hidden="true">
                <path d={connector.path} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <circle cx={connector.startX} cy={connector.startY} r="5" fill="#fff" stroke={c} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
