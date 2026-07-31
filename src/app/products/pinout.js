"use client";

import { useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import styles from "./pinout.module.css";

/* 功能色 */
const FN_COLOR = {
  power: "#e1554f",
  gnd: "#3a423d",
  rst: "#d8a13a",
  digital: "#16b66a",
  analog: "#2f73f1",
  i2c: "#8b5cf6",
  spi: "#0ea5b0",
  uart: "#16a3a3",
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
    { id: "NFC", xiao: "—", fn: "digital", chip: "P1.02 / P1.01", desc: { en: "NFC Antenna Pins", zh: "NFC 天线引脚" }, note: { en: "Connects to the NFC antenna pads.", zh: "接 NFC 天线焊盘。" }, code: "" },
    { id: "GRTC", xiao: "—", fn: "digital", chip: "P0.04 / P0.05", desc: { en: "General Purpose RTC Pins", zh: "通用 RTC 引脚" }, note: "", code: "" },
  ] },
];

/* nRF54 板子示意图：左右两列排出全部引脚 */
const nrf54Left = [
  "VBUS", "BAT+", "BAT-", "SHPHLD", "RESET", "SWCLK", "SWDIO", "SAMD11_RESET",
  "A0", "A1", "A2", "A3", "A7", "SDA", "SCL", "BAT_SDA", "BAT_SCL", "GND", "3V3",
];
const nrf54Right = [
  "USER_BUTTON", "RGB_R", "RGB_G", "RGB_B", "TX", "RX", "MOSI", "MISO", "SCK",
  "MIC_CLK", "MIC_DAT", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1", "NFC", "GRTC",
];

/* 标准 XIAO 14 脚封装（ESP32-S3 / C3 / C6 / C5 等共用）。
   xiao 名 + 功能映射来自 Seeed 标准 XIAO 引脚定义；具体 GPIO 编号因板而异，
   请以 Seeed Wiki 对应板型页面为准，故 chip 暂记 "—"。 */
