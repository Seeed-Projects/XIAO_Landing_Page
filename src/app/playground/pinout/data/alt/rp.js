import { alt } from "./util.js";

const gpio = (n, extra = {}) => alt({
  adc: extra.adc,
  i2c: `I2C0/1 (GPIO${n} func)`,
  spi: `SPI0/1 (GPIO${n} func)`,
  uart: `UART0/1 (GPIO${n} func)`,
  pwm: `PWM slice on GPIO${n}`,
  other: extra.other,
});

export default {
  GPIO26: gpio(26, { adc: "ADC0" }),
  GPIO27: gpio(27, { adc: "ADC1" }),
  GPIO28: gpio(28, { adc: "ADC2" }),
  GPIO29: gpio(29, { adc: "ADC3" }),
  GPIO0: gpio(0, { other: ["UART0 TX"] }),
  GPIO1: gpio(1, { other: ["UART0 RX"] }),
  GPIO2: gpio(2, { other: ["SPI0 SCK"] }),
  GPIO3: gpio(3, { other: ["SPI0 MOSI"] }),
  GPIO4: gpio(4, { other: ["SPI0 MISO"] }),
  GPIO5: gpio(5, { other: ["SPI0 CS (RP2350 D3)"] }),
  GPIO6: gpio(6, { other: ["I2C1 SDA"] }),
  GPIO7: gpio(7, { other: ["I2C1 SCL"] }),
  GPIO16: gpio(16, { other: ["I2C0 SCL on RP2350 D14"] }),
  GPIO17: gpio(17, { other: ["I2C0 SDA on RP2350 D13"] }),
  GPIO21: gpio(21, { other: ["UART1 RX on RP2350 D11"] }),
  GPIO20: gpio(20, { other: ["UART1 TX on RP2350 D12"] }),
  RUN: alt({ other: ["RESET"] }),
  SWCLK: alt({ other: ["SWD CLK"] }),
  SWDIO: alt({ other: ["SWD DIO"] }),
  USB_DP: alt({ other: ["USB D+"] }),
  USB_DM: alt({ other: ["USB D−"] }),
};
