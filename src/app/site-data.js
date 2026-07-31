export const navItems = [
  { label: "首页", href: "/" },
  { label: "产品", href: "/products" },
  { label: "RES", href: "/res" },
  { label: "Project Hub", href: "/project-hub" },
  { label: "Open Roadmap", href: "/open-roadmap" },
];

export const homepageSections = {
  heroTitle: "Hero Banner区域",
  dataTitle: "DATA",
  dataItems: [
    { value: "17", label: "Dev Boards" },
    { value: "300+", label: "Add-on Accessories" },
    { value: "21×17.8mm", label: "= 2 Gummy Bears" },
    { value: "500,000+", label: "Developers' Choices" },
    { value: "500+ Million", label: "Views on YT, TikTok" },
    { value: "2,000,000+", label: "Pieces Shipped Globally" },
  ],
  ecosystemMedia: "XIAO生态介绍一个图片，视频（但是不展开）",
  productsTitle: "产品",
  products: ["XIAO Dev Boards", "XIAO Add-ons", "XIAO Gadgets"],
  developerTitle: "开发者生态",
  developerItems: ["软件", "XIAO Open Roadmap", "Co-Create XIAO"],
  developerSummary: "生态Ecosystem（软件，硬件，社区）",
  partnerGroups: [
    {
      label: "芯片/硬件伙伴",
      partners: [
        { name: "Nordic", url: "https://www.nordicsemi.com" },
        { name: "Espressif", url: "https://www.espressif.com" },
        { name: "Raspberry Pi", url: "https://www.raspberrypi.com" },
        { name: "Microchip", url: "https://www.microchip.com" },
        { name: "Silicon Labs", url: "https://www.silabs.com" },
        { name: "NXP", url: "https://www.nxp.com" },
        { name: "ST", url: "https://www.st.com" },
        { name: "TI", url: "https://www.ti.com" },
      ],
    },
    {
      label: "软件/框架伙伴",
      partners: [
        { name: "Arduino", url: "https://www.arduino.cc" },
        { name: "PlatformIO", url: "https://platformio.org" },
        { name: "MicroPython", url: "https://micropython.org" },
        { name: "CircuitPython", url: "https://circuitpython.org" },
        { name: "Zephyr", url: "https://zephyrproject.org" },
        { name: "Matter", url: "https://csa-iot.org/all-solutions/matter" },
        { name: "TinyML", url: "https://www.tinyml.org" },
        { name: "Edge Impulse", url: "https://www.edgeimpulse.com" },
      ],
    },
    {
      label: "内容/社区伙伴",
      partners: [
        { name: "Hackster", url: "https://www.hackster.io" },
        { name: "CNX-Software", url: "https://www.cnx-software.com" },
        { name: "Seeed Wiki", url: "https://wiki.seeedstudio.com" },
        { name: "Instructables", url: "https://www.instructables.com" },
        { name: "Hackaday", url: "https://hackaday.com" },
        { name: "Adafruit", url: "https://www.adafruit.com" },
        { name: "SparkFun", url: "https://www.sparkfun.com" },
        { name: "Digi-Key", url: "https://www.digikey.com" },
      ],
    },
  ],
  newsTitle: "XIAO in the News",
  newsItems: [
    { title: "XIAO ESP32-S3 获评年度最佳开发板", source: "Hackster.io", date: "2025-06-15", excerpt: "评测团队对 XIAO ESP32-S3 的紧凑体积与强大性能给予高度评价。", tag: "外部评测" },
    { title: "Seeed Studio 推出 XIAO nRF54L15", source: "CNX-Software", date: "2025-05-28", excerpt: "新一代低功耗 BLE 芯片 nRF54L15 登陆 XIAO 系列，续航提升 40%。", tag: "媒体报道" },
    { title: "XIAO RP2350 上手体验", source: "Hackaday", date: "2025-05-10", excerpt: "双核 RP2350 带来更强大的 PIO 和 USB 支持，适合教育和控制项目。", tag: "外部评测" },
    { title: "XIAO 生态月报：5 月新增 12 个社区项目", source: "Seeed Blog", date: "2025-06-01", excerpt: "本月社区围绕 Matter 和 TinyML 贡献了大量精彩教程和开源代码。", tag: "内部 Blog" },
    { title: "用 XIAO ESP32-C6 搭建 Matter 智能家居", source: "Hackster.io", date: "2025-04-22", excerpt: "完整教程展示如何用 XIAO ESP32-C6 构建多协议智能家居节点。", tag: "外部评测" },
    { title: "XIAO MG24：Matter 时代的微型主力", source: "CNX-Software", date: "2025-04-08", excerpt: "Silicon Labs MG24 让 XIAO 在 Thread/Zigbee 领域表现亮眼。", tag: "媒体报道" },
  ],
  reviewTitle: "用户评价",
  reviewItems: [
    { name: "Alex Chen", role: "嵌入式工程师", company: "IoT Startup", quote: "XIAO 的体积和性能平衡得非常好，ESP32-S3 成了我们量产产品的首选。", avatar: "AC" },
    { name: "Sarah Kim", role: "产品设计师", company: "Design Studio", quote: "从原型到量产，XIAO 让我们的硬件迭代速度提升了 3 倍。", avatar: "SK" },
    { name: "张伟", role: "创客教育者", company: "MakerSpace", quote: "学生用 XIAO 上手特别快，Grove 接口省去了大量焊接时间。", avatar: "张" },
    { name: "Maria Lopez", role: "全栈开发者", company: "Freelance", quote: "MicroPython + XIAO 是我做可穿戴项目的黄金组合，没有之一。", avatar: "ML" },
    { name: "David Park", role: "硬件架构师", company: "Tech Corp", quote: "nRF54L15 的低功耗表现超出预期，电池续航从 7 天延长到 21 天。", avatar: "DP" },
    { name: "李娜", role: "AI 研究员", company: "University Lab", quote: "TinyML 部署在 XIAO 上运行流畅，是边缘 AI 实验的理想平台。", avatar: "李" },
  ],
  edmTitle: "XIAO EDM订阅",
  statsTitle: "数据展示",
};

