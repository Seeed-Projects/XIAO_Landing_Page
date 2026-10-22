const image = (path) => `/xiao-products/${path}`;

const product = (title, link, img, descEn = "", wiki = "") => ({
  title,
  link,
  img: image(img),
  desc: descEn,
  descEn,
  ...(wiki ? { wiki } : {}),
});

const group = (id, labelEn, labelZhOrItems, maybeItems) => {
  const hasZh = Array.isArray(maybeItems);
  return {
    id,
    label: labelEn,
    labelEn,
    labelZh: hasZh ? labelZhOrItems : labelEn,
    items: hasZh ? maybeItems : labelZhOrItems,
  };
};

const selectorImage = (name) => image(`dev_boards/selector/${name}.svg`);

// Selector artwork is intentionally separate from the Product-card photos.
// 选型器使用简洁 SVG，产品卡片继续使用实物正面图。
export const SELECTOR_IMAGES = {
  "XIAO ESP32-C3": selectorImage("XIAO-ESP32-C3"),
  "XIAO ESP32-C5": selectorImage("XIAO-ESP32-C5"),
  "XIAO ESP32-C6": selectorImage("XIAO-ESP32-C6"),
  "XIAO ESP32-S3": selectorImage("XIAO-ESP32-S3"),
  "XIAO ESP32-S3 Plus": selectorImage("XIAO-ESP32-S3-Plus"),
  "XIAO ESP32-S3 Sense": selectorImage("XIAO-ESP32-S3-Sense"),
  "XIAO MG24": selectorImage("XIAO-MG24"),
  "XIAO MG24 Sense": selectorImage("XIAO-MG24-Sense"),
  "XIAO nRF54L15": selectorImage("XIAO-nRF54L15"),
  "XIAO nRF54L15 Sense": selectorImage("XIAO-nRF54L15-Sense"),
  "XIAO nRF54LM20A": selectorImage("XIAO-nRF54LM20A"),
  "XIAO nRF54LM20A Sense": selectorImage("XIAO-nRF54LM20A-Sense"),
  "XIAO nRF52840": selectorImage("XIAO-nRF52840"),
  "XIAO nRF52840 Plus": selectorImage("XIAO-nRF52840-Plus"),
  "XIAO nRF52840 Sense": selectorImage("XIAO-nRF52840-Sense"),
  "XIAO nRF52840 Sense Plus": selectorImage("XIAO-nRF52840-Sense-Plus"),
  "XIAO RA4M1": selectorImage("XIAO-RA4M1"),
  "XIAO RP2040": selectorImage("XIAO-RP2040"),
  "XIAO RP2040 Plus": selectorImage("XIAO-RP2040-Plus"),
  "XIAO RP2350": selectorImage("XIAO-RP2350"),
  "XIAO SAMD21": selectorImage("XIAO-SAMD21"),
  "XIAO SAMD21 Plus": selectorImage("XIAO-SAMD21-Plus"),
  "XIAO STM32C5": selectorImage("XIAO-STM32C5"),
};

/**
 * Presentation metadata for the three top-level XIAO series.
 * 三大系列在产品目录里的展示元数据（色调、封面、简介、标签）。
 */
