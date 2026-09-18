/**
 * Diagram-facing metadata keyed by board id (marker order, back column ids).
 * 引脚图元数据：marker 顺序与背面列 id。
 */
export const BOARD_DIAGRAM_META = {
  samd21: {
    markerIds: ["USER_LED", "POWER_LED", "TX_LED", "RX_LED", "RST"],
    minBackRects: 24,
  },
  samd21plus: {
    markerIds: ["RGB_LED", "USER_BUTTON", "VBAT_EN", "AIN11_VBAT", "CHARGE_LED"],
    back: {
      left: ["D12", "D13", "D14", "D15", "D16", "D17", "D18", "D19", "D20", "D21"],
      right: ["D22", "D23", "D24", "D25", "D26", "D27", "SWDIO", "SWCLK", "BAT-", "BAT+", "GND_SWD", "GND_VIN", "VIN", "RST"],
    },
  },
  c3: {
    markerIds: ["Boot", "UFL_ANT", "CHARGE_LED"],
    back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+", "Boot"] },
    minBackRects: 24,
  },
  c5: {
    markerIds: ["USER_LED", "Boot", "CHARGE_LED", "ADC_BAT", "ADC_CRL", "UFL_ANT"],
    back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  c6: {
    markerIds: ["USER_LED", "Boot", "RF_SW_PORT", "RF_SW_PWR"],
    back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "Boot", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  s3: {
    markerIds: ["USER_LED", "Boot", "UFL_ANT", "CHARGE_LED"],
    back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  s3plus: {
    markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
    back: {
      left: ["MTDO", "MTCK", "USB_D+", "D11", "D12", "D13", "D14"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "D15", "D16", "D17", "D18", "D19", "BAT-", "BAT+"],
    },
  },
  s3sense: {
    markerIds: ["USER_LED", "Boot", "UFL_ANT", "CHARGE_LED"],
    back: { left: ["MTDO", "GND", "MTCK", "3V3"], right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  nrf52: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED", "ADC_BAT", "RF_SW_PORT", "RF_SW_PWR"],
    back: { left: [], right: ["NFC1", "NFC2", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  nrf52840sense: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED", "IMU_INT1", "MIC_DATA", "MIC_CLK", "ADC_BAT", "RF_SW_PORT", "RF_SW_PWR"],
    back: { left: [], right: ["NFC1", "NFC2", "BAT-", "BAT+"] },
    minBackRects: 24,
  },
  nrf52840plus: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED", "IMU_INT1", "MIC_DATA", "MIC_CLK"],
    back: {
      left: ["SWCLK", "D11", "D12", "D13", "D16", "D17"],
      right: ["SWDIO", "RST", "D14", "D15", "D18", "D19", "BAT-", "BAT+"],
    },
  },
  nrf52840senseplus: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED", "IMU_INT1", "MIC_DATA", "MIC_CLK"],
    back: {
      left: ["SWCLK", "D11", "D12", "D13", "D16", "D17"],
      right: ["SWDIO", "RST", "D14", "D15", "D18", "D19", "BAT-", "BAT+"],
    },
  },
  nrf54l15: {
    markerIds: ["USER_LED", "USER_KEY", "NFC1", "NFC2", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR", "CHARGE_LED"],
    back: {
      left: ["SWCLK", "GND", "SAMD11_SWCLK", "3V3", "D11", "D12"],
      right: ["SWDIO", "nRST", "SAMD11_SWDIO", "SAMD11_RST", "D15", "D14", "D13", "BAT-", "BAT+"],
    },
  },
  nrf54l15sense: {
    markerIds: ["USER_LED", "USER_KEY", "NFC1", "NFC2", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR", "CHARGE_LED"],
    back: {
      left: ["SWCLK", "GND", "SAMD11_SWCLK", "3V3", "D11", "D12"],
      right: ["SWDIO", "nRST", "SAMD11_SWDIO", "SAMD11_RST", "D15", "D14", "D13", "BAT-", "BAT+"],
    },
  },
  nrf54lm20a: {
    markerIds: ["USER_BUTTON", "RGB_R", "RGB_G", "RGB_B", "CHARGE_LED"],
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P3.06", "P3.05", "P3.04", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT-", "BAT+"],
    },
  },
  nrf54lm20asense: {
    markerIds: ["USER_BUTTON", "RGB_R", "RGB_G", "RGB_B", "MIC_DAT", "MIC_CLK", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1"],
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P3.06", "P3.05", "P3.04", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT-", "BAT+"],
    },
  },
  rp2040: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "Boot"],
    back: { left: ["SWCLK", "GND", "Boot"], right: ["SWDIO", "RST", "5V"] },
    minBackRects: 24,
  },
  rp2040plus: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "Boot", "BAT_ADC", "BAT_EN"],
    back: {
      left: ["D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D19", "D20", "D21"],
      right: ["D22", "D23", "D24", "D25", "D26", "SWDIO", "SWCLK", "RST", "BAT-", "BAT+"],
    },
  },
  rp2350: {
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "Boot", "BAT_ADC", "BAT_EN"],
    back: {
      left: ["D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18"],
      right: ["D19", "D20", "D21", "D22", "D23", "D24", "D25", "D26", "D27", "SWDIO", "SWCLK", "RST", "BAT-", "BAT+"],
    },
  },
  mg24: {
    markerIds: ["USER_LED", "CHARGE_LED", "ADC_BAT", "RF_SW", "RF_SW_PWR"],
    back: {
      left: ["M_CLK", "GND", "M_RST", "3V3", "S_CLK", "D11", "D12", "D13", "D14"],
      right: ["M_DIO", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT-", "BAT+"],
    },
  },
  mg24sense: {
    markerIds: ["USER_LED", "CHARGE_LED", "ADC_BAT", "RF_SW", "RF_SW_PWR"],
    back: {
      left: ["M_CLK", "GND", "M_RST", "3V3", "S_CLK", "D11", "D12", "D13", "D14"],
      right: ["M_DIO", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT-", "BAT+"],
    },
  },
  ra4: {
    markerIds: ["USER_LED", "CHARGE_LED", "BAT_ADC"],
    back: {
      left: ["D11", "D12", "D13", "D14", "D15", "D16", "D17"],
      right: ["D18", "D19", "D20", "D21", "D22", "D23", "D24", "SWDIO", "SWCLK", "BAT-", "BAT+"],
    },
  },
  stm32c5: {
    markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
    back: { left: ["SWCLK", "GND", "3V3"], right: ["SWDIO", "RST", "BAT-", "BAT+"] },
  },
};
