import { analogHeader, assembleBoard, busPin, headerPin, note, powerPin } from "./buildBoard.js";
import { NRF54_FRONT_PADS, S3_FRONT_PADS, STD_FRONT_PADS } from "./footprint.js";
import samd21 from "./boards/samd21.js";
import { buildVariantBoards } from "./variants.js";

const vbusWarn = note("From USB; keep peripheral load under 500mA.", "来自 USB，外设勿超 500mA。");
const gndWarn = note("Common ground for all peripherals.", "所有外设共地。");
const v33Warn = (ma) => note(`Max output ~${ma}mA; use a separate supply beyond that.`, `最大输出约 ${ma}mA，超出请独立供电。`);
const rstWarn = note("Active-low reset; onboard pull-up.", "低电平复位，已板载上拉。");
const sdaWarn = note("Onboard pull-ups; extra devices usually need no added pull-up.", "板载上拉，外接多设备一般无需再加。");
const sclWarn = note("Default 100kHz; can be raised to 400kHz.", "默认 100kHz，可调至 400kHz。");
const txWarn = note("3.3V logic; level-shift before connecting 5V devices.", "逻辑电平 3.3V，接 5V 设备先电平转换。");
const sckWarn = note("Start with a low clock rate when debugging.", "时钟频率先低后高调试。");

const powerTriple = (series, v33 = 200, fiveId = "5V") => [
  powerPin(fiveId, fiveId === "VBUS" ? "VBUS" : "5V", "VBUS", "5V Power Input/Output (USB VBus)", "5V 电源输入/输出（USB VBus）", vbusWarn.en, vbusWarn.zh, { series }),
  powerPin("GND", "GND", "—", "Ground", "地", gndWarn.en, gndWarn.zh, { series, fn: "gnd" }),
  powerPin("3V3", "3V3", "3V3_OUT", "3.3V Power Output", "3.3V 电源输出", v33Warn(v33).en, v33Warn(v33).zh, { series }),
];

const rstPin = (chip, series, id = "RST") => headerPin(id, {
  silk: id === "RESET" ? "RESET" : "RST",
  chip,
  fn: "rst",
  status: "conditional",
  warning: rstWarn,
  desc: "Board Reset",
  descZh: "板载复位",
}, series);