export const SERIES_PRESENTATION = {
  "dev-boards": {
    eyebrow: { en: "Core MCUs", zh: "核心 MCU" },
    title: { en: "XIAO Dev Boards", zh: "XIAO 开发板" },
    description: {
      en: "Thumb-sized, Arduino-compatible microcontrollers powered by popular chipsets for TinyML and edge computing.",
      zh: "拇指大小的 Arduino 兼容微控制器，搭载主流芯片，适合 TinyML 与边缘计算。",
    },
    tags: {
      en: ["Plus Series", "Pre-soldered", "Tape & Reel", "3-Pack"],
      zh: ["Plus 系列", "预焊排针", "编带包装", "3 联包"],
    },
    tone: "var(--theme-blue)",
    ink: "var(--theme-blue)",
    cover: "/home/glimpse-devboards.webp",
    density: "boards",
  },
  addons: {
    eyebrow: { en: "Expansion Accessories", zh: "扩展配件" },
    title: { en: "XIAO Add-ons", zh: "XIAO 扩展模块" },
    description: {
      en: "Expansion boards, sensors, connectivity modules, actuators and kits designed for XIAO.",
      zh: "为 XIAO 设计的扩展板、传感器、连接模块、执行器与套件。",
    },
    tags: {
      en: ["Grove Ecosystem", "Stackable Modules", "Starter Kits"],
      zh: ["Grove 生态", "可堆叠模块", "入门套件"],
    },
    tone: "var(--theme-teal)",
    ink: "var(--theme-teal)",
    cover: "/home/glimpse-addons.jpeg",
    density: "addons",
  },
  gadgets: {
    eyebrow: { en: "Ready-to-Use Devices", zh: "即用设备" },
    title: { en: "XIAO Gadgets", zh: "XIAO 智能设备" },
    description: {
      en: "Out-of-the-box smart devices built on XIAO boards and add-ons for smart home, vision AI and maker projects.",
      zh: "基于 XIAO 开发板与扩展模块的开箱即用智能设备，覆盖智能家居、视觉 AI 与创客项目。",
    },
    tags: {
      en: ["Smart Home", "Vision AI", "Maker Devices"],
      zh: ["智能家居", "视觉 AI", "创客设备"],
    },
    tone: "var(--theme-lime)",
    ink: "var(--theme-lime-ink)",
    cover: "/home/glimpse-gadgets.jpeg",
    density: "addons",
  },
};

