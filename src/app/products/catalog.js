const image = (path) => `/xiao-products/${path}`;

const product = (title, link, img, descEn = "") => ({
  title,
  link,
  img: image(img),
  desc: descEn,
  descEn,
});

const group = (id, labelEn, items) => ({ id, label: labelEn, labelEn, items });

// Product names, grouping and destinations supplied for the XIAO product page.
// Images are local static assets from /picture, organized by the same category.
export const PRODUCT_CATALOG = [
  {
    id: "dev-boards",
    label: "XIAO Dev Boards in a Glimpse",
    labelEn: "XIAO Dev Boards in a Glimpse",
    subcategories: [
      group("esp32", "Espressif ESP32 Series", [
        product("XIAO ESP32-C3", "https://www.seeedstudio.com/Seeed-XIAO-ESP32C3-p-5431.html", "dev_boards/XIAO落地页素材-19-1536x1257.jpg", "Cost effective with Wi-Fi and BLE on board"),
        product("XIAO ESP32-S3", "https://www.seeedstudio.com/XIAO-ESP32S3-p-5627.html", "dev_boards/XIAO落地页素材-20-1536x1257.jpg", "High-performance dev board with Wi-Fi and BLE"),
        product("XIAO ESP32-S3 Sense", "https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html", "dev_boards/XIAO落地页素材-21-1536x1257.jpg", "Mini camera perfect for computer vision"),
        product("XIAO ESP32-C6", "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html", "dev_boards/Group-43-1536x1256.webp", "2.4GHz Wi-Fi 6, BLE 5.0, Zigbee, and Thread for Matter"),
        product("XIAO ESP32-C5", "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C5-p-6609.html", "dev_boards/XIAO-ESP32-C5-Bazaar-1536x1256.jpg", "2.4 & 5 GHz Wi-Fi 6, BLE 5.0, Zigbee, and Thread for Matter"),
      ]),
      group("nrf52", "Nordic nRF52 Series", [
        product("XIAO nRF52840", "https://www.seeedstudio.com/Seeed-XIAO-BLE-nRF52840-p-5201.html", "dev_boards/Group-42-1536x1256.webp", "Ultra-low power consumption, perfect for BLE applications"),
        product("XIAO nRF52840 Sense", "https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html", "dev_boards/XIAO落地页素材-04-1536x1257.jpg", "Low power BLE with onboard microphone and 6-axis IMU"),
      ]),
      group("nrf54", "Nordic nRF54 Series", [
        product("XIAO nRF54L15", "https://www.seeedstudio.com/XIAO-nRF54L15-p-6493.html", "dev_boards/Group-12.webp", "Ultra low power consumption with multiple connectivity"),
        product("XIAO nRF54L15 Sense", "https://www.seeedstudio.com/XIAO-nRF54L15-Sense-p-6494.html", "dev_boards/nRF54L15-Sense-1536x1256.jpg", "Ultra low power consumption with multiple connectivity and onboard sensors"),
        product("XIAO nRF54LM20A", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-p-6841.html", "dev_boards/Group-47-1536x1256.webp", "Ultra low power, larger memory capacity and expanded IO"),
        product("XIAO nRF54LM20A Sense", "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-Sense-p-6840.html", "dev_boards/Group-48-1536x1256.jpg", "Ultra low power, larger memory and expanded IO, paired with onboard sensors"),
      ]),
      group("rp", "Raspberry Pi RP Series", [
        product("XIAO RP2040", "https://www.seeedstudio.com/XIAO-RP2040-v1-0-p-5026.html", "dev_boards/XIAO落地页素材-05-1536x1257.jpg", "Raspberry Pi Ecosystem with great MicroPython support"),
        product("XIAO RP2350", "https://www.seeedstudio.com/Seeed-XIAO-RP2350-p-5944.html", "dev_boards/XIAO-RP2350-2-1536x1245.webp", "MicroPython-ready based on Raspberry Pi RP2350"),
      ]),
      group("mg", "Silicon Labs MG Series", [
        product("XIAO MG24", "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-p-6247.html", "dev_boards/XIAO-MG24-1536x1256.webp", "Super-low power for battery-powered Matter projects"),
        product("XIAO MG24 Sense", "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-Sense-p-6248.html", "dev_boards/MG24-Sense-1536x1256.webp", "Super-low power board with microphone & 6-axis IMU"),
      ]),
      group("samd", "Microchip SAMD Series", [
        product("XIAO SAMD21", "https://www.seeedstudio.com/Seeeduino-XIAO-Arduino-Microcontroller-SAMD21-Cortex-M0+-p-4426.html", "dev_boards/samd21-front.webp", "Classic for Arduino beginners, with courses"),
      ]),
      group("ra", "Renesas RA Series", [
        product("XIAO RA4M1", "https://www.seeedstudio.com/Seeed-XIAO-RA4M1-p-5943.html", "dev_boards/XIAO-RA4M1-1536x1258.webp", "Renesas 32-bit ARM Cortex-M4 MCU, Arduino IDE-ready"),
      ]),
    ],
  },
  {
    id: "addons",
    label: "XIAO Add-ons",
    labelEn: "XIAO Add-ons",
    subcategories: [
      group("expansion", "Expansion", [
        product("Seeed Studio XIAO Debug Mate", "https://www.seeedstudio.com/Seeed-Studio-XIAO-Debug-Mate-p-6588.html", "addons/Expansion/1-xiao-debugger.jpg"),
        product("Seeed Studio XIAO Expansion Board", "https://www.seeedstudio.com/Seeeduino-XIAO-Expansion-board-p-4746.html", "addons/Expansion/zheng1.jpg"),
        product("Grove Shield For Seeed Studio XIAO", "https://www.seeedstudio.com/Grove-Shield-for-Seeeduino-XIAO-p-4621.html", "addons/Expansion/Grove-Base-for-XIAO.webp"),
        product("XIAO PowerBread, a Breadboard Power Supply and Meter", "https://www.seeedstudio.com/XIAO-PowerBread-p-6318.html", "addons/Expansion/1-114993507-xiao-powerbread-45font.jpg"),
        product("Seeed Studio Grove Modules", "https://www.seeedstudio.com/category/Grove-c-1003.html", "addons/Expansion/Our-Initiative.jpg"),
      ]),
      group("sensors", "Sensors", [
        product("Grove Vision AI Module V2 with Camera", "https://www.seeedstudio.com/Grove-Vision-AI-V2-Kit-p-5852.html", "addons/sensors/image.jpeg"),
        product("mmWave Human Presence Sensor", "https://www.seeedstudio.com/Seeed-Studio-24GHz-mmWave-for-XIAO-p-5830.html", "addons/sensors/24GHz-mmWave-Sensor-for-XIAO.webp"),
        product("Grove Smart IR Gesture Sensor", "https://www.seeedstudio.com/Grove-Smart-IR-Gesture-Sensor-p-5721.html", "addons/sensors/1-101991067-grove---smart-ir-gesture-sensor-45font.jpg"),
        product("reSpeaker Lite 2-Mic Array", "https://www.seeedstudio.com/ReSpeaker-Lite-Voice-Assistant-Kit-Full-Kit-of-2-Mic-Array-pre-soldered-XIAO-ESP32S3-Mono-Enclosed-Speaker-and-Enclosure.html", "addons/sensors/reSpeaker-USB-2-Mic-Array-1536x1160.webp"),
        product("Quectel L76K GNSS Add-On", "https://www.seeedstudio.com/L76K-GNSS-Module-for-Seeed-Studio-XIAO-p-5864.html", "addons/sensors/7-l76k-gnss-module-for-seeed-studio-xiao-feature.jpg"),
        product("XIAO Logger HAT (Temp, Hum & Light)", "https://www.seeedstudio.com/XIAO-LOG-p-6341.html", "addons/sensors/1-114993446-xiao-log-45font.jpg"),
        product("Grove Bundle Monitoring Kit for ESPHome", "https://www.seeedstudio.com/Grove-Bundle-Kit-for-ESPHOME-p-5509.html", "addons/sensors/esphome-bundle-kit0000_1.jpg"),
        product("Sound Event Detection Module D1 - Sensor/Audio Board", "https://www.seeedstudio.com/Sound-Event-Detection-Module-D1-p-6652.html", "addons/sensors/sound_event_detection_module_d1.jpg"),
      ]),
      group("connectivity", "Connectivity", [
        product("Wi-Fi HaLow Module for XIAO", "https://www.seeedstudio.com/Wio-WM6180-Wi-Fi-Halow-Module-for-XIAO-p-6395.html", "addons/connectivity/1-109100041-wio-wm6180-wifi-module-for-xiao.jpg"),
        product("Wio-SX1262 LoRa Add-on for XIAO", "https://www.seeedstudio.com/Wio-SX1262-for-XIAO-p-6379.html", "addons/connectivity/1-113010003-wio-sx1262-for-xiao.jpg"),
        product("CAN BUS Breakout Board for XIAO", "https://www.seeedstudio.com/Seeed-Studio-CAN-Bus-Breakout-Board-for-XIAO-and-QT-Py-p-5702.html", "addons/connectivity/1-seeed-can-bus-breakout-board-45font.jpg"),
        product("RS-485 Breakout Board for XIAO", "https://www.seeedstudio.com/RS485-Breakout-Board-for-XIAO-p-6306.html", "addons/connectivity/1-113991354-rs485-breakout-board-for-xiao.jpg"),
        product("SenseCAP S2110 LoRaWAN Sensor Kit", "https://www.seeedstudio.com/sensecap-outdoor-lorawan-sensor-kit-based-on-grove-p-5503.html", "addons/connectivity/1-e22011019-sensecap-s2110-lorawan-sensor-kit-first_1_.jpg"),
      ]),
      group("actuators", "Actuators", [
        product("COB LED DIY Kit for XIAO", "https://www.seeedstudio.com/COB-LED-DIY-Kit-for-Seeed-Studio-XIAO.html", "addons/actuators/1_80_21.webp"),
        product("LED Driver Board for XIAO", "https://www.seeedstudio.com/LED-Driver-Board-for-Seeed-Studio-XIAO-p-6451.html", "addons/actuators/1-6x10-rgb-matrix-for-xiao-45font_1.jpg"),
        product("Bus Servo Driver Board for XIAO", "https://www.seeedstudio.com/Bus-Servo-Driver-Board-for-XIAO-p-6413.html", "addons/actuators/1-105990190-bus-servo-driver-board-for-xiao.jpg"),
        product("1-Channel Relay for XIAO", "https://www.seeedstudio.com/Relay-add-on-module-for-XIAO-p-6310.html", "addons/actuators/1-114993555-relay-add-on-module-for-xiao-45font.jpg"),
        product("6x10 RGB WS2812B Matrix For XIAO", "https://www.seeedstudio.com/6x10-RGB-MATRIX-for-XIAO-p-5771.html", "addons/actuators/1-6x10-rgb-matrix-for-xiao-45font_1.jpg"),
        product("1.28'' Round Display for XIAO", "https://www.seeedstudio.com/Seeed-Studio-Round-Display-for-XIAO-p-5638.html", "addons/actuators/1-104030087-seeed-studio-round-display-for-xiao-45font.jpg"),
        product("ePaper Driver Board for XIAO", "https://www.seeedstudio.com/ePaper-breakout-Board-for-XIAO-V2-p-6374.html", "addons/actuators/1-114993558-epaper-driver-board-for-xiao.jpg"),
        product("E-Paper Breakout Board", "https://www.seeedstudio.com/ePaper-Breakout-Board-p-5804.html", "addons/actuators/4-105990172-epaper-breakout-board-45back.jpg"),
        product('2.9" 4-Color ePaper Display, 128x296 Pixels', "https://www.seeedstudio.com/2-9-Quadruple-Color-ePaper-Display-with-128x296-Pixels-p-5783.html", "addons/actuators/1-308030049-eink-2.9-quadruple-color-epaper-display-with-296x128-pixels-45font.jpg"),
        product('4.2" Monochrome ePaper Display, 400x300 Pixels', "https://www.seeedstudio.com/4-2-Monochrome-ePaper-Display-with-400x300-Pixels-p-5784.html", "addons/actuators/1-104990857-4.2-monochrome-epaper-display-with-400x300-pixels-45font.jpg"),
      ]),
      group("accessories", "Accessories", [
        product("7-pin male header for Seeed Studio XIAO", "https://www.seeedstudio.com/XIAO-Series-7-Pin-Male-Header-5-pcs-p-5460.html", "addons/accessories/102010490_front-05.jpg"),
        product("2.4GHz FPC Antenna (1.16dBi) for XIAO ESP32-S3", "https://www.seeedstudio.com/2-4GHz-FPC-Antenna-1-16dBi-for-XIAO-ESP32S3-p-6440.html", "addons/accessories/1-318020968-external-antenna-2.4ghz-1.65dbi_ipex-1.jpg"),
        product("2.4GHz FPC Antenna (2.9dBi) for XIAO ESP32-C3", "https://www.seeedstudio.com/2-4GHz-FPC-Antenna-2-9dBi-for-XIAO-ESP32C3-p-6439.html", "addons/accessories/1-318020748-external-antenna-2.4ghz-2.90dbi_ipex-1.jpg"),
        product("2.4GHz Rod Antenna for XIAO ESP32C3", "https://www.seeedstudio.com/2-4GHz-2-81dBi-Antenna-for-XIAO-ESP32C3-p-5475.html", "addons/accessories/1-103990623-2.4ghz-rod-antenna-for-xiao-esp32c3-45font.jpg"),
        product("Aluminum Heat Sink For XIAO ESP32S3 Sense (2 Pcs)", "https://www.seeedstudio.com/Aluminum-Heat-Sink-For-XIAO-2pcs-p-5972.html", "addons/accessories/1-114010001-aluminum-heat-sink-for-xiao-_2pcs_-.jpg"),
        product("OV5640 Camera for XIAO ESP32S3 Sense", "https://www.seeedstudio.com/OV5640-Camera-for-XIAO-ESP32S3-Sense-With-Heat-Sink-p-5739.html", "addons/accessories/1-114993115-ov5640-camera-for-xiao-esp32s3-sense-_with-heat-sink_-45font.jpg"),
        product("Micro SD Card Tool Kit for XIAO ESP32S3 Sense", "https://www.seeedstudio.com/Micro-SD-Card-Tool-Kit-p-5772.html", "addons/accessories/1-110991944-micro-sd-card-tool-kit-45font.jpg"),
        product("Acrylic Case for Seeed Studio XIAO Expansion Board", "https://www.seeedstudio.com/XIAO-p-4812.html", "addons/accessories/110010024_preview-08.webp"),
      ]),
      group("kits", "Kits", [
        product("The XIAOML Kit", "https://www.seeedstudio.com/The-XIAOML-Kit.html", "addons/kits/0-102991955-the-xiaoml-kit_3.jpg"),
        product("Vibration Anomaly Detection Kit for XIAO ESP32-S3", "https://www.seeedstudio.com/Vibration-Anomaly-Detection-Kit-for-XIAO-ESP32-S3.html", "addons/kits/4-e25072201-vibration-anomaly-detection-kit-for-xiao-esp32-s3.jpg"),
        product("Seeed Studio XIAO Machine Learning Practical Class Kit", "https://www.seeedstudio.com/Machine-Learning-Practical-Class-Kit-p-5951.html", "addons/kits/3-110992064-machine-learning-practical-class-kit-all.jpg"),
        product("Grove Starter Kit For Seeed Studio XIAO", "https://www.seeedstudio.com/Seeed-XIAO-Starter-Kit-p-5378.html", "addons/kits/seeed_studio_xiao_starter_kit_-_all_seeed_studio_xiao_series_deve_after_1_.jpg"),
      ]),
    ],
  },
  {
    id: "gadgets",
    label: "XIAO Gadgets",
    labelEn: "XIAO Gadgets",
    subcategories: [
      group("home-automation", "Home Automation", [
        product("XIAO Soil Moisture Sensor", "https://www.seeedstudio.com/XIAO-Soil-Sensor-p-6452.html", "gadgets/Home_Automation/1-114993632-seeed-studio-xiao-soil-sensor-1.jpg"),
        product("XIAO Smart IR Mate", "https://www.seeedstudio.com/XIAO-Smart-IR-Mate-p-6492.html", "gadgets/Home_Automation/109_2x-1536x1152.webp"),
        product("XIAO 2-Channel Wi-Fi AC Energy Meter w/ CTs", "https://www.seeedstudio.com/XIAO-2-Channel-Wi-Fi-AC-Energy-Meter-Bundle-Kit.html", "gadgets/Home_Automation/1-114993611-xiao-2-channel-wi-fi-ac-energy-meter_1.jpg"),
        product('XIAO 7.5" ePaper Panel', "https://www.seeedstudio.com/XIAO-7-5-ePaper-Panel-p-6416.html", "gadgets/Home_Automation/1-114993635-xiao-7.5-epaper-panel.jpg"),
        product("XIAO 6-Channel Wi-Fi 5V DC Relay", "https://www.seeedstudio.com/6-Channel-Wi-Fi-5V-DC-Relay-p-6373.html", "gadgets/Home_Automation/1-114993588-6-ch-relay-sensor.jpg"),
      ]),
      group("vision-ai-agent", "Vision AI & AI Agent", [
        product("XIAO Vision AI Camera", "https://www.seeedstudio.com/XIAO-Vision-AI-Camera-p-6450.html", "gadgets/Vision_Al_Al_Agent/1-104990982-xiao-vision-ai-camera.jpg"),
        product("SenseCAP Watcher, Physical AI Agent", "https://www.seeedstudio.com/SenseCAP-Watcher-W1-A-p-5979.html", "gadgets/Vision_Al_Al_Agent/SenseCAP-Watcher-Deployed-in-an-Office_副本2-1-1024x709.jpg"),
        product("OpenUC2 10x AI Microscope", "https://www.seeedstudio.com/XIAO-Microscope-p-5971.html", "gadgets/Vision_Al_Al_Agent/1-114993409-xiao-microscope.jpg"),
      ]),
      group("maker", "Maker", [
        product("XIAO W5500 Ethernet Adapter", "https://www.seeedstudio.com/XIAO-W5500-Ethernet-Adapter-p-6472.html", "gadgets/Home_Automation/3-1024x768.jpg"),
        product("XIAO Bus Servo Adapter", "https://www.seeedstudio.com/XIAO-Bus-Servo-Adapter-for-XIAO-p-6397.html", "addons/actuators/1-105990190-bus-servo-driver-board-for-xiao.jpg"),
        product("XIAO MIDI Synthesizer", "https://www.seeedstudio.com/XIAO-MIDI-Synthesizer-p-6462.html", "gadgets/Home_Automation/Seeed-Studio-IoT-Button.webp"),
        product("1-Channel LoRaWAN Gateway / Meshtastic Node", "https://www.seeedstudio.com/XIAO-ESP32S3-for-Meshtastic-LoRa-with-3D-Printed-Enclosure-p-6314.html", "addons/connectivity/1-113010003-wio-sx1262-for-xiao.jpg"),
        product("SenseCAP S2110 Sensor Builder", "https://www.seeedstudio.com/SenseCAP-XIAO-LoRaWAN-Controller-p-5474.html", "addons/connectivity/1-e22011019-sensecap-s2110-lorawan-sensor-kit-first_1_.jpg"),
      ]),
    ],
  },
];
