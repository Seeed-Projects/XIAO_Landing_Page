import { alt, SERCOM } from "./util.js";

export default {
  PA02: alt({ adc: "AIN0 / A0", pwm: "TCC", other: ["DAC0"] }),
  PA04: alt({ adc: "AIN4 / A1", pwm: "TCC" }),
  PA10: alt({ adc: "AIN10 / A2", pwm: "TCC" }),
  PA11: alt({ adc: "AIN11 / A3", pwm: "TCC" }),
  PA08: alt({ adc: "AIN16 / A4", i2c: "SDA SERCOM0/2 PAD0", pwm: "TCC" }),
  PA09: alt({ adc: "AIN17 / A5", i2c: "SCL SERCOM0/2 PAD1", pwm: "TCC" }),
  PB08: alt({ adc: "AIN2 / A6", uart: "TX SERCOM4 PAD0", pwm: "TCC" }),
  PB09: alt({ adc: "AIN3 / A7", uart: "RX SERCOM4 PAD1", pwm: "TCC" }),
  PA07: alt({ adc: "AIN7 / A8", spi: "SCK SERCOM0 PAD3", pwm: "TCC" }),
  PA05: alt({ adc: "AIN5 / A9", spi: "MISO SERCOM0 PAD1", pwm: "TCC" }),
  PA06: alt({ adc: "AIN6 / A10", spi: "MOSI SERCOM0 PAD2", pwm: "TCC" }),
  PA16: alt({ i2c: "SDA1 SERCOM1 PAD0", pwm: "TCC" }),
  PA17: alt({ i2c: "SCL1 SERCOM1 PAD1", pwm: "TCC", other: ["LED on SAMD21"] }),
  PA30: alt({ other: ["SWCLK"] }),
  PA31: alt({ other: ["SWDIO"] }),
  RESETN: alt({ other: ["RESET"] }),
  PA12: alt({ spi: SERCOM, uart: SERCOM, pwm: "TCC" }),
  PA13: alt({ spi: SERCOM, uart: SERCOM, pwm: "TCC" }),
  PA14: alt({ spi: SERCOM, uart: SERCOM, pwm: "TCC" }),
  PA15: alt({ spi: SERCOM, uart: SERCOM, pwm: "TCC" }),
};
