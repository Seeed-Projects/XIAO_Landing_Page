import { n, POWER_NOTES } from "./util.js";

const adcOnly = n(
  "caution",
  "RP2040 / RP2350 ADC exists only on GPIO26–29 (ADC0–ADC3). Other GPIOs cannot analogRead.",
  "RP2040 / RP2350 的 ADC 只在 GPIO26–29（ADC0–ADC3）。其它 GPIO 不能 analogRead。",
);

const boot = n(
  "caution",
  "BOOT is sampled at reset. Hold it while plugging USB to mount as a UF2 drive.",
  "BOOT 在复位时采样。按住再插 USB 会变成 UF2 磁盘。",
);

const run = n(
  "caution",
  "RUN is the RP2040 reset. Pull low to halt the cores; release to boot.",
  "RUN 是 RP2040 复位。拉低停止内核，松开后启动。",
);

export default {
  byId: {
    ...POWER_NOTES,
    Boot: [boot],
    RST: [run],
    SWCLK: [n("info", "SWD clock. Pair with SWDIO for picoprobe / debug.", "SWD 时钟。配合 SWDIO 做 picoprobe 调试。")],
    SWDIO: [n("info", "SWD data.", "SWD 数据。")],
    "USB_D+": [n("danger", "USB D+. Not a GPIO.", "USB D+。不是 GPIO。")],
    "USB_D-": [n("danger", "USB D−. Not a GPIO.", "USB D−。不是 GPIO。")],
  },
  byChip: {
    GPIO26: [adcOnly],
    GPIO27: [adcOnly],
    GPIO28: [adcOnly],
    GPIO29: [adcOnly, n("info", "On RP2350 this ADC is wired to battery sense instead of D3.", "RP2350 上这路 ADC 接到电池检测，而不是 D3。")],
    GPIO0: [n("info", "Default UART0 TX (D6).", "默认 UART0 TX（D6）。")],
    GPIO1: [n("info", "Default UART0 RX (D7).", "默认 UART0 RX（D7）。")],
    GPIO6: [n("info", "Default I2C1 SDA (D4).", "默认 I2C1 SDA（D4）。")],
    GPIO7: [n("info", "Default I2C1 SCL (D5).", "默认 I2C1 SCL（D5）。")],
    GPIO2: [n("info", "Default SPI0 SCK (D8).", "默认 SPI0 SCK（D8）。")],
    GPIO4: [n("info", "Default SPI0 MISO (D9).", "默认 SPI0 MISO（D9）。")],
    GPIO3: [n("info", "Default SPI0 MOSI (D10). On RP2350 D3 is CS instead of ADC.", "默认 SPI0 MOSI（D10）。RP2350 上 D3 改作 CS，不再是 ADC。")],
    GPIO5: [n("info", "RP2350 SPI0 CS on D3.", "RP2350 上 D3 的 SPI0 片选。")],
    RUN: [run],
    RP2040_BOOT: [boot],
    RP2350_BOOT: [boot],
    USB_DP: [n("danger", "USB D+.", "USB D+。")],
    USB_DM: [n("danger", "USB D−.", "USB D−。")],
  },
  byBoard: {
    rp2350: {
      GPIO5: [n("caution", "Wiki maps D3 to SPI0 CS (GPIO5), not to ADC3.", "Wiki 把 D3 接到 SPI0 CS（GPIO5），不是 ADC3。")],
      GPIO17: [n("info", "Back header I2C0 SDA (D13).", "背面 I2C0 SDA（D13）。")],
      GPIO16: [n("info", "Back header I2C0 SCL (D14).", "背面 I2C0 SCL（D14）。")],
    },
  },
};
