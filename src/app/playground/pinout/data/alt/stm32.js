import { alt } from "./util.js";

const gpio = (n) => alt({
  i2c: "I2C (remap)",
  spi: "SPI (remap)",
  uart: "USART (remap)",
  pwm: "TIMER PWM",
  other: [`header D${n}`],
});

export default {
  GPIO0: gpio(0),
  GPIO1: gpio(1),
  GPIO2: gpio(2),
  GPIO3: gpio(3),
  GPIO4: gpio(4),
  GPIO5: gpio(5),
  GPIO6: gpio(6),
  GPIO7: gpio(7),
  GPIO8: gpio(8),
  GPIO9: gpio(9),
  GPIO10: gpio(10),
  NRST: alt({ other: ["NRST"] }),
  SWCLK: alt({ other: ["SWD CLK"] }),
  SWDIO: alt({ other: ["SWD DIO"] }),
  BOOT: alt({ other: ["BOOT"] }),
};