// Product names, grouping and destinations supplied for the XIAO product page.
// Images are local static assets from /picture, organized by the same category.
export const PRODUCT_CATALOG = [
  {
    id: "dev-boards",
    label: "XIAO Dev Boards",
    labelEn: "XIAO Dev Boards",
    labelZh: "XIAO 开发板",
    subcategories: [
      group("esp32", "Espressif ESP32 Series", "Espressif ESP32 系列", [
        product("XIAO ESP32-C3", "https://www.seeedstudio.com/Seeed-XIAO-ESP32C3-p-5431.html", "dev_boards/front/XIAO-ESP32-C3-front.webp", "Cost effective with Wi-Fi and BLE on board"),
        product("XIAO ESP32-S3", "https://www.seeedstudio.com/XIAO-ESP32S3-p-5627.html", "dev_boards/front/XIAO-ESP32-S3-front.webp", "High-performance dev board with Wi-Fi and BLE"),
        product("XIAO ESP32-S3 Plus", "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Plus-p-6361.html", "dev_boards/front/XIAO-ESP32-S3-Plus-front.webp", "ESP32-S3 with expanded castellated I/O for production designs"),
        product("XIAO ESP32-S3 Sense", "https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html", "dev_boards/front/XIAO-ESP32-S3-Sense-front.webp", "Mini camera perfect for computer vision"),
        product("XIAO ESP32-C6", "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html", "dev_boards/front/XIAO-ESP32-C6-front.webp", "2.4GHz Wi-Fi 6, BLE 5.0, Zigbee, and Thread for Matter"),
        product("XIAO ESP32-C5", "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C5-p-6609.html", "dev_boards/front/XIAO-ESP32-C5-front.webp", "2.4 & 5 GHz Wi-Fi 6, BLE 5.0, Zigbee, and Thread for Matter"),
      ]),
      group("nrf52", "Nordic nRF52 Series", "Nordic nRF52 系列", [
        product("XIAO nRF52840", "https://www.seeedstudio.com/Seeed-XIAO-BLE-nRF52840-p-5201.html", "dev_boards/front/XIAO-nRF52840-front.webp", "Ultra-low power consumption, perfect for BLE applications"),
        product("XIAO nRF52840 Plus", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Plus-p-6359.html", "dev_boards/front/XIAO-nRF52840-Plus-front.webp", "nRF52840 with expanded castellated I/O for BLE projects"),
        product("XIAO nRF52840 Sense", "https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html", "dev_boards/front/XIAO-nRF52840-Sense-front.webp", "Low power BLE with onboard microphone and 6-axis IMU"),
        product("XIAO nRF52840 Sense Plus", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Sense-Plus-p-6360.html", "dev_boards/front/XIAO-nRF52840-Sense-Plus-front.webp", "Sense sensors plus expanded castellated I/O"),
      ]),
      group("nrf54", "Nordic nRF54 Series", "Nordic nRF54 系列", [
        product("XIAO nRF54L15", "https://www.seeedstudio.com/XIAO-nRF54L15-p-6493.html", "dev_boards/front/XIAO-nRF54L15-front.webp", "Ultra low power consumption with multiple connectivity"),
        product("XIAO nRF54L15 Sense", "https://www.seeedstudio.com/XIAO-nRF54L15-Sense-p-6494.html", "dev_boards/front/XIAO-nRF54L15-Sense-front.webp", "Ultra low power consumption with multiple connectivity and onboard sensors"),
        product("XIAO nRF54LM20A", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-p-6841.html", "dev_boards/front/XIAO-nRF54LM20A-front.webp", "Ultra low power, larger memory capacity and expanded IO"),
        product("XIAO nRF54LM20A Sense", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-Sense-p-6840.html", "dev_boards/front/XIAO-nRF54LM20A-Sense-front.webp", "Ultra low power, larger memory and expanded IO, paired with onboard sensors"),
      ]),
      group("rp", "Raspberry Pi RP Series", "Raspberry Pi RP 系列", [
        product("XIAO RP2040", "https://www.seeedstudio.com/XIAO-RP2040-v1-0-p-5026.html", "dev_boards/front/XIAO-RP2040-front.webp", "Raspberry Pi Ecosystem with great MicroPython support"),
        product("XIAO RP2040 Plus", "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Plus-p-6932.html", "dev_boards/front/XIAO-RP2040-Plus-front.webp", "RP2040 with expanded I/O and onboard battery management"),
        product("XIAO RP2350", "https://www.seeedstudio.com/Seeed-XIAO-RP2350-p-5944.html", "dev_boards/front/XIAO-RP2350-front.webp", "MicroPython-ready based on Raspberry Pi RP2350"),
      ]),
      group("mg", "Silicon Labs MG Series", "Silicon Labs MG 系列", [
        product("XIAO MG24", "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-p-6247.html", "dev_boards/front/XIAO-MG24-front.webp", "Super-low power for battery-powered Matter projects"),
        product("XIAO MG24 Sense", "https://www.seeedstudio.com/Seeed-XIAO-MG24-Sense-p-6248.html", "dev_boards/front/XIAO-MG24-Sense-front.webp", "Super-low power board with microphone & 6-axis IMU"),
      ]),
      group("samd", "Microchip SAMD Series", "Microchip SAMD 系列", [
        product("XIAO SAMD21", "https://www.seeedstudio.com/Seeeduino-XIAO-Arduino-Microcontroller-SAMD21-Cortex-M0+-p-4426.html", "dev_boards/front/XIAO-SAMD21-front.webp", "Classic for Arduino beginners, with courses"),
        product("XIAO SAMD21 Plus", "https://www.seeedstudio.com/Seeed-Studio-XIAO-SAMD21-Plus-p-6933.html", "dev_boards/front/XIAO-SAMD21-Plus-front.webp", "SAMD21 with expanded I/O and onboard battery management"),
      ]),
      group("ra", "Renesas RA Series", "Renesas RA 系列", [
        product("XIAO RA4M1", "https://www.seeedstudio.com/Seeed-XIAO-RA4M1-p-5943.html", "dev_boards/front/XIAO-RA4M1-front.webp", "Renesas 32-bit ARM Cortex-M4 MCU, Arduino IDE-ready"),
      ]),
      group("stm32", "STMicroelectronics STM32 Series", "意法半导体 STM32 系列", [
        product("XIAO STM32C5", "https://www.seeedstudio.com/XIAO-STM32C5-p-7011.html", "dev_boards/front/XIAO-STM32C5-front.webp", "144 MHz Cortex-M33 with CAN FD, 16 MB Flash and a 6-axis IMU"),
      ]),
    ],
  },
  {
    id: "addons",
    label: "XIAO Add-ons",
    labelEn: "XIAO Add-ons",
    labelZh: "XIAO 扩展模块",
    // Add-ons are a single flat family — no second-level grouping.
    // Add-ons 为单一大家族平铺展示，不再二次分类。
    items: [
      product(
        "L76K GNSS Module for XIAO",
        "https://www.seeedstudio.com/L76K-GNSS-Module-for-Seeed-Studio-XIAO-p-5864.html",
        "addons/109100021.jpg",
        "Compact GNSS positioning module for global location tracking",
        "https://wiki.seeedstudio.com/get_start_l76k_gnss/",
      ),
      product(
        "LED Driver Board for Seeed Studio XIAO",
        "https://www.seeedstudio.com/LED-Driver-Board-for-Seeed-Studio-XIAO-p-6451.html",
        "addons/105100021.jpg",
        "Constant-current LED driver board for lighting projects",
        "https://wiki.seeedstudio.com/led_driver_board/",
      ),
      product(
        "Seeed Studio XIAO 24Ghz mmwave Human Static Presence Module",
        "https://www.seeedstudio.com/Seeed-Studio-XIAO-24Ghz-mmwave-Human-Static-Presence-Module-p-6266.html",
        "addons/101010001.png",
        "24GHz mmWave module that senses static human presence",
        "https://wiki.seeedstudio.com/mmwave_for_xiao/",
      ),
      product(
        "Expansion Base for XIAO",
        "https://www.seeedstudio.com/Seeeduino-XIAO-Expansion-board-p-4746.html",
        "addons/103030356.png",
        "Full-featured expansion base with RTC, OLED, SD card and buzzer",
        "https://wiki.seeedstudio.com/Seeeduino-XIAO-Expansion-Board/",
      ),
      product(
        "CAN Bus Breakout Board for XIAO",
        "https://www.seeedstudio.com/Seeed-Studio-CAN-Bus-Breakout-Board-for-XIAO-and-QT-Py-p-5702.html",
        "addons/105100001.png",
        "CAN bus breakout that turns XIAO into an industrial node",
        "https://wiki.seeedstudio.com/xiao-can-bus-expansion/",
      ),
      product(
        "Grove Base for XIAO",
        "https://www.seeedstudio.com/Grove-Shield-for-Seeeduino-XIAO-p-4621.html",
        "addons/103020312.png",
        "Grove shield with battery management for quick prototyping",
        "https://wiki.seeedstudio.com/Grove-Shield-for-Seeeduino-XIAO-embedded-battery-management-chip/",
      ),
      product(
        "Round Display for XIAO",
        "https://www.seeedstudio.com/1-28-Round-Touch-Display-for-Seeed-Studio-XIAO-ESP32.html",
        "addons/104030087.jpg",
        "1.28-inch round capacitive touch display add-on",
        "https://wiki.seeedstudio.com/get_start_round_display/",
      ),
      product(
        "OV5640 Camera for XIAO ESP32S3 Sense",
        "https://www.seeedstudio.com/OV5640-Camera-for-XIAO-ESP32S3-Sense-With-Heat-Sink-p-5739.html",
        "addons/114993115.png",
        "5MP camera module with aluminum heat sink for vision projects",
        "https://wiki.seeedstudio.com/xiao_esp32s3_camera_usage/",
      ),
      product(
        "2.4GHz Rod Antenna for XIAO",
        "https://www.seeedstudio.com/2-4GHz-2-81dBi-Antenna-for-XIAO-ESP32C3-p-5475.html",
        "addons/103990623.png",
        "2.81dBi rod antenna boosting 2.4GHz wireless range",
      ),
      product(
        "COB LED Driver Board for Seeed Studio XIAO",
        "https://www.seeedstudio.com/COB-LED-Driver-Board-for-Seeed-Studio-XIAO-p-6602.html",
        "addons/100079172.jpg",
        "Chip-on-board LED driver for bright, efficient lighting",
        "https://wiki.seeedstudio.com/getting_started_with_cob_led_dirver_board/",
      ),
      product(
        "6x10 RGB WS2812 Matrix for XIAO",
        "https://www.seeedstudio.com/6x10-RGB-MATRIX-for-XIAO-p-5771.html",
        "addons/104030107.png",
        "60-pixel addressable RGB matrix for scrolling text and art",
        "https://wiki.seeedstudio.com/rgb_matrix_for_xiao/",
      ),
      product(
        "XIAO Starter Kit",
        "https://www.seeedstudio.com/Seeed-XIAO-Starter-Kit-p-5378.html",
        "addons/110010044.png",
        "Grove starter kit bundled with XIAO quick-start courses",
        "https://wiki.seeedstudio.com/XIAO-Kit-Courses/",
      ),
      product(
        "ePaper Driver Board for XIAO",
        "https://www.seeedstudio.com/ePaper-breakout-Board-for-XIAO-V2-p-6374.html",
        "addons/114993558.jpg",
        "E-paper driver board for XIAO-powered low-power displays",
        "https://wiki.seeedstudio.com/xiao_eink_expansion_board_v2/",
      ),
      product(
        "1-Channel Relay for XIAO",
        "https://www.seeedstudio.com/Relay-add-on-module-for-XIAO-p-6310.html",
        "addons/114993555.png",
        "Single-channel relay module for switching external loads",
        "https://wiki.seeedstudio.com/relay_add_on_module_for_xiao/",
      ),
      product(
        "Bus Servo Driver Board for XIAO",
        "https://www.seeedstudio.com/Bus-Servo-Driver-Board-for-XIAO-p-6413.html",
        "addons/105990190.jpg",
        "Serial bus servo driver board for robotics builds",
        "https://wiki.seeedstudio.com/bus_servo_driver_board/",
      ),
      product(
        "RS485 Breakout Board for XIAO",
        "https://www.seeedstudio.com/RS485-Breakout-Board-for-XIAO-p-6306.html",
        "addons/113991354.jpg",
        "RS485 transceiver breakout for long-range serial links",
        "https://wiki.seeedstudio.com/XIAO-RS485-Expansion-Board/",
      ),
      product(
        "7-Pin Male Header for XIAO (5 pcs)",
        "https://www.seeedstudio.com/XIAO-Series-7-Pin-Male-Header-5-pcs-p-5460.html",
        "addons/102010490.png",
        "Solder-friendly 7-pin male headers for all XIAO boards",
      ),
      product(
        "2.4GHz FPC Antenna(1.86dBi) for XIAO nRF54L15",
        "https://www.seeedstudio.com/2-4GHz-FPC-Antenna-1-16dBi-for-XIAO-ESP32S3-p-6440.html",
        "addons/100039813.png",
        "Flexible IPEX antenna for compact 2.4GHz designs",
      ),
      product(
        "Aluminum Heat Sink for XIAO (2pcs)",
        "https://www.seeedstudio.com/Aluminum-Heat-Sink-For-XIAO-2pcs-p-5972.html",
        "addons/114010001.jpg",
        "Aluminum heat sinks keeping XIAO cool under heavy loads",
        "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
      ),
      product(
        "Acrylic Case for XIAO Expansion Base",
        "https://www.seeedstudio.com/XIAO-p-4812.html",
        "addons/110010024.png",
        "Transparent acrylic enclosure for the XIAO expansion base",
      ),
      product(
        "XIAO Machine Learning Practical Class Kit",
        "https://www.seeedstudio.com/Machine-Learning-Practical-Class-Kit-p-5951.html",
        "addons/110992064.png",
        "Classroom kit with lessons for hands-on machine learning",
      ),
      product(
        "XIAO IMU(LSM6DS3) Kit",
        "https://www.seeedstudio.com/The-XIAOML-Kit.html",
        "addons/102991955.jpg",
        "The XIAOML Kit: XIAO ESP32S3 Sense with 6-axis IMU and OLED",
        "https://mlsysbook.ai/kits/contents/seeed/xiao_esp32s3/xiao_esp32s3.html",
      ),
    ],
  },
  {
    id: "gadgets",
    label: "XIAO Gadgets",
    labelEn: "XIAO Gadgets",
    labelZh: "XIAO 智能设备",
    // Gadgets are a single flat family — no second-level grouping.
    // Gadgets 为单一大家族平铺展示，不再二次分类。
    items: [
      product(
        "XIAO 1.47'' IPS Touch Display(ESP32-S3)",
        "https://www.seeedstudio.com/1-47-Inch-Touch-Display-Powered-by-XIAO-ESP32-S3-Plus-p-6996.html",
        "gadgets/100069905.jpg",
        "1.47-inch round IPS touch display powered by XIAO ESP32-S3 Plus",
        "https://wiki.seeedstudio.com/getting_started_1.47_inch_touch_display_esp32s3/",
      ),
      product(
        "XIAO 1.47'' IPS Touch Display(nRF52840)",
        "https://www.seeedstudio.com/1-47-Inch-Touch-Display-Powered-by-XIAO-nRF52840-Plus-p-6995.html",
        "gadgets/100004242.jpg",
        "1.47-inch round IPS touch display powered by XIAO nRF52840 Plus",
        "https://wiki.seeedstudio.com/getting_started_1.47_inch_touch_display_nrf52840/",
      ),
      product(
        "XIAO 60GHz mmWave Human Breathing and Heartbeat Sensor -MR60BHA2",
        "https://www.seeedstudio.com/MR60BHA2-60GHz-mmWave-Sensor-Breathing-and-Heartbeat-Module-p-5945.html",
        "gadgets/114993387.jpg",
        "60GHz mmWave sensor that tracks breathing and heartbeat without contact",
        "https://wiki.seeedstudio.com/getting_started_with_mr60bha2_mmwave_kit/",
      ),
      product(
        "XIAO Smart IR Mate",
        "https://www.seeedstudio.com/XIAO-Smart-IR-Mate-p-6492.html",
        "gadgets/109990586.png",
        "Smart IR remote mate that learns and replays appliance commands",
        "https://wiki.seeedstudio.com/XIAO_IR_Mate_Smart_IR_Remote/",
      ),
      product(
        "XIAO 1.14'' IPS Display(ESP32-S3)",
        "https://www.seeedstudio.com/1-14-Inch-Display-Powered-by-XIAO-ESP32-S3-Plus-p-6991.html",
        "gadgets/100086099.jpg",
        "1.14-inch IPS display module powered by XIAO ESP32-S3 Plus",
        "https://wiki.seeedstudio.com/getting_started_1.14_inch_display_esp32s3/",
      ),
      product(
        "XIAO Vision AI Camera",
        "https://www.seeedstudio.com/XIAO-Vision-AI-Camera-p-6450.html",
        "gadgets/104990982.jpg",
        "Ready-to-use vision AI camera with RS485 chaining support",
        "https://wiki.seeedstudio.com/grove_vision_ai_v2/",
      ),
      product(
        "XIAO 6-Channel Wi-Fi 5V DC Relay",
        "https://www.seeedstudio.com/6-Channel-Wi-Fi-5V-DC-Relay-p-6373.html",
        "gadgets/114993588.jpg",
        "Six-channel Wi-Fi controlled 5V DC relay board",
        "https://wiki.seeedstudio.com/6_channel_wifi_relay/",
      ),
      product(
        "XIAO W5500 Ethernet Adapter",
        "https://www.seeedstudio.com/XIAO-W5500-Ethernet-Adapter-p-6472.html",
        "gadgets/113100042.jpg",
        "Wired Ethernet adapter with PoE, built on XIAO ESP32-S3 Plus",
        "https://wiki.seeedstudio.com/xiao_w5500_ethernet_adapter/",
      ),
      product(
        "XIAO Soil Sensor",
        "https://www.seeedstudio.com/XIAO-Soil-Sensor-p-6452.html",
        "gadgets/114993632.jpg",
        "Calibrated soil moisture and temperature sensor",
        "https://wiki.seeedstudio.com/xiao_soil_moisture_sensor/",
      ),
      product(
        "XIAO 60GHz mmWave Human Fall Detection Sensor-MR60FDA2",
        "https://www.seeedstudio.com/MR60FDA2-60GHz-mmWave-Sensor-Fall-Detection-Module-p-5946.html",
        "gadgets/114993388.jpg",
        "60GHz mmWave sensor that detects human falls without cameras",
        "https://wiki.seeedstudio.com/getting_started_with_mr60fda2_mmwave_kit/",
      ),
      product(
        "XIAO 0.96'' IPS Display(ESP32-S3)",
        "https://www.seeedstudio.com/0-96-Inch-Display-Powered-by-XIAO-ESP32-S3-Plus-p-6993.html",
        "gadgets/100037468.jpg",
        "0.96-inch IPS display module powered by XIAO ESP32-S3 Plus",
        "https://wiki.seeedstudio.com/getting_started_0.96_inch_display_esp32s3/",
      ),
      product(
        "Seeed Studio XIAO Debug Mate",
        "https://www.seeedstudio.com/Seeed-Studio-XIAO-Debug-Mate-p-6588.html",
        "gadgets/109990585.jpg",
        "USB-C debugging probe with DAPLink firmware for XIAO projects",
        "https://wiki.seeedstudio.com/getting_started_with_xiao_debug_mate/",
      ),
      product(
        "XIAO 1.14'' IPS Display(nRF52840)",
        "https://www.seeedstudio.com/1-14-Inch-Display-Powered-by-XIAO-nRF52840-Plus-p-6994.html",
        "gadgets/100069374.jpg",
        "1.14-inch IPS display module powered by XIAO nRF52840 Plus",
        "https://wiki.seeedstudio.com/getting_started_1.14_inch_display_nrf52840/",
      ),
      product(
        "XIAO MIDI Synthesizer",
        "https://www.seeedstudio.com/XIAO-MIDI-Synthesizer-p-6462.html",
        "gadgets/107990333.jpg",
        "Pocket MIDI synthesizer with built-in speaker and keys",
        "https://wiki.seeedstudio.com/xiao_midi_synthesizer/",
      ),
      product(
        "XIAO 2-Channel Wi-Fi AC Relay",
        "https://www.seeedstudio.com/Dual-Smart-Relay-Module-for-XIAO-p-6309.html",
        "gadgets/114993526.png",
        "Two-channel Wi-Fi AC relay for smart home switching",
        "https://wiki.seeedstudio.com/2_channel_wifi_ac_relay/",
      ),
      product(
        "XIAO 0.96'' IPS Display(nRF52840)",
        "https://www.seeedstudio.com/0-96-Inch-Display-Powered-by-XIAO-nRF52840-Plus-p-6992.html",
        "gadgets/100063377.jpg",
        "0.96-inch IPS display module powered by XIAO nRF52840 Plus",
        "https://wiki.seeedstudio.com/getting_started_0.96_inch_display_nrf52840/",
      ),
      product(
        "XIAO Bus Servo Adapter",
        "https://www.seeedstudio.com/XIAO-Bus-Servo-Adapter-for-XIAO-p-6397.html",
        "gadgets/114993612.jpg",
        "Bus servo adapter that drives LX-style serial servos from XIAO",
        "https://wiki.seeedstudio.com/xiao_bus_servo_adapter/",
      ),
      product(
        "XIAO 2-Channel AC Wi-Fi Energy Meter",
        "https://www.seeedstudio.com/XIAO-2-Channel-Wi-Fi-AC-Energy-Meter-Bundle-Kit.html",
        "gadgets/114993611.jpg",
        "Two-channel AC energy meter with clamp-on CT sensors",
        "https://wiki.seeedstudio.com/2_channel_wifi_ac_energy_meter/",
      ),
    ],
  },
];
