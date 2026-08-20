// 热门项目数据 —— 真实社区项目，按 XIAO 板子型号归类。
// 封面图：优先用项目原页 og:image / YouTube 缩略图；深挖不到的用对应 XIAO 板子官方产品图
// （files.seeedstudio.com，国内可直连）保证每条都有相关图。
// 注：5 条 YouTube 标题为占位（本地环境无法访问 YouTube oEmbed），建议替换为真实视频标题。

const BOARD_IMG = {
  "ESP32-C6": "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/img/xiaoc6.jpg",
  "ESP32-C5":
    "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/Getting_started/Seeed-Studio-XIAO-ESP32C5_1.webp",
  "ESP32-S3": "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/img/xiaoesp32s3.jpg",
  "ESP32-S3 Sense":
    "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/img/xiaoesp32s3sense.jpg",
  "nRF52840": "https://files.seeedstudio.com/wiki/XIAO-BLE/102010469_Front-14.jpg",
  "RP2040": "https://files.seeedstudio.com/wiki/XIAO-RP2040/img/102010428_Preview-07.jpg",
  "MG24": "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/top.jpg",
};

export const PROJECTS = [
  {
    tag: "ESP32-S3 Sense Plus",
    title: "EFortune Cookie — a Tiny ESP32 Fortune Teller",
    excerpt:
      "An interactive fortune-cookie gadget with an e-paper display, built around the XIAO ESP32-S3 Sense Plus.",
    author: "Instructables",
    url: "https://www.instructables.com/EFortune-Cookie-a-Tiny-ESP32-Fortune-Teller/",
    media_url:
      "https://content.instructables.com/F6G/WPQT/MOKK3HWT/F6GWPQTMOKK3HWT.jpg?auto=webp&frame=1",
  },
  {
    tag: "ESP32-C3",
    title: "Building a Giant XIAO: A Fully Functional 15× Scale XIAO ESP32-C3",
    excerpt: "A fully functional 15× scale replica of the Seeed Studio XIAO ESP32-C3.",
    author: "Madriguera",
    url:
      "https://madriguera.me/building-a-giant-xiao-a-fully-functional-15x-scale-seeed-studio-xiao-esp32-c3/",
    media_url:
      "https://madriguera.me/content/images/2026/06/02-size-comparison-real-vs-giant.jpg",
  },
  {
    tag: "ESP32-C6",
    title: "XIAO ESP32-C6 Wireless Project",
    excerpt: "A wireless build showcasing the XIAO ESP32-C6 with Wi-Fi 6 and Thread/Zigbee.",
    author: "YouTube",
    url: "https://www.youtube.com/watch?v=DqiMmY5ppnE",
    media_url: BOARD_IMG["ESP32-C6"],
  },
  {
    tag: "ESP32-C5",
    title: "XIAO ESP32-C5 Connectivity Build",
    excerpt: "A connectivity project on the XIAO ESP32-C5 with Wi-Fi 6 and BLE.",
    author: "YouTube",
    url: "https://www.youtube.com/watch?v=omlpN5Fmq7g",
    media_url: BOARD_IMG["ESP32-C5"],
  },
  {
    tag: "ESP32-S3 Sense",
    title: "XIAO ESP32-S3 Sense Vision Project",
    excerpt: "A vision-enabled project using the XIAO ESP32-S3 Sense camera module.",
    author: "YouTube",
    url: "https://www.youtube.com/watch?v=4tEngx4ffeQ",
    media_url: BOARD_IMG["ESP32-S3 Sense"],
  },
  {
    tag: "ESP32-S3",
    title: "XIAO ESP32-S3 Maker Build",
    excerpt: "A maker project built around the dual-core XIAO ESP32-S3.",
    author: "YouTube",
    url: "https://www.youtube.com/watch?v=0RDqchg34wQ",
    media_url: BOARD_IMG["ESP32-S3"],
  },
  {
    tag: "nRF52840 Sense",
    title: "A 4-Button Bluetooth Macro Keyboard for AI Coding",
    excerpt:
      "A 4-button Bluetooth macro keyboard built on the XIAO nRF52840 Sense for AI coding workflows.",
    author: "Instructables",
    url: "https://www.instructables.com/Vibe-Pad/",
    media_url:
      "https://content.instructables.com/FE8/S8UR/MRCQBOD0/FE8S8URMRCQBOD0.jpg?auto=webp&frame=1&width=2100",
  },
  {
    tag: "nRF52840",
    title: "XIAO nRF52840 Bluetooth Project",
    excerpt: "A Bluetooth project built on the XIAO nRF52840.",
    author: "YouTube",
    url: "https://www.youtube.com/watch?v=9S_ipDDkSGk",
    media_url: BOARD_IMG["nRF52840"],
  },
  {
    tag: "nRF54LM20A",
    title: "tanen — XIAO nRF54LM20A Project",
    excerpt: "An open-source project built on the XIAO nRF54LM20A.",
    author: "GitHub",
    url: "https://github.com/hmd83/tanen",
    media_url:
      "https://opengraph.githubassets.com/64f1032f689a276bf3ab47b05a11fe2c875202ae409deca9b0629b930ee78687/hmd83/tanen",
  },
  {
    tag: "RP2350",
    title: "MINTIA Micropython Console",
    excerpt: "A compact MicroPython console built with the XIAO RP2350.",
    author: "Instructables",
    url: "https://www.instructables.com/MINTIA-Micropython-Console/",
    media_url:
      "https://content.instructables.com/F25/L00G/MQK2168S/F25L00GMQK2168S.jpg?auto=webp&frame=1&width=2100",
  },
  {
    tag: "RP2040",
    title: "Desktop Air Quality Monitor with XIAO RP2040",
    excerpt: "A desktop air-quality monitor using the XIAO RP2040 and an ENS160 sensor.",
    author: "Hackster.io",
    url:
      "https://www.hackster.io/pradeeplogu0/desktop-air-quality-monitor-with-xiao-rp2040-ens160-74ceeb",
    media_url: BOARD_IMG["RP2040"],
  },
  {
    tag: "SAMD21",
    title: "Vail Adapter: Morse Code Key/Paddle to USB",
    excerpt: "A XIAO SAMD21-based adapter project.",
    author: "vailadapter.com",
    url: "https://vailadapter.com/",
    media_url: "https://vailadapter.com/basic%20adapter%20pic.jpg",
  },
  {
    tag: "MG24",
    title: "Glove-controlled Electric Skateboard",
    excerpt: "A glove-controlled electric skateboard powered by the XIAO MG24 over Thread.",
    author: "Silicon Labs Community",
    url:
      "https://community.silabs.com/s/share/a5UVm0000010QoLMAU/updated-xiaopowered-glovecontrolled-electric-skateboard?language=en_US",
    media_url: BOARD_IMG["MG24"],
  },
];
