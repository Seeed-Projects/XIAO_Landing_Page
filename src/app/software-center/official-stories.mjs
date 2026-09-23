/** Official software use cases, supported hardware and entry points. 官方软件用途、支持硬件与入口。 */
export const DIAGRAM_IDS = ["ha","zephyr","gfx2","esphome","micropython","sensecraft"];

export const FLAGSHIP_STORIES = [
  {
    id: "ha",
    diagram: "ha",
    eyebrow: {
      en: "Smart home integration",
      zh: "智能家居接入"
    },
    name: {
      en: "Home Assistant Discovery",
      zh: "Home Assistant Discovery"
    },
    lede: {
      en: "Turn a XIAO into a smart sensor or a home-control terminal, using the Arduino or PlatformIO workflow you already know.",
      zh: "沿用熟悉的 Arduino 或 PlatformIO 开发方式，把 XIAO 变成智能传感器，或控制家中设备的小终端。"
    },
    problem: {
      en: "A custom device needs to expose its readings and controls to Home Assistant before it can take part in your home's automations.",
      zh: "自制设备不仅要能联网，还要让 Home Assistant 读懂传感器数据、识别控制功能，才能参与家中的自动化。"
    },
    what: {
      en: "A Home Assistant integration paired with Arduino libraries handles discovery and two-way communication. Supported XIAO boards can report sensors, receive commands and read existing smart-device states over Wi-Fi or Bluetooth.",
      zh: "这套 Home Assistant 插件与 Arduino 库负责设备发现和双向通信。受支持的 XIAO 可通过 Wi-Fi 或蓝牙上报传感器、接收控制指令，也能读取已有智能设备的状态。"
    },
    steps: [
      {
        en: "Install the integration through HACS in Home Assistant.",
        zh: "通过 HACS 在 Home Assistant 中安装插件。"
      },
      {
        en: "Add the library in Arduino IDE or PlatformIO and adapt a sensor or control example.",
        zh: "在 Arduino IDE 或 PlatformIO 中添加库，按需求修改传感器或控制示例。"
      },
      {
        en: "Connect the board and use its entities in dashboards and automations; ready-made examples also have a web flasher.",
        zh: "连接开发板，把设备实体加入面板与自动化；现成示例也可使用网页烧录。"
      }
    ],
    capabilities: [
      {
        en: "Sensor reporting",
        zh: "传感器上报"
      },
      {
        en: "Two-way control",
        zh: "双向控制"
      },
      {
        en: "Device state access",
        zh: "读取设备状态"
      },
      {
        en: "Automatic discovery",
        zh: "自动发现"
      }
    ],
    boards: [
      "XIAO ESP32-C3",
      "XIAO ESP32-C5",
      "XIAO ESP32-C6",
      "XIAO ESP32-S3",
      "XIAO nRF52840"
    ],
    badges: [
      {
        en: "Home Assistant integration",
        zh: "Home Assistant 插件"
      },
      {
        en: "Arduino / PlatformIO",
        zh: "Arduino / PlatformIO"
      },
      {
        en: "Wi-Fi / Bluetooth",
        zh: "Wi-Fi / 蓝牙"
      }
    ],
    links: [
      {
        kind: "github",
        label: {
          en: "View project",
          zh: "查看项目"
        },
        href: "https://github.com/Seeed-Projects/Seeed-Homeassistant-Discovery"
      },
      {
        kind: "flasher",
        label: {
          en: "Try web flasher",
          zh: "打开网页烧录"
        },
        href: "https://seeed-projects.github.io/Seeed-Homeassistant-Discovery/flasher/"
      }
    ]
  },
  {
    id: "zephyr",
    diagram: "zephyr",
    eyebrow: {
      en: "One platform across chips",
      zh: "跨芯片统一开发"
    },
    name: {
      en: "XIAO Zephyr Assistant",
      zh: "XIAO Zephyr Assistant"
    },
    lede: {
      en: "Develop XIAO boards from different chip families on one software platform, with a shared workflow inside VS Code.",
      zh: "让不同芯片系列的 XIAO 拥有统一的软件开发平台，在 VS Code 中使用一致的开发流程。"
    },
    problem: {
      en: "Switching chip vendors often means learning another SDK and rebuilding the same peripheral setup. That work slows down hardware choices and project reuse.",
      zh: "更换芯片平台往往意味着重新熟悉开发工具、配置外设和整理示例，让选型与项目复用都变得费力。"
    },
    what: {
      en: "The VS Code extension brings XIAO boards, Grove examples and support status into a Zephyr-based workspace. Browse hardware, create a project, then build, flash and monitor it through one interface. Available features follow each board's support status.",
      zh: "这个 VS Code 插件把 XIAO 板卡、Grove 示例和支持状态整合到基于 Zephyr 的开发环境中。选择硬件、创建项目、编译、烧录和查看串口，都有统一入口；具体能力以各板卡的支持状态为准。"
    },
    steps: [
      {
        en: "Follow the repository setup for the VS Code extension and Zephyr tools.",
        zh: "按仓库说明安装 VS Code 插件和 Zephyr 开发工具。"
      },
      {
        en: "Select a XIAO and a supported example, then create your project.",
        zh: "选择 XIAO 与受支持的示例，创建项目。"
      },
      {
        en: "Build, flash and monitor in VS Code; reuse the workflow when changing boards.",
        zh: "在 VS Code 中编译、烧录和查看串口，换板后继续沿用这套流程。"
      }
    ],
    capabilities: [
      {
        en: "Shared development workflow",
        zh: "统一开发流程"
      },
      {
        en: "Grove examples",
        zh: "Grove 示例"
      },
      {
        en: "Board support status",
        zh: "板卡支持状态"
      },
      {
        en: "Project reuse",
        zh: "项目复用"
      }
    ],
    boards: [
      "XIAO SAMD21",
      "XIAO nRF52840",
      "XIAO nRF54L15",
      "XIAO MG24",
      "XIAO RP2040",
      "XIAO RP2350",
      "XIAO ESP32-C3",
      "XIAO ESP32-S3",
      "XIAO ESP32-C6",
      "XIAO RA4M1"
    ],
    badges: [
      {
        en: "VS Code extension",
        zh: "VS Code 插件"
      },
      {
        en: "Zephyr RTOS",
        zh: "Zephyr RTOS"
      },
      {
        en: "Cross-chip development",
        zh: "跨芯片开发"
      }
    ],
    links: [
      {
        kind: "github",
        label: {
          en: "Explore XIAO Zephyr",
          zh: "查看 XIAO Zephyr"
        },
        href: "https://github.com/limengdu/Seeed-Zephyr-Project"
      }
    ]
  },
  {
    id: "gfx2",
    diagram: "gfx2",
    eyebrow: {
      en: "One graphics library",
      zh: "统一图形驱动"
    },
    name: {
      en: "Seeed GFX2",
      zh: "Seeed GFX2"
    },
    lede: {
      en: "Build interfaces for Seeed MCU display products with a common graphics library, from color screens to e-paper.",
      zh: "为 Seeed 的 MCU 屏幕产品提供统一图形驱动，从彩色屏幕到电子纸，用同一套绘图方式构建界面。"
    },
    problem: {
      en: "Different display controllers and board wiring can turn a simple interface into a hardware-porting task.",
      zh: "屏幕控制器、通信方式和板卡接线各不相同，一个简单界面也可能需要大量底层适配。"
    },
    what: {
      en: "Seeed GFX2 provides product configurations and display drivers behind the Seeed_GFX API. Arduino and PlatformIO projects can draw text, images and controls while the library handles the supported display hardware.",
      zh: "Seeed GFX2 将产品配置与显示驱动整合到 Seeed_GFX 接口中。在 Arduino 或 PlatformIO 里绘制文字、图片和控件，由库处理受支持屏幕的底层差异。"
    },
    steps: [
      {
        en: "Install Seeed GFX2 and select your supported product configuration.",
        zh: "安装 Seeed GFX2，选择对应产品配置。"
      },
      {
        en: "Start with a graphics, image or e-paper example.",
        zh: "打开基础图形、图片显示或电子纸示例。"
      },
      {
        en: "Build your display interface using the shared drawing API.",
        zh: "使用统一绘图接口，搭建自己的产品界面。"
      }
    ],
    capabilities: [
      {
        en: "Text and graphics",
        zh: "文字与图形"
      },
      {
        en: "Bitmap images",
        zh: "图片显示"
      },
      {
        en: "Sprites",
        zh: "离屏绘图"
      },
      {
        en: "E-paper refresh",
        zh: "电子纸刷新"
      }
    ],
    boards: [
      "XIAO display add-ons",
      "Wio Terminal",
      "reTerminal E Series",
      "SenseCAP display products"
    ],
    badges: [
      {
        en: "Arduino / PlatformIO",
        zh: "Arduino / PlatformIO"
      },
      {
        en: "LCD / OLED / E-paper",
        zh: "LCD / OLED / 电子纸"
      }
    ],
    links: [
      {
        kind: "github",
        label: {
          en: "Explore Seeed GFX2",
          zh: "查看 Seeed GFX2"
        },
        href: "https://github.com/Seeed-Studio/Seeed_GFX2"
      }
    ]
  },
  {
    id: "esphome",
    diagram: "esphome",
    eyebrow: {
      en: "Ready-to-use smart-home gadgets",
      zh: "智能家居产品固件"
    },
    name: {
      en: "XIAO ESPHome Projects",
      zh: "XIAO ESPHome Projects"
    },
    lede: {
      en: "Bring XIAO-based smart-home gadgets to life with product drivers, example configurations and firmware.",
      zh: "把 XIAO 智能家居小设备用起来：在一个地方找到产品驱动、配置示例和固件。"
    },
    problem: {
      en: "A finished gadget needs matching drivers, pin settings and device behavior before it becomes useful in Home Assistant.",
      zh: "一款成品小设备需要配套驱动、引脚配置和功能设置，才能真正接入 Home Assistant 并发挥作用。"
    },
    what: {
      en: "This repository collects ESPHome configurations and components for XIAO-based products, including soil monitors, IoT buttons, energy meters, radar sensors and relays. Start with the product's maintained configuration or install available firmware through the gadget installer.",
      zh: "这个仓库汇集 XIAO 产品的 ESPHome 配置与组件，覆盖土壤监测、IoT 按钮、电能计、雷达传感器和继电器等设备。可直接从对应产品配置开始，也可通过配套网页安装可用固件。"
    },
    steps: [
      {
        en: "Find the configuration that matches your gadget and hardware revision.",
        zh: "找到与设备及硬件版本对应的产品配置。"
      },
      {
        en: "Use the web installer where available, or build the ESPHome configuration.",
        zh: "使用对应的网页固件，或自行编译 ESPHome 配置。"
      },
      {
        en: "Connect the device to Home Assistant and tailor its automations.",
        zh: "将设备接入 Home Assistant，设置适合自己的自动化。"
      }
    ],
    capabilities: [
      {
        en: "Product drivers",
        zh: "产品驱动"
      },
      {
        en: "Example configurations",
        zh: "配置示例"
      },
      {
        en: "Firmware installation",
        zh: "固件安装"
      },
      {
        en: "Home automations",
        zh: "家居自动化"
      }
    ],
    boards: [
      "XIAO ESP32-based gadgets"
    ],
    badges: [
      {
        en: "ESPHome",
        zh: "ESPHome"
      },
      {
        en: "Product firmware",
        zh: "产品固件"
      },
      {
        en: "Home Assistant",
        zh: "Home Assistant"
      }
    ],
    links: [
      {
        kind: "github",
        label: {
          en: "Browse firmware projects",
          zh: "查看固件项目"
        },
        href: "https://github.com/Seeed-Studio/xiao-esphome-projects"
      },
      {
        kind: "flasher",
        label: {
          en: "Open gadget installer",
          zh: "打开产品烧录页"
        },
        href: "https://gadgets.seeed.cc"
      }
    ]
  },
  {
    id: "micropython",
    diagram: "micropython",
    eyebrow: {
      en: "Python on XIAO",
      zh: "用 Python 开发 XIAO"
    },
    name: {
      en: "MicroPython for XIAO",
      zh: "MicroPython for XIAO"
    },
    lede: {
      en: "Explore hardware with Python: try a command, read a sensor and change your program without rebuilding a C++ application.",
      zh: "用 Python 探索硬件：输入命令、读取传感器、修改程序，让学习与原型验证更直接。"
    },
    problem: {
      en: "Python hardware projects need firmware and examples that match the board, not just a generic interpreter.",
      zh: "在开发板上运行 Python，不仅需要解释器，还需要匹配板卡的固件、驱动和上手示例。"
    },
    what: {
      en: "Seeed's MicroPython board repository brings together firmware, drivers and examples for supported XIAO families. Its board helpers and interactive Python workflow make it easier to test peripherals and develop small connected projects. Support varies by board and firmware build.",
      zh: "这个仓库集中提供受支持 XIAO 系列的 MicroPython 固件、驱动和示例。配合板卡辅助库与交互式 Python，可以逐步验证外设、开发小型连接项目；具体功能取决于板卡及固件版本。"
    },
    steps: [
      {
        en: "Download the firmware for your exact board from the releases.",
        zh: "在发布页下载与开发板型号对应的固件。"
      },
      {
        en: "Flash it using the board's instructions and connect through Thonny.",
        zh: "按对应板卡说明烧录，通过 Thonny 连接。"
      },
      {
        en: "Try the Python console, then adapt a driver or example for your project.",
        zh: "先在 Python 控制台测试，再修改驱动或示例完成项目。"
      }
    ],
    capabilities: [
      {
        en: "Interactive Python",
        zh: "交互式 Python"
      },
      {
        en: "Board firmware",
        zh: "板卡固件"
      },
      {
        en: "Drivers and examples",
        zh: "驱动与示例"
      },
      {
        en: "Rapid prototyping",
        zh: "快速原型验证"
      }
    ],
    boards: [
      "XIAO ESP32 Series",
      "XIAO nRF52840",
      "XIAO nRF54L15",
      "XIAO nRF54LM20A",
      "XIAO MG24",
      "XIAO RA4M1"
    ],
    badges: [
      {
        en: "MicroPython",
        zh: "MicroPython"
      },
      {
        en: "Thonny / REPL",
        zh: "Thonny / 交互控制台"
      }
    ],
    links: [
      {
        kind: "github",
        label: {
          en: "Explore MicroPython",
          zh: "查看 MicroPython"
        },
        href: "https://github.com/Seeed-Studio/micropython-seeed-boards"
      },
      {
        kind: "download",
        label: {
          en: "Download firmware",
          zh: "下载固件"
        },
        href: "https://github.com/Seeed-Studio/micropython-seeed-boards/releases"
      }
    ]
  },
  {
    id: "sensecraft",
    diagram: "sensecraft",
    eyebrow: {
      en: "No-code edge AI",
      zh: "无代码边缘 AI"
    },
    name: {
      en: "SenseCraft AI",
      zh: "SenseCraft AI"
    },
    lede: {
      en: "Turn a XIAO camera into an AI-powered device that recognizes objects locally, without building the entire AI toolchain yourself.",
      zh: "让 XIAO 摄像头成为能在本地识别物体的 AI 设备，无需从头搭建完整的 AI 开发工具链。"
    },
    problem: {
      en: "Moving from an idea to on-device recognition requires a suitable model, deployment tools and a way to inspect results.",
      zh: "从一个识别想法到板上运行，需要合适的模型、部署工具，以及查看实际识别结果的方式。"
    },
    what: {
      en: "SenseCraft AI combines model selection, no-code training and device deployment in one platform. Use a ready-made model or train your own, deploy it to XIAO ESP32-S3 Sense and inspect live recognition results.",
      zh: "SenseCraft AI 将模型选择、无代码训练与设备部署整合到一个平台。选择现成模型或训练自己的模型，部署到 XIAO ESP32-S3 Sense，再查看实时识别结果。"
    },
    steps: [
      {
        en: "Choose a model, or train one for your detection or classification task.",
        zh: "选择现成模型，或为目标检测、分类任务训练模型。"
      },
      {
        en: "Deploy the model to XIAO ESP32-S3 Sense.",
        zh: "将模型部署到 XIAO ESP32-S3 Sense。"
      },
      {
        en: "Preview recognition results and refine your application.",
        zh: "预览识别结果，逐步完善应用。"
      }
    ],
    capabilities: [
      {
        en: "Object detection",
        zh: "目标检测"
      },
      {
        en: "Image classification",
        zh: "图像分类"
      },
      {
        en: "No-code training",
        zh: "无代码训练"
      },
      {
        en: "Live preview",
        zh: "实时预览"
      }
    ],
    boards: [
      "XIAO ESP32-S3 Sense"
    ],
    badges: [
      {
        en: "Edge AI",
        zh: "边缘 AI"
      },
      {
        en: "No-code platform",
        zh: "无代码平台"
      }
    ],
    links: [
      {
        kind: "app",
        label: {
          en: "Open SenseCraft AI",
          zh: "打开 SenseCraft AI"
        },
        href: "https://sensecraft.seeed.cc/ai/#/home"
      },
      {
        kind: "wiki",
        label: {
          en: "Getting started",
          zh: "上手指南"
        },
        href: "https://wiki.seeedstudio.com/xiao_esp32s3_edgelab/"
      }
    ]
  }
];

/** Unique source repositories used by the official software count. 官方软件计数使用的唯一源码仓库。 */
export function officialRepoUrls() {
  return [...new Set(FLAGSHIP_STORIES.flatMap((story) =>
    story.links.filter((link) => link.kind === "github").map((link) => link.href)
  ))];
}