const stdGroups = [
  { cat: "power", label: { en: "Power", zh: "电源" }, pins: [
    { id: "5V", xiao: "5V", fn: "power", chip: "—", desc: { en: "5V Power Input/Output (USB VBus)", zh: "5V 电源输入/输出（USB VBus）" }, note: { en: "From USB; keep peripheral load under 500mA.", zh: "来自 USB，外设勿超 500mA。" }, code: "" },
    { id: "GND", xiao: "GND", fn: "gnd", chip: "—", desc: { en: "Ground", zh: "地" }, note: { en: "Common ground for all peripherals.", zh: "所有外设共地。" }, code: "" },
    { id: "3V3", xiao: "3V3", fn: "power", chip: "—", desc: { en: "3.3V Power Output", zh: "3.3V 电源输出" }, note: { en: "Max output ~200mA; use a separate supply beyond that.", zh: "最大输出约 200mA，超出请独立供电。" }, code: "" },
  ] },
  { cat: "system", label: { en: "System", zh: "系统" }, pins: [
    { id: "RST", xiao: "RST", fn: "rst", chip: "—", desc: { en: "Board Reset", zh: "板载复位" }, note: { en: "Active-low reset; onboard pull-up.", zh: "低电平复位，已板载上拉。" }, code: "" },
  ] },
  { cat: "analog", label: { en: "Analog / Digital", zh: "模拟 / 数字" }, pins: [
    { id: "D0", xiao: "A0", fn: "analog", chip: "—", desc: { en: "Digital 0 / Analog 0", zh: "数字 0 / 模拟 0" }, note: { en: "Input voltage must not exceed 3.3V.", zh: "输入电压不得超过 3.3V。" }, code: "int v = analogRead(A0);  // 0–4095" },
    { id: "D1", xiao: "A1", fn: "analog", chip: "—", desc: { en: "Digital 1 / Analog 1", zh: "数字 1 / 模拟 1" }, note: "", code: "int v = analogRead(A1);" },
    { id: "D2", xiao: "A2", fn: "analog", chip: "—", desc: { en: "Digital 2 / Analog 2", zh: "数字 2 / 模拟 2" }, note: "", code: "int v = analogRead(A2);" },
    { id: "D3", xiao: "A3", fn: "analog", chip: "—", desc: { en: "Digital 3 / Analog 3", zh: "数字 3 / 模拟 3" }, note: "", code: "int v = analogRead(A3);" },
  ] },
  { cat: "i2c", label: { en: "I2C", zh: "I2C" }, pins: [
    { id: "D4", xiao: "SDA", fn: "i2c", chip: "—", desc: { en: "I2C Data Line", zh: "I2C 数据线" }, note: { en: "Onboard pull-ups; extra devices usually need no added pull-up.", zh: "板载上拉，外接多设备一般无需再加。" }, code: "Wire.begin(SDA, SCL);" },
    { id: "D5", xiao: "SCL", fn: "i2c", chip: "—", desc: { en: "I2C Clock Line", zh: "I2C 时钟线" }, note: { en: "Default 100kHz; can be raised to 400kHz.", zh: "默认 100kHz，可调至 400kHz。" }, code: "Wire.begin(SDA, SCL);" },
  ] },
  { cat: "uart", label: { en: "UART", zh: "UART" }, pins: [
    { id: "D6", xiao: "TX", fn: "uart", chip: "—", desc: { en: "UART Transmit", zh: "UART 发送" }, note: { en: "3.3V logic; level-shift before connecting 5V devices.", zh: "逻辑电平 3.3V，接 5V 设备先电平转换。" }, code: "Serial1.begin(115200);\nSerial1.println(\"hi\");" },
    { id: "D7", xiao: "RX", fn: "uart", chip: "—", desc: { en: "UART Receive", zh: "UART 接收" }, note: "", code: "Serial1.begin(115200);" },
  ] },
  { cat: "spi", label: { en: "SPI", zh: "SPI" }, pins: [
    { id: "D8", xiao: "SCK", fn: "spi", chip: "—", desc: { en: "SPI Serial Clock", zh: "SPI 串行时钟" }, note: { en: "Start with a low clock rate when debugging.", zh: "时钟频率先低后高调试。" }, code: "SPI.begin(SCK, MISO, MOSI, CS);" },
    { id: "D9", xiao: "MISO", fn: "spi", chip: "—", desc: { en: "SPI Master In Slave Out", zh: "SPI 主入从出" }, note: "", code: "SPI.begin(SCK, MISO, MOSI, CS);" },
    { id: "D10", xiao: "MOSI", fn: "spi", chip: "—", desc: { en: "SPI Master Out Slave In", zh: "SPI 主出从入" }, note: "", code: "SPI.begin(SCK, MISO, MOSI, CS);" },
  ] },
];
const stdLeft = ["D0", "D1", "D2", "D3", "D4", "D5", "D6"];
const stdRight = ["5V", "GND", "3V3", "D10", "D9", "D8", "D7"];

/* 选型下拉：XIAO 板型 → 板信息 + 引脚数据 + 板图两列 */
const BOARDS = {
  nrf54: {
    name: "XIAO nRF54LM20",
    figureLabel: ["XIAO", "nRF54LM20"],
    figureSub: "nRF54LM20A · nPM1300 · SAMD11",
    tagline: { en: "nRF54LM20A + nPM1300 + SAMD11 — ultra-low-power wireless controller", zh: "nRF54LM20A + nPM1300 + SAMD11，超低功耗无线主控" },
    groups: nrf54Groups,
    leftColIds: nrf54Left,
    rightColIds: nrf54Right,
    gpioNote: false,
  },
  s3: {
    name: "XIAO ESP32-S3",
    figureLabel: ["XIAO", "ESP32-S3"],
    figureSub: "ESP32-S3 · Wi-Fi + BLE",
    tagline: { en: "ESP32-S3 — Wi-Fi + BLE workhorse with plenty of GPIO and PSRAM.", zh: "ESP32-S3 — Wi-Fi + BLE 主力，GPIO 多、带 PSRAM。" },
    groups: stdGroups, leftColIds: stdLeft, rightColIds: stdRight, gpioNote: true,
  },
  c3: {
    name: "XIAO ESP32-C3",
    figureLabel: ["XIAO", "ESP32-C3"],
    figureSub: "ESP32-C3 · Wi-Fi 4 + BLE 5",
    tagline: { en: "ESP32-C3 — compact RISC-V for Wi-Fi + BLE basics.", zh: "ESP32-C3 — RISC-V 小巧，Wi-Fi + BLE 入门。" },
    groups: stdGroups, leftColIds: stdLeft, rightColIds: stdRight, gpioNote: true,
  },
  c6: {
    name: "XIAO ESP32-C6",
    figureLabel: ["XIAO", "ESP32-C6"],
    figureSub: "ESP32-C6 · Wi-Fi 6 + BLE + Thread/Zigbee",
    tagline: { en: "ESP32-C6 — Wi-Fi 6, BLE, and Thread/Zigbee for Matter smart-home.", zh: "ESP32-C6 — Wi-Fi 6 + BLE + Thread/Zigbee，适合 Matter 智能家居。" },
    groups: stdGroups, leftColIds: stdLeft, rightColIds: stdRight, gpioNote: true,
  },
  c5: {
    name: "XIAO ESP32-C5",
    figureLabel: ["XIAO", "ESP32-C5"],
    figureSub: "ESP32-C5 · Wi-Fi 6 + BLE 5",
    tagline: { en: "ESP32-C5 — Wi-Fi 6 + BLE 5 on the XIAO footprint.", zh: "ESP32-C5 — XIAO 封装上的 Wi-Fi 6 + BLE 5。" },
    groups: stdGroups, leftColIds: stdLeft, rightColIds: stdRight, gpioNote: true,
  },
};
const BOARD_ORDER = ["nrf54", "s3", "c3", "c6", "c5"];

