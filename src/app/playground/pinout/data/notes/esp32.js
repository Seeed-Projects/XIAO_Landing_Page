import { n, POWER_NOTES } from "./util.js";

const strap = n(
  "danger",
  "Strapping pin. Its level at reset chooses boot mode. A peripheral that holds it low can trap the chip in download mode.",
  "启动脚。复位瞬间的电平决定启动模式。外设若把它拉低，芯片可能卡在下载模式。",
);

const adc2wifi = n(
  "caution",
  "This ADC channel sits on ADC2. Wi-Fi uses ADC2 internally, so analog reads fail or drift while Wi-Fi is on. Prefer ADC1 pins for sensors.",
  "这条模拟通道在 ADC2。Wi-Fi 会占用 ADC2，开着 Wi-Fi 时读数会失败或漂移。传感器请优先用 ADC1 脚。",
);

const txLog = n(
  "caution",
  "UART TX. The ROM prints boot logs here. A device that cannot stand extra text at 115200 8N1 will see garbage until your sketch starts.",
  "UART 发送脚。ROM 会在这里打启动日志。对方若不能接受 115200 8N1 的额外文字，上电会看到乱码，直到你的程序接管。",
);

const usbPad = n(
  "danger",
  "Native USB data pad. Do not treat it as GPIO. Shorting D+ / D− to 3.3 V or 5 V can kill the USB PHY.",
  "原生 USB 数据线焊盘。不要当普通 GPIO 用。接到 3.3V 或 5V 可能损坏 USB 收发器。",
);

const jtagShare = n(
  "caution",
  "JTAG pad. On this board it is wired to a GPIO that already appears on the header. Use one function at a time.",
  "JTAG 焊盘。它和排针上的某个 GPIO 是同一只脚，同一时间只能用一种功能。",
);

const batCharge = n(
  "caution",
  "Charge current is set on the board (typically around 100 mA). Fast-charge packs need an external charger.",
  "充电电流由板上电阻决定（大约 100 mA）。需要快充时请用外置充电器。",
);

const rfSwitch = n(
  "info",
  "RF switch GPIO. It selects the onboard antenna or the U.FL connector. Leave it to the board support package unless you are swapping antennas.",
  "射频开关 GPIO。用来在板载天线和 U.FL 座之间切换。一般交给板级支持包，只有换天线时才自己控。",
);

export default {
  byId: {
    ...POWER_NOTES,
    "BAT+": [...POWER_NOTES["BAT+"], batCharge],
    "USB_D+": [usbPad],
    "USB_D-": [usbPad],
    UFL_ANT: [n("caution", "U.FL antenna port. Keep the matching cable short and do not feed DC into it.", "U.FL 天线口。馈线尽量短，不要给它通直流。")],
    Boot: [strap],
    MTDO: [jtagShare],
    MTDI: [jtagShare],
    MTCK: [jtagShare],
    MTMS: [jtagShare],
  },
  byChip: {
    GPIO0: [strap, n("info", "ESP32-S3 / C6 / C5 family often uses GPIO0 as BOOT. Hold low at reset to enter download mode.", "S3 / C6 / C5 常用 GPIO0 作 BOOT。复位时拉低进入下载模式。")],
    GPIO2: [n("caution", "On ESP32-C3 this is D0 and an ADC1 pin. Keep analog sources at 0–3.3 V.", "在 ESP32-C3 上这是 D0，也是 ADC1。模拟输入保持 0–3.3V。")],
    GPIO5: [n("caution", "On ESP32-C3 this is D3 / ADC2. Analog reads conflict with Wi-Fi.", "在 ESP32-C3 上这是 D3 / ADC2。模拟读取会和 Wi-Fi 冲突。"), adc2wifi],
    GPIO8: [n("caution", "C3 strapping / SPI SCK on XIAO C3 (D8). A strong pull at reset changes flash voltage select.", "C3 启动脚，在 XIAO C3 上是 D8（SPI SCK）。复位时强上拉/下拉会改变 Flash 电压选择。")],
    GPIO9: [strap, n("caution", "On XIAO C3 / C6 this pad is also SPI MISO or the BOOT button. Do not wire a busy SPI slave that holds it low during reset.", "在 XIAO C3 / C6 上这只脚还兼 SPI MISO 或 BOOT 键。不要接一个复位时把脚拉低的 SPI 从设备。")],
    GPIO19: [n("info", "On ESP32-C6 this is SPI SCK (D8).", "在 ESP32-C6 上这是 SPI SCK（D8）。")],
    GPIO20: [n("info", "Default UART RX on XIAO C3 (D7).", "XIAO C3 默认 UART RX（D7）。")],
    GPIO21: [txLog],
    GPIO43: [txLog],
    GPIO44: [n("info", "Default UART RX on XIAO ESP32-S3 (D7).", "XIAO ESP32-S3 默认 UART RX（D7）。")],
    USB_DP: [usbPad],
    USB_DM: [usbPad],
    CHIP_EN: [n("caution", "Chip enable. Hold low to power-gate the SoC. The pad is the board RST.", "芯片使能。拉低会关掉 SoC。板上 RST 焊盘就是它。")],
    CHIP_PU: [n("caution", "Chip enable (CHIP_PU). Hold low to power-gate the SoC. The pad is the board RST.", "芯片使能（CHIP_PU）。拉低会关掉 SoC。板上 RST 焊盘就是它。")],
    LNA_IN: [n("caution", "RF input to the matching network. Not a GPIO.", "射频输入，接到匹配网络。不是 GPIO。")],
    GPIO14: [rfSwitch],
    GPIO3: [n("info", "On ESP32-C6 this GPIO drives RF switch power.", "在 ESP32-C6 上这只脚控制射频开关电源。")],
  },
  byBoard: {
    c3: {
      GPIO9: [strap, n("danger", "BOOT button and D9 / MISO share GPIO9. Hold the button at reset to flash.", "BOOT 键和 D9 / MISO 共用 GPIO9。复位时按住即可烧录。")],
      GPIO5: [adc2wifi],
    },
    s3: {
      GPIO0: [strap],
      GPIO1: [n("info", "ADC1_CH0 and Touch. Safe to use while Wi-Fi is on.", "ADC1_CH0 与触摸。开着 Wi-Fi 也可以用。")],
    },
    s3sense: {
      GPIO0: [strap],
    },
    s3plus: {
      GPIO0: [strap],
      GPIO38: [n("info", "Plus-header GPIO on the back (D11).", "Plus 背面扩展 GPIO（D11）。")],
    },
    c6: {
      GPIO9: [strap],
      GPIO16: [txLog],
    },
    c5: {
      GPIO28: [strap],
      GPIO6: [n("info", "Battery ADC on this board. Enable the measure circuit (ADC_CRL) before reading.", "这块板的电池 ADC。读数前先打开测量电路（ADC_CRL）。")],
    },
  },
};
