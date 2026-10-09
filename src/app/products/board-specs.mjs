/**
 * Filter group definitions and per-board capability matrix for XIAO Selector.
 * 选型器筛选项定义与每块开发板的能力矩阵。
 */

export const FILTER_GROUPS = [
  {
    id: "connectivity",
    section: "default",
    mode: "and",
    label: { en: "Connectivity & Protocols", zh: "无线能力与协议" },
    options: [
      { id: "wifi", label: { en: "Wi-Fi", zh: "Wi-Fi" } },
      { id: "ble", label: { en: "Bluetooth LE", zh: "Bluetooth LE" } },
      { id: "matter", label: { en: "Matter", zh: "Matter" } },
      { id: "thread", label: { en: "Thread", zh: "Thread" } },
      { id: "zigbee", label: { en: "Zigbee", zh: "Zigbee" } },
      { id: "nfc", label: { en: "NFC", zh: "NFC" } },
    ],
  },
  {
    id: "variant",
    section: "default",
    mode: "or",
    label: { en: "XIAO Variant", zh: "XIAO 版本" },
    options: [
      { id: "standard", label: { en: "Standard", zh: "Standard" } },
      { id: "plus", label: { en: "Plus", zh: "Plus" } },
    ],
  },
  {
    id: "platform",
    section: "default",
    mode: "or",
    label: { en: "Chip Platform", zh: "芯片平台" },
    options: [
      { id: "espressif", label: { en: "Espressif", zh: "Espressif" } },
      { id: "nordic", label: { en: "Nordic", zh: "Nordic" } },
      { id: "silicon-labs", label: { en: "Silicon Labs", zh: "Silicon Labs" } },
      { id: "raspberry-pi", label: { en: "Raspberry Pi", zh: "Raspberry Pi" } },
      { id: "microchip", label: { en: "Microchip", zh: "Microchip" } },
      { id: "renesas", label: { en: "Renesas", zh: "Renesas" } },
    ],
  },
  {
    id: "sensors",
    section: "default",
    mode: "and",
    label: { en: "Onboard Sensors", zh: "板载传感器" },
    options: [
      { id: "camera", label: { en: "Camera", zh: "摄像头" } },
      { id: "microphone", label: { en: "Microphone", zh: "麦克风" } },
      { id: "imu", label: { en: "IMU", zh: "IMU" } },
      { id: "none", label: { en: "No Onboard Sensor", zh: "无板载传感器" } },
    ],
  },
  {
    id: "power",
    section: "default",
    mode: "and",
    label: { en: "Power", zh: "供电与功耗" },
    options: [
      { id: "battery-charging", label: { en: "Battery Charging", zh: "电池充电" } },
      { id: "low-power", label: { en: "Low Power", zh: "低功耗" } },
      { id: "ultra-low-power", label: { en: "Ultra-Low Power", zh: "超低功耗" } },
    ],
  },
  {
    id: "io",
    section: "more",
    mode: "and",
    label: { en: "I/O & Interfaces", zh: "接口与 I/O" },
    options: [
      { id: "usb-c", label: { en: "USB-C", zh: "USB-C" } },
      { id: "sd-card", label: { en: "SD Card Slot", zh: "SD 卡槽" } },
      { id: "swd", label: { en: "SWD Debug", zh: "SWD 调试" } },
      { id: "battery-connector", label: { en: "Battery Connector", zh: "电池焊盘" } },
      { id: "expanded-io", label: { en: "Expanded I/O (Plus)", zh: "扩展 I/O（Plus）" } },
    ],
  },
  {
    id: "dev",
    section: "more",
    mode: "and",
    label: { en: "Development Platform", zh: "开发平台" },
    options: [
      { id: "arduino", label: { en: "Arduino", zh: "Arduino" } },
      { id: "micropython", label: { en: "MicroPython", zh: "MicroPython" } },
      { id: "circuitpython", label: { en: "CircuitPython", zh: "CircuitPython" } },
      { id: "esp-idf", label: { en: "ESP-IDF", zh: "ESP-IDF" } },
      { id: "zephyr", label: { en: "Zephyr (NCS)", zh: "Zephyr (NCS)" } },
      { id: "platformio", label: { en: "PlatformIO", zh: "PlatformIO" } },
    ],
  },
  {
    id: "pinHeader",
    section: "purchase",
    mode: "or",
    label: { en: "Pin Header", zh: "排针" },
    options: [
      { id: "un-soldered", label: { en: "Un-Soldered", zh: "未焊接" } },
      { id: "pre-soldered", label: { en: "Pre-Soldered", zh: "已焊接" } },
    ],
  },
  {
    id: "format",
    section: "purchase",
    mode: "or",
    label: { en: "Purchase Format", zh: "采购形式" },
    options: [
      { id: "1pc", label: { en: "1 Pc", zh: "1 片" } },
      { id: "3pcs", label: { en: "3 Pcs", zh: "3 片装" } },
      {
        id: "tape-reel",
        label: { en: "Tape & Reel", zh: "编带卷装" },
        note: { en: "For SMT Production", zh: "适用于 SMT 量产" },
      },
    ],
  },
];