export const pageDirectories = {
  home: ["Hero Banner区域", "DATA", "产品", "开发者生态", "XIAO in the News", "用户评价", "XIAO EDM订阅", "数据展示"],
  products: ["XIAO Dev Boards", "XIAO Add-ons", "XIAO Gadgets"],
  res: ["RES"],
  projectHub: ["Project Hub"],
  openRoadmap: ["Open Roadmap"],
};

export const defaultXiaoImage =
  "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=clean%20studio%20product%20photo%20of%20a%20compact%20XIAO%20development%20board%20on%20a%20soft%20neutral%20background%2C%20minimal%20shadow%2C%20high%20detail%2C%20e-commerce%20placeholder%2C%20realistic&image_size=landscape_4_3";

export const productPageCategories = [
  {
    label: "XIAO Dev Boards",
    items: [
      { title: "方案名称 01", description: "简单介绍" },
      { title: "方案名称 02", description: "简单介绍" },
      { title: "方案名称 03", description: "简单介绍" },
    ],
  },
  {
    label: "XIAO Add-ons",
    items: [
      { title: "方案名称 01", description: "简单介绍" },
      { title: "方案名称 02", description: "简单介绍" },
      { title: "方案名称 03", description: "简单介绍" },
    ],
  },
  {
    label: "XIAO Gadgets",
    items: [
      { title: "方案名称 01", description: "简单介绍" },
      { title: "方案名称 02", description: "简单介绍" },
      { title: "方案名称 03", description: "简单介绍" },
    ],
  },
];

