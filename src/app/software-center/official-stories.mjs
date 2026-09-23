/**
 * Flagship stories and the shorter list of other official repositories.
 * 旗舰故事，以及其余官方仓库的短列表。
 *
 * Copy follows the public README or product page for each project.
 * 文案依据各项目公开的 README 或产品页。
 */

/** Diagram ids StoryDiagram knows how to draw. StoryDiagram 会绘制的示意图编号。 */
export const DIAGRAM_IDS = ["ha", "zephyr", "esphome", "sensecraft"];

export const FLAGSHIP_STORIES = [
  {
    id: "ha",
    diagram: "ha",
    eyebrow: { en: "Smart home", zh: "智能家居接入" },
    name: { en: "Home Assistant Discovery", zh: "Home Assistant Discovery" },
    lede: {
      en: "Readings leave a XIAO board, land on a Home Assistant dashboard, and a switch there lights the board.",
      zh: "读数从 XIAO 送到 Home Assistant 面板，面板上的开关再把板上的灯点亮。",
    },
    problem: {
      en: "Putting a board on a Home Assistant dashboard usually means standing up an MQTT broker first, or sending the data through a cloud service.",
      zh: "要把一块板子接到 Home Assistant 面板上，通常得先搭一个 MQTT 代理，或者把数据交到云服务。",
    },
    what: {
      en: "Seeed HA Discovery is a maintained Home Assistant integration plus Arduino libraries for XIAO. A short sketch on an ESP32 or nRF52840 board talks over Wi-Fi or BLE, and Home Assistant discovers the device on the local network. No MQTT broker, and no cloud service.",
      zh: "Seeed HA Discovery 是 Seeed 维护的 Home Assistant 集成，加上给 XIAO 用的 Arduino 库。在 ESP32 或 nRF52840 上写一段短程序，通过 Wi-Fi 或蓝牙通信，Home Assistant 会在局域网里自动发现这块设备。不用搭 MQTT，也不用云服务。",
    },
    steps: [
      {
        en: "Install the integration from HACS, the Home Assistant Community Store.",
        zh: "在 HACS（Home Assistant 社区商店）里安装这个集成。",
      },
      {
        en: "Add the Arduino library and publish a sensor with a few lines of code, in the Arduino IDE or PlatformIO.",
        zh: "在 Arduino IDE 或 PlatformIO 里装上 Arduino 库，用几行代码上报一个传感器。",
      },
      {
        en: "Or skip the IDE. The Web Flasher writes a ready-made example from Chrome or Edge, and Home Assistant discovers the device when it comes online.",
        zh: "也可以不装 IDE。浏览器烧录器用 Chrome 或 Edge 写入现成示例，设备上线后 Home Assistant 会自己发现它。",
      },
    ],
    capabilities: [
      { en: "No MQTT", zh: "不用 MQTT" },
      { en: "No cloud", zh: "不用云" },
      { en: "Auto discovery", zh: "自动发现" },
      { en: "Wi-Fi and BLE", zh: "Wi-Fi 与蓝牙" },
      { en: "Sensor upload", zh: "传感器上报" },
      { en: "Control back to the board", zh: "开关回控到板子" },
      { en: "Camera on ESP32-S3", zh: "ESP32-S3 摄像头" },
    ],
    boards: ["XIAO ESP32-C3", "XIAO ESP32-C5", "XIAO ESP32-C6", "XIAO ESP32-S3", "XIAO nRF52840"],
    badges: [
      { en: "HACS one-click install", zh: "HACS 一键安装" },
      { en: "Web Flasher", zh: "浏览器烧录" },
      { en: "Local network only", zh: "只走局域网" },
    ],
    links: [
      {
        kind: "github",
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/Seeed-Homeassistant-Discovery",
      },
      {
        kind: "flasher",
        label: { en: "Web Flasher", zh: "浏览器烧录" },
        href: "https://seeed-projects.github.io/Seeed-Homeassistant-Discovery/flasher/",
      },
    ],
  },
  {
    id: "zephyr",
    diagram: "zephyr",
    eyebrow: { en: "One workflow, every chip", zh: "跨芯片统一开发" },
    name: { en: "Seeed Zephyr Base", zh: "Seeed Zephyr Base" },
    lede: {
      en: "One command builds and flashes XIAO boards from six chip vendors on Zephyr RTOS.",
      zh: "一条命令，在 Zephyr RTOS 上编译并烧录来自 6 家芯片厂的 XIAO。",
    },
    problem: {
      en: "XIAO boards do not share a chip vendor. Each one brings its own SDK, flash tool and setup, so a Grove example that works on one board is a new project on the next.",
      zh: "XIAO 的芯片并不来自同一家。每块板有自己的 SDK、烧录工具和上手步骤，所以一份能在这块板上跑的 Grove 示例，换一块板往往得重做。",
    },
    what: {
      en: "Seeed Zephyr Base is the XIAO and Grove example library, capability catalog and seeed-zephyr command line on top of Zephyr. It picks the board target, then hands build and flash to Zephyr's own tools. Boards from Microchip, Nordic, Silicon Labs, Raspberry Pi, Espressif and Renesas share one Grove example. XIAO ESP32-C5 is listed, and Zephyr v4.4.0 does not ship a board target for it yet.",
      zh: "Seeed Zephyr Base 是放在 Zephyr 之上的 XIAO 与 Grove 示例库、能力目录，以及 seeed-zephyr 命令行。它选好板卡目标，再把编译和烧录交给 Zephyr 自己的工具。Microchip、Nordic、Silicon Labs、Raspberry Pi、Espressif 和 Renesas 的板子共用同一份 Grove 示例。XIAO ESP32-C5 已列入，Zephyr v4.4.0 还没有它的板级目标。",
    },
    steps: [
      {
        en: "Install the seeed-zephyr command and the Zephyr toolchain with the one-line installer.",
        zh: "用一行安装脚本装上 seeed-zephyr 命令和 Zephyr 工具链。",
      },
      {
        en: "From any directory, flash a tracked board. The documented form is seeed-zephyr flash xiao_esp32c6.",
        zh: "在任意目录烧录一块已登记的板。文档里的写法是 seeed-zephyr flash xiao_esp32c6。",
      },
      {
        en: "Build the same Grove example for another board. The source tree stays the same.",
        zh: "把同一份 Grove 示例换一块板再编译。源码目录不用改。",
      },
    ],
    capabilities: [
      { en: "One flash command", zh: "一条命令烧录" },
      { en: "One Grove example, every board", zh: "一份 Grove 示例，全板通用" },
      { en: "Six chip vendors", zh: "6 家芯片厂" },
      { en: "Hardware-tested marks", zh: "硬件实测标记" },
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
      "XIAO RA4M1",
      "XIAO ESP32-C5",
    ],
    badges: [
      { en: "Zephyr v4.4.0", zh: "Zephyr v4.4.0" },
      { en: "11 boards tracked", zh: "11 块板在册" },
      { en: "10 hardware-tested", zh: "10 块硬件实测" },
    ],
    links: [
      {
        kind: "github",
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/limengdu/Seeed-Zephyr-Project",
      },
    ],
  },
  {
    id: "esphome",
    diagram: "esphome",
    eyebrow: { en: "Voice assistant", zh: "语音助手" },
    name: { en: "ESPHome for XIAO ESP32S3", zh: "ESPHome for XIAO ESP32S3" },
    lede: {
      en: "The I2S microphone and speaker support XIAO ESP32-S3 needs before Home Assistant Assist can listen and speak.",
      zh: "补上 XIAO ESP32-S3 的 I2S 麦克风和扬声器，Home Assistant Assist 才能听和说。",
    },
    problem: {
      en: "ESPHome's usual I2S audio setup does not match the microphone and speaker on XIAO ESP32-S3, so a voice assistant stops before the first word.",
      zh: "ESPHome 常见的 I2S 音频配置对不上 XIAO ESP32-S3 的麦克风和扬声器，语音助手在第一句话之前就接不上。",
    },
    what: {
      en: "This official component adds an i2s_audio_xiao platform to ESPHome, with a microphone and a speaker for XIAO ESP32-S3. The repository example wires both into Home Assistant's voice assistant, including wake word, and drives a listening light on the board.",
      zh: "这个官方组件给 ESPHome 加了 i2s_audio_xiao 平台，为 XIAO ESP32-S3 提供麦克风和扬声器。仓库里的示例把两者接到 Home Assistant 的语音助手，包含唤醒词，并在聆听时点亮板上的灯。",
    },
    steps: [
      {
        en: "Point external_components at github://Seeed-Projects/ESPHome_XIAO-ESP32S3.",
        zh: "把 external_components 指向 github://Seeed-Projects/ESPHome_XIAO-ESP32S3。",
      },
      {
        en: "Declare i2s_audio_xiao with the clock pins, then attach the microphone and the speaker.",
        zh: "声明 i2s_audio_xiao 并填上时钟引脚，再挂上麦克风和扬声器。",
      },
      {
        en: "Turn on voice_assistant. Home Assistant Assist listens through the microphone and answers through the speaker.",
        zh: "打开 voice_assistant。Home Assistant Assist 用麦克风听，用扬声器回答。",
      },
    ],
    capabilities: [
      { en: "i2s_audio_xiao", zh: "i2s_audio_xiao" },
      { en: "Microphone", zh: "麦克风" },
      { en: "Speaker", zh: "扬声器" },
      { en: "Wake word", zh: "唤醒词" },
      { en: "Home Assistant Assist", zh: "Home Assistant Assist" },
    ],
    boards: ["XIAO ESP32-S3"],
    badges: [
      { en: "Official ESPHome component", zh: "ESPHome 官方组件" },
    ],
    links: [
      {
        kind: "github",
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/ESPHome_XIAO-ESP32S3",
      },
    ],
  },
  {
    id: "sensecraft",
    diagram: "sensecraft",
    eyebrow: { en: "No-code edge AI", zh: "无代码边缘 AI" },
    name: { en: "SenseCraft AI", zh: "SenseCraft AI" },
    lede: {
      en: "Train a vision model, deploy it, and preview the live camera, without writing firmware.",
      zh: "训练视觉模型、部署到板子、看实况画面，不用写固件。",
    },
    problem: {
      en: "Running a vision model on a small board usually means building a dataset pipeline, a training toolchain and board-specific firmware yourself.",
      zh: "要在一块小板上跑视觉模型，通常得自己做数据集、训练工具链，以及这块板专用的固件。",
    },
    what: {
      en: "SenseCraft AI is Seeed's no-code platform for edge AI. It trains object detection and classification without code, deploys a model to a device in one click, and previews the result. The device workspace includes XIAO ESP32S3 Sense.",
      zh: "SenseCraft AI 是 Seeed 的无代码边缘 AI 平台。它零代码训练目标检测和分类模型，一键把模型部署到设备上，并预览结果。设备工作区包含 XIAO ESP32S3 Sense。",
    },
    steps: [
      {
        en: "Open SenseCraft AI and pick a model, or train a detection or classification model with no code.",
        zh: "打开 SenseCraft AI，选一个现成模型，或零代码训练一个检测或分类模型。",
      },
      {
        en: "Deploy that model to XIAO ESP32S3 Sense in one click.",
        zh: "把模型一键部署到 XIAO ESP32S3 Sense。",
      },
      {
        en: "Watch the live recognition preview from the board in the device workspace.",
        zh: "在设备工作区里看这块板传回的实况识别画面。",
      },
    ],
    capabilities: [
      { en: "No-code training", zh: "零代码训练" },
      { en: "Object detection", zh: "目标检测" },
      { en: "Image classification", zh: "图像分类" },
      { en: "One-click deploy", zh: "一键部署" },
      { en: "Live preview", zh: "实况预览" },
    ],
    boards: ["XIAO ESP32S3 Sense"],
    badges: [
      { en: "No-code platform", zh: "无代码平台" },
      { en: "One-click deploy", zh: "一键部署" },
    ],
    links: [
      {
        kind: "app",
        label: { en: "Open SenseCraft", zh: "打开 SenseCraft" },
        href: "https://sensecraft.seeed.cc/ai/#/home",
      },
      {
        kind: "wiki",
        label: { en: "Wiki", zh: "Wiki" },
        href: "https://wiki.seeedstudio.com/xiao_esp32s3_edgelab/",
      },
    ],
  },
];