const basePurchase = ["1pc", "3pcs"];

/**
 * Hardware summary columns shown in the results table and compare panel.
 * 结果表与对比面板中展示的硬件参数列。
 */
export const HARDWARE_FIELDS = [
  { id: "mcu", label: { en: "MCU", zh: "主控" } },
  { id: "core", label: { en: "Core / Clock", zh: "核心 / 主频" } },
  { id: "flash", label: { en: "Flash", zh: "Flash" } },
  { id: "ram", label: { en: "RAM", zh: "RAM" } },
  { id: "gpio", label: { en: "GPIO", zh: "GPIO" } },
];

const WIKI = "https://wiki.seeedstudio.com/";

/**
 * Hardware summary and Wiki link keyed by catalog product title.
 * 以产品目录标题为键的硬件摘要与 Wiki 链接。
 */
export const BOARD_HARDWARE = {
  "XIAO ESP32-C3": {
    mcu: "ESP32-C3", core: "RISC-V 1 x 160 MHz", flash: "4 MB", ram: "400 KB SRAM", gpio: 11,
    wiki: `${WIKI}XIAO_ESP32C3_Getting_Started/`,
  },
  "XIAO ESP32-S3": {
    mcu: "ESP32-S3R8", core: "Xtensa LX7 2 x 240 MHz", flash: "8 MB", ram: "512 KB SRAM + 8 MB PSRAM", gpio: 11,
    wiki: `${WIKI}xiao_esp32s3_getting_started/`,
  },
  "XIAO ESP32-S3 Sense": {
    mcu: "ESP32-S3R8", core: "Xtensa LX7 2 x 240 MHz", flash: "8 MB", ram: "512 KB SRAM + 8 MB PSRAM", gpio: 11,
    wiki: `${WIKI}xiao_esp32s3_getting_started/`,
  },
  "XIAO ESP32-S3 Plus": {
    mcu: "ESP32-S3R8", core: "Xtensa LX7 2 x 240 MHz", flash: "16 MB", ram: "512 KB SRAM + 8 MB PSRAM", gpio: 20,
    wiki: `${WIKI}xiao_esp32s3_getting_started/`,
  },
  "XIAO ESP32-C6": {
    mcu: "ESP32-C6", core: "RISC-V 160 MHz + LP 20 MHz", flash: "4 MB", ram: "512 KB SRAM", gpio: 11,
    wiki: `${WIKI}xiao_esp32c6_getting_started/`,
  },
  "XIAO ESP32-C5": {
    mcu: "ESP32-C5", core: "RISC-V 240 MHz + LP 40 MHz", flash: "8 MB", ram: "384 KB SRAM + 8 MB PSRAM", gpio: 11,
    wiki: `${WIKI}xiao_esp32c5_getting_started/`,
  },
  "XIAO nRF52840": {
    mcu: "nRF52840", core: "Cortex-M4F 64 MHz", flash: "1 MB + 2 MB onboard", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}XIAO_BLE/`,
  },
  "XIAO nRF52840 Sense": {
    mcu: "nRF52840", core: "Cortex-M4F 64 MHz", flash: "1 MB + 2 MB onboard", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}XIAO_BLE/`,
  },
  "XIAO nRF52840 Plus": {
    mcu: "nRF52840", core: "Cortex-M4F 64 MHz", flash: "1 MB + 2 MB onboard", ram: "256 KB SRAM", gpio: 20,
    wiki: `${WIKI}XIAO_BLE/`,
  },
  "XIAO nRF52840 Sense Plus": {
    mcu: "nRF52840", core: "Cortex-M4F 64 MHz", flash: "1 MB + 2 MB onboard", ram: "256 KB SRAM", gpio: 20,
    wiki: `${WIKI}XIAO_BLE/`,
  },
  "XIAO nRF54L15": {
    mcu: "nRF54L15", core: "Cortex-M33 128 MHz + RISC-V", flash: "1.5 MB NVM", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}xiao_nrf54l15_sense_getting_started/`,
  },
  "XIAO nRF54L15 Sense": {
    mcu: "nRF54L15", core: "Cortex-M33 128 MHz + RISC-V", flash: "1.5 MB NVM", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}xiao_nrf54l15_sense_getting_started/`,
  },
  "XIAO nRF54LM20A": {
    mcu: "nRF54LM20A", core: "Cortex-M33 128 MHz", flash: "2 MB NVM", ram: "512 KB SRAM", gpio: 20,
    wiki: `${WIKI}xiao_nrf54lm20a_getting_started/`,
  },
  "XIAO nRF54LM20A Sense": {
    mcu: "nRF54LM20A", core: "Cortex-M33 128 MHz", flash: "2 MB NVM", ram: "512 KB SRAM", gpio: 20,
    wiki: `${WIKI}xiao_nrf54lm20a_getting_started/`,
  },
  "XIAO RP2040": {
    mcu: "RP2040", core: "Cortex-M0+ 2 x 133 MHz", flash: "2 MB", ram: "264 KB SRAM", gpio: 11,
    wiki: `${WIKI}XIAO-RP2040/`,
  },
  "XIAO RP2040 Plus": {
    mcu: "RP2040", core: "Cortex-M0+ 2 x 133 MHz", flash: "2 MB", ram: "264 KB SRAM", gpio: 26,
    wiki: `${WIKI}XIAO-RP2040/`,
  },
  "XIAO RP2350": {
    mcu: "RP2350", core: "Cortex-M33 / RISC-V 2 x 150 MHz", flash: "2 MB", ram: "520 KB SRAM", gpio: 19,
    wiki: `${WIKI}getting-started-xiao-rp2350/`,
  },
  "XIAO MG24": {
    mcu: "EFR32MG24", core: "Cortex-M33 78 MHz", flash: "1.5 MB", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}xiao_mg24_getting_started/`,
  },
  "XIAO MG24 Sense": {
    mcu: "EFR32MG24", core: "Cortex-M33 78 MHz", flash: "1.5 MB", ram: "256 KB SRAM", gpio: 11,
    wiki: `${WIKI}xiao_mg24_getting_started/`,
  },
  "XIAO SAMD21": {
    mcu: "ATSAMD21G18", core: "Cortex-M0+ 48 MHz", flash: "256 KB", ram: "32 KB SRAM", gpio: 11,
    wiki: `${WIKI}Seeeduino-XIAO/`,
  },
  "XIAO SAMD21 Plus": {
    mcu: "ATSAMD21G18", core: "Cortex-M0+ 48 MHz", flash: "256 KB", ram: "32 KB SRAM", gpio: 27,
    wiki: `${WIKI}Seeeduino-XIAO/`,
  },
  "XIAO RA4M1": {
    mcu: "R7FA4M1AB", core: "Cortex-M4 48 MHz", flash: "256 KB", ram: "32 KB SRAM", gpio: 19,
    wiki: `${WIKI}getting_started_xiao_ra4m1/`,
  },
};

/**
 * Spec matrix keyed by catalog product title.
 * 以产品目录标题为键的规格矩阵。
 */
export const BOARD_SPECS = {
  "XIAO ESP32-C3": {
    connectivity: ["wifi", "ble"],
    variant: ["standard"],
    platform: ["espressif"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase, "tape-reel"],
  },
  "XIAO ESP32-S3": {
    connectivity: ["wifi", "ble"],
    variant: ["standard"],
    platform: ["espressif"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase],
  },
  "XIAO ESP32-S3 Sense": {
    connectivity: ["wifi", "ble"],
    variant: ["standard"],
    platform: ["espressif"],
    sensors: ["camera", "microphone"],
    power: ["battery-charging"],
    io: ["usb-c", "sd-card", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase],
  },
  "XIAO ESP32-S3 Plus": {
    connectivity: ["wifi", "ble"],
    variant: ["plus"],
    platform: ["espressif"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "battery-connector", "expanded-io"],
    dev: ["arduino", "micropython", "circuitpython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO ESP32-C6": {
    connectivity: ["wifi", "ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["espressif"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "battery-connector"],
    dev: ["arduino", "micropython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO ESP32-C5": {
    connectivity: ["wifi", "ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["espressif"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "battery-connector"],
    dev: ["arduino", "micropython", "esp-idf", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF52840": {
    connectivity: ["ble", "nfc"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: [],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase, "tape-reel"],
  },
  "XIAO nRF52840 Sense": {
    connectivity: ["ble", "nfc"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: ["microphone", "imu"],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase, "tape-reel"],
  },
  "XIAO nRF52840 Plus": {
    connectivity: ["ble", "nfc"],
    variant: ["plus"],
    platform: ["nordic"],
    sensors: [],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector", "expanded-io"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF52840 Sense Plus": {
    connectivity: ["ble", "nfc"],
    variant: ["plus"],
    platform: ["nordic"],
    sensors: ["microphone", "imu"],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector", "expanded-io"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF54L15": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: [],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF54L15 Sense": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: ["microphone", "imu"],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF54LM20A": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: [],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO nRF54LM20A Sense": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["nordic"],
    sensors: ["microphone", "imu"],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO RP2040": {
    connectivity: [],
    variant: ["standard"],
    platform: ["raspberry-pi"],
    sensors: [],
    power: [],
    io: ["usb-c", "swd"],
    dev: ["arduino", "micropython", "circuitpython", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase, "tape-reel"],
  },
  "XIAO RP2040 Plus": {
    connectivity: [],
    variant: ["plus"],
    platform: ["raspberry-pi"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "swd", "battery-connector", "expanded-io"],
    dev: ["arduino", "micropython", "circuitpython", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO RP2350": {
    connectivity: [],
    variant: ["standard"],
    platform: ["raspberry-pi"],
    sensors: [],
    power: ["battery-charging"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "micropython", "circuitpython", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO MG24": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["silicon-labs"],
    sensors: [],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO MG24 Sense": {
    connectivity: ["ble", "matter", "thread", "zigbee"],
    variant: ["standard"],
    platform: ["silicon-labs"],
    sensors: ["microphone", "imu"],
    power: ["battery-charging", "ultra-low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO SAMD21": {
    connectivity: [],
    variant: ["standard"],
    platform: ["microchip"],
    sensors: [],
    power: ["low-power"],
    io: ["usb-c", "swd"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered", "pre-soldered"],
    format: [...basePurchase],
  },
  "XIAO SAMD21 Plus": {
    connectivity: [],
    variant: ["plus"],
    platform: ["microchip"],
    sensors: [],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector", "expanded-io"],
    dev: ["arduino", "micropython", "circuitpython", "zephyr", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
  "XIAO RA4M1": {
    connectivity: [],
    variant: ["standard"],
    platform: ["renesas"],
    sensors: [],
    power: ["battery-charging", "low-power"],
    io: ["usb-c", "swd", "battery-connector"],
    dev: ["arduino", "platformio"],
    pinHeader: ["un-soldered"],
    format: [...basePurchase],
  },
};

/** Build empty multi-select state for every filter group. */
export function emptySelection() {
  return Object.fromEntries(FILTER_GROUPS.map((group) => [group.id, []]));
}

/** Look up board specs by product title. */
export function getBoardSpecs(title) {
  return BOARD_SPECS[title] ?? null;
}