export const homepageProductCategories = [
  {
    label: "XIAO Dev Boards",
    subcategories: [
      {
        label: "ESP32 Series",
        items: [
          { title: "XIAO ESP32-S3 Plus", description: "适合需要 Wi-Fi、蓝牙、图形界面或轻量 AI 的通用原型，是多数联网项目的稳妥起点。" },
          { title: "XIAO ESP32-S3 Sense", description: "板载摄像头与麦克风更适合视觉、语音采集和轻量边缘 AI 原型。" },
          { title: "XIAO ESP32-C6", description: "适合同时需要 Wi-Fi、BLE 与 Thread / Zigbee 的智能家居和 Matter 设备。" },
        ],
      },
      {
        label: "nRF Series",
        items: [
          { title: "XIAO nRF54L15", description: "面向低功耗 BLE、NFC、可穿戴与电池传感器，适合追求更长续航的新项目。" },
          { title: "XIAO nRF52840 Plus", description: "成熟的低功耗 BLE 与 USB 方案，适合 HID、可穿戴、传感器和稳定量产原型。" },
        ],
      },
      {
        label: "MG24",
        items: [
          { title: "XIAO MG24", description: "适合低功耗 Matter、Thread、Zigbee 与多协议智能家居节点。" },
        ],
      },
      {
        label: "RP2350",
        items: [
          { title: "XIAO RP2350", description: "适合无无线需求的控制、USB、PIO、教育和实时外设项目。" },
        ],
      },
    ],
    items: [
      { title: "XIAO ESP32-S3 Plus", description: "适合需要 Wi-Fi、蓝牙、图形界面或轻量 AI 的通用原型，是多数联网项目的稳妥起点。" },
      { title: "XIAO ESP32-S3 Sense", description: "板载摄像头与麦克风更适合视觉、语音采集和轻量边缘 AI 原型。" },
      { title: "XIAO ESP32-C6", description: "适合同时需要 Wi-Fi、BLE 与 Thread / Zigbee 的智能家居和 Matter 设备。" },
      { title: "XIAO nRF54L15", description: "面向低功耗 BLE、NFC、可穿戴与电池传感器，适合追求更长续航的新项目。" },
      { title: "XIAO nRF52840 Plus", description: "成熟的低功耗 BLE 与 USB 方案，适合 HID、可穿戴、传感器和稳定量产原型。" },
      { title: "XIAO MG24", description: "适合低功耗 Matter、Thread、Zigbee 与多协议智能家居节点。" },
      { title: "XIAO RP2350", description: "适合无无线需求的控制、USB、PIO、教育和实时外设项目。" },
    ],
  },
  {
    label: "XIAO Add-ons",
    subcategories: [
      {
        label: "Expansion Boards",
        items: [
          { title: "XIAO Expansion Board", description: "提供 Grove 接口、OLED 屏幕和 RTC，快速扩展 XIAO 功能。" },
          { title: "XIAO Round Display", description: "圆形 LCD 显示屏扩展，适合 HMI 和可视化交互项目。" },
        ],
      },
      {
        label: "Sensors",
        items: [
          { title: "Grove Temperature & Humidity", description: "高精度温湿度传感器，兼容 XIAO Grove 接口。" },
          { title: "Grove IMU 9DoF", description: "九轴惯性测量单元，适合姿态检测和运动追踪。" },
          { title: "Grove Vision AI", description: "嵌入式视觉模块，支持图像采集和轻量 AI 推理。" },
          { title: "Grove Light Sensor", description: "环境光传感器，适合自动调光和光照监测场景。" },
          { title: "Grove Sound Sensor", description: "声音检测传感器，适合噪声监测和声控交互项目。" },
          { title: "Grove Air Quality", description: "空气质量传感器，检测 VOC 和 CO2，适合室内环境监测。" },
          { title: "Grove PIR Motion", description: "人体红外感应模块，适合安防和智能照明触发。" },
          { title: "Grove Ultrasonic Ranger", description: "超声波测距传感器，适合避障和距离检测项目。" },
          { title: "Grove Soil Moisture", description: "土壤湿度传感器，适合智能农业和植物养护。" },
          { title: "Grove CO2 Sensor", description: "二氧化碳浓度传感器，适合室内空气和温室监测。" },
          { title: "Grove Dust Sensor", description: "颗粒物传感器，检测 PM2.5，适合空气质量评估。" },
          { title: "Grove Barometer", description: "气压传感器，适合海拔测量和天气预报项目。" },
        ],
      },
      {
        label: "Displays",
        items: [
          { title: "XIAO OLED Display", description: "0.96 寸 OLED 显示模块，适合简单信息展示。" },
          { title: "Grove LCD RGB Backlight", description: "RGB 背光字符液晶，适合状态显示和基础 UI。" },
        ],
      },
    ],
    items: [
      { title: "XIAO Expansion Board", description: "提供 Grove 接口、OLED 屏幕和 RTC，快速扩展 XIAO 功能。" },
      { title: "XIAO Round Display", description: "圆形 LCD 显示屏扩展，适合 HMI 和可视化交互项目。" },
      { title: "Grove Temperature & Humidity", description: "高精度温湿度传感器，兼容 XIAO Grove 接口。" },
      { title: "Grove IMU 9DoF", description: "九轴惯性测量单元，适合姿态检测和运动追踪。" },
      { title: "Grove Vision AI", description: "嵌入式视觉模块，支持图像采集和轻量 AI 推理。" },
      { title: "XIAO OLED Display", description: "0.96 寸 OLED 显示模块，适合简单信息展示。" },
      { title: "Grove LCD RGB Backlight", description: "RGB 背光字符液晶，适合状态显示和基础 UI。" },
    ],
  },
  {
    label: "XIAO Gadgets",
    subcategories: [
      {
        label: "Kits",
        items: [
          { title: "XIAO Starter Kit", description: "包含 XIAO 主板和常用配件，适合初学者快速入门。" },
          { title: "XIAO IoT Kit", description: "面向物联网项目的组合套件，含传感器和联网模块。" },
        ],
      },
      {
        label: "Accessories",
        items: [
          { title: "XIAO Battery", description: "锂电池配件，为 XIAO 提供便携供电方案。" },
          { title: "XIAO Case", description: "3D 打印外壳，保护 XIAO 主板并适配多种安装场景。" },
          { title: "XIAO Antenna", description: "外置天线配件，增强 XIAO 无线信号覆盖范围。" },
        ],
      },
      {
        label: "Modules",
        items: [
          { title: "XIAO LoRa Module", description: "LoRa 通信扩展模块，适合远距离低功耗物联网。" },
          { title: "XIAO GNSS Module", description: "卫星定位模块，为 XIAO 提供精准位置服务。" },
        ],
      },
    ],
    items: [
      { title: "XIAO Starter Kit", description: "包含 XIAO 主板和常用配件，适合初学者快速入门。" },
      { title: "XIAO IoT Kit", description: "面向物联网项目的组合套件，含传感器和联网模块。" },
      { title: "XIAO Battery", description: "锂电池配件，为 XIAO 提供便携供电方案。" },
      { title: "XIAO Case", description: "3D 打印外壳，保护 XIAO 主板并适配多种安装场景。" },
      { title: "XIAO Antenna", description: "外置天线配件，增强 XIAO 无线信号覆盖范围。" },
      { title: "XIAO LoRa Module", description: "LoRa 通信扩展模块，适合远距离低功耗物联网。" },
      { title: "XIAO GNSS Module", description: "卫星定位模块，为 XIAO 提供精准位置服务。" },
    ],
  },
];