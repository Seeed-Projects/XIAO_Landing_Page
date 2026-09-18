import { alt } from "./util.js";

const gpio = (extra = {}) => alt({
  adc: extra.adc,
  i2c: extra.i2c || "I2C (port remap)",
  spi: extra.spi || "SPI (port remap)",
  uart: extra.uart || "USART (port remap)",
  pwm: extra.pwm || "TIMER PWM",
  other: extra.other,
});

export default {
  PC00: gpio({ adc: "AIN" }),
  PC01: gpio({ adc: "AIN" }),
  PC02: gpio({ adc: "AIN" }),
  PC03: gpio({ adc: "AIN" }),
  PC04: gpio({ i2c: "SDA", adc: "AIN" }),
  PC05: gpio({ i2c: "SCL", adc: "AIN" }),
  PC06: gpio({ uart: "TX" }),
  PC07: gpio({ uart: "RX" }),
  PA03: gpio({ spi: "SCK" }),
  PA04: gpio({ spi: "MISO" }),
  PA05: gpio({ spi: "MOSI" }),
  PA09: gpio({ uart: "SAMD11 TX on back" }),
  PA08: gpio({ uart: "SAMD11 RX on back" }),
  PB00: gpio({ spi: "MOSI1" }),
  PB01: gpio({ spi: "MISO1" }),
  PA00: gpio({ spi: "SCK1" }),
  PD02: gpio({ spi: "CS" }),
  PD04: gpio({ adc: "VBAT" }),
  RESET: alt({ other: ["RESET"] }),
  "MG24 SWCLK": alt({ other: ["SWD CLK"] }),
  "MG24 SWDIO": alt({ other: ["SWD DIO"] }),
};
