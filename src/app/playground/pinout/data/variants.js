import { assembleBoard, headerPin, powerPin } from "./buildBoard.js";

const onboard = (id, chip, fn, desc, descZh, series, extra = {}) => headerPin(id, {
  silk: extra.silk || "—",
  chip,
  fn,
  status: extra.status || "occupied",
  occupiedBy: extra.occupiedBy || desc,
  desc,
  descZh,
  warning: extra.warning || "",
  warningZh: extra.warningZh,
  caps: extra.caps || {},
  side: extra.side || "front",
}, series);

const espFw = ["arduino", "micropython"];
const nrfFw = ["arduino", "zephyr"];
const factsEsp = { v33MaxMa: 500 };

/** Clone helper: same pins as base, new id/name/img. 克隆基板引脚，替换 id/name/img。 */
function cloneBoard(base, meta) {
  return {
    ...base,
    id: meta.id,
    name: meta.name,
    images: {
      front: { src: `/xiao-products/pinout/${meta.id}-front.svg`, width: 1920, height: 1080 },
      back: { src: `/xiao-products/pinout/${meta.id}-back.svg`, width: 1920, height: 1080 },
    },
    tagline: meta.tagline,
    pins: base.pins.map((pin) => ({ ...pin, series: pin.series })),
    markers: base.markers,
  };
}