/* 下方推荐区 —— Seeed 相关 */
const recommendations = [
  { name: { en: "Grove Sensor Kit", zh: "Grove 传感器套件" }, tagline: { en: "Plug-and-play; pair with XIAO to prototype fast.", zh: "即插即用，配合 XIAO 快速搭建原型。" }, tag: { en: "Accessory", zh: "配件" } },
  { name: { en: "XIAO Expansion Base", zh: "XIAO 扩展底板" }, tagline: { en: "Breaks out every pin for easy wiring and debugging.", zh: "引出全部引脚，方便接线和调试。" }, tag: { en: "Expansion", zh: "扩展" } },
  { name: { en: "Seeed Wiki Tutorials", zh: "Seeed Wiki 教程" }, tagline: { en: "From blinking an LED to a Matter smart home.", zh: "从点亮 LED 到 Matter 智能家居全流程。" }, tag: { en: "Docs", zh: "文档" } },
  { name: { en: "nPM1300 Power Management", zh: "nPM1300 电源管理" }, tagline: { en: "Companion chip for battery monitoring and low-power scheduling.", zh: "电池监测与低功耗调度配套芯片。" }, tag: { en: "Companion", zh: "配套" } },
];

export function Pinout() {
  const { lang } = useLang();
  const [boardId, setBoardId] = useState("nrf54");
  const [selId, setSelId] = useState("A0");
  const board = BOARDS[boardId];
  const groups = board.groups;
  const allPins = groups.flatMap((g) => g.pins);
  const pinById = (id) => allPins.find((p) => p.id === id);
  const activeId = pinById(selId) ? selId : allPins[0].id;
  const pin = pinById(activeId);
  const c = FN_COLOR[pin.fn];
  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  const T = {
    eyebrow: lang === "zh" ? "引脚定义" : "Pinout",
    h2: lang === "zh" ? "引脚定义" : "Pinout",
    p: lang === "zh"
      ? "点击左侧引脚列表或板子上的焊盘，查看每个引脚的功能、芯片引脚、注意事项与初始化代码。"
      : "Click a pin in the list or a pad on the board to see its function, chip pin, notes and init code.",
    listLabel: lang === "zh" ? "引脚列表" : "Pin List",
    detailLabel: lang === "zh" ? "引脚详情" : "Pin Details",
    fn: lang === "zh" ? "功能" : "Function",
    chipPin: lang === "zh" ? "芯片引脚" : "Chip Pin",
    note: lang === "zh" ? "注意事项" : "Note",
    codeHead: lang === "zh" ? "初始化代码" : "Initialization",
    codeEmpty: lang === "zh" ? "// 电源 / 内部引脚，无需用户初始化" : "// Power / internal pin — no user init needed",
    recoTitle: lang === "zh" ? "相关推荐" : "Related",
    recoSub: lang === "zh" ? "来自 Seeed 的配套资源" : "Companion resources from Seeed",
    boardLabel: lang === "zh" ? "板型" : "Board",
    gpioNote: lang === "zh" ? "GPIO 编号以 Seeed Wiki 对应板型为准" : "GPIO numbers per Seeed Wiki for each board",
  };

  const noteText = pin.note ? pick(pin.note) : "";

  return (
    <div className={styles.pinout} id="pinout">
      <div className={styles.wrap}>
        <div className={styles.introBlock}>
          <span className={styles.eyebrow}><span className={styles.eyebrowDot} /> {T.eyebrow}</span>
          <Glow as="h2">{T.h2}</Glow>
          <p>{T.p}</p>
        </div>

        <div className={styles.boardBar}>
          <label className={styles.boardBarLabel}>{T.boardLabel}</label>
          <div className={styles.boardSelect}>
            <select value={boardId} onChange={(e) => setBoardId(e.target.value)} aria-label={T.boardLabel}>
              {BOARD_ORDER.map((k) => (
                <option key={k} value={k}>{BOARDS[k].name}</option>
              ))}
            </select>
          </div>
          {board.gpioNote && <span className={styles.gpioNote}>{T.gpioNote}</span>}
        </div>

        <section className={styles.workspace}>
          <div className={styles.grid}>
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
                        onClick={() => setSelId(p.id)}
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

            {/* 中：CSS 板子示意图（左右两列引脚） */}
            <div className={styles.centerPanel}>
              <div className={styles.boardFigure}>
                <div className={`${styles.pinCol} ${styles.pinColLeft}`}>
                  {board.leftColIds.map((id) => {
                    const p = pinById(id);
                    const active = id === activeId;
                    return (
                      <button key={id} type="button"
                        className={`${styles.pinRow} ${active ? styles.pinRowActive : ""}`}
                        onClick={() => setSelId(id)}
                      >
                        <span className={styles.pinName}>{p.id}</span>
                        <span className={styles.pinFunc}>{p.xiao !== "—" ? p.xiao : ""}</span>
                        <span className={styles.pinLead} style={active ? { background: FN_COLOR[p.fn] } : null} />
                        <span className={styles.pinPad} style={{ background: FN_COLOR[p.fn] }} />
                      </button>
                    );
                  })}
                </div>

                <div className={styles.boardBody}>
                  <div className={styles.boardChip}>{board.figureLabel[0]}<br />{board.figureLabel[1]}</div>
                  <div className={styles.boardSub}>{board.figureSub}</div>
                </div>

                <div className={`${styles.pinCol} ${styles.pinColRight}`}>
                  {board.rightColIds.map((id) => {
                    const p = pinById(id);
                    const active = id === activeId;
                    return (
                      <button key={id} type="button"
                        className={`${styles.pinRow} ${active ? styles.pinRowActive : ""}`}
                        onClick={() => setSelId(id)}
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
            </div>

            {/* 右：选中引脚详情 */}
            <aside className={styles.rightPanel}>
              <div className={styles.panelLabel}>{T.detailLabel}</div>
              <div className={styles.detailCard}>
                <div className={styles.detailHead}>
                  <span className={styles.detailDot} style={{ background: c }} />
                  <h3 className={styles.detailName}>{pin.id}</h3>
                  <span className={styles.detailXiao}>{pin.xiao}</span>
                </div>

                <dl className={styles.specList}>
                  <div className={styles.specRow}><dt>{T.fn}</dt><dd>{pick(pin.desc)}</dd></div>
                  <div className={styles.specRow}><dt>{T.chipPin}</dt><dd className={styles.mono}>{pin.chip}</dd></div>
                </dl>

                {noteText && (
                  <div className={styles.noteBox}>
                    <strong>{T.note}</strong>
                    {noteText}
                  </div>
                )}

                <div className={styles.codeBlock}>
                  <div className={styles.codeHead}>{T.codeHead}</div>
                  <pre><code>{pin.code || T.codeEmpty}</code></pre>
                </div>
              </div>
            </aside>
          </div>

          {/* 推荐区 */}
          <div className={styles.recoArea}>
            <div className={styles.recoHead}>
              <strong>{T.recoTitle}</strong>
              <span>{T.recoSub}</span>
            </div>
            <div className={styles.recoGrid}>
              {recommendations.map((r) => (
                <article key={r.name.en} className={styles.recoCard}>
                  <span className={styles.recoTag}>{pick(r.tag)}</span>
                  <h4>{pick(r.name)}</h4>
                  <p>{pick(r.tagline)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
