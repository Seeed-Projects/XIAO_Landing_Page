/** Pin note builder. level is danger | caution | info. 引脚注意事项构造。 */
export const n = (level, en, zh) => ({ level, en, zh });

export const POWER_NOTES = {
  "5V": [n("caution", "This pad is USB VBUS. It sits near 5 V when USB is plugged in. Do not feed it back into a 3.3 V pin.", "这是 USB 的 5V 总线。插着 USB 时接近 5V。不要把它接到 3.3V 引脚上。")],
  VBUS: [n("caution", "USB VBUS in/out. Keep extra load under about 500 mA unless the host can supply more.", "USB 5V 输入/输出。额外负载建议不超过约 500 mA。")],
  GND: [n("info", "Common ground. Connect every module ground here so signals have a return path.", "公共地。每个模块的地都接到这里，信号才有回路。")],
  "3V3": [n("caution", "Regulated 3.3 V output. Current is limited; use a separate supply for hungry loads.", "3.3V 稳压输出。电流有限，大负载请另接电源。")],
  "BAT+": [n("danger", "Lithium-cell positive pad. Use a 3.7 V LiPo. Polarity is marked; reverse connection can damage the charger.", "锂电池正极焊盘。使用 3.7V 锂电。极性印在板上，接反可能损坏充电电路。")],
  "BAT-": [n("caution", "Battery negative. It is tied to board ground through the charger path.", "电池负极。经充电电路与板地相连。")],
  RST: [n("caution", "Active-low reset. The board already pulls it up. Pulse it to ground to reboot.", "低电平复位。板上已上拉。对地脉冲即可重启。")],
  RESET: [n("caution", "Active-low reset. The board already pulls it up. Pulse it to ground to reboot.", "低电平复位。板上已上拉。对地脉冲即可重启。")],
};

export const GENERIC_GPIO = n(
  "info",
  "General-purpose I/O at 3.3 V. Stay within 0–3.3 V unless the pin is marked 5 V tolerant.",
  "通用输入输出，逻辑电平 3.3V。输入保持在 0–3.3V，除非该脚标明耐 5V。",
);