const i2cPair = (sdaChip, sclChip, series, adc) => [
  busPin("D4", "SDA", "i2c", "i2c", sdaChip, series, { adc, warning: sdaWarn, desc: "I2C Data Line", descZh: "I2C 数据线", code: "Wire.begin(SDA, SCL);" }),
  busPin("D5", "SCL", "i2c", "i2c", sclChip, series, { adc, warning: sclWarn, desc: "I2C Clock Line", descZh: "I2C 时钟线", code: "Wire.begin(SDA, SCL);" }),
];
const uartPair = (txChip, rxChip, series, adc) => [
  busPin("D6", "TX", "uart", "uart", txChip, series, { adc, warning: txWarn, desc: "UART Transmit", descZh: "UART 发送", code: "Serial1.begin(115200);\nSerial1.println(\"hi\");" }),
  busPin("D7", "RX", "uart", "uart", rxChip, series, { adc, desc: "UART Receive", descZh: "UART 接收", code: "Serial1.begin(115200);" }),
];
const spiTriple = (sckChip, misoChip, mosiChip, series, adc) => [
  busPin("D8", "SCK", "spi", "spi", sckChip, series, { adc, warning: sckWarn, desc: "SPI Serial Clock", descZh: "SPI 串行时钟", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
  busPin("D9", "MISO", "spi", "spi", misoChip, series, { adc, desc: "SPI Master In Slave Out", descZh: "SPI 主入从出", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
  busPin("D10", "MOSI", "spi", "spi", mosiChip, series, { adc, desc: "SPI Master Out Slave In", descZh: "SPI 主出从入", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
];

const analogRow = (chips, series, labels) => chips.map((chip, i) => analogHeader(`D${i}`, labels?.[i] || `A${i}`, chip, series));

const onboard = (id, chip, fn, desc, descZh, series, extra = {}) => headerPin(id, {
  silk: extra.silk || "—",
  chip,
  fn,
  status: extra.status || "occupied",
  occupiedBy: extra.occupiedBy || desc,
  desc,
  descZh,
  warning: extra.warning || "",
  warningZh: extra.warningZh,
  caps: extra.caps || {},
  side: extra.side || "front",
}, series);

const pad = (id, silk, fn, chip, desc, descZh, series, extra = {}) => headerPin(id, {
  silk, chip, fn, desc, descZh, side: extra.side || "back", status: extra.status || "free",
  caps: extra.caps || {}, warning: extra.warning || "", warningZh: extra.warningZh, code: extra.code || "",
}, series);

const batPair = (series) => [
  pad("BAT-", "BAT-", "gnd", "BAT-", "Battery negative pad", "电池负极焊盘", series),
  pad("BAT+", "BAT+", "power", "BAT+", "Battery positive pad", "电池正极焊盘", series),
];

const espFw = ["arduino", "micropython"];
const nrfFw = ["arduino", "zephyr"];
const rpFw = ["arduino", "micropython"];
const arduinoFw = ["arduino"];

const factsEsp = { v33MaxMa: 500 };
const factsNrf = { v33MaxMa: 200 };

function stdBoard(meta, analogChips, buses, extras = []) {
  const { series } = meta;
  const pins = [
    ...powerTriple(series, meta.facts?.v33MaxMa || 200),
    rstPin(buses.rst, series),
    ...analogRow(analogChips, series),
    ...i2cPair(buses.sda, buses.scl, series, buses.i2cAdc),
    ...uartPair(buses.tx, buses.rx, series, buses.uartAdc),
    ...spiTriple(buses.sck, buses.miso, buses.mosi, series, buses.spiAdc),
    ...extras,
  ];
  return assembleBoard({
    ...meta,
    frontPads: meta.frontPads || STD_FRONT_PADS,
    frameworks: meta.frameworks,
    img: meta.img,
  }, pins, meta.back, meta.markerIds);
}

const s3 = stdBoard({
  id: "s3", name: "XIAO ESP32-S3", series: "esp32", img: "s3", frontRotated: true,
  frameworks: espFw, frontPads: S3_FRONT_PADS, facts: factsEsp,
  tagline: { en: "ESP32-S3 — Wi-Fi + BLE workhorse with plenty of GPIO and PSRAM.", zh: "ESP32-S3 — Wi-Fi + BLE 主力，GPIO 多、带 PSRAM。" },
  back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+"], padY: { left: [20, 30, 40, 50], right: [20, 30, 40, 70, 80] } },
  markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
}, ["GPIO1", "GPIO2", "GPIO3", "GPIO4"], {
  rst: "CHIP_PU", sda: "GPIO5", scl: "GPIO6", tx: "GPIO43", rx: "GPIO44",
  sck: "GPIO7", miso: "GPIO8", mosi: "GPIO9", i2cAdc: "A4", spiAdc: true,
}, [
  analogHeader("D11", "A11", "GPIO42", "esp32"),
  analogHeader("D12", "A12", "GPIO41", "esp32"),
  onboard("USER_LED", "GPIO21", "digital", "User Light LED", "用户指示灯", "esp32"),
  onboard("Boot", "GPIO0", "rst", "Boot Button", "Boot 按键", "esp32", { status: "conditional", silk: "BOOT", warning: note("Strapping pin. Held low at reset enters download mode.", "启动脚，复位时拉低会进入下载模式。") }),
  onboard("UFL_ANT", "LNA_IN", "digital", "U.FL Antenna", "U.FL 天线", "esp32"),
  onboard("CHARGE_LED", "VCC_3V3", "power", "Charging Indicator LED", "充电指示灯", "esp32"),
  pad("MTDO", "MTDO", "digital", "GPIO40", "JTAG TDO", "JTAG TDO", "esp32"),
  pad("MTDI", "MTDI", "digital", "GPIO41", "JTAG TDI (shares D12/GPIO41)", "JTAG TDI（与 D12/GPIO41 共用）", "esp32", { status: "conditional" }),
  pad("MTCK", "MTCK", "digital", "GPIO39", "JTAG TCK", "JTAG TCK", "esp32"),
  pad("MTMS", "MTMS", "digital", "GPIO42", "JTAG TMS (shares D11/GPIO42)", "JTAG TMS（与 D11/GPIO42 共用）", "esp32", { status: "conditional" }),
  ...batPair("esp32"),
]);

const s3plus = stdBoard({
  id: "s3plus", name: "XIAO ESP32-S3 Plus", series: "esp32", img: "s3plus",
  frameworks: espFw, facts: factsEsp,
  tagline: { en: "ESP32-S3 Plus — expanded GPIO, battery pads and native USB on the XIAO footprint.", zh: "ESP32-S3 Plus — 在 XIAO 封装上扩展 GPIO、电池焊盘与原生 USB。" },
  back: { left: ["MTDO", "MTCK", "USB_D+", "D11", "D12", "D13", "D14"], right: ["MTDI", "RST", "MTMS", "USB_D-", "D15", "D16", "D17", "D18", "D19", "BAT-", "BAT+"], padY: { left: [12, 23, 34, 46, 56, 66, 76], right: [10, 18, 26, 34, 43, 50, 57, 64, 71, 82, 90] } },
  markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
}, ["GPIO1", "GPIO2", "GPIO3", "GPIO4"], {
  rst: "CHIP_PU", sda: "GPIO5", scl: "GPIO6", tx: "GPIO43", rx: "GPIO44",
  sck: "GPIO7", miso: "GPIO8", mosi: "GPIO9", i2cAdc: "A4", spiAdc: true,
}, [
  analogHeader("D11", "D11", "GPIO38", "esp32"),
  analogHeader("D12", "D12", "GPIO39", "esp32"),
  headerPin("D13", { silk: "D13", chip: "GPIO40", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D14", { silk: "D14", chip: "GPIO41", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D15", { silk: "D15", chip: "GPIO42", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D16", { silk: "D16", chip: "GPIO10", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D17", { silk: "D17", chip: "GPIO13", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D18", { silk: "D18", chip: "GPIO12", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  headerPin("D19", { silk: "D19", chip: "GPIO11", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "esp32"),
  onboard("Boot", "GPIO0", "rst", "Boot Button", "Boot 按键", "esp32", { status: "conditional", silk: "BOOT" }),
  onboard("ADC_BAT", "GPIO10", "analog", "Battery Voltage ADC", "电池电压 ADC", "esp32", { caps: { adc: "VBAT" } }),
  onboard("UFL_ANT", "LNA_IN", "digital", "U.FL Antenna", "U.FL 天线", "esp32"),
  onboard("CHARGE_LED", "VCC_3V3", "power", "Charging Indicator LED", "充电指示灯", "esp32"),
  onboard("USER_LED", "GPIO21", "digital", "User Light", "用户指示灯", "esp32"),
  pad("MTDO", "MTDO", "digital", "GPIO40", "JTAG TDO", "JTAG TDO", "esp32"),
  pad("MTDI", "MTDI", "digital", "GPIO41", "JTAG TDI / ADC", "JTAG TDI / ADC", "esp32"),
  pad("MTCK", "MTCK", "digital", "GPIO39", "JTAG TCK / ADC", "JTAG TCK / ADC", "esp32"),
  pad("MTMS", "MTMS", "digital", "GPIO42", "JTAG TMS / ADC", "JTAG TMS / ADC", "esp32"),
  pad("USB_D+", "D+", "digital", "USB_DP", "USB data positive", "USB 数据正", "esp32"),
  pad("USB_D-", "D-", "digital", "USB_DM", "USB data negative", "USB 数据负", "esp32"),
  ...batPair("esp32"),
]);

const c3 = stdBoard({
  id: "c3", name: "XIAO ESP32-C3", series: "esp32", img: "c3",
  frameworks: espFw, facts: factsEsp,
  tagline: { en: "ESP32-C3 — compact RISC-V for Wi-Fi + BLE basics.", zh: "ESP32-C3 — RISC-V 小巧，Wi-Fi + BLE 入门。" },
  back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+", "Boot"], padY: { left: [17, 27, 37, 47], right: [17, 27, 37, 57, 67, 91] } },
  markerIds: ["Boot", "CHARGE_LED"],
}, ["GPIO2", "GPIO3", "GPIO4", "GPIO5"], {
  rst: "CHIP_EN", sda: "GPIO6", scl: "GPIO7", tx: "GPIO21", rx: "GPIO20",
  sck: "GPIO8", miso: "GPIO9", mosi: "GPIO10",
}, [
  onboard("Boot", "GPIO9", "rst", "Boot Button (shares D9/GPIO9)", "Boot 按键（与 D9/GPIO9 共用）", "esp32", { status: "conditional", silk: "BOOT", warning: note("Shares D9. Held low at reset enters download mode.", "与 D9 共用，复位时拉低进入下载模式。") }),
  onboard("UFL_ANT", "LNA_IN", "digital", "U.FL Antenna", "U.FL 天线", "esp32"),
  onboard("CHARGE_LED", "VCC_3V3", "power", "Charging Indicator LED", "充电指示灯", "esp32"),
  pad("MTDO", "MTDO", "digital", "GPIO7", "JTAG TDO (shares D5/GPIO7)", "JTAG TDO（与 D5/GPIO7 共用）", "esp32", { status: "conditional" }),
  pad("MTDI", "MTDI", "digital", "GPIO5", "JTAG TDI (shares D3/GPIO5)", "JTAG TDI（与 D3/GPIO5 共用）", "esp32", { status: "conditional" }),
  pad("MTCK", "MTCK", "digital", "GPIO6", "JTAG TCK (shares D4/GPIO6)", "JTAG TCK（与 D4/GPIO6 共用）", "esp32", { status: "conditional" }),
  pad("MTMS", "MTMS", "digital", "GPIO4", "JTAG TMS (shares D2/GPIO4)", "JTAG TMS（与 D2/GPIO4 共用）", "esp32", { status: "conditional" }),
  ...batPair("esp32"),
]);

const c6 = stdBoard({
  id: "c6", name: "XIAO ESP32-C6", series: "esp32", img: "c6",
  frameworks: espFw, facts: factsEsp,
  tagline: { en: "ESP32-C6 — Wi-Fi 6, BLE, and Thread/Zigbee for Matter smart-home.", zh: "ESP32-C6 — Wi-Fi 6 + BLE + Thread/Zigbee，适合 Matter 智能家居。" },
  back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"], padY: { left: [19, 29, 39, 49], right: [19, 29, 39, 49, 69, 79] } },
  markerIds: ["USER_LED", "Boot"],
}, ["GPIO0", "GPIO1", "GPIO2"], {
  rst: "CHIP_PU", sda: "GPIO22", scl: "GPIO23", tx: "GPIO16", rx: "GPIO17",
  sck: "GPIO19", miso: "GPIO20", mosi: "GPIO18",
}, [
  headerPin("D3", { silk: "A3", chip: "GPIO21", fn: "digital", desc: "Digital 3 (GPIO, no ADC)", descZh: "数字 3（GPIO，无 ADC）" }, "esp32"),
  onboard("USER_LED", "GPIO15", "digital", "User Light LED", "用户指示灯", "esp32"),
  onboard("Boot", "GPIO9", "rst", "Boot Button", "Boot 按键", "esp32", { status: "conditional", silk: "BOOT" }),
  onboard("RF_SW_PORT", "GPIO14", "digital", "RF Switch Port Select (onboard/UFL)", "射频开关端口选择（板载/UFL）", "esp32"),
  onboard("RF_SW_PWR", "GPIO3", "digital", "RF Switch Power", "射频开关电源", "esp32"),
  pad("MTDO", "MTDO", "digital", "GPIO7", "JTAG TDO", "JTAG TDO", "esp32"),
  pad("MTDI", "MTDI", "digital", "GPIO5", "JTAG TDI", "JTAG TDI", "esp32"),
  pad("MTCK", "MTCK", "digital", "GPIO6", "JTAG TCK", "JTAG TCK", "esp32"),
  pad("MTMS", "MTMS", "digital", "GPIO4", "JTAG TMS", "JTAG TMS", "esp32"),
  ...batPair("esp32"),
]);

const c5 = stdBoard({
  id: "c5", name: "XIAO ESP32-C5", series: "esp32", img: "c5",
  frameworks: espFw, facts: factsEsp,
  tagline: { en: "ESP32-C5 — Wi-Fi 6 + BLE 5 on the XIAO footprint.", zh: "ESP32-C5 — XIAO 封装上的 Wi-Fi 6 + BLE 5。" },
  back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"], padY: { left: [19, 29, 39, 49], right: [19, 29, 39, 49, 69, 79] } },
  markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
}, ["GPIO1"], {
  rst: "CHIP_EN", sda: "GPIO23", scl: "GPIO24", tx: "GPIO11", rx: "GPIO12",
  sck: "GPIO8", miso: "GPIO9", mosi: "GPIO10",
}, [
  headerPin("D1", { silk: "A1", chip: "GPIO0", fn: "digital", desc: "Digital 1 (GPIO, no ADC)", descZh: "数字 1（GPIO，无 ADC）" }, "esp32"),
  headerPin("D2", { silk: "A2", chip: "GPIO25", fn: "digital", desc: "Digital 2 (GPIO, no ADC)", descZh: "数字 2（GPIO，无 ADC）" }, "esp32"),
  headerPin("D3", { silk: "A3", chip: "GPIO7", fn: "digital", desc: "Digital 3 (GPIO, no ADC)", descZh: "数字 3（GPIO，无 ADC）" }, "esp32"),
  onboard("USER_LED", "GPIO27", "digital", "User Light LED (Yellow)", "用户指示灯（黄色）", "esp32"),
  onboard("ADC_BAT", "GPIO6", "analog", "Battery Voltage ADC", "电池电压 ADC", "esp32", { caps: { adc: "VBAT" } }),
  onboard("ADC_CRL", "GPIO26", "analog", "Controls measurement circuit to save power", "控制测量电路启用/禁用以省电", "esp32"),
  onboard("Boot", "GPIO28", "rst", "Boot Button", "Boot 按键", "esp32", { status: "conditional", silk: "BOOT" }),
  onboard("UFL_ANT", "LNA_IN", "digital", "U.FL Antenna", "U.FL 天线", "esp32"),
  onboard("CHARGE_LED", "VCC_3V3", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "esp32"),
  pad("MTDO", "MTDO", "digital", "GPIO5", "JTAG TDO", "JTAG TDO", "esp32"),
  pad("MTDI", "MTDI", "digital", "GPIO3", "JTAG TDI", "JTAG TDI", "esp32"),
  pad("MTCK", "MTCK", "digital", "GPIO4", "JTAG TCK", "JTAG TCK", "esp32"),
  pad("MTMS", "MTMS", "digital", "GPIO2", "JTAG TMS", "JTAG TMS", "esp32"),
  ...batPair("esp32"),
]);

const nrf52 = stdBoard({
  id: "nrf52", name: "XIAO nRF52840", series: "nrf52", img: "nrf52",
  frameworks: nrfFw, facts: factsNrf,
  tagline: { en: "nRF52840 — BLE 5.4, NFC, battery charging; the first wireless XIAO.", zh: "nRF52840 — BLE 5.4、NFC、电池充电，首款无线 XIAO。" },
  back: { left: [], right: ["NFC1", "NFC2", "BAT-", "BAT+"], padY: { left: [], right: [74, 86, 42, 54] } },
  markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED"],
}, ["P0.02", "P0.03", "P0.28", "P0.29"], {
  rst: "P0.18", sda: "P0.04", scl: "P0.05", tx: "P1.11", rx: "P1.12",
  sck: "P1.13", miso: "P1.14", mosi: "P1.15", i2cAdc: true,
}, [
  onboard("USER_LED_R", "P0.26", "digital", "RGB LED Red", "RGB LED 红", "nrf52"),
  onboard("USER_LED_G", "P0.30", "digital", "RGB LED Green", "RGB LED 绿", "nrf52"),
  onboard("USER_LED_B", "P0.06", "digital", "RGB LED Blue", "RGB LED 蓝", "nrf52"),
  pad("NFC1", "NFC1", "digital", "P0.09", "NFC Antenna 1", "NFC 天线 1", "nrf52"),
  pad("NFC2", "NFC2", "digital", "P0.10", "NFC Antenna 2", "NFC 天线 2", "nrf52"),
  onboard("ADC_BAT", "P0.14", "analog", "Battery Voltage ADC Enable", "电池电压 ADC 使能", "nrf52", { caps: { adc: "VBAT" } }),
  onboard("RF_SW_PORT", "P2.05", "digital", "RF Switch Port Select (onboard antenna)", "射频开关端口选择（板载天线）", "nrf52"),
  onboard("RF_SW_PWR", "P2.03", "digital", "RF Switch Power", "射频开关电源", "nrf52"),
  onboard("CHARGE_LED", "P0.17", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "nrf52"),
  ...batPair("nrf52"),
]);

const nrf52840plus = stdBoard({
  id: "nrf52840plus", name: "XIAO nRF52840 Plus", series: "nrf52", img: "nrf52840plus",
  frameworks: nrfFw, facts: factsNrf,
  tagline: { en: "nRF52840 Plus — expanded GPIO with NFC, IMU, PDM microphone and battery support.", zh: "nRF52840 Plus — 扩展 GPIO，并提供 NFC、IMU、PDM 麦克风与电池支持。" },
  back: { left: ["SWCLK", "D11", "D12", "D13", "D16", "D17"], right: ["SWDIO", "RST", "D14", "D15", "D18", "D19", "BAT-", "BAT+"], padY: { left: [13, 29, 41, 53, 68, 78], right: [13, 23, 35, 47, 59, 69, 80, 90] } },
  markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED"],
}, ["P0.02", "P0.03", "P0.28", "P0.29"], {
  rst: "P0.18", sda: "P0.04", scl: "P0.05", tx: "P1.11", rx: "P1.12",
  sck: "P1.13", miso: "P1.14", mosi: "P1.15", i2cAdc: true,
}, [
  headerPin("D11", { silk: "I2S_SD", chip: "P0.15", fn: "digital", caps: { adc: "AIN" }, desc: "I2S data / ADC", descZh: "I2S 数据 / ADC", side: "back" }, "nrf52"),
  headerPin("D12", { silk: "I2S_SCK", chip: "P0.19", fn: "digital", caps: { adc: "AIN" }, desc: "I2S clock / ADC", descZh: "I2S 时钟 / ADC", side: "back" }, "nrf52"),
  headerPin("D13", { silk: "I2S_WS", chip: "P1.01", fn: "digital", caps: { adc: "AIN" }, desc: "I2S word select / ADC", descZh: "I2S 字选择 / ADC", side: "back" }, "nrf52"),
  headerPin("D14", { silk: "RX1", chip: "P0.09", fn: "uart", caps: { uart: "RX1", adc: "AIN" }, desc: "UART1 receive / NFC1 / ADC", descZh: "UART1 接收 / NFC1 / ADC", side: "back" }, "nrf52"),
  headerPin("D15", { silk: "TX1", chip: "P0.10", fn: "uart", caps: { uart: "TX1", adc: "AIN" }, desc: "UART1 transmit / NFC2 / ADC", descZh: "UART1 发送 / NFC2 / ADC", side: "back" }, "nrf52"),
  headerPin("D16", { silk: "AIN7_BAT", chip: "P0.31", fn: "analog", caps: { adc: "AIN7" }, desc: "Battery Voltage ADC", descZh: "电池电压 ADC", side: "back" }, "nrf52"),
  headerPin("D17", { silk: "SCK1", chip: "P1.03", fn: "spi", caps: { spi: "SCK1" }, desc: "SPI1 Clock", descZh: "SPI1 时钟", side: "back" }, "nrf52"),
  headerPin("D18", { silk: "MISO1", chip: "P1.05", fn: "spi", caps: { spi: "MISO1" }, desc: "SPI1 Data Input", descZh: "SPI1 数据输入", side: "back" }, "nrf52"),
  headerPin("D19", { silk: "MOSI1", chip: "P1.07", fn: "spi", caps: { spi: "MOSI1" }, desc: "SPI1 Data Output", descZh: "SPI1 数据输出", side: "back" }, "nrf52"),
  onboard("ADC_BAT", "P0.14", "analog", "Battery Voltage Read Enable", "电池电压读取使能", "nrf52"),
  onboard("IMU_PWR", "P1.08", "digital", "6-axis IMU Power Switch", "六轴 IMU 电源开关", "nrf52"),
  onboard("IMU_INT1", "P0.11", "digital", "6-axis IMU Interrupt 1", "六轴 IMU 中断 1", "nrf52"),
  onboard("MIC_DATA", "P0.16", "digital", "PDM Microphone Data", "PDM 麦克风数据", "nrf52"),
  onboard("MIC_CLK", "P1.00", "digital", "PDM Microphone Clock", "PDM 麦克风时钟", "nrf52"),
  onboard("RF_SW_PORT", "P2.05", "digital", "RF Switch Port Select", "射频开关端口选择", "nrf52"),
  onboard("RF_SW_PWR", "P2.03", "digital", "RF Switch Power", "射频开关电源", "nrf52"),
  onboard("CHARGE_LED", "P0.17", "power", "Charging Indicator LED", "充电指示灯", "nrf52"),
  onboard("USER_LED_R", "P0.26", "digital", "User RGB LED Red", "用户 RGB LED 红", "nrf52"),
  onboard("USER_LED_B", "P0.06", "digital", "User RGB LED Blue", "用户 RGB LED 蓝", "nrf52"),
  onboard("USER_LED_G", "P0.30", "digital", "User RGB LED Green", "用户 RGB LED 绿", "nrf52"),
  pad("SWDIO", "SWDIO", "digital", "SWDIO", "SWD Debug Data", "SWD 调试数据", "nrf52"),
  pad("SWCLK", "SWCLK", "digital", "SWCLK", "SWD Debug Clock", "SWD 调试时钟", "nrf52"),
  ...batPair("nrf52"),
]);

const nrf54l15 = stdBoard({
  id: "nrf54l15", name: "XIAO nRF54L15", series: "nrf54", img: "nrf54l15",
  frameworks: nrfFw, facts: { v33MaxMa: 300 },
  tagline: { en: "nRF54L15 — 128MHz Cortex-M33, low-power BLE 5.4 + NFC.", zh: "nRF54L15 — 128MHz Cortex-M33，低功耗 BLE 5.4 + NFC。" },
  back: { left: ["SWCLK", "GND", "SAMD11_SWCLK", "3V3", "D11", "D12"], right: ["SWDIO", "nRST", "SAMD11_SWDIO", "SAMD11_RST", "D15", "D14", "D13", "BAT-", "BAT+"], padY: { left: [13, 23, 34, 44, 54, 64], right: [13, 23, 34, 44, 54, 62, 69, 78, 86] } },
  markerIds: ["USER_LED", "USER_KEY", "CHARGE_LED"],
}, ["P1.04", "P1.05", "P1.06", "P1.07"], {
  rst: "nRF54_RESET", sda: "P1.10", scl: "P1.11", tx: "P2.08", rx: "P2.07",
  sck: "P2.01", miso: "P2.04", mosi: "P2.02",
}, [
  headerPin("D11", { silk: "SCL1", chip: "P0.03", fn: "i2c", caps: { i2c: "SCL1" }, desc: "I2C1 Clock (back pad)", descZh: "I2C1 时钟（背面焊盘）", side: "back" }, "nrf54"),
  headerPin("D12", { silk: "SDA1", chip: "P0.04", fn: "i2c", caps: { i2c: "SDA1" }, desc: "I2C1 Data (back pad)", descZh: "I2C1 数据（背面焊盘）", side: "back" }, "nrf54"),
  headerPin("D13", { silk: "D13", chip: "P2.10", fn: "digital", desc: "Digital 13", descZh: "数字 13", side: "back" }, "nrf54"),
  headerPin("D14", { silk: "D14", chip: "P2.09", fn: "digital", desc: "Digital 14", descZh: "数字 14", side: "back" }, "nrf54"),
  headerPin("D15", { silk: "D15", chip: "P2.06", fn: "digital", desc: "Digital 15", descZh: "数字 15", side: "back" }, "nrf54"),
  onboard("USER_LED", "P2.00", "digital", "User Light LED", "用户指示灯", "nrf54"),
  onboard("USER_KEY", "P0.00", "digital", "User Button", "用户按键", "nrf54", { status: "occupied" }),
  onboard("NFC1", "P1.02", "digital", "NFC Antenna 1", "NFC 天线 1", "nrf54"),
  onboard("NFC2", "P1.03", "digital", "NFC Antenna 2", "NFC 天线 2", "nrf54"),
  onboard("AIN7_VBAT", "P1.14", "analog", "Battery Voltage ADC", "电池电压 ADC", "nrf54", { caps: { adc: "AIN7" } }),
  onboard("RF_SW_PORT", "P2.05", "digital", "RF Switch Port Select", "射频开关端口选择", "nrf54"),
  onboard("RF_SW_PWR", "P2.03", "digital", "RF Switch Power", "射频开关电源", "nrf54"),
  onboard("CHARGE_LED", "charge_LED", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "nrf54"),
  pad("SWCLK", "SWCLK", "digital", "SWDCLK", "nRF54L15 SWD Clock", "nRF54L15 SWD 时钟", "nrf54"),
  pad("SWDIO", "SWDIO", "digital", "SWDIO", "nRF54L15 SWD Data", "nRF54L15 SWD 数据", "nrf54"),
  pad("nRST", "nRST", "rst", "RST", "nRF54L15 Reset (debug)", "nRF54L15 复位（调试）", "nrf54", { status: "conditional" }),
  pad("SAMD11_SWCLK", "SWCLK2", "digital", "PA30", "SAMD11 SWD Clock", "SAMD11 SWD 时钟", "nrf54"),
  pad("SAMD11_SWDIO", "SWDIO2", "digital", "PA31", "SAMD11 SWD Data", "SAMD11 SWD 数据", "nrf54"),
  pad("SAMD11_RST", "RST2", "rst", "RST2", "SAMD11 Reset (debug)", "SAMD11 复位（调试）", "nrf54", { status: "conditional" }),
  ...batPair("nrf54"),
]);

const nrf54Pins = [
  powerPin("VBUS", "VBUS", "—", "5V Power Input/Output", "5V 电源输入/输出", vbusWarn.en, vbusWarn.zh, { series: "nrf54" }),
  powerPin("GND", "GND", "—", "Ground", "地", gndWarn.en, gndWarn.zh, { series: "nrf54", fn: "gnd" }),
  powerPin("3V3", "3V3", "3V3-OUT", "3.3V Power Output", "3.3V 电源输出", v33Warn(300).en, v33Warn(300).zh, { series: "nrf54" }),
  powerPin("BAT+", "BAT+", "BAT+", "Battery Input (monitored by nPM1300 via I²C)", "电池输入（由 nPM1300 经 I²C 监测）", "Connect to LiPo positive; charge level monitored by nPM1300.", "接锂电池正极，电量由 nPM1300 监测。", { series: "nrf54", side: "back" }),
  powerPin("BAT-", "BAT-", "BAT-", "Battery Negative Terminal", "电池负极", "Connect to battery negative; common with GND.", "接电池负极，与 GND 共地。", { series: "nrf54", fn: "gnd", side: "back" }),
  headerPin("SHPHLD", { silk: "SHPHLD", chip: "SHPHLD", fn: "rst", status: "conditional", desc: "PMIC Ship/Hibernate Mode Control", descZh: "PMIC Ship/Hibernate 模式控制", warning: note("Pull low to enter ship mode.", "拉低进入 ship 模式。"), side: "back" }, "nrf54"),
  rstPin("—", "nrf54", "RESET"),
  headerPin("SWCLK", { silk: "SWCLK", chip: "nRF54LM20A / SAMD11 SWCLK", fn: "digital", desc: "Serial Wire Clock", descZh: "串行调试时钟", side: "back" }, "nrf54"),
  headerPin("SWDIO", { silk: "SWDIO", chip: "nRF54LM20A / SAMD11 SWDIO", fn: "digital", desc: "Serial Wire Data", descZh: "串行调试数据", side: "back" }, "nrf54"),
  headerPin("SWCLK2", { silk: "SWCLK2", chip: "SAMD11 SWCLK", fn: "digital", desc: "SAMD11 debug clock", descZh: "SAMD11 调试时钟", side: "back" }, "nrf54"),
  headerPin("SWDIO2", { silk: "SWDIO2", chip: "SAMD11 SWDIO", fn: "digital", desc: "SAMD11 debug data", descZh: "SAMD11 调试数据", side: "back" }, "nrf54"),
  headerPin("RST2", { silk: "RST2", chip: "SAMD11 RESET", fn: "rst", status: "conditional", desc: "SAMD11 reset", descZh: "SAMD11 复位", side: "back" }, "nrf54"),
  analogHeader("A0", "A0", "AIN0 / P1.00", "nrf54"),
  analogHeader("A1", "A1", "AIN1 / P1.31", "nrf54"),
  analogHeader("A2", "A2", "AIN2 / P1.30", "nrf54"),
  analogHeader("A3", "A3", "AIN3 / P1.29", "nrf54"),
  busPin("SDA", "SDA", "i2c", "i2c", "P1.03", "nrf54", { warning: sdaWarn, desc: "I2C Data Line (IMU & Peripheral)", descZh: "I2C 数据线（IMU 与外设）", code: "Wire.begin(SDA, SCL);" }),
  busPin("SCL", "SCL", "i2c", "i2c", "P1.07", "nrf54", { warning: sclWarn, desc: "I2C Clock Line (IMU & Peripheral)", descZh: "I2C 时钟线（IMU 与外设）", code: "Wire.begin(SDA, SCL);" }),
  busPin("TX", "TX", "uart", "uart", "P1.08", "nrf54", { warning: txWarn, desc: "UART Transmit", descZh: "UART 发送", code: "Serial1.begin(115200);" }),
  busPin("RX", "RX", "uart", "uart", "P1.09", "nrf54", { desc: "UART Receive", descZh: "UART 接收", code: "Serial1.begin(115200);" }),
  busPin("MOSI", "MOSI", "spi", "spi", "P1.06", "nrf54", { desc: "SPI Master Out Slave In", descZh: "SPI 主出从入", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
  busPin("MISO", "MISO", "spi", "spi", "P1.05", "nrf54", { desc: "SPI Master In Slave Out", descZh: "SPI 主入从出", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
  busPin("SCK", "SCK", "spi", "spi", "P1.04", "nrf54", { warning: sckWarn, desc: "SPI Serial Clock", descZh: "SPI 串行时钟", code: "SPI.begin(SCK, MISO, MOSI, CS);" }),
  onboard("USER_BUTTON", "P0.09", "digital", "User Button Input", "用户按键输入", "nrf54", { code: "pinMode(BUTTON, INPUT_PULLUP);" }),
  onboard("RGB_B", "P1.23", "digital", "Onboard RGB LED Blue Channel", "板载 RGB LED 蓝色通道", "nrf54"),
  onboard("RGB_G", "P1.24", "digital", "Onboard RGB LED Green Channel", "板载 RGB LED 绿色通道", "nrf54"),
  onboard("RGB_R", "P1.22", "digital", "Onboard RGB LED Red Channel", "板载 RGB LED 红色通道", "nrf54"),
  onboard("MIC_DAT", "P1.14", "digital", "Microphone Data Line", "麦克风数据线", "nrf54"),
  onboard("MIC_CLK", "P1.13", "digital", "Microphone Clock Line", "麦克风时钟线", "nrf54"),
  onboard("IMU_SDA", "P0.08", "i2c", "IMU I2C SDA (Onboard IMU)", "IMU I2C SDA（板载 IMU）", "nrf54", { warning: note("Internally wired to the IMU; do not repurpose.", "内部已接 IMU，勿挪用。") }),
  onboard("IMU_SCL", "P0.07", "i2c", "IMU I2C SCL (Onboard IMU)", "IMU I2C SCL（板载 IMU）", "nrf54"),
  onboard("IMU_CS", "P3.12", "digital", "IMU Chip Select", "IMU 片选", "nrf54"),
  onboard("IMU_INT1", "P0.06", "digital", "IMU Interrupt 1", "IMU 中断 1", "nrf54"),
  pad("NFC1", "N1", "digital", "P1.02", "NFC Antenna Pin 1", "NFC 天线引脚 1", "nrf54"),
  pad("NFC2", "N2", "digital", "P1.01", "NFC Antenna Pin 2", "NFC 天线引脚 2", "nrf54"),
  ...[
    ["P3.00", "D11"], ["P3.01", "D12"], ["P3.02", "D13"], ["P3.03", "D14"],
    ["P3.04", "D15"], ["P3.05", "D16"], ["P3.06", "D17"], ["P3.07", "D18"],
    ["P3.11", "P3.11"], ["P3.10", "P3.10"], ["P3.09", "P3.09"],
    ["P0.00", "P0.00"], ["P0.01", "P0.01"], ["P0.02", "P0.02"],
    ["P0.03", "P0.03"], ["P0.04", "P0.04"], ["P0.05", "P0.05"],
  ].map(([id, silk]) => pad(id, silk, "digital", id, "Expanded GPIO pad", "扩展 GPIO 贴片引脚", "nrf54")),
];

const nrf54 = assembleBoard({
  id: "nrf54", name: "XIAO nRF54LM20A", series: "nrf54", img: "nrf54",
  frameworks: nrfFw, frontPads: NRF54_FRONT_PADS, facts: { v33MaxMa: 300 },
  tagline: { en: "nRF54LM20A + nPM1300 + SAMD11 — ultra-low-power wireless controller", zh: "nRF54LM20A + nPM1300 + SAMD11，超低功耗无线主控" },
  markerIds: ["USER_BUTTON", "RGB_R", "RGB_G", "RGB_B", "MIC_DAT", "MIC_CLK"],
}, nrf54Pins, {
  left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
  right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P3.06", "P3.05", "P3.04", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT-", "BAT+"],
  padY: { left: [7, 14, 21, 28, 36, 43, 50, 57, 65, 72, 79, 91], right: [5, 10, 15, 20, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 86, 90, 94, 98] },
});

const rp2040 = stdBoard({
  id: "rp2040", name: "XIAO RP2040", series: "rp", img: "rp2040",
  frameworks: rpFw,
  tagline: { en: "RP2040 — dual Cortex-M0+ 133MHz; the smallest Raspberry Pi Pico.", zh: "RP2040 — 双核 Cortex-M0+ 133MHz，最小的树莓派 Pico。" },
  back: { left: ["SWCLK", "GND", "Boot"], right: ["SWDIO", "RST", "5V"], padY: { left: [18, 89, 94], right: [18, 94, 89] } },
  markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "Boot"],
}, ["GPIO26", "GPIO27", "GPIO28", "GPIO29"], {
  rst: "RUN", sda: "GPIO6", scl: "GPIO7", tx: "GPIO0", rx: "GPIO1",
  sck: "GPIO2", miso: "GPIO4", mosi: "GPIO3",
}, [
  onboard("USER_LED_R", "GPIO17", "digital", "RGB LED Red", "RGB LED 红", "rp"),
  onboard("USER_LED_G", "GPIO16", "digital", "RGB LED Green", "RGB LED 绿", "rp"),
  onboard("USER_LED_B", "GPIO25", "digital", "RGB LED Blue", "RGB LED 蓝", "rp"),
  onboard("Boot", "RP2040_BOOT", "rst", "Boot Button", "Boot 按键", "rp", { status: "conditional", silk: "BOOT" }),
  pad("SWDIO", "SWDIO", "digital", "SWDIO", "SWD Debug Data", "SWD 调试数据", "rp"),
  pad("SWCLK", "SWCLK", "digital", "SWCLK", "SWD Debug Clock", "SWD 调试时钟", "rp"),
]);

const rp2040plus = stdBoard({
  id: "rp2040plus", name: "XIAO RP2040 Plus", series: "rp", img: "rp2040plus",
  frameworks: rpFw,
  tagline: { en: "RP2040 Plus — dual Cortex-M0+ with expanded GPIO, USB and battery control.", zh: "RP2040 Plus — 双核 Cortex-M0+，增加扩展 GPIO、USB 与电池控制。" },
  back: { left: ["SWCLK", "USB_D+", "D12", "D13", "D14", "D19", "D20", "D21", "D22"], right: ["SWDIO", "RST", "USB_D-", "Boot", "D17", "D16", "D15", "D23", "D24", "D25", "D26", "D27", "BAT-", "BAT+"], padY: { left: [7, 15, 27, 36, 45, 55, 63, 71, 79], right: [6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 96] } },
  markerIds: ["USER_LED", "RGB_LED", "Boot", "CHARGE_LED"],
}, ["GPIO26", "GPIO27", "GPIO28", "GPIO29"], {
  rst: "RUN", sda: "GPIO6", scl: "GPIO7", tx: "GPIO0", rx: "GPIO1",
  sck: "GPIO2", miso: "GPIO4", mosi: "GPIO3",
}, [
  headerPin("D12", { silk: "D12", chip: "GPIO18", fn: "digital", desc: "Plus-only expansion GPIO", descZh: "Plus 专属扩展 GPIO", side: "back" }, "rp"),
  headerPin("D13", { silk: "SCL1", chip: "GPIO21", fn: "i2c", caps: { i2c: "SCL1" }, desc: "Plus-only I2C1 clock", descZh: "Plus 专属 I2C1 时钟", side: "back" }, "rp"),
  headerPin("D14", { silk: "SDA1", chip: "GPIO20", fn: "i2c", caps: { i2c: "SDA1" }, desc: "Plus-only I2C1 data", descZh: "Plus 专属 I2C1 数据", side: "back" }, "rp"),
  ...[["D15", "GPIO19"], ["D16", "GPIO22"], ["D17", "GPIO23"], ["D19", "GPIO5"],
    ["D20", "GPIO13"], ["D21", "GPIO14"], ["D22", "GPIO15"], ["D23", "GPIO16"],
    ["D24", "GPIO17"], ["D25", "GPIO10"], ["D26", "GPIO9"], ["D27", "GPIO8"]]
    .map(([id, chip]) => headerPin(id, { silk: id, chip, fn: "digital", desc: "Plus-only expansion GPIO", descZh: "Plus 专属扩展 GPIO", side: "back" }, "rp")),
  onboard("Boot", "RP2040_BOOT", "rst", "Bootloader Button", "Bootloader 按键", "rp", { status: "conditional", silk: "BOOT" }),
  onboard("RGB_LED", "GPIO12 / NEOPIX", "digital", "WS2812B RGB LED data", "WS2812B RGB LED 数据", "rp"),
  onboard("RGB_EN", "GPIO11", "digital", "WS2812B Power Enable", "WS2812B 电源使能", "rp"),
  onboard("USER_LED", "GPIO25", "digital", "User-controlled LED", "用户指示灯", "rp"),
  onboard("BAT_EN", "GPIO24", "digital", "Battery Power Control", "电池电源控制", "rp"),
  onboard("CHARGE_LED", "—", "power", "Hardware Charging Indicator", "硬件充电指示灯", "rp"),
  pad("SWDIO", "SWDIO", "digital", "RP2040_SWDIO", "SWD Debug Data", "SWD 调试数据", "rp"),
  pad("SWCLK", "SWCLK", "digital", "RP2040_SWCLK", "SWD Debug Clock", "SWD 调试时钟", "rp"),
  pad("USB_D+", "D+", "digital", "USB_DP", "USB data positive", "USB 数据正", "rp"),
  pad("USB_D-", "D-", "digital", "USB_DM", "USB data negative", "USB 数据负", "rp"),
  ...batPair("rp"),
]);

const rp2350 = stdBoard({
  id: "rp2350", name: "XIAO RP2350", series: "rp", img: "rp2350",
  frameworks: rpFw,
  tagline: { en: "RP2350 — dual Cortex-M33 150MHz + Hazard3 RISC-V, RGB LED, 19 GPIO.", zh: "RP2350 — 双核 Cortex-M33 150MHz + Hazard3 RISC-V，RGB LED，19 GPIO。" },
  back: { left: ["SWCLK", "GND", "D11", "D12", "D13", "D14"], right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT-", "BAT+"], padY: { left: [16, 25, 34, 43, 52, 61], right: [12, 20, 28, 38, 46, 54, 62, 74, 84] } },
  markerIds: ["RGB_LED", "USER_LED", "Boot", "CHARGE_LED"],
}, ["GPIO26", "GPIO27", "GPIO28"], {
  rst: "RUN", sda: "GPIO6", scl: "GPIO7", tx: "GPIO0", rx: "GPIO1",
  sck: "GPIO2", miso: "GPIO4", mosi: "GPIO3",
}, [
  headerPin("D3", { silk: "CS", chip: "GPIO5", fn: "spi", caps: { spi: "CS" }, desc: "SPI0 Chip Select", descZh: "SPI0 片选", warning: note("RP2350 routes D3 to SPI0 CS instead of analog.", "RP2350 将 D3 用作 SPI0 片选，非模拟。"), code: "SPI.begin(SCK, MISO, MOSI, CS);" }, "rp"),
  headerPin("D11", { silk: "D11", chip: "GPIO21", fn: "uart", caps: { uart: "RX1" }, desc: "Digital 11 (UART1 RX)", descZh: "数字 11（UART1 接收）", side: "back" }, "rp"),
  headerPin("D12", { silk: "D12", chip: "GPIO20", fn: "uart", caps: { uart: "TX1" }, desc: "Digital 12 (UART1 TX)", descZh: "数字 12（UART1 发送）", side: "back" }, "rp"),
  headerPin("D13", { silk: "D13", chip: "GPIO17", fn: "i2c", caps: { i2c: "SCL0" }, desc: "Digital 13 (I2C0 SCL)", descZh: "数字 13（I2C0 时钟）", side: "back" }, "rp"),
  headerPin("D14", { silk: "D14", chip: "GPIO16", fn: "i2c", caps: { i2c: "SDA0" }, desc: "Digital 14 (I2C0 SDA)", descZh: "数字 14（I2C0 数据）", side: "back" }, "rp"),
  headerPin("D15", { silk: "D15", chip: "GPIO11", fn: "spi", caps: { spi: "MOSI1" }, desc: "Digital 15 (SPI1 MOSI)", descZh: "数字 15（SPI1 主出从入）", side: "back" }, "rp"),
  headerPin("D16", { silk: "D16", chip: "GPIO12", fn: "spi", caps: { spi: "MISO1" }, desc: "Digital 16 (SPI1 MISO)", descZh: "数字 16（SPI1 主入从出）", side: "back" }, "rp"),
  headerPin("D17", { silk: "D17", chip: "GPIO10", fn: "spi", caps: { spi: "SCK1" }, desc: "Digital 17 (SPI1 SCK)", descZh: "数字 17（SPI1 时钟）", side: "back" }, "rp"),
  headerPin("D18", { silk: "D18", chip: "GPIO9", fn: "spi", caps: { spi: "CS1" }, desc: "Digital 18 (SPI1 CS)", descZh: "数字 18（SPI1 片选）", side: "back" }, "rp"),
  onboard("RGB_LED", "GPIO22", "digital", "Onboard RGB LED (WS2812)", "板载 RGB LED（WS2812）", "rp"),
  onboard("USER_LED", "GPIO25", "digital", "User LED (Yellow)", "用户 LED（黄）", "rp"),
  onboard("ADC_BAT", "GPIO29", "analog", "Battery Voltage ADC", "电池电压 ADC", "rp", { caps: { adc: "VBAT" } }),
  onboard("ADC_BAT_EN", "GPIO19", "analog", "Battery Voltage Measure Enable", "电池电压检测使能", "rp"),
  onboard("Boot", "RP2350_BOOT", "rst", "Boot Button", "Boot 按键", "rp", { status: "conditional", silk: "BOOT" }),
  onboard("CHARGE_LED", "NCHG", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "rp"),
  pad("SWCLK", "SWCLK", "digital", "SWCLK", "SWD debug clock", "SWD 调试时钟", "rp"),
  pad("SWDIO", "SWDIO", "digital", "SWDIO", "SWD debug data", "SWD 调试数据", "rp"),
  ...batPair("rp"),
]);

const ra4 = stdBoard({
  id: "ra4", name: "XIAO RA4M1", series: "ra", img: "ra4",
  frameworks: arduinoFw,
  tagline: { en: "RA4M1 — Cortex-M4 48MHz; same chip as Arduino Uno R4.", zh: "RA4M1 — Cortex-M4 48MHz，与 Arduino Uno R4 同芯。" },
  back: { left: ["SWCLK", "GND", "D11", "D12", "D13", "D14"], right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT-", "BAT+"], padY: { left: [16, 25, 34, 43, 52, 61], right: [12, 20, 28, 38, 46, 54, 62, 74, 84] } },
  markerIds: ["USER_LED", "RGB_LED", "Boot", "CHARGE_LED"],
}, ["P014", "P000", "P001", "P002"], {
  rst: "RES", sda: "P206", scl: "P100", tx: "P302", rx: "P301",
  sck: "P111", miso: "P110", mosi: "P109", i2cAdc: "A5",
}, [
  headerPin("D11", { silk: "D11", chip: "P408", fn: "uart", caps: { uart: "RX9" }, desc: "Digital 11 (UART9 RX)", descZh: "数字 11（UART9 RX）", side: "back" }, "ra"),
  headerPin("D12", { silk: "D12", chip: "P409", fn: "uart", caps: { uart: "TX9" }, desc: "Digital 12 (UART9 TX)", descZh: "数字 12（UART9 TX）", side: "back" }, "ra"),
  headerPin("D13", { silk: "D13", chip: "P013", fn: "digital", desc: "Digital 13", descZh: "数字 13", side: "back" }, "ra"),
  headerPin("D14", { silk: "D14", chip: "P012", fn: "digital", desc: "Digital 14", descZh: "数字 14", side: "back" }, "ra"),
  headerPin("D15", { silk: "D15", chip: "P101", fn: "uart", caps: { uart: "TX0", i2c: "SDA0" }, desc: "Digital 15 (UART0 TX / I2C0 SDA)", descZh: "数字 15（UART0 TX / I2C0 SDA）", side: "back" }, "ra"),
  headerPin("D16", { silk: "D16", chip: "P104", fn: "uart", caps: { uart: "RX0", i2c: "SCL0" }, desc: "Digital 16 (UART0 RX / I2C0 SCL)", descZh: "数字 16（UART0 RX / I2C0 SCL）", side: "back" }, "ra"),
  headerPin("D17", { silk: "D17", chip: "P102", fn: "spi", caps: { spi: "SCK0" }, desc: "Digital 17 (UART / SPI0 SCK)", descZh: "数字 17（UART / SPI0 SCK）", side: "back" }, "ra"),
  headerPin("D18", { silk: "D18", chip: "P103", fn: "spi", caps: { adc: "AIN" }, desc: "Digital 18 (SPI / ADC)", descZh: "数字 18（SPI / ADC）", side: "back" }, "ra"),
  onboard("USER_LED", "P011", "digital", "User LED (Yellow)", "用户 LED（黄）", "ra"),
  onboard("RGB_LED", "P112", "digital", "Onboard RGB LED", "板载 RGB LED", "ra"),
  onboard("RGB_LED_EN", "P500", "digital", "RGB LED Enable", "RGB LED 使能", "ra"),
  onboard("ADC_BAT", "P015", "analog", "Battery Voltage ADC", "电池电压 ADC", "ra", { caps: { adc: "VBAT" } }),
  onboard("Boot", "P201", "rst", "Boot Button", "Boot 按键", "ra", { status: "conditional", silk: "BOOT" }),
  onboard("CHARGE_LED", "VBUS", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "ra"),
  pad("SWCLK", "SWCLK", "digital", "SWCLK", "SWD debug clock", "SWD 调试时钟", "ra"),
  pad("SWDIO", "SWDIO", "digital", "SWDIO", "SWD debug data", "SWD 调试数据", "ra"),
  ...batPair("ra"),
]);

const samd21plus = stdBoard({
  id: "samd21plus", name: "XIAO SAMD21 Plus", series: "samd", img: "samd21plus",
  frameworks: arduinoFw,
  tagline: { en: "SAMD21 Plus — the original XIAO architecture with expanded GPIO, RGB and battery sensing.", zh: "SAMD21 Plus — 初代 XIAO 架构，增加扩展 GPIO、RGB 与电池检测。" },
  back: { left: ["SWCLK", "D18", "D12", "D13", "D14", "D19", "D20", "D21", "D22"], right: ["SWDIO", "RST", "D17", "D16", "D15", "D23", "D24", "D25", "D26", "D27", "BAT-", "BAT+"], padY: { left: [7, 18, 30, 39, 48, 57, 65, 73, 81], right: [7, 15, 25, 34, 43, 52, 60, 68, 76, 84, 91, 97] } },
  markerIds: ["RGB_LED", "USER_BUTTON", "CHARGE_LED"],
}, ["PA02", "PA04", "PA10", "PA11"], {
  rst: "RESETN", sda: "PA08", scl: "PA09", tx: "PB08", rx: "PB09",
  sck: "PA07", miso: "PA05", mosi: "PA06", i2cAdc: true, uartAdc: true, spiAdc: true,
}, [
  headerPin("D12", { silk: "D12", chip: "PA28", fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "samd"),
  headerPin("D13", { silk: "SCL1", chip: "PA17", fn: "i2c", caps: { i2c: "SCL1" }, desc: "Plus expansion GPIO / I2C1 clock", descZh: "Plus 扩展 GPIO / I2C1 时钟", side: "back" }, "samd"),
  headerPin("D14", { silk: "SDA1", chip: "PA16", fn: "i2c", caps: { i2c: "SDA1" }, desc: "Plus expansion GPIO / I2C1 data", descZh: "Plus 扩展 GPIO / I2C1 数据", side: "back" }, "samd"),
  ...[["D15", "PA15"], ["D16", "PA14"], ["D17", "PA13"], ["D18", "PA12"],
    ["D19", "PA19"], ["D20", "PA20"], ["D21", "PA21"], ["D22", "PB10"],
    ["D23", "PB11"], ["D24", "PB23"], ["D25", "PA23"], ["D26", "PB2"], ["D27", "PA18"]]
    .map(([id, chip]) => headerPin(id, { silk: id, chip, fn: "digital", desc: "Plus expansion GPIO", descZh: "Plus 扩展 GPIO", side: "back" }, "samd")),
  onboard("RGB_LED", "PA27", "digital", "WS2812B RGB LED data", "WS2812B RGB LED 数据", "samd"),
  onboard("USER_BUTTON", "PB22", "rst", "User Button (active low)", "用户按键（低电平有效）", "samd"),
  onboard("VBAT_EN", "PB02", "digital", "Battery ADC Enable", "电池 ADC 使能", "samd"),
  onboard("AIN11_VBAT", "PB03 / AIN11", "analog", "Battery Voltage ADC", "电池电压 ADC", "samd", { caps: { adc: "AIN11" } }),
  onboard("CHARGE_LED", "—", "power", "Hardware Charging Indicator", "硬件充电指示灯", "samd"),
  pad("SWDIO", "SWDIO", "digital", "PA31", "SWD Debug Data", "SWD 调试数据", "samd"),
  pad("SWCLK", "SWCLK", "digital", "PA30", "SWD Debug Clock", "SWD 调试时钟", "samd"),
  ...batPair("samd"),
]);

const mg24 = stdBoard({
  id: "mg24", name: "XIAO MG24", series: "mg", img: "mg24",
  frameworks: arduinoFw,
  tagline: { en: "EFR32MG24 — Cortex-M33 with Zigbee/Thread for Matter.", zh: "EFR32MG24 — Cortex-M33，Zigbee/Thread，适合 Matter。" },
  back: { left: ["M_CLK", "GND", "M_RST", "3V3", "S_CLK", "D11", "D12", "D13", "D14"], right: ["M_DIO", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT-", "BAT+"], padY: { left: [10, 19, 28, 37, 46, 55, 64, 73, 82], right: [10, 20, 30, 40, 50, 60, 70, 81, 91] } },
  markerIds: ["USER_LED", "CHARGE_LED"],
}, ["PC00", "PC01", "PC02", "PC03"], {
  rst: "RESET", sda: "PC04", scl: "PC05", tx: "PC06", rx: "PC07",
  sck: "PA03", miso: "PA04", mosi: "PA05", i2cAdc: true, uartAdc: true, spiAdc: true,
}, [
  headerPin("D11", { silk: "D11", chip: "PA09", fn: "uart", caps: { uart: "RX" }, desc: "Digital 11 (SAMD11 UART RX)", descZh: "数字 11（SAMD11 UART RX）", side: "back" }, "mg"),
  headerPin("D12", { silk: "D12", chip: "PA08", fn: "uart", caps: { uart: "TX" }, desc: "Digital 12 (SAMD11 UART TX)", descZh: "数字 12（SAMD11 UART TX）", side: "back" }, "mg"),
  headerPin("D13", { silk: "D13", chip: "PB02", fn: "i2c", caps: { i2c: "SCL1" }, desc: "Digital 13 (I2C1 SCL)", descZh: "数字 13（I2C1 SCL）", side: "back" }, "mg"),
  headerPin("D14", { silk: "D14", chip: "PB03", fn: "i2c", caps: { i2c: "SDA1" }, desc: "Digital 14 (I2C1 SDA)", descZh: "数字 14（I2C1 SDA）", side: "back" }, "mg"),
  headerPin("D15", { silk: "D15", chip: "PB00", fn: "spi", caps: { spi: "MOSI1" }, desc: "Digital 15 (SPI1 MOSI)", descZh: "数字 15（SPI1 MOSI）", side: "back" }, "mg"),
  headerPin("D16", { silk: "D16", chip: "PB01", fn: "spi", caps: { spi: "MISO1" }, desc: "Digital 16 (SPI1 MISO)", descZh: "数字 16（SPI1 MISO）", side: "back" }, "mg"),
  headerPin("D17", { silk: "D17", chip: "PA00", fn: "spi", caps: { spi: "SCK1" }, desc: "Digital 17 (SPI1 SCK)", descZh: "数字 17（SPI1 SCK）", side: "back" }, "mg"),
  headerPin("D18", { silk: "D18", chip: "PD02", fn: "spi", caps: { spi: "CS" }, desc: "Digital 18 (SPI CS)", descZh: "数字 18（SPI 片选）", side: "back" }, "mg"),
  onboard("USER_LED", "PA07", "digital", "User LED (Yellow)", "用户指示灯（黄色）", "mg"),
  onboard("ADC_BAT", "PD04", "analog", "Battery Voltage ADC", "电池电压 ADC", "mg", { caps: { adc: "VBAT" } }),
  onboard("RF_SW", "PB04", "digital", "RF Antenna Switch (onboard/UFL)", "射频天线开关（板载/UFL）", "mg"),
  onboard("RF_SW_PWR", "PB05", "digital", "RF Switch Power", "射频开关电源", "mg"),
  onboard("CHARGE_LED", "VBUS", "power", "Charging Indicator LED (Red)", "充电指示灯（红色）", "mg"),
  pad("M_CLK", "M_CLK", "digital", "MG24 SWCLK", "MG24 debug clock", "MG24 调试时钟", "mg"),
  pad("M_DIO", "M_DIO", "digital", "MG24 SWDIO", "MG24 debug data", "MG24 调试数据", "mg"),
  pad("M_RST", "M_RST", "rst", "MG24 RESET", "MG24 reset", "MG24 复位", "mg", { status: "conditional" }),
  pad("S_CLK", "S_CLK", "digital", "SAMD11 SWCLK", "SAMD11 debug clock", "SAMD11 调试时钟", "mg"),
  pad("S_DIO", "S_DIO", "digital", "SAMD11 SWDIO", "SAMD11 debug data", "SAMD11 调试数据", "mg"),
  pad("S_RST", "S_RST", "rst", "SAMD11 RESET", "SAMD11 reset", "SAMD11 复位", "mg", { status: "conditional" }),
  ...batPair("mg"),
]);

const variants = buildVariantBoards({
  s3, nrf52, nrf52840plus, nrf54l15, nrf54, mg24, c5,
});

export const BOARD_LIST = [
  s3, variants.s3sense, s3plus, c3, c6, c5,
  nrf52, variants.nrf52840sense, nrf52840plus, variants.nrf52840senseplus,
  nrf54l15, variants.nrf54l15sense,
  variants.nrf54lm20a, variants.nrf54lm20asense,
  rp2040, rp2040plus, rp2350,
  mg24, variants.mg24sense,
  samd21, samd21plus, ra4,
  variants.stm32c5,
];

export const BOARDS = Object.fromEntries(BOARD_LIST.map((board) => [board.id, board]));
// Legacy URL alias: nrf54 → nRF54LM20A Sense
BOARDS.nrf54 = BOARDS.nrf54lm20asense;
