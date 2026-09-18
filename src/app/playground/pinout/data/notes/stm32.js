import { n, POWER_NOTES } from "./util.js";

export default {
  byId: {
    ...POWER_NOTES,
    Boot: [n("caution", "BOOT0-style pin. Hold at reset to enter the STM32 ROM bootloader / DFU path used by this board.", "类似 BOOT0 的脚。复位时按住进入这块板使用的 ROM 引导 / DFU。")],
    SWCLK: [n("info", "SWD clock.", "SWD 时钟。")],
    SWDIO: [n("info", "SWD data.", "SWD 数据。")],
    RST: POWER_NOTES.RST,
  },
  byChip: {
    NRST: POWER_NOTES.RST,
    BOOT: [n("caution", "Boot pin sampled at reset.", "复位时采样的启动脚。")],
    SWCLK: [n("info", "SWD clock.", "SWD 时钟。")],
    SWDIO: [n("info", "SWD data.", "SWD 数据。")],
    GPIO0: [n("info", "Header D0. Treat as 3.3 V GPIO until the wiki lists a dedicated analog channel.", "排针 D0。在 Wiki 标明模拟通道之前，按 3.3V GPIO 使用。")],
  },
  byBoard: {},
};
