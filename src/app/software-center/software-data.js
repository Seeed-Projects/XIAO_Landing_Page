// 自动从 wiki xiao_topic_page 解析生成，内容为 wiki 真实数据（软件 + 支持板卡 + 链接），非自编。

// 把名称转为 url slug
export function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 扁平化所有软件项，附带 slug 与所属分类，供 logo 墙与详情页查找
export function flattenSoftware() {
  const out = [];
  for (const cat of SOFTWARE_CATEGORIES) {
    for (const item of cat.items) {
      out.push({
        slug: slugify(item.name),
        category: { id: cat.id, title: cat.title },
        ...item,
      });
    }
  }
  return out;
}

// wiki 解析出的 logo 字段缺少文件扩展名，CDN 会 403；这里只对 seeed wiki 路径补 .png，其他 CDN（simpleicons 等）原样返回
export function logoSrc(url) {
  if (!url) return "";
  if (/\.(png|svg|jpe?g|webp|gif|bmp|ico)$/i.test(url)) return url;
  if (url.includes("files.seeedstudio.com/wiki/")) return `${url}.png`;
  return url;
}

// 所有带 logo 的软件项（去重），用于 logo 墙
export function logoWallItems() {
  const seen = new Set();
  const out = [];
  for (const flat of flattenSoftware()) {
    if (flat.logo && !seen.has(flat.logo)) {
      seen.add(flat.logo);
      out.push(flat);
    }
  }
  return out;
}

// 按 slug 查找单个软件项
export function findSoftwareBySlug(slug) {
  return flattenSoftware().find((s) => s.slug === slug) ?? null;
}