export function buildVariantBoards(baseBoards) {
  const { s3, nrf52, nrf52840plus, nrf54l15, nrf54, mg24, c5 } = baseBoards;

  const s3sense = cloneBoard(s3, {
    id: "s3sense",
    name: "XIAO ESP32-S3 Sense",
    tagline: {
      en: "ESP32-S3 Sense — camera, microphone and SD slot on the XIAO footprint.",
      zh: "ESP32-S3 Sense — XIAO 封装上的摄像头、麦克风与 SD 卡槽。",
    },
  });

  const nrf52840sense = assembleBoard({
    id: "nrf52840sense",
    name: "XIAO nRF52840 Sense",
    series: "nrf52",
    img: "nrf52840sense",
    frameworks: nrfFw,
    facts: { v33MaxMa: 200 },
    tagline: {
      en: "nRF52840 Sense — BLE with onboard 6-axis IMU and PDM microphone.",
      zh: "nRF52840 Sense — 板载六轴 IMU 与 PDM 麦克风的 BLE 板。",
    },
    markerIds: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "CHARGE_LED", "IMU_INT1", "MIC_DATA", "MIC_CLK"],
  }, [
    ...nrf52.pins.filter((pin) => !["IMU_INT1", "MIC_DATA", "MIC_CLK"].includes(pin.id)),
    onboard("IMU_INT1", "P0.11", "digital", "6-axis IMU interrupt", "六轴 IMU 中断", "nrf52"),
    onboard("MIC_DATA", "P0.16", "digital", "PDM microphone data", "PDM 麦克风数据", "nrf52"),
    onboard("MIC_CLK", "P1.00", "digital", "PDM microphone clock", "PDM 麦克风时钟", "nrf52"),
  ], {
    left: [],
    right: ["NFC1", "NFC2", "BAT-", "BAT+"],
    padY: { left: [], right: [74, 86, 42, 54] },
  });

  const nrf52840senseplus = cloneBoard(nrf52840plus, {
    id: "nrf52840senseplus",
    name: "XIAO nRF52840 Sense Plus",
    tagline: {
      en: "nRF52840 Sense Plus — Sense sensors with expanded castellated I/O.",
      zh: "nRF52840 Sense Plus — Sense 传感器 + 扩展 Castellated I/O。",
    },
  });

  const nrf54l15sense = cloneBoard(nrf54l15, {
    id: "nrf54l15sense",
    name: "XIAO nRF54L15 Sense",
    tagline: {
      en: "nRF54L15 Sense — ultra-low-power BLE with onboard IMU and microphone.",
      zh: "nRF54L15 Sense — 超低功耗 BLE，板载 IMU 与麦克风。",
    },
  });

  const nrf54lm20asense = {
    ...nrf54,
    id: "nrf54lm20asense",
    name: "XIAO nRF54LM20A Sense",
    images: {
      front: { src: "/xiao-products/pinout/nrf54lm20asense-front.svg", width: 1920, height: 1080 },
      back: { src: "/xiao-products/pinout/nrf54lm20asense-back.svg", width: 1920, height: 1080 },
    },
    tagline: {
      en: "nRF54LM20A Sense — ultra-low-power wireless with IMU, microphone and expanded I/O.",
      zh: "nRF54LM20A Sense — 超低功耗无线，板载 IMU、麦克风与扩展 I/O。",
    },
  };

  const senseIds = new Set(["MIC_DAT", "MIC_CLK", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1"]);
  const nrf54lm20a = {
    ...nrf54,
    id: "nrf54lm20a",
    name: "XIAO nRF54LM20A",
    images: {
      front: { src: "/xiao-products/pinout/nrf54lm20a-front.svg", width: 1920, height: 1080 },
      back: { src: "/xiao-products/pinout/nrf54lm20a-back.svg", width: 1920, height: 1080 },
    },
    tagline: {
      en: "nRF54LM20A — higher-memory Nordic wireless with nPM1300 power management.",
      zh: "nRF54LM20A — 更大内存的 Nordic 无线板，集成 nPM1300 电源管理。",
    },
    pins: nrf54.pins.filter((pin) => !senseIds.has(pin.id)),
    markers: nrf54.markers.filter((marker) => !senseIds.has(marker.id)),
  };

  const mg24sense = cloneBoard(mg24, {
    id: "mg24sense",
    name: "XIAO MG24 Sense",
    tagline: {
      en: "MG24 Sense — Zigbee/Thread board with microphone and 6-axis IMU.",
      zh: "MG24 Sense — 带麦克风与六轴 IMU 的 Zigbee/Thread 板。",
    },
  });

  const stm32c5 = assembleBoard({
    id: "stm32c5",
    name: "XIAO STM32C5",
    series: "stm32",
    img: "stm32c5",
    frameworks: ["arduino"],
    tagline: {
      en: "STM32C5 — STM32 wireless MCU on the XIAO footprint.",
      zh: "STM32C5 — XIAO 封装上的 STM32 无线 MCU。",
    },
    markerIds: ["USER_LED", "Boot", "CHARGE_LED"],
  }, [
    powerPin("5V", "5V", "VBUS", "5V power in/out (USB VBUS)", "5V 电源输入/输出（USB VBUS）", "", "", { series: "stm32" }),
    powerPin("GND", "GND", "—", "Ground", "地", "", "", { series: "stm32", fn: "gnd" }),
    powerPin("3V3", "3V3", "3V3_OUT", "3.3V regulated output", "3.3V 稳压输出", "", "", { series: "stm32" }),
    ...["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"].map((id, index) =>
      headerPin(id, { silk: id, chip: `GPIO${index}`, fn: "digital", desc: `Digital ${index}`, descZh: `数字 ${index}` }, "stm32")),
    onboard("USER_LED", "LED", "digital", "User LED", "用户 LED", "stm32"),
    onboard("Boot", "BOOT", "rst", "Boot button", "Boot 按键", "stm32", { status: "conditional", silk: "BOOT" }),
    onboard("CHARGE_LED", "VBUS", "power", "Charge LED", "充电指示灯", "stm32"),
    headerPin("SWCLK", { silk: "SWCLK", chip: "SWCLK", fn: "digital", desc: "SWD debug clock", descZh: "SWD 调试时钟", side: "back" }, "stm32"),
    headerPin("SWDIO", { silk: "SWDIO", chip: "SWDIO", fn: "digital", desc: "SWD debug data", descZh: "SWD 调试数据", side: "back" }, "stm32"),
    headerPin("RST", { silk: "RST", chip: "NRST", fn: "rst", status: "conditional", desc: "Reset", descZh: "复位", side: "back" }, "stm32"),
    headerPin("BAT-", { silk: "BAT-", chip: "BAT-", fn: "gnd", desc: "Battery negative pad", descZh: "电池负极焊盘", side: "back" }, "stm32"),
    headerPin("BAT+", { silk: "BAT+", chip: "BAT+", fn: "power", desc: "Battery positive pad", descZh: "电池正极焊盘", side: "back" }, "stm32"),
  ], {
    left: ["SWCLK", "GND", "3V3"],
    right: ["SWDIO", "RST", "BAT-", "BAT+"],
    padY: { left: [20, 40, 60], right: [20, 40, 70, 80] },
  });

  return {
    s3sense,
    nrf52840sense,
    nrf52840senseplus,
    nrf54l15sense,
    nrf54lm20a,
    nrf54lm20asense,
    mg24sense,
    stm32c5,
  };
}
