import { assembleBoard, headerPin, placeOrphans, powerPin } from "./buildBoard.js";

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
  // Sense expansion-board signals from the official module pinout: the
  // OV2640 camera, PDM microphone and microSD slot sit on the expansion
  // board and occupy these main-board GPIOs through the board-to-board
  // connector (see the module face on the pinout page).
  // Sense 扩展板信号，来自官方扩展板引脚图：OV2640 摄像头、PDM 麦克风与
  // microSD 卡槽位于扩展板上，经板对板连接器占用这些主板 GPIO。
  s3sense.pins = [
    ...s3sense.pins,
    // PDM microphone (GPIO41 / GPIO42, D12 / D11 on the connector silk).
    onboard("PDM_DATA", "GPIO41", "digital", "PDM microphone data line, also JTAG MTDI (D12).", "PDM 麦克风数据线，兼作 JTAG MTDI（D12）。", "esp32", { occupiedBy: "PDM microphone" }),
    onboard("PDM_CLK", "GPIO42", "digital", "PDM microphone clock line, also JTAG MTMS (D11).", "PDM 麦克风时钟线，兼作 JTAG MTMS（D11）。", "esp32", { occupiedBy: "PDM microphone" }),
    // OV2640 camera DVP bus.
    onboard("DVP_Y2", "GPIO15", "digital", "OV2640 camera DVP data bit Y2.", "OV2640 摄像头 DVP 数据线 Y2。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y3", "GPIO17", "digital", "OV2640 camera DVP data bit Y3.", "OV2640 摄像头 DVP 数据线 Y3。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y4", "GPIO18", "digital", "OV2640 camera DVP data bit Y4.", "OV2640 摄像头 DVP 数据线 Y4。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y5", "GPIO16", "digital", "OV2640 camera DVP data bit Y5.", "OV2640 摄像头 DVP 数据线 Y5。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y6", "GPIO14", "digital", "OV2640 camera DVP data bit Y6.", "OV2640 摄像头 DVP 数据线 Y6。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y7", "GPIO12", "digital", "OV2640 camera DVP data bit Y7 (labelled DVP_Y7/SPI_MISO).", "OV2640 摄像头 DVP 数据线 Y7（图上标注 DVP_Y7/SPI_MISO）。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y8", "GPIO11", "digital", "OV2640 camera DVP data bit Y8 (labelled DVP_Y8/SPI1_MOSI).", "OV2640 摄像头 DVP 数据线 Y8（图上标注 DVP_Y8/SPI1_MOSI）。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_Y9", "GPIO48", "digital", "OV2640 camera DVP data bit Y9.", "OV2640 摄像头 DVP 数据线 Y9。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_HREF", "GPIO47", "digital", "OV2640 camera DVP horizontal reference (HREF).", "OV2640 摄像头 DVP 行参考信号 HREF。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_VSYNC", "GPIO38", "digital", "OV2640 camera DVP vertical sync (labelled DVP_VSYNC/I2S_SD).", "OV2640 摄像头 DVP 场同步信号（图上标注 DVP_VSYNC/I2S_SD）。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("DVP_PCLK", "GPIO13", "digital", "OV2640 camera pixel clock (labelled DVP_PCLK/SPI1_SCK).", "OV2640 摄像头像素时钟（图上标注 DVP_PCLK/SPI1_SCK）。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("XMCLK", "GPIO10", "digital", "OV2640 camera master clock output.", "OV2640 摄像头主时钟输出。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("CAM_SCL", "GPIO39", "i2c", "Camera SCCB (I²C) clock, also I2S SCK (JTAG MTCK).", "摄像头 SCCB（I²C）时钟，兼作 I2S SCK（JTAG MTCK）。", "esp32", { occupiedBy: "OV2640 camera" }),
    onboard("CAM_SDA", "GPIO40", "i2c", "Camera SCCB (I²C) data, also I2S WS (JTAG MTDO).", "摄像头 SCCB（I²C）数据，兼作 I2S WS（JTAG MTDO）。", "esp32", { occupiedBy: "OV2640 camera" }),
    // microSD slot on SPI.
    onboard("SD_MOSI", "GPIO9", "spi", "microSD card SPI MOSI — shares the D10/A10 header pin.", "microSD 卡 SPI MOSI，与 D10/A10 排针复用。", "esp32", { occupiedBy: "microSD slot" }),
    onboard("SD_MISO", "GPIO8", "spi", "microSD card SPI MISO — shares the D9/A9 header pin.", "microSD 卡 SPI MISO，与 D9/A9 排针复用。", "esp32", { occupiedBy: "microSD slot" }),
    onboard("SD_SCK", "GPIO7", "spi", "microSD card SPI clock — shares the D8/A8 header pin.", "microSD 卡 SPI 时钟，与 D8/A8 排针复用。", "esp32", { occupiedBy: "microSD slot" }),
    onboard("SD_CS", "GPIO3", "spi", "microSD card SPI chip select — shares the D2/A2 header pin.", "microSD 卡 SPI 片选，与 D2/A2 排针复用。", "esp32", { occupiedBy: "microSD slot" }),
    onboard("SHIELD", "GND", "gnd", "Camera FFC shield, tied to ground.", "摄像头排线屏蔽层，接地。", "esp32", { occupiedBy: "camera FFC" }),
    // The connector's VIN rows (top of the right column and bottom of the
    // left column) are the expansion board's 5V feed from the main board.
    // 连接器两端的 VIN 行是扩展板从主板取电的 5V 电源。
    onboard("VIN", "VBUS", "power", "Expansion-board 5V power input — wired to the main board 5V (VBUS) pin.", "扩展板 5V 电源输入，接主板 5V（VBUS）引脚。", "esp32", { occupiedBy: "Sense expansion board" }),
  ];
  // assembleBoard normally does this: header pins without a measured pad are
  // reclassified as onboard entries. The clone path skips it, so run it here.
  // assembleBoard 里本会执行这步：无量得焊盘的引脚归类为板载项；clone 路径没有，这里补上。
  s3sense.pins = placeOrphans(s3sense.pins);

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
    onboard("MIC_DATA", "P0.16", "digital", "PDM microphone data", "PDM 麦克风数据", "nrf52", { silk: "PDM_DATA" }),
    onboard("MIC_CLK", "P1.00", "digital", "PDM microphone clock", "PDM 麦克风时钟", "nrf52", { silk: "PDM_CLK" }),
    onboard("MIC_PWR", "P1.10", "digital", "PDM microphone power enable", "PDM 麦克风供电使能", "nrf52", { silk: "PWR" }),
    onboard("IMU_SDA", "P0.07", "i2c", "6-axis IMU I2C data (I2C1_SDA)", "六轴 IMU I2C 数据（I2C1_SDA）", "nrf52", { silk: "I2C1_SDA" }),
    onboard("IMU_SCL", "P0.27", "i2c", "6-axis IMU I2C clock (I2C1_SCL)", "六轴 IMU I2C 时钟（I2C1_SCL）", "nrf52", { silk: "I2C1_SCL" }),
    onboard("IMU", "LSM6DS3TR-C", "peripheral",
      "Onboard ST LSM6DS3TR-C 6-axis IMU — a 3-axis accelerometer and 3-axis gyroscope on the I²C bus (address 0x6A, wired to IMU_SDA / IMU_SCL). Use it for tilt, gesture and orientation sensing; its IMU_INT1 interrupt can wake the MCU on motion events.",
      "板载 ST LSM6DS3TR-C 六轴 IMU —— 3 轴加速度计 + 3 轴陀螺仪，挂接在 I²C 总线（地址 0x6A，走 IMU_SDA / IMU_SCL）。可用于倾角、手势与姿态检测；IMU_INT1 中断可在检测到运动时唤醒 MCU。",
      "nrf52"),
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
  // Sense diagram rows the Plus clone does not carry: mic power and the IMU
  // I2C pair, plus the diagram's own names for the mic pins.
  // Plus 克隆缺的 Sense 图行：麦克风供电与 IMU I2C 对，外加图上麦克风引脚名。
  nrf52840senseplus.pins = placeOrphans([
    ...nrf52840senseplus.pins.map((pin) => (pin.id === "MIC_DATA" || pin.id === "MIC_CLK"
      ? { ...pin, names: { ...pin.names, silk: pin.id === "MIC_DATA" ? "PDM_DATA" : "PDM_CLK" } }
      : pin)),
    onboard("MIC_PWR", "P1.10", "digital", "PDM microphone power enable", "PDM 麦克风供电使能", "nrf52", { silk: "PWR" }),
    onboard("IMU_SDA", "P0.07", "i2c", "6-axis IMU I2C data (I2C1_SDA)", "六轴 IMU I2C 数据（I2C1_SDA）", "nrf52", { silk: "I2C1_SDA" }),
    onboard("IMU_SCL", "P0.27", "i2c", "6-axis IMU I2C clock (I2C1_SCL)", "六轴 IMU I2C 时钟（I2C1_SCL）", "nrf52", { silk: "I2C1_SCL" }),
    onboard("IMU", "LSM6DS3TR-C", "peripheral",
      "Onboard ST LSM6DS3TR-C 6-axis IMU — a 3-axis accelerometer and 3-axis gyroscope on the I²C bus (address 0x6A, wired to IMU_SDA / IMU_SCL). Use it for tilt, gesture and orientation sensing.",
      "板载 ST LSM6DS3TR-C 六轴 IMU —— 3 轴加速度计 + 3 轴陀螺仪，挂接在 I²C 总线（地址 0x6A，走 IMU_SDA / IMU_SCL）。可用于倾角、手势与姿态检测。",
      "nrf52"),
  ]);

  const nrf54l15sense = cloneBoard(nrf54l15, {
    id: "nrf54l15sense",
    name: "XIAO nRF54L15 Sense",
    tagline: {
      en: "nRF54L15 Sense — ultra-low-power BLE with onboard IMU and microphone.",
      zh: "nRF54L15 Sense — 超低功耗 BLE，板载 IMU 与麦克风。",
    },
  });
  // Sense-only peripherals on the front diagram's 6-Dof IMU / microphone rows.
  // 仅 Sense 板有的外设：正面图的六轴 IMU 与麦克风行。
  nrf54l15sense.pins = placeOrphans([
    ...nrf54l15sense.pins,
    onboard("IMU_INT1", "P0.02", "digital", "6-axis IMU interrupt 1", "六轴 IMU 中断 1", "nrf54"),
    onboard("IMU", "LSM6DS3TR-C", "peripheral",
      "Onboard ST LSM6DS3TR-C 6-axis IMU — a 3-axis accelerometer and 3-axis gyroscope on the I²C bus (address 0x6A). Use it for tilt, gesture and orientation sensing; the IMU_INT1 interrupt can wake the MCU on motion events.",
      "板载 ST LSM6DS3TR-C 六轴 IMU —— 3 轴加速度计 + 3 轴陀螺仪，挂接在 I²C 总线（地址 0x6A）。可用于倾角、手势与姿态检测；IMU_INT1 中断可在检测到运动时唤醒 MCU。",
      "nrf54"),
    onboard("MIC_CLK", "P1.12", "digital", "Microphone clock line", "麦克风时钟线", "nrf54"),
    onboard("MIC_DAT", "P1.13", "digital", "Microphone data line", "麦克风数据线", "nrf54"),
  ]);
  // The Sense IMU hangs off I2C1 (P0.03/P0.04), so the D11/D12 back pads are
  // wired to it and not free. Sense 板的 IMU 挂在 I2C1（P0.03/P0.04）上，
  // 背面 D11/D12 焊盘已接 IMU，非空闲。
  nrf54l15sense.pins = nrf54l15sense.pins.map((pin) => {
    if (pin.id !== "D11" && pin.id !== "D12") return pin;
    const sda = pin.id === "D12";
    return {
      ...pin,
      status: "occupied",
      occupiedBy: "6-axis IMU (I2C1)",
      desc: {
        en: `${sda ? "I2C1 data" : "I2C1 clock"} (back pad) — wired to the onboard 6-axis IMU`,
        zh: `${sda ? "I2C1 数据" : "I2C1 时钟"}（背面焊盘）—— 已接板载六轴 IMU`,
      },
      warning: {
        en: "Other I2C1 devices can share the bus, but these pads cannot be repurposed.",
        zh: "其他 I2C1 器件可共线使用，但这两个焊盘不能挪作他用。",
      },
    };
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
  // Sense-only peripherals: the 6-Dof IMU row and the analog microphone pins.
  // 仅 Sense 板有的外设：六轴 IMU 行与模拟麦克风引脚。
  mg24sense.pins = placeOrphans([
    ...mg24sense.pins,
    onboard("IMU", "LSM6DS3TR-C", "peripheral",
      "Onboard ST LSM6DS3TR-C 6-axis IMU — a 3-axis accelerometer and 3-axis gyroscope on the I²C bus (address 0x6A). Use it for tilt, gesture and orientation sensing.",
      "板载 ST LSM6DS3TR-C 六轴 IMU —— 3 轴加速度计 + 3 轴陀螺仪，挂接在 I²C 总线（地址 0x6A）。可用于倾角、手势与姿态检测。",
      "mg"),
    onboard("MIC_EN", "PC08", "digital", "Microphone enable", "麦克风使能", "mg"),
    onboard("MIC_ADC", "PC09", "analog", "Microphone analog audio input", "麦克风模拟音频输入", "mg"),
  ]);

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
    // Chips and default buses follow the official pin diagram (PA0…PB15),
    // not a generic GPIO numbering.
    // 芯片名与默认总线按官方引脚图（PA0…PB15），不是通用 GPIO 编号。
    ...[
      ["D0", "PA0", { adc: "A0" }, "Digital 0 / Analog 0", "数字 0 / 模拟 0"],
      ["D1", "PA1", { adc: "A1" }, "Digital 1 / Analog 1", "数字 1 / 模拟 1"],
      ["D2", "PA2", { adc: "A2" }, "Digital 2 / Analog 2", "数字 2 / 模拟 2"],
      ["D3", "PA3", { adc: "A3" }, "Digital 3 / Analog 3", "数字 3 / 模拟 3"],
      ["D4", "PB7", { i2c: "I2C1 SDA" }, "Digital 4 / I2C1 data", "数字 4 / I2C1 数据"],
      ["D5", "PB6", { i2c: "I2C1 SCL" }, "Digital 5 / I2C1 clock", "数字 5 / I2C1 时钟"],
      ["D6", "PA9", { uart: "UART TX" }, "Digital 6 / UART transmit", "数字 6 / UART 发送"],
      ["D7", "PA10", { uart: "UART RX" }, "Digital 7 / UART receive", "数字 7 / UART 接收"],
      ["D8", "PE2", { spi: "SPI SCK" }, "Digital 8 / SPI clock", "数字 8 / SPI 时钟"],
      ["D9", "PB0", { spi: "SPI MISO" }, "Digital 9 / SPI MISO", "数字 9 / SPI 主入从出"],
      ["D10", "PB15", { spi: "SPI MOSI" }, "Digital 10 / SPI MOSI", "数字 10 / SPI 主出从入"],
    ].map(([id, chip, caps, desc, descZh]) =>
      headerPin(id, { silk: id, chip, fn: "digital", caps, desc, descZh }, "stm32")),
    onboard("USER_LED", "PB25", "digital", "User LED", "用户 LED", "stm32"),
    onboard("Boot", "PH2-BOOT0", "rst", "Boot button", "Boot 按键", "stm32", { status: "conditional", silk: "BOOT" }),
    onboard("CHARGE_LED", "VBUS", "power", "Charge LED", "充电指示灯", "stm32"),
    // D11–D14 are the two FDCAN controllers; D15 is the transceiver standby pin.
    // D11–D14 是两路 FDCAN 控制器；D15 是收发器待机控制脚。
    ...[
      ["D11", "PB8", "FDCAN1 RX", "Digital 11 / FDCAN1 receive", "数字 11 / FDCAN1 接收"],
      ["D12", "PB9", "FDCAN1 TX", "Digital 12 / FDCAN1 transmit", "数字 12 / FDCAN1 发送"],
      ["D13", "PB5", "FDCAN2 RX", "Digital 13 / FDCAN2 receive", "数字 13 / FDCAN2 接收"],
      ["D14", "PB13", "FDCAN2 TX", "Digital 14 / FDCAN2 transmit", "数字 14 / FDCAN2 发送"],
      ["D15", "PB14", "CAN STB", "CAN FD standby control (CAN_STB)", "CAN FD 待机控制（CAN_STB）"],
    ].map(([id, chip, can, desc, descZh]) =>
      headerPin(id, { silk: id, chip, fn: "digital", caps: { can }, desc, descZh, side: "back" }, "stm32")),
    headerPin("USB_D+", { silk: "D+", chip: "PA12", fn: "digital", desc: "USB data positive", descZh: "USB 数据正", side: "back" }, "stm32"),
    headerPin("USB_D-", { silk: "D-", chip: "PA11", fn: "digital", desc: "USB data negative", descZh: "USB 数据负", side: "back" }, "stm32"),
    headerPin("CAN_H", { silk: "CAN_H", chip: "CAN_H", fn: "can", desc: "CAN FD bus H", descZh: "CAN FD 总线 H", side: "back" }, "stm32"),
    headerPin("CAN_L", { silk: "CAN_L", chip: "CAN_L", fn: "can", desc: "CAN FD bus L", descZh: "CAN FD 总线 L", side: "back" }, "stm32"),
    onboard("IMU", "—", "peripheral",
      "Onboard 6-axis IMU — a 3-axis accelerometer and 3-axis gyroscope on the I²C bus (see IMU_SDA / IMU_SCL and the IMU_INT interrupt).",
      "板载六轴 IMU —— 3 轴加速度计 + 3 轴陀螺仪，挂接在 I²C 总线（见 IMU_SDA / IMU_SCL 与 IMU_INT 中断）。",
      "stm32"),
    onboard("IMU_SDA", "PB4", "i2c", "IMU I2C data", "IMU I2C 数据", "stm32"),
    onboard("IMU_SCL", "PB3", "i2c", "IMU I2C clock", "IMU I2C 时钟", "stm32"),
    onboard("IMU_INT", "PC13", "digital", "IMU interrupt", "IMU 中断", "stm32"),
    onboard("IMU_PWM", "PB15", "digital", "IMU heater PWM", "IMU 加热 PWM", "stm32"),
    headerPin("SWCLK", { silk: "SWCLK", chip: "SWCLK", fn: "digital", desc: "SWD debug clock", descZh: "SWD 调试时钟", side: "back" }, "stm32"),
    headerPin("SWDIO", { silk: "SWDIO", chip: "SWDIO", fn: "digital", desc: "SWD debug data", descZh: "SWD 调试数据", side: "back" }, "stm32"),
    headerPin("RST", { silk: "RST", chip: "NRST", fn: "rst", status: "conditional", desc: "Reset", descZh: "复位", side: "back" }, "stm32"),
    headerPin("BAT-", { silk: "BAT-", chip: "BAT-", fn: "gnd", desc: "Battery negative pad", descZh: "电池负极焊盘", side: "back" }, "stm32"),
    headerPin("BAT+", { silk: "BAT+", chip: "BAT+", fn: "power", desc: "Battery positive pad", descZh: "电池正极焊盘", side: "back" }, "stm32"),
  ], {
    left: ["SWCLK", "GND", "USB_D+", "3V3", "D11", "D12", "D13", "D14", "BAT-", "CAN_H"],
    right: ["SWDIO", "RST", "USB_D-", "Boot", "D15", "BAT+", "CAN_L"],
    padY: { left: [8, 16, 24, 32, 42, 50, 58, 66, 78, 90], right: [8, 16, 24, 32, 44, 78, 90] },
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
