import { alt } from "./util.js";

const gpio = (extra = {}) => alt({
  adc: extra.adc,
  i2c: extra.i2c || "SCI (I2C)",
  spi: extra.spi || "SPI",
  uart: extra.uart || "SCI (UART)",
  pwm: extra.pwm || "GPT PWM",
  other: extra.other,
});

export default {
  P014: gpio({ adc: "AN000 / A0" }),
  P000: gpio({ adc: "A1" }),
  P001: gpio({ adc: "A2" }),
  P002: gpio({ adc: "A3" }),
  P206: gpio({ i2c: "SDA" }),
  P100: gpio({ i2c: "SCL" }),
  P302: gpio({ uart: "TX" }),
  P301: gpio({ uart: "RX" }),
  P111: gpio({ spi: "SCK" }),
  P110: gpio({ spi: "MISO" }),
  P109: gpio({ spi: "MOSI" }),
  P408: gpio({ uart: "RX9" }),
  P409: gpio({ uart: "TX9" }),
  P101: gpio({ uart: "TX0", i2c: "SDA0" }),
  P104: gpio({ uart: "RX0", i2c: "SCL0" }),
  P102: gpio({ spi: "SCK0" }),
  P103: gpio({ adc: "AIN", spi: "SPI" }),
  P015: gpio({ adc: "VBAT AN010" }),
  RES: alt({ other: ["RESET"] }),
  SWCLK: alt({ other: ["SWD CLK"] }),
  SWDIO: alt({ other: ["SWD DIO"] }),
};