/** Official repositories that stay as a compact list under the flagship stories. 放在旗舰故事下面的其余官方仓库。 */
export const MORE_OFFICIAL = [
  {
    id: "l76k",
    name: { en: "L76K GNSS for XIAO", zh: "L76K GNSS for XIAO" },
    summary: {
      en: "Arduino examples for the L76K GNSS module: GPS, BeiDou, GLONASS and QZSS.",
      zh: "L76K GNSS 模块的 Arduino 示例，支持 GPS、北斗、GLONASS 和 QZSS。",
    },
    boards: ["XIAO SAMD21", "XIAO RP2040", "XIAO nRF52840", "XIAO ESP32-C3", "XIAO ESP32-S3"],
    links: [
      {
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/Seeed_L76K-GNSS_for_XIAO",
      },
    ],
  },
  {
    id: "tft",
    name: { en: "Seeed TFT_eSPI", zh: "Seeed TFT_eSPI" },
    summary: {
      en: "Seeed's fork of TFT_eSPI, revised for Seeed displays, including updated XIAO ESP32-C6 support.",
      zh: "Seeed 维护的 TFT_eSPI 分支，面向 Seeed 的屏幕，并更新了对 XIAO ESP32-C6 的支持。",
    },
    boards: ["XIAO series"],
    links: [
      {
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/SeeedStudio_TFT_eSPI",
      },
    ],
  },
  {
    id: "w5500",
    name: { en: "W5500 Ethernet examples", zh: "W5500 以太网示例" },
    summary: {
      en: "Examples that connect XIAO to a W5500 Ethernet module: a link test, a web server and a camera stream.",
      zh: "把 XIAO 接到 W5500 以太网模块的示例：链路测试、网页服务器和摄像头串流。",
    },
    boards: ["XIAO series"],
    links: [
      {
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/XIAO_W5500_Ehernet_Adapter_Example",
      },
    ],
  },
  {
    id: "fly",
    name: { en: "ESP-FLY quadcopter kit", zh: "ESP-FLY 四旋翼套件" },
    summary: {
      en: "Kit software for the XIAO ESP32-S3 micro drone. Fly from a phone over Wi-Fi, or from a radio over ESP-NOW.",
      zh: "XIAO ESP32-S3 微型无人机的套件软件。可以用手机经 Wi-Fi 飞，也可以用遥控经 ESP-NOW 飞。",
    },
    boards: ["XIAO ESP32-S3"],
    links: [
      {
        label: { en: "GitHub", zh: "GitHub" },
        href: "https://github.com/Seeed-Projects/Co-Create_ESP-FLY",
      },
    ],
  },
  {
    id: "meter-relay",
    name: { en: "Energy meter and relay firmware", zh: "电能计与继电器固件" },
    summary: {
      en: "Firmware repositories for two XIAO ESP32-C6 products: a dual-channel AC energy meter and a 6-channel relay.",
      zh: "两款 XIAO ESP32-C6 产品的固件仓库：双通道交流电能计，以及 6 通道继电器。",
    },
    boards: ["XIAO ESP32-C6"],
    links: [
      {
        label: { en: "Energy meter", zh: "电能计" },
        href: "https://github.com/Seeed-Projects/2-Channel_Energy_Meter_based_on_XIAO_ESP32C6",
      },
      {
        label: { en: "Relay", zh: "继电器" },
        href: "https://github.com/Seeed-Projects/6-Channel_Relay_based_on_XIAO_ESP32C6",
      },
    ],
  },
];

/**
 * GitHub repository URLs referenced by the flagship stories and the compact list.
 * 旗舰故事和短列表引用到的 GitHub 仓库地址。
 */
export function officialRepoUrls() {
  const urls = [];
  for (const story of FLAGSHIP_STORIES) {
    for (const link of story.links) {
      if (link.href.includes("://github.com/")) urls.push(link.href);
    }
  }
  for (const item of MORE_OFFICIAL) {
    for (const link of item.links) {
      if (link.href.includes("://github.com/")) urls.push(link.href);
    }
  }
  return [...new Set(urls)];
}
