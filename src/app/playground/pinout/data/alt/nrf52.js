import { alt, PWM_NRF } from "./util.js";

const gpio = (adc, extra = {}) => alt({
  adc,
  i2c: "any GPIO",
  spi: "any GPIO",
  uart: "any GPIO",
  pwm: PWM_NRF,
  other: extra.other,
});

export default {
  "P0.02": gpio("AIN0"),
  "P0.03": gpio("AIN1"),
  "P0.04": gpio("AIN2", { other: ["default SDA"] }),
  "P0.05": gpio("AIN3", { other: ["default SCL"] }),
  "P0.28": gpio("AIN4"),
  "P0.29": gpio("AIN5"),
  "P0.30": gpio("AIN6"),
  "P0.31": gpio("AIN7"),
  "P0.09": gpio("", { other: ["NFC1"] }),
  "P0.10": gpio("", { other: ["NFC2"] }),
  "P0.18": alt({ other: ["RESET"] }),
  "P1.11": gpio("", { other: ["default TX"] }),
  "P1.12": gpio("", { other: ["default RX"] }),
  "P1.13": gpio("", { other: ["default SCK"] }),
  "P1.14": gpio("", { other: ["default MISO"] }),
  "P1.15": gpio("", { other: ["default MOSI"] }),
  "P0.15": gpio("", { other: ["Plus I2S_SD"] }),
  "P0.19": gpio("", { other: ["Plus I2S_SCK"] }),
  "P1.01": gpio("", { other: ["Plus I2S_WS"] }),
  "P1.03": gpio("", { other: ["Plus SPI1 SCK"] }),
  "P1.05": gpio("", { other: ["Plus SPI1 MISO"] }),
  "P1.07": gpio("", { other: ["Plus SPI1 MOSI"] }),
  SWCLK: alt({ other: ["SWD CLK"] }),
  SWDIO: alt({ other: ["SWD DIO"] }),
};
