/**
 * Shared pinout tokens and the standard XIAO header footprint.
 * 共享引脚图色板、标签列顺序，以及标准封装正面焊盘坐标。
 */

export const FN_COLOR = {
  power: "#e1554f",
  gnd: "#3a423d",
  rst: "#d8a13a",
  digital: "#16b66a",
  analog: "#2f73f1",
  i2c: "#8b5cf6",
  spi: "#f59e0b",
  uart: "#ec4899",
};

export const FN_LABEL = {
  power: { en: "Power", zh: "电源" },
  gnd: { en: "GND", zh: "地" },
  analog: { en: "ADC", zh: "模拟" },
  i2c: { en: "I²C", zh: "I²C" },
  spi: { en: "SPI", zh: "SPI" },
  uart: { en: "UART", zh: "UART" },
  digital: { en: "Digital", zh: "数字" },
  rst: { en: "Reset", zh: "复位" },
};

export const LEGEND_ORDER = ["power", "gnd", "analog", "i2c", "spi", "uart", "digital", "rst"];

/** Label-strip columns from the board outward. 标签带列顺序：靠近板子一侧向外。 */
export const STRIP_COLUMNS = ["silk", "code", "chip", "adc", "i2c", "spi", "uart", "pwm"];

/** Column widths in px; shared by every strip so columns line up. 各列宽度（px），所有标签带共用以对齐。 */
export const STRIP_WIDTH = { silk: 44, code: 50, chip: 62, adc: 40, i2c: 40, spi: 44, uart: 44, pwm: 42 };

/** Column titles shown once above each lane. 每侧标签带上方显示一次的列标题。 */
export const STRIP_TITLE = {
  silk: { en: "Pin", zh: "引脚" },
  code: { en: "Code", zh: "代码" },
  chip: { en: "Chip", zh: "芯片" },
  adc: { en: "ADC", zh: "ADC" },
  i2c: { en: "I²C", zh: "I²C" },
  spi: { en: "SPI", zh: "SPI" },
  uart: { en: "UART", zh: "UART" },
  pwm: { en: "PWM", zh: "PWM" },
};

export const STD_LEFT_IDS = ["D0", "D1", "D2", "D3", "D4", "D5", "D6"];
export const STD_RIGHT_IDS = ["5V", "GND", "3V3", "D10", "D9", "D8", "D7"];

export const NRF54_LEFT_IDS = ["A0", "A1", "A2", "A3", "SDA", "SCL", "TX"];
export const NRF54_RIGHT_IDS = ["VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX"];

/** Measured pad-center Y% on the standard front photo. 标准正面图焊盘圆心 Y%。 */
export const STD_PAD_Y = {
  left: [22.5, 33.1, 43.4, 53.7, 64.1, 74.4, 84.7],
  right: [22.5, 33.1, 43.4, 53.7, 64.1, 74.4, 84.7],
};

/** ESP32-S3 Sense front photo (USB up). ESP32-S3 正面图焊盘圆心 Y%。 */
export const S3_PAD_Y = {
  left: [19.94, 29.76, 39.58, 49.4, 59.23, 69.05, 78.87],
  right: [20.24, 30.06, 39.88, 49.7, 59.52, 69.35, 79.17],
};

export const STD_PAD_X = { left: 21.4, right: 78.6 };
export const BACK_PAD_X = { left: 22.0, right: 78.0 };

export const DEFAULT_FACTS = {
  logic: "3.3V",
  fiveVTolerant: false,
  vbus: {
    en: "5V pin is USB VBUS in/out. Keep peripheral load under 500 mA.",
    zh: "5V 脚为 USB VBUS 输入/输出，外设供电勿超过 500 mA。",
  },
  v33MaxMa: 200,
  battery: "back",
};

export const BOARD_CATEGORIES = [
  { id: "esp32", label: "Espressif ESP32 Series", boardIds: ["s3", "s3sense", "s3plus", "c3", "c6", "c5"] },
  { id: "nrf52", label: "Nordic nRF52 Series", boardIds: ["nrf52", "nrf52840sense", "nrf52840plus", "nrf52840senseplus"] },
  { id: "nrf54", label: "Nordic nRF54 Series", boardIds: ["nrf54lm20a", "nrf54lm20asense", "nrf54l15", "nrf54l15sense"] },
  { id: "rp", label: "Raspberry Pi RP Series", boardIds: ["rp2040", "rp2040plus", "rp2350"] },
  { id: "mg", label: "Silicon Labs MG Series", boardIds: ["mg24", "mg24sense"] },
  { id: "samd", label: "Microchip SAMD Series", boardIds: ["samd21", "samd21plus"] },
  { id: "ra", label: "Renesas RA Series", boardIds: ["ra4"] },
  { id: "stm32", label: "STMicro STM32 Series", boardIds: ["stm32c5"] },
];

export function padsFromColumns(leftIds, rightIds, padY = STD_PAD_Y, padX = STD_PAD_X) {
  const pads = {};
  leftIds.forEach((id, index) => {
    pads[id] = { x: padX.left, y: padY.left[index], lane: "left", order: index };
  });
  rightIds.forEach((id, index) => {
    pads[id] = { x: padX.right, y: padY.right[index], lane: "right", order: index };
  });
  return pads;
}

export const STD_FRONT_PADS = padsFromColumns(STD_LEFT_IDS, STD_RIGHT_IDS, STD_PAD_Y, STD_PAD_X);
export const S3_FRONT_PADS = padsFromColumns(STD_LEFT_IDS, STD_RIGHT_IDS, S3_PAD_Y, STD_PAD_X);
export const NRF54_FRONT_PADS = padsFromColumns(NRF54_LEFT_IDS, NRF54_RIGHT_IDS, STD_PAD_Y, STD_PAD_X);

export function backPadsFromColumns(leftIds, rightIds, padY, padX = BACK_PAD_X) {
  return padsFromColumns(leftIds, rightIds, padY, padX);
}