export const SOFTWARE_CATEGORIES = [
  {
    "id": "official",
    "title": "官方软件",
    "desc": "Seeed 官方维护的 XIAO 软件、组件与方案（来自 Seeed-Projects）。",
    "items": [
      {
        "name": "Seeed Home Assistant Discovery",
        "url": "https://github.com/Seeed-Projects/Seeed-Homeassistant-Discovery",
        "desc": "让 ESP32 设备一键接入 Home Assistant 的官方方案，由 Seeed Studio 提供。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32 系列", "url": "" }]
      },
      {
        "name": "ESPHome for XIAO ESP32S3",
        "url": "https://github.com/Seeed-Projects/ESPHome_XIAO-ESP32S3",
        "desc": "XIAO ESP32S3 的 ESPHome 官方自定义组件。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32S3", "url": "" }]
      },
      {
        "name": "L76K GNSS for XIAO",
        "url": "https://github.com/Seeed-Projects/Seeed_L76K-GNSS_for_XIAO",
        "desc": "XIAO 配套 L76K GNSS 模块的官方驱动与示例。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32 系列", "url": "" }]
      },
      {
        "name": "ESP-FLY 四旋翼套件",
        "url": "https://github.com/Seeed-Projects/Co-Create_ESP-FLY",
        "desc": "ESP-FLY DIY 四旋翼飞行器的官方软件与套件。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32S3", "url": "" }]
      },
      {
        "name": "6 通道继电器 (XIAO ESP32C6)",
        "url": "https://github.com/Seeed-Projects/6-Channel_Relay_based_on_XIAO_ESP32C6",
        "desc": "基于 XIAO ESP32C6 的 6 通道继电器官方软件。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32C6", "url": "" }]
      },
      {
        "name": "2 通道电能计 (XIAO ESP32C6)",
        "url": "https://github.com/Seeed-Projects/2-Channel_Energy_Meter_based_on_XIAO_ESP32C6",
        "desc": "基于 XIAO ESP32C6 的双通道电能计量官方软件。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO ESP32C6", "url": "" }]
      },
      {
        "name": "XIAO W5500 以太网示例",
        "url": "https://github.com/Seeed-Projects/XIAO_W5500_Ehernet_Adapter_Example",
        "desc": "XIAO 接 W5500 以太网模块的官方示例软件。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO 系列", "url": "" }]
      },
      {
        "name": "Seeed TFT_eSPI 库",
        "url": "https://github.com/Seeed-Projects/SeeedStudio_TFT_eSPI",
        "desc": "Seeed 优化的 TFT 显示驱动库，兼容 Arduino / PlatformIO。",
        "logo": "https://media-cdn.seeedstudio.com/media/logo/stores/4/logo_2018_horizontal.png",
        "boards": [{ "name": "XIAO 系列", "url": "" }]
      }
    ]
  },
  {
    "id": "guides",
    "title": "产品指南",
    "desc": "XIAO 各板卡的入门、引脚与外设 Wiki 指南。",
    "items": [
      {
        "name": "XIAO SAMD21",
        "url": "",
        "desc": "Getting Started WiKi Pin Usage Single Cycle IOBUS by @nanase_coder",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started WiKi",
            "url": "https://wiki.seeedstudio.com/Seeeduino-XIAO/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/Seeeduino-XIAO-by-Nanase/"
          },
          {
            "name": "Single Cycle IOBUS",
            "url": "https://wiki.seeedstudio.com/Seeeduino-XIAO-by-Nanase/"
          },
          {
            "name": "@nanase_coder",
            "url": "https://twitter.com/nanase_coder"
          }
        ]
      },
      {
        "name": "XIAO RP2040",
        "url": "",
        "desc": "Getting Started WiKi Pin Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started WiKi",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-with-Arduino/#getting-started"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-with-Arduino/#pin-multuiplexing-on-the-seeed-studio-xiao-rp2040"
          }
        ]
      },
      {
        "name": "XIAO nRF52840 (Sense)",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage 6-Axis IMU Usage PDM Usage QSPI Flash NFC Usage Bluetooth Lib (Seeed nRF52) Bluetooth Lib (Seeed nRF52 mbed)",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/XIAO_BLE/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/"
          },
          {
            "name": "6-Axis IMU Usage",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-IMU-Usage/"
          },
          {
            "name": "PDM Usage",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-PDM-Usage/"
          },
          {
            "name": "QSPI Flash",
            "url": "https://wiki.seeedstudio.com/xiao-ble-qspi-flash-usage/"
          },
          {
            "name": "NFC Usage",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-NFC-Usage/"
          },
          {
            "name": "Bluetooth Lib (Seeed nRF52)",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Bluetooth_Usage/"
          },
          {
            "name": "Bluetooth Lib (Seeed nRF52 mbed)",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Bluetooth-Usage/"
          }
        ]
      },
      {
        "name": "XIAO ESP32C3",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Wi-Fi Usage Bluetooth Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32C3_Pin_Multiplexing/"
          },
          {
            "name": "Wi-Fi Usage",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32C3_WiFi_Usage/"
          },
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32C3_Bluetooth_Usage/"
          }
        ]
      },
      {
        "name": "XIAO ESP32S3 (Sense)",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Wi-Fi Usage Bluetooth Usage Sleep Modes Microphone Usage Camera Usage MicroSD Card",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_pin_multiplexing/"
          },
          {
            "name": "Wi-Fi Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_wifi_usage/"
          },
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_bluetooth/"
          },
          {
            "name": "Sleep Modes",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32S3_Consumption/"
          },
          {
            "name": "Microphone Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_sense_mic/"
          },
          {
            "name": "Camera Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_camera_usage/"
          },
          {
            "name": "MicroSD Card",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_sense_filesystem/"
          }
        ]
      },
      {
        "name": "XIAO ESP32C6",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Wi-Fi Usage Bluetooth Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/xiao_pin_multiplexing_esp32c6/"
          },
          {
            "name": "Wi-Fi Usage",
            "url": "https://wiki.seeedstudio.com/xiao_wifi_usage_esp32c6/"
          },
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_bluetooth/"
          }
        ]
      },
      {
        "name": "XIAO RP2350",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/getting-started-xiao-rp2350/"
          },
          {
            "name": "Pin Usage",
            "url": "\"\""
          }
        ]
      },
      {
        "name": "XIAO RA4M1",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/getting_started_xiao_ra4m1/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/xiao_ra4m1_pin_multiplexing/"
          }
        ]
      },
      {
        "name": "XIAO MG24 (Sense)",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Bluetooth Usage IMU & Microphone Usage",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_getting_started/"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_pin_multiplexing/"
          },
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_bluetooth/"
          }
        ]
      },
      {
        "name": "XIAO nRF54L15 (Sense)",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Bluetooth Usage Power Consumptions",
        "logo": "",
        "boards": [
          {
            "name": "Getting Started Wiki",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started"
          },
          {
            "name": "Pin Usage",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_pin_multiplexing/"
          },
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_bluetooth_usage/"
          },
          {
            "name": "Power Consumptions",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_power_consumptions"
          }
        ]
      },
      {
        "name": "XIAO ESP32C5",
        "url": "",
        "desc": "Getting Started Wiki Pin Usage Bluetooth Usage WiFi Usage WiFi throughput tester ESP-WIFI-MESH",
        "logo": "",
        "boards": [
          {
            "name": "Bluetooth Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_buletooth_usage"
          },
          {
            "name": "WiFi Usage",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_wifi_usage"
          },
          {
            "name": "WiFi throughput tester",
            "url": "https://wiki.seeedstudio.com/xaio_esp32c5_wifi_throughput_tester"
          },
          {
            "name": "ESP-WIFI-MESH",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_esp-mesh_audio"
          }
        ]
      }
    ]
  },
  {
    "id": "languages",
    "title": "开发语言与平台",
    "desc": "XIAO 支持的主流语言与开发框架及可用板卡。",
    "items": [
      {
        "name": "PlatformIO",
        "url": "https://platformio.org/",
        "desc": "the most loved IDE solution for Microsoft Visual Studio Code.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/platformio",
        "boards": [
          {
            "name": "XIAO SAMD21 (Seeeduino XIAO)",
            "url": "https://docs.platformio.org/en/stable/boards/atmelsam/seeed_xiao.html"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_nrf52840_with_platform_io/"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://docs.platformio.org/en/latest/boards/espressif32/seeed_xiao_esp32c3.html"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_with_platform_io/"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://docs.platformio.org/en/latest/boards/espressif32/seeed_xiao_esp32s3.html"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://taunoerik.art/2023/05/15/start-seeed-xiao-rp2040-on-platformio/"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://wiki.seeedstudio.com/xiao_rp2350_with_platform_io/"
          },
          {
            "name": "XIAO MG24 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_with_platform_io/"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://wiki.seeedstudio.com/xiao_ra4m1_with_platform_io/"
          },
          {
            "name": "XIAO nRF54L15 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_with_platform_io"
          },
          {
            "name": "XIAO ESP32C5",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_with_platformio"
          }
        ]
      },
      {
        "name": "MicroPython",
        "url": "https://micropython.org/",
        "desc": "a full implementation of the Python 3 programming language that runs directly on embedded hardware.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/micropython",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://wiki.seeedstudio.com/XIAO-SAMD21-MicroPython/"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-with-MicroPython/"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c3_with_micropython/"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_with_micropython/"
          },
          {
            "name": "XIAO ESP32S3 Sense Only (Camera, Wi-Fi)",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32S3_Micropython/"
          },
          {
            "name": "XIAO nRF52840 Sense",
            "url": "https://micropython.org/download/SEEED_XIAO_NRF52/"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_micropython/"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://micropython.org/download/SEEED_XIAO_RP2350/"
          },
          {
            "name": "XIAO nRF54L15(Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_micropython/"
          },
          {
            "name": "XIAO MG24",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_sense_micropython"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://wiki.seeedstudio.com/xiao_ra4m1_micropython"
          },
          {
            "name": "XIAO ESP32C5",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_with_micropyhton"
          }
        ]
      },
      {
        "name": "CircuitPython",
        "url": "https://circuitpython.org/",
        "desc": "a programming language designed to simplify experimenting and learning to code on low-cost microcontroller boards.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/circuitpython",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://wiki.seeedstudio.com/Seeeduino-XIAO-CircuitPython/"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-with-CircuitPython/"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE_CircutPython/"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c3_with_circuitpython/"
          },
          {
            "name": "XIAO ESP32S3 Sense",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_project_circuitpython/"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_with_circuitpython/"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://circuitpython.org/board/seeeduino_xiao_rp2350/"
          }
        ]
      },
      {
        "name": "Embedded Swift",
        "url": "https://www.swift.org/getting-started/embedded-swift/",
        "desc": "a scalable language, great for writing desktop and mobile apps, server backends, and system software, running on microcontrollers",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/swift",
        "boards": [
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao-esp32-swift/"
          }
        ]
      },
      {
        "name": "Rust",
        "url": "https://www.rust-lang.org/",
        "desc": "a language empowering everyone to build reliable and efficient software.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/rust",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://github.com/atsamd-rs/atsamd/tree/master/boards/xiao_m0"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://tutoduino.fr/en/tutorials/programing-in-rust-the-xiao-rp2040-board/"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://forum.seeedstudio.com/t/rust-on-xiao-esp32s3/276724"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://github.com/Wumpf/Seeed-nRF52840-Sense-projects"
          },
          {
            "name": "XIAO ESP32-C3",
            "url": "https://github.com/uFerris-rs/uferris-bsp/tree/master/examples/xiao-esp32-c3"
          }
        ]
      },
      {
        "name": "TinyGo",
        "url": "https://tinygo.org/",
        "desc": "a Go compiler intended for use in small places such as microcontrollers, WebAssembly (wasm/wasi), and command-line tools.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/tinygo",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://tinygo.org/docs/reference/microcontrollers/xiao/"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://tinygo.org/docs/reference/microcontrollers/xiao-ble/"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://tinygo.org/docs/reference/microcontrollers/xiao-rp2040/"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://tinygo.org/docs/reference/microcontrollers/boards/xiao-rp2350/"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://tinygo.org/docs/reference/microcontrollers/featured/xiao-esp32c3/"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://tinygo.org/docs/reference/microcontrollers/featured/xiao-esp32s3/"
          }
        ]
      },
      {
        "name": "MicroBlocks",
        "url": "https://microblocks.fun/",
        "desc": "a blocks programming language for physical computing inspired by Scratch.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/microblocks",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://wiki.seeedstudio.com/xiao_samd21_microblocks"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/xiao_rp2040_microblocks"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://wiki.seeedstudio.com/xiao_rp2350_microblocks"
          },
          {
            "name": "XIAO nRF52840",
            "url": "https://wiki.seeedstudio.com/xiao_ble_microblocks"
          },
          {
            "name": "XIAO ESP32-C3",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c3_microblocks"
          },
          {
            "name": "XIAO ESP32-S3",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_microblocks"
          }
        ]
      }
    ]
  },
  {
    "id": "rtos",
    "title": "RTOS 支持",
    "desc": "实时操作系统与调度框架及支持板卡。",
    "items": [
      {
        "name": "Zephyr",
        "url": "https://docs.zephyrproject.org/latest/",
        "desc": "a scalable real-time operating system (RTOS) supporting multiple hardware architectures, optimized for resource constrained devices, and built with security in mind.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/zephyr",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://wiki.seeedstudio.com/XIAO-SAMD21-Zephyr-RTOS/"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-Zephyr-RTOS/"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://wiki.seeedstudio.com/XIAO-nRF52840-Zephyr-RTOS/"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://wiki.seeedstudio.com/XIAO-ESP32C3-Zephyr/"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_zephyr_rtos/"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_esp32c6/doc/index.html"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_ra4m1/doc/index.html"
          },
          {
            "name": "XIAO MG24",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_mg24/doc/index.html"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_rp2350/doc/index.html"
          },
          {
            "name": "XIAO nRF54L15",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_nrf54l15/doc/index.html"
          },
          {
            "name": "XIAO ESP32C5",
            "url": "https://docs.zephyrproject.org/latest/boards/seeed/xiao_esp32c5/doc/index.html"
          }
        ]
      },
      {
        "name": "FreeRTOS",
        "url": "https://www.freertos.org/",
        "desc": "real-time operating system for microcontrollers and small microprocessors.",
        "logo": "",
        "boards": [
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao-esp32s3-freertos/"
          },
          {
            "name": "XIAO ESP32C5",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_with_freertos/"
          }
        ]
      },
      {
        "name": "Apache NuttX RTOS",
        "url": "https://nuttx.apache.org/",
        "desc": "a real-time operating system (RTOS) with an emphasis on standards compliance and small footprint",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/nuttxrtos",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://nuttx.apache.org/docs/latest/platforms/arm/samd2l2/boards/xiao-seeeduino/index.html"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/xiao-rp2040-with-nuttx/"
          },
          {
            "name": "XIAO nRF52840",
            "url": "https://nuttx.apache.org/docs/latest/platforms/arm/nrf52/boards/xiao-nrf52840/index.html"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://nuttx.apache.org/docs/latest/platforms/arm/rp23xx/boards/xiao-rp2350/index.html"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://nuttx.apache.org/docs/latest/platforms/arm/ra4m1/boards/xiao-ra4m1/index.html"
          },
          {
            "name": "XIAO ESP32S3",
            "url": "https://nuttx.apache.org/docs/latest/platforms/xtensa/esp32s3/boards/esp32s3-xiao/index.html"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://nuttx.apache.org/docs/latest/platforms/risc-v/esp32c3/boards/esp32c3-xiao/index.html"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://nuttx.apache.org/docs/latest/platforms/risc-v/esp32c6/boards/esp32c6-xiao/index.html"
          }
        ]
      }
    ]
  },
  {
    "id": "comms",
    "title": "通信协议",
    "desc": "Wi-Fi、蓝牙、Thread/Matter 等连接栈及支持板卡。",
    "items": [
      {
        "name": "Apache Kafka",
        "url": "https://kafka.apache.org/",
        "desc": "an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical ",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/apachekafka",
        "boards": [
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_kafka/"
          }
        ]
      },
      {
        "name": "Matter",
        "url": "https://csa-iot.org/all-solutions/matter/",
        "desc": "industry–unifying standard protocol that offers reliable, secure connectivity for ompatible devices and systems.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/matter",
        "boards": [
          {
            "name": "XIAO ESP32 Series (C3, S3, C6)",
            "url": "https://wiki.seeedstudio.com/xiao_idf/"
          }
        ]
      },
      {
        "name": "Zigbee",
        "url": "https://csa-iot.org/all-solutions/zigbee/",
        "desc": "a wireless technology developed as an open global market connectivity standard to address the unique needs of low-cost, low-power wireless IoT data networks.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/zigbee",
        "boards": [
          {
            "name": "XIAO ESP32C6（Arduino）",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_zigbee_arduino/"
          },
          {
            "name": "XIAO ESP32C6（IDF）",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_zigbee/"
          },
          {
            "name": "XIAO ESP32C5 (Arduino)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_zigbee_arduino"
          },
          {
            "name": "XIAO ESP32C5 (IDF)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_zigbee_idf"
          },
          {
            "name": "XIAO nRF54L15 (Sense)",
            "url": "https://wiki.seeedstudio.com/xiao_nrf54l15_zigbee"
          }
        ]
      },
      {
        "name": "ESP-NOW",
        "url": "https://www.espressif.com/en/solutions/low-power-solutions/esp-now",
        "desc": "a wireless communication protocol for quick responses and low-power, which widely used in smart-home appliances, remote controlling and sensors.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/espnow",
        "boards": [
          {
            "name": "XIAO ESP32 Series (ESP32C3, ESP32S3, ESP32S3 Sense, ESP32C6)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_espnow/"
          }
        ]
      },
      {
        "name": "Meshtastic",
        "url": "https://meshtastic.org/",
        "desc": "an open source, off-grid, decentralized, mesh network built to run on affordable, low-power devices",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/mashtastic",
        "boards": [
          {
            "name": "XIAO ESP32S3 for Meshtastic and LoRa",
            "url": "https://wiki.seeedstudio.com/wio_sx1262_xiao_esp32s3_for_meshtastic/"
          }
        ]
      },
      {
        "name": "Amazon Sidewalk",
        "url": "https://aws.amazon.com/iot-core/sidewalk/",
        "desc": "an encrypted free-to-connect long-range network that provides persistent connectivity for billions of devices.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/amazonsidewalk",
        "boards": [
          {
            "name": "XIAO nRF52840",
            "url": "https://wiki.seeedstudio.com/xiao-ble-sidewalk/"
          }
        ]
      },
      {
        "name": "Blecon",
        "url": "https://www.blecon.net/",
        "desc": "enables physical products to communicate with cloud applications using Bluetooth Low Energy.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/blecon",
        "boards": [
          {
            "name": "XIAO nRF52840",
            "url": "https://developer.blecon.net/modem-reference/boards-and-modules/seeed-xiao-nrf52840-breakout"
          }
        ]
      }
    ]
  },
  {
    "id": "tinyml",
    "title": "TinyML / 边缘 AI",
    "desc": "在 XIAO 上运行机器学习推理的平台及支持板卡。",
    "items": [
      {
        "name": "SenseCraft AI",
        "url": "https://sensecraft.seeed.cc/ai/#/home",
        "desc": "Your go-to solution for no-code model training, deployment and more.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/sensecraft",
        "boards": [
          {
            "name": "XIAO ESP32S3 Sense (Model Assistant)",
            "url": "https://wiki.seeedstudio.com/xiao_esp32s3_edgelab/"
          }
        ]
      },
      {
        "name": "TensorFlow Lite",
        "url": "https://ai.google.dev/edge/litert",
        "desc": "Google's high-performance runtime for on-device AI.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/tensorflowlite",
        "boards": [
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://wiki.seeedstudio.com/XIAO-BLE-Sense-TFLite-Getting-Started/"
          }
        ]
      },
      {
        "name": "Edge Impulse",
        "url": "https://edgeimpulse.com/",
        "desc": "the leading development platform for machine learning on edge devices.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/edgeimpulse",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://wiki.seeedstudio.com/Seeeduino-XIAO-TinyML/"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://wiki.seeedstudio.com/XIAO-RP2040-EI/"
          },
          {
            "name": "XIAO nRF52840 (Sense)-Motion Recognition",
            "url": "https://wiki.seeedstudio.com/XIAOEI/"
          },
          {
            "name": "XIAO ESP32S3 Sense (Key Word Spotting)",
            "url": "https://wiki.seeedstudio.com/tinyml_course_Key_Word_Spotting/"
          },
          {
            "name": "XIAO ESP32S3 Sense (Image Classification)",
            "url": "https://wiki.seeedstudio.com/tinyml_course_Image_classification_project/"
          }
        ]
      }
    ]
  },
  {
    "id": "smarthome",
    "title": "智能家居与自动化",
    "desc": "接入主流家居平台的软件方案及支持板卡。",
    "items": [
      {
        "name": "Home Assistant & ESPHome",
        "url": "https://www.home-assistant.io/",
        "desc": "a system to control your microcontrollers by simple yet powerful configuration files and control them remotely through Home Automation systems such as Home Assistant.",
        "logo": "",
        "boards": [
          {
            "name": "XIAO ESP32S3 Sense",
            "url": "https://wiki.seeedstudio.com/XIAO_ESP32S3_esphome/"
          },
          {
            "name": "Grove Sensors",
            "url": "https://wiki.seeedstudio.com/Connect-Grove-to-Home-Assistant-ESPHome/#grove-compatibility-list-with-esphome"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://wiki.seeedstudio.com/xiao-esp32c3-esphome/"
          },
          {
            "name": "XIAO ESP32C6 (zigbee)",
            "url": "https://wiki.seeedstudio.com/xiaoc6_zigbee_led_ha"
          },
          {
            "name": "XIAO ESP32C5",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c5_homeassistant"
          },
          {
            "name": "XIAO MG24",
            "url": "https://wiki.seeedstudio.com/xiao_mg24_ha_openthread/"
          }
        ]
      },
      {
        "name": "Tasmota",
        "url": "https://github.com/arendst/Tasmota",
        "desc": "alternative open source firmware for ESP8266 and ESP32 based devices with easy configuration using webUI, OTA updates, automation using timers or rules, expandability and entirely ",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/tasmota",
        "boards": [
          {
            "name": "XIAO ESP32C3",
            "url": "https://templates.blakadder.com/seeedstudio_XIAO_ESP32C3.html"
          },
          {
            "name": "XIAO ESP32S3",
            "url": "https://templates.blakadder.com/seeedstudio_XIAO_ESP32S3.html"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://templates.blakadder.com/seeedstudio_XIAO_ESP32S3_SENSE.html"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://templates.blakadder.com/seeedstudio_XIAO_ESP32C6.html"
          },
          {
            "name": "Human Detection Sensor Kit Presence Sensor Based on XIAO ESP32C3",
            "url": "https://templates.blakadder.com/seeedstudio_mmwave_sensor_kit.html"
          }
        ]
      }
    ]
  },
  {
    "id": "keyboard",
    "title": "开源键盘软件",
    "desc": "XIAO 作为键控主控的软件方案及支持板卡。",
    "items": [
      {
        "name": "QMK",
        "url": "https://qmk.fm/",
        "desc": "Open-source keyboard firmware for Atmel AVR and Arm USB families.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/qmk",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://github.com/PJE66/hummingbird"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://github.com/kilipan/hummingbird_qmk"
          }
        ]
      },
      {
        "name": "ZMK",
        "url": "https://zmk.dev/",
        "desc": "an open source keyboard firmware built on the Zephyr™ Project Real Time Operating System (RTOS).",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/zmk",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://zmk.dev/docs/hardware#seeed_xiao"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://zmk.dev/docs/hardware#seeed_xiao"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://zmk.dev/docs/hardware#seeed_xiao"
          }
        ]
      }
    ]
  },
  {
    "id": "applications",
    "title": "热门应用",
    "desc": "社区高频使用的专项软件与集成及支持板卡。",
    "items": [
      {
        "name": "WLED",
        "url": "https://kno.wled.ge/",
        "desc": "a fast and feature-rich implementation of an ESP8266/ESP32 webserver to control NeoPixel (WS2812B, WS2811, SK6812) LEDs or also SPI based chipsets.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/wled",
        "boards": [
          {
            "name": "XIAO ESP32 Series (C3, S3, S3 Sense)",
            "url": "https://www.instructables.com/WLED-ON-XIAO-ESP32/"
          }
        ]
      },
      {
        "name": "ChatGPT",
        "url": "https://chatgpt.com/",
        "desc": "a sibling model to InstructGPT⁠, which is trained to follow an instruction in a prompt and provide a detailed response.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/chatgtp",
        "boards": [
          {
            "name": "XIAO ESP32C3",
            "url": "https://wiki.seeedstudio.com/xiaoesp32c3-chatgpt/"
          }
        ]
      },
      {
        "name": "FFmpeg",
        "url": "https://www.ffmpeg.org/",
        "desc": "a collection of libraries and tools to process multimedia content such as audio, video, subtitles and related metadata.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/ffmpeg",
        "boards": [
          {
            "name": "XIAO ESP32S3 Sense",
            "url": "https://tutoduino.fr/tutoriels/esp32-timelapse/#google_vignette"
          }
        ]
      },
      {
        "name": "mROS2-ESP32",
        "url": "https://github.com/mROS-base/mros2-esp32",
        "desc": "a light-weighted runtime environment for ROS nodes onto embedded esp32 micro-controller",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/mrosbase",
        "boards": [
          {
            "name": "XIAO ESP32C3",
            "url": "https://github.com/mROS-base/mros2-esp32/issues/7"
          },
          {
            "name": "XIAO ESP32S3",
            "url": "https://github.com/mROS-base/mros2-esp32/issues/24"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://github.com/mROS-base/mros2-esp32/issues/23"
          }
        ]
      }
    ]
  },
  {
    "id": "tools",
    "title": "原型与设计工具",
    "desc": "硬件设计与仿真工具及支持板卡。",
    "items": [
      {
        "name": "Fritzing",
        "url": "https://fritzing.org/",
        "desc": "an electronics design and prototyping platform for makers, hobbyists, and educators.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/fritzing",
        "boards": [
          {
            "name": "XIAO SAMD21",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20SAMD21(Seeeduino).fzpz"
          },
          {
            "name": "XIAO RP2040",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20RP2040.fzpz"
          },
          {
            "name": "XIAO nRF52840 (Sense)",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20nRF52840(Sense).fzpz"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20ESP32C3.fzpz"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20ESP32C6.fzpz"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20ESP32S3(Sense).fzpz"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/XIAO%20RP2350.fzpz"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://github.com/Seeed-Studio/fritzing_parts/blob/master/XIAO%20Boards/Seeed%20Studio%20XIAO%20RA4M1.fzpz"
          }
        ]
      },
      {
        "name": "FluxAI",
        "url": "https://www.flux.ai/",
        "desc": "a Better Way to Build professional PCBs with an AI Copilot.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/flux",
        "boards": [
          {
            "name": "XIAO RP2040",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-rp2040"
          },
          {
            "name": "XIAO nRF52840",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-nrf52840"
          },
          {
            "name": "XIAO nRF52840 Sense",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-nrf52840-sense"
          },
          {
            "name": "XIAO ESP32C3",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-esp32c3"
          },
          {
            "name": "XIAO ESP32S3",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-esp32s3"
          },
          {
            "name": "XIAO ESP32S3 Sense",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-esp32s3-sense"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-esp32c6"
          },
          {
            "name": "XIAO RP2350",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-rp2350"
          },
          {
            "name": "XIAO RA4M1",
            "url": "https://www.flux.ai/seeedstudio/seeed-studio-xiao-ra4m1"
          }
        ]
      },
      {
        "name": "Wokwi",
        "url": "https://wokwi.com/",
        "desc": "World's most advanced ESP32 Simulator.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/wokwi",
        "boards": [
          {
            "name": "XIAO ESP32C3",
            "url": "https://wokwi.com/projects/410433244849526785"
          },
          {
            "name": "XIAO ESP32S3 (Sense)",
            "url": "https://wokwi.com/projects/411276781876475905"
          },
          {
            "name": "XIAO ESP32C6",
            "url": "https://wokwi.com/projects/411265368570177537"
          }
        ]
      }
    ]
  },
  {
    "id": "iotcloud",
    "title": "IoT 云平台",
    "desc": "设备上云与可视化的云服务及支持板卡。",
    "items": [
      {
        "name": "AWS IoT",
        "url": "https://aws.amazon.com/iot/",
        "desc": "enables to securely connect and manage devices, collect and analyze device data, and build and deploy solutions that drive greater business value.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/awsiot",
        "boards": [
          {
            "name": "XIAO ESP32C6",
            "url": "https://wiki.seeedstudio.com/xiao_esp32c6_aws_iot/"
          }
        ]
      },
      {
        "name": "ThingSpeak",
        "url": "https://thingspeak.mathworks.com/",
        "desc": "the open IoT platform with MATLAB analytics.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/thingspeak",
        "boards": [
          {
            "name": "XIAO nRF52840",
            "url": "https://elchika.com/article/433216e7-90a9-4f59-bbb3-4a7531588140/"
          }
        ]
      },
      {
        "name": "Ubidots",
        "url": "https://ubidots.com/",
        "desc": "a low-code IoT development platform for engineers and developers without the time or energy to build an entire, production-ready IoT application.",
        "logo": "https://files.seeedstudio.com/wiki/xiao_topicpage/ubidots",
        "boards": [
          {
            "name": "XIAO ESP32S3 + L76K GNSS Module for Tracking",
            "url": "https://wiki.seeedstudio.com/L76K_Path_Tracking_on_Ubidots/"
          }
        ]
      }
    ]
  }
];
