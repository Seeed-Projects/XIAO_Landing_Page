"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { defaultXiaoImage } from "./site-data";

const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  toggle: () => {},
  t: {},
});

const zh = {
  code: "zh",
  nav: {
    home: "首页",
    products: "产品",
    res: "资源",
    projectHub: "项目中心",
    openRoadmap: "开放路线图",
    software: "软件中心",
    playground: "Playground",
  },
  header: { subtitle: "系列落地页" },
  productsHero: { eyebrow: "产品", h1: "产品页", body: "XIAO 系列产品总览：从产品目录到选型，覆盖开发板、扩展模块与配件。" },
  hero: {
    kicker: "XIAO 系列落地页",
    title: "主视觉横幅",
    ecosystemKicker: "XIAO 生态",
    ecosystemText: "XIAO 生态一览：图片与视频（此处不展开）",
  },
  data: {
    title: "数据",
    items: [
      { value: "17", label: "截至目前 · 开发板" },
      { value: "300+", label: "款扩展配件" },
      { value: "21×17.8 mm", label: "拇指大小" },
      { value: "500,000+", label: "深受开发者信赖" },
      { value: "500+ Million", label: "YouTube / TikTok 播放" },
      { value: "2,000,000+", label: "全球出货量" },
    ],
  },
  products: {
    eyebrow: "产品总览",
    title: "产品",
    categories: [
      {
        label: "XIAO 开发板",
        subcategories: [
          {
            label: "ESP32 系列",
            items: [
              { title: "XIAO ESP32-S3 Plus", description: "适合需要 Wi-Fi、蓝牙、图形界面或轻量 AI 的通用原型，是多数联网项目的稳妥起点。" },
              { title: "XIAO ESP32-S3 Sense", description: "板载摄像头与麦克风更适合视觉、语音采集和轻量边缘 AI 原型。" },
              { title: "XIAO ESP32-C6", description: "适合同时需要 Wi-Fi、BLE 与 Thread / Zigbee 的智能家居和 Matter 设备。" },
            ],
          },
          {
            label: "nRF 系列",
            items: [
              { title: "XIAO nRF54L15", description: "面向低功耗 BLE、NFC、可穿戴与电池传感器，适合追求更长续航的新项目。" },
              { title: "XIAO nRF52840 Plus", description: "成熟的低功耗 BLE 与 USB 方案，适合 HID、可穿戴、传感器和稳定量产原型。" },
            ],
          },
          { label: "MG24", items: [{ title: "XIAO MG24", description: "适合低功耗 Matter、Thread、Zigbee 与多协议智能家居节点。" }] },
          { label: "RP2350", items: [{ title: "XIAO RP2350", description: "适合无无线需求的控制、USB、PIO、教育和实时外设项目。" }] },
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
        label: "XIAO 扩展模块",
        subcategories: [
          {
            label: "扩展板",
            items: [
              { title: "XIAO Expansion Board", description: "提供 Grove 接口、OLED 屏幕和 RTC，快速扩展 XIAO 功能。" },
              { title: "XIAO Round Display", description: "圆形 LCD 显示屏扩展，适合 HMI 和可视化交互项目。" },
            ],
          },
          {
            label: "传感器",
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
            label: "显示屏",
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
        label: "XIAO 配件套装",
        subcategories: [
          {
            label: "套件",
            items: [
              { title: "XIAO Starter Kit", description: "包含 XIAO 主板和常用配件，适合初学者快速入门。" },
              { title: "XIAO IoT Kit", description: "面向物联网项目的组合套件，含传感器和联网模块。" },
            ],
          },
          {
            label: "配件",
            items: [
              { title: "XIAO Battery", description: "锂电池配件，为 XIAO 提供便携供电方案。" },
              { title: "XIAO Case", description: "3D 打印外壳，保护 XIAO 主板并适配多种安装场景。" },
              { title: "XIAO Antenna", description: "外置天线配件，增强 XIAO 无线信号覆盖范围。" },
            ],
          },
          {
            label: "模块",
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
    ],
    image: defaultXiaoImage,
  },
  developer: {
    title: "开发者生态",
    groupLabels: ["芯片/硬件伙伴", "软件/框架伙伴", "内容/社区伙伴"],
  },
  news: {
    title: "XIAO 新闻",
    description: "了解 XIAO 的最新新闻，以及来自 Seeed 和全球社区的最新动态。",
    items: [
      { title: "XIAO ESP32-S3 获评年度最佳开发板", source: "Hackster.io", date: "2025-06-15", excerpt: "评测团队对 XIAO ESP32-S3 的紧凑体积与强大性能给予高度评价。", tag: "外部评测" },
      { title: "Seeed Studio 推出 XIAO nRF54L15", source: "CNX-Software", date: "2025-05-28", excerpt: "新一代低功耗 BLE 芯片 nRF54L15 登陆 XIAO 系列，续航提升 40%。", tag: "媒体报道" },
      { title: "XIAO RP2350 上手体验", source: "Hackaday", date: "2025-05-10", excerpt: "双核 RP2350 带来更强大的 PIO 和 USB 支持，适合教育和控制项目。", tag: "外部评测" },
      { title: "XIAO 生态月报：5 月新增 12 个社区项目", source: "Seeed Blog", date: "2025-06-01", excerpt: "本月社区围绕 Matter 和 TinyML 贡献了大量精彩教程和开源代码。", tag: "内部博客" },
      { title: "用 XIAO ESP32-C6 搭建 Matter 智能家居", source: "Hackster.io", date: "2025-04-22", excerpt: "完整教程展示如何用 XIAO ESP32-C6 构建多协议智能家居节点。", tag: "外部评测" },
      { title: "XIAO MG24：Matter 时代的微型主力", source: "CNX-Software", date: "2025-04-08", excerpt: "Silicon Labs MG24 让 XIAO 在 Thread/Zigbee 领域表现亮眼。", tag: "媒体报道" },
    ],
  },
  projects: {
    title: "基于 XIAO 构建的项目",
    items: [
      { title: "XIAO ESP32-S3 智能天气站", author: "MakerLeo", date: "2025-06-20", excerpt: "基于 XIAO ESP32-S3 的桌面天气站，集成 PM2.5、温湿度与光照，数据上云可视。", tag: "开源" },
      { title: "XIAO 腕上开源智能手表", author: "AdaWei", date: "2025-05-30", excerpt: "用 XIAO nRF54L15 打造的超低功耗可穿戴，续航三周，支持消息提醒与运动监测。", tag: "可穿戴" },
      { title: "ESP32-C6 Matter 家庭网关", author: "TomHax", date: "2025-05-12", excerpt: "以 XIAO ESP32-C6 为核心的多协议网关，统一接入 Thread / Zigbee / Wi-Fi 设备。", tag: "智能家居" },
      { title: "XIAO RP2350 复古游戏机", author: "PixelBin", date: "2025-04-25", excerpt: "RP2350 双核驱动掌机，PIO 模拟经典手柄，开源固件支持社区 ROM。", tag: "教育" },
      { title: "nRF54L15 低功耗资产追踪器", author: "NodeFox", date: "2025-04-10", excerpt: "BLE 5.4 远程追踪标签，纽扣电池待机半年，配合网关实现室内定位。", tag: "物联网" },
      { title: "XIAO MG24 Thread 灯控节点", author: "GlowLab", date: "2025-03-28", excerpt: "基于 MG24 的 Matter over Thread 调光节点，接入苹果家庭与谷歌 Home。", tag: "智能家居" },
    ],
  },
  reviews: {
    title: "用户评价",
    items: [
      { name: "Alex Chen", role: "嵌入式工程师", company: "IoT Startup", quote: "XIAO 的体积和性能平衡得非常好，ESP32-S3 成了我们量产产品的首选。", avatar: "AC" },
      { name: "Sarah Kim", role: "产品设计师", company: "Design Studio", quote: "从原型到量产，XIAO 让我们的硬件迭代速度提升了 3 倍。", avatar: "SK" },
      { name: "张伟", role: "创客教育者", company: "MakerSpace", quote: "学生用 XIAO 上手特别快，Grove 接口省去了大量焊接时间。", avatar: "张" },
      { name: "Maria Lopez", role: "全栈开发者", company: "Freelance", quote: "MicroPython + XIAO 是我做可穿戴项目的黄金组合，没有之一。", avatar: "ML" },
      { name: "David Park", role: "硬件架构师", company: "Tech Corp", quote: "nRF54L15 的低功耗表现超出预期，电池续航从 7 天延长到 21 天。", avatar: "DP" },
      { name: "李娜", role: "AI 研究员", company: "University Lab", quote: "TinyML 部署在 XIAO 上运行流畅，是边缘 AI 实验的理想平台。", avatar: "李" },
    ],
  },
  mediaReviews: {
    kicker: "媒体与社区之声",
    title: "开源社区信赖之选",
  },
  cocreate: {
    title: "与 XIAO 共创",
    kicker: "共创",
    description: "借助 Seeed Fusion Co-Create 的原型、量产与推广服务，从零开始设计并规模化你定制的 XIAO 项目。提交基于 XIAO 的 PCBA 设计即可获得免费打样赞助；优秀设计还将上架 Seeed 官方商城销售，设计者按每售出一件获得授权收益。",
    banner: {
      kicker: "XIAO × Seeed Fusion",
      title: "与 XIAO 共创",
      text: "借助 Seeed Fusion Co-Create 的原型、量产与推广服务，从零开始设计并规模化你定制的 XIAO 项目。提交基于 XIAO 的 PCBA 设计即可获得免费打样赞助；优秀设计还将上架 Seeed 官方商城销售，设计者按每售出一件获得授权收益。",
      cta: "了解更多",
      nodes: ["XIAO", "Grove", "Fusion", "Wiki", "社区"],
    },
    features: [
      { title: "R&D 资源", desc: "开源硬件、参考设计与工程支持，降低研发门槛。" },
      { title: "Fusion 制造", desc: "PCB 打样、PCBA 贴片与小批量量产，敏捷交付。" },
      { title: "全球渠道", desc: "认证、上架与全球分销网络，助力产品走向市场。" },
    ],
    steps: [
      { label: "提出想法", sub: "构思" },
      { label: "快速打样", sub: "原型" },
      { label: "量产支持", sub: "量产" },
      { label: "全球上架", sub: "上市" },
    ],
  },
  edm: {
    kicker: "Newsletter",
    title: "“Everything About XIAO”",
    description: "专为所有 XIAO 用户打造的每月电子报，内容包括：",
    topics: ["🤖️ 社区酷项目", "📖 固件、Wiki 与新品预告等产品更新", "📣 活动、竞赛等最新消息"],
    contact: "📮 还有其他问题？请联系 maker[at]seeed.cc",
    placeholder: "输入你的邮箱地址",
    button: "立即订阅",
    footnote: "订阅即表示同意接收 Seeed Studio 的产品与资讯邮件。",
    success: "订阅成功！请到邮箱查收确认邮件。",
  },
  stats: { title: "数据展示" },
  contact: { label: "联系方式" },
  side: {
    home: [
      { id: "hero", label: "主视觉" },
      { id: "data", label: "数据" },
      { id: "developer", label: "开发者生态" },
      { id: "projects", label: "基于 XIAO 构建的项目" },
      { id: "news", label: "XIAO 新闻" },
      { id: "reviews", label: "媒体评测" },
      { id: "cocreate", label: "生态共创" },
      { id: "edm", label: "XIAO 电子报" },
    ],
    products: [
      { id: "top", label: "概览" },
      { id: "products-catalog", label: "产品目录" },
      { id: "smart-selector", label: "智能选型" },
      { id: "pinout", label: "引脚定义" },
      { id: "esp-flasher", label: "在线烧录" },
    ],
    res: [
      { id: "top", label: "顶部" },
      { id: "resources", label: "资源" },
    ],
    projectHub: [
      { id: "top", label: "顶部" },
      { id: "archive", label: "应用归档" },
    ],
    openRoadmap: [
      { id: "top", label: "顶部" },
      { id: "ideas", label: "创意投票" },
      { id: "success", label: "成功案例" },
    ],
    softwareCenter: [
      { id: "top", label: "概览" },
      { id: "official", label: "官方软件" },
      { id: "community", label: "社区软件" },
    ],
  },
};

const en = {
  code: "en",
  nav: {
    home: "Home",
    products: "Products",
    res: "Resources",
    projectHub: "Project Hub",
    openRoadmap: "Open Roadmap",
    software: "Software Center",
    playground: "Playground",
  },
  header: { subtitle: "Series Landing Page" },
  productsHero: { eyebrow: "Products", h1: "Products", body: "An overview of the XIAO lineup — from catalog and selection to dev boards, add-ons and accessories." },
  hero: {
    kicker: "XIAO Landing Page · Home",
    title: "Hero Banner Area",
    ecosystemKicker: "XIAO Ecosystem",
    ecosystemText: "A showcase of the XIAO ecosystem — images and video (not expanded here).",
  },
  data: {
    title: "DATA",
    items: [
      { value: "17", label: "By now · Dev Boards" },
      { value: "300+", label: "Add-on Accessories" },
      { value: "21×17.8 mm", label: "Thumb Sized" },
      { value: "500,000+", label: "Trusted by Developers" },
      { value: "500+ Million", label: "Views on YT, TikTok" },
      { value: "2,000,000+", label: "Pieces Shipped Globally" },
    ],
  },
  products: {
    eyebrow: "Products",
    title: "Products",
    categories: [
      {
        label: "XIAO Dev Boards",
        subcategories: [
          {
            label: "ESP32 Series",
            items: [
              { title: "XIAO ESP32-S3 Plus", description: "A solid starting point for general prototypes needing Wi-Fi, Bluetooth, a display, or lightweight AI — a safe bet for most connected projects." },
              { title: "XIAO ESP32-S3 Sense", description: "Onboard camera and microphone make it better for vision, voice capture, and lightweight edge AI prototyping." },
              { title: "XIAO ESP32-C6", description: "For smart-home and Matter devices that need Wi-Fi, BLE, and Thread / Zigbee at once." },
            ],
          },
          {
            label: "nRF Series",
            items: [
              { title: "XIAO nRF54L15", description: "For low-power BLE, NFC, wearables, and battery sensors — ideal for new projects that need longer runtime." },
              { title: "XIAO nRF52840 Plus", description: "A mature low-power BLE and USB solution for HID, wearables, sensors, and stable production prototypes." },
            ],
          },
          { label: "MG24", items: [{ title: "XIAO MG24", description: "For low-power Matter, Thread, Zigbee, and multi-protocol smart-home nodes." }] },
          { label: "RP2350", items: [{ title: "XIAO RP2350", description: "For control, USB, PIO, education, and real-time peripheral projects without wireless needs." }] },
        ],
        items: [
          { title: "XIAO ESP32-S3 Plus", description: "A solid starting point for general prototypes needing Wi-Fi, Bluetooth, a display, or lightweight AI — a safe bet for most connected projects." },
          { title: "XIAO ESP32-S3 Sense", description: "Onboard camera and microphone make it better for vision, voice capture, and lightweight edge AI prototyping." },
          { title: "XIAO ESP32-C6", description: "For smart-home and Matter devices that need Wi-Fi, BLE, and Thread / Zigbee at once." },
          { title: "XIAO nRF54L15", description: "For low-power BLE, NFC, wearables, and battery sensors — ideal for new projects that need longer runtime." },
          { title: "XIAO nRF52840 Plus", description: "A mature low-power BLE and USB solution for HID, wearables, sensors, and stable production prototypes." },
          { title: "XIAO MG24", description: "For low-power Matter, Thread, Zigbee, and multi-protocol smart-home nodes." },
          { title: "XIAO RP2350", description: "For control, USB, PIO, education, and real-time peripheral projects without wireless needs." },
        ],
      },
      {
        label: "XIAO Add-ons",
        subcategories: [
          {
            label: "Expansion Boards",
            items: [
              { title: "XIAO Expansion Board", description: "Adds Grove connectors, an OLED screen, and RTC to quickly extend XIAO capabilities." },
              { title: "XIAO Round Display", description: "A round LCD display add-on for HMI and visual interaction projects." },
            ],
          },
          {
            label: "Sensors",
            items: [
              { title: "Grove Temperature & Humidity", description: "High-precision temp & humidity sensor, compatible with XIAO Grove connectors." },
              { title: "Grove IMU 9DoF", description: "9-axis inertial measurement unit for posture detection and motion tracking." },
              { title: "Grove Vision AI", description: "Embedded vision module supporting image capture and lightweight AI inference." },
              { title: "Grove Light Sensor", description: "Ambient light sensor for auto-dimming and light monitoring scenarios." },
              { title: "Grove Sound Sensor", description: "Sound detection sensor for noise monitoring and voice-triggered interaction." },
              { title: "Grove Air Quality", description: "Air quality sensor detecting VOC and CO2 for indoor environment monitoring." },
              { title: "Grove PIR Motion", description: "PIR motion sensor for security and smart-lighting triggers." },
              { title: "Grove Ultrasonic Ranger", description: "Ultrasonic distance sensor for obstacle avoidance and range detection." },
              { title: "Grove Soil Moisture", description: "Soil moisture sensor for smart agriculture and plant care." },
              { title: "Grove CO2 Sensor", description: "CO2 concentration sensor for indoor air and greenhouse monitoring." },
              { title: "Grove Dust Sensor", description: "Particulate sensor detecting PM2.5 for air quality assessment." },
              { title: "Grove Barometer", description: "Barometric pressure sensor for altitude measurement and weather forecasts." },
            ],
          },
          {
            label: "Displays",
            items: [
              { title: "XIAO OLED Display", description: "0.96-inch OLED display module for simple information display." },
              { title: "Grove LCD RGB Backlight", description: "RGB-backlit character LCD for status display and basic UI." },
            ],
          },
        ],
        items: [
          { title: "XIAO Expansion Board", description: "Adds Grove connectors, an OLED screen, and RTC to quickly extend XIAO capabilities." },
          { title: "XIAO Round Display", description: "A round LCD display add-on for HMI and visual interaction projects." },
          { title: "Grove Temperature & Humidity", description: "High-precision temp & humidity sensor, compatible with XIAO Grove connectors." },
          { title: "Grove IMU 9DoF", description: "9-axis inertial measurement unit for posture detection and motion tracking." },
          { title: "Grove Vision AI", description: "Embedded vision module supporting image capture and lightweight AI inference." },
          { title: "XIAO OLED Display", description: "0.96-inch OLED display module for simple information display." },
          { title: "Grove LCD RGB Backlight", description: "RGB-backlit character LCD for status display and basic UI." },
        ],
      },
      {
        label: "XIAO Gadgets",
        subcategories: [
          {
            label: "Kits",
            items: [
              { title: "XIAO Starter Kit", description: "Includes a XIAO board and common accessories for beginners to get started fast." },
              { title: "XIAO IoT Kit", description: "An IoT-focused bundle with sensors and connectivity modules." },
            ],
          },
          {
            label: "Accessories",
            items: [
              { title: "XIAO Battery", description: "Lithium battery accessory for portable XIAO power." },
              { title: "XIAO Case", description: "3D-printed case to protect the XIAO board and fit various mounting scenarios." },
              { title: "XIAO Antenna", description: "External antenna accessory to extend XIAO wireless coverage." },
            ],
          },
          {
            label: "Modules",
            items: [
              { title: "XIAO LoRa Module", description: "LoRa communication add-on for long-range, low-power IoT." },
              { title: "XIAO GNSS Module", description: "Satellite positioning module for precise location services on XIAO." },
            ],
          },
        ],
        items: [
          { title: "XIAO Starter Kit", description: "Includes a XIAO board and common accessories for beginners to get started fast." },
          { title: "XIAO IoT Kit", description: "An IoT-focused bundle with sensors and connectivity modules." },
          { title: "XIAO Battery", description: "Lithium battery accessory for portable XIAO power." },
          { title: "XIAO Case", description: "3D-printed case to protect the XIAO board and fit various mounting scenarios." },
          { title: "XIAO Antenna", description: "External antenna accessory to extend XIAO wireless coverage." },
          { title: "XIAO LoRa Module", description: "LoRa communication add-on for long-range, low-power IoT." },
          { title: "XIAO GNSS Module", description: "Satellite positioning module for precise location services on XIAO." },
        ],
      },
    ],
    image: defaultXiaoImage,
  },
  developer: {
    title: "Developer Ecosystem",
    groupLabels: ["Chip / Hardware Partners", "Software / Framework Partners", "Content / Community Partners"],
  },
  news: {
    title: "XIAO in the News",
    description: "Discover the latest news on XIAO, updates from Seeed and from our community all over the world",
    items: [
      { title: "XIAO ESP32-S3 named Dev Board of the Year", source: "Hackster.io", date: "2025-06-15", excerpt: "Reviewers praised the XIAO ESP32-S3's balance of compact size and strong performance.", tag: "External Review" },
      { title: "Seeed Studio launches XIAO nRF54L15", source: "CNX-Software", date: "2025-05-28", excerpt: "The new low-power BLE chip nRF54L15 joins the XIAO lineup with 40% longer runtime.", tag: "Media Coverage" },
      { title: "Hands-on with the XIAO RP2350", source: "Hackaday", date: "2025-05-10", excerpt: "The dual-core RP2350 brings stronger PIO and USB support, great for education and control projects.", tag: "External Review" },
      { title: "XIAO ecosystem monthly: 12 new community projects in May", source: "Seeed Blog", date: "2025-06-01", excerpt: "This month the community contributed a wealth of tutorials and open-source code around Matter and TinyML.", tag: "Internal Blog" },
      { title: "Building a Matter smart home with XIAO ESP32-C6", source: "Hackster.io", date: "2025-04-22", excerpt: "A full tutorial shows how to build a multi-protocol smart-home node with the XIAO ESP32-C6.", tag: "External Review" },
      { title: "XIAO MG24: a compact mainstay for the Matter era", source: "CNX-Software", date: "2025-04-08", excerpt: "Silicon Labs' MG24 makes XIAO shine in the Thread / Zigbee space.", tag: "Media Coverage" },
    ],
  },
  projects: {
    title: "Projects Built on XIAO",
    items: [
      { title: "XIAO ESP32-S3 Smart Weather Station", author: "MakerLeo", date: "2025-06-20", excerpt: "A desk weather station built on XIAO ESP32-S3 — PM2.5, temp/humidity and light, cloud-dashboarded.", tag: "Open Source" },
      { title: "XIAO Open-Source Smart Watch", author: "AdaWei", date: "2025-05-30", excerpt: "An ultra-low-power wearable on XIAO nRF54L15 — three-week battery life with alerts and activity tracking.", tag: "Wearable" },
      { title: "ESP32-C6 Matter Home Gateway", author: "TomHax", date: "2025-05-12", excerpt: "A multi-protocol gateway centered on XIAO ESP32-C6, unifying Thread / Zigbee / Wi-Fi devices.", tag: "Smart Home" },
      { title: "XIAO RP2350 Retro Handheld", author: "PixelBin", date: "2025-04-25", excerpt: "Dual-core RP2350 handheld — PIO emulates classic pads, open firmware supports community ROMs.", tag: "Education" },
      { title: "nRF54L15 Low-Power Asset Tracker", author: "NodeFox", date: "2025-04-10", excerpt: "BLE 5.4 tracking tag with half a year of coin-cell standby, indoor positioning via gateway.", tag: "IoT" },
      { title: "XIAO MG24 Thread Light Node", author: "GlowLab", date: "2025-03-28", excerpt: "A Matter-over-Thread dimming node on MG24, integrating with Apple Home and Google Home.", tag: "Smart Home" },
    ],
  },
  reviews: {
    title: "User Reviews",
    items: [
      { name: "Alex Chen", role: "Embedded Engineer", company: "IoT Startup", quote: "XIAO nails the size-to-performance balance — the ESP32-S3 became our go-to for mass-produced products.", avatar: "AC" },
      { name: "Sarah Kim", role: "Product Designer", company: "Design Studio", quote: "From prototype to production, XIAO sped up our hardware iteration 3x.", avatar: "SK" },
      { name: "Zhang Wei", role: "Maker Educator", company: "MakerSpace", quote: "Students pick up XIAO really fast, and the Grove connectors save tons of soldering time.", avatar: "ZW" },
      { name: "Maria Lopez", role: "Full-stack Developer", company: "Freelance", quote: "MicroPython + XIAO is my golden combo for wearable projects, bar none.", avatar: "ML" },
      { name: "David Park", role: "Hardware Architect", company: "Tech Corp", quote: "The nRF54L15's low-power performance exceeded expectations — battery life went from 7 days to 21.", avatar: "DP" },
      { name: "Li Na", role: "AI Researcher", company: "University Lab", quote: "TinyML runs smoothly on XIAO — an ideal platform for edge AI experiments.", avatar: "LN" },
    ],
  },
  mediaReviews: {
    kicker: "Media & Community Voices",
    title: "Trusted by the Open-Source Community",
  },
  cocreate: {
    title: "Co-Create with XIAO",
    kicker: "CO-CREATE",
    description: "Design and scale up your custom XIAO-based projects from scratch with Seeed Fusion Co-Create Services of prototyping, production and promotion. Get FREE prototyping sponsorship for your XIAO-based PCBA design fabrication. We'll also list outstanding designs for sale on the Seeed webstore, and designers will receive a license fee for each piece sold.",
    banner: {
      kicker: "XIAO × Seeed Fusion",
      title: "Co-Create with XIAO",
      text: "Design and scale up your custom XIAO-based projects from scratch with Seeed Fusion Co-Create Services of prototyping, production and promotion. Get FREE prototyping sponsorship for your XIAO-based PCBA design fabrication. We'll also list outstanding designs for sale on the Seeed webstore, and designers will receive a license fee for each piece sold.",
      cta: "Learn More",
      nodes: ["XIAO", "Grove", "Fusion", "Wiki", "Community"],
    },
    features: [
      { title: "R&D Resources", desc: "Open-source hardware, reference designs, and engineering support that lower the R&D barrier." },
      { title: "Fusion Manufacturing", desc: "PCB prototyping, PCBA assembly, and small-batch production with agile delivery." },
      { title: "Global Channels", desc: "Certification, listings, and a worldwide distribution network to take products to market." },
    ],
    steps: [
      { label: "Ideation", sub: "Share your idea" },
      { label: "Prototype", sub: "Fast sampling" },
      { label: "Production", sub: "Scale up" },
      { label: "Launch", sub: "Go global" },
    ],
  },
  edm: {
    kicker: "NEWSLETTER",
    title: "“Everything About XIAO”",
    description: "A monthly newsletter specifically for all XIAO owners with topics of:",
    topics: [
      "🤖️ Cool Projects from the Community",
      "📖 Product Updates on firmware, wiki and new product spoiler",
      "📣 News: events, contest, and more",
    ],
    contact: "📮 Got any other questions? Contact us at maker[at]seeed.cc",
    placeholder: "Enter your email address",
    button: "Subscribe NOW",
    footnote: "By subscribing you agree to receive product and news emails from Seeed Studio.",
    success: "Subscribed! Please check your inbox for the confirmation email.",
  },
  stats: { title: "Data Showcase" },
  contact: { label: "contact" },
  side: {
    home: [
      { id: "hero", label: "Hero" },
      { id: "data", label: "DATA" },
      { id: "developer", label: "Developer" },
      { id: "projects", label: "Projects Built on XIAO" },
      { id: "news", label: "News" },
      { id: "reviews", label: "Reviews" },
      { id: "cocreate", label: "Co-Create" },
      { id: "edm", label: "NEWSLETTER" },
    ],
    products: [
      { id: "top", label: "Overview" },
      { id: "products-catalog", label: "Catalog" },
      { id: "smart-selector", label: "Smart Selector" },
      { id: "pinout", label: "Pinout" },
      { id: "esp-flasher", label: "ESP Flasher" },
    ],
    res: [
      { id: "top", label: "Top" },
      { id: "resources", label: "Resources" },
    ],
    projectHub: [
      { id: "top", label: "Top" },
      { id: "archive", label: "Archive" },
    ],
    openRoadmap: [
      { id: "top", label: "Top" },
      { id: "ideas", label: "Ideas" },
      { id: "success", label: "Success Cases" },
    ],
    softwareCenter: [
      { id: "top", label: "Overview" },
      { id: "official", label: "Official" },
      { id: "community", label: "Community" },
    ],
  },
};

export const dictionaries = { zh, en };

const LANG_KEY = "xiao-lang";
const VALID = ["en", "zh"];

/* 读取已持久化的语言偏好；SSR/构建期无 window，返回 "en" 与预渲染 HTML 一致，
   避免 hydration mismatch；客户端挂载后再同步到 localStorage 的真实值。 */
function readStoredLang() {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    return VALID.includes(v) ? v : "en";
  } catch {
    return "en";
  }
}

function writeStoredLang(lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

/* 同步 <html lang>，供浏览器/无障碍/字体特性使用 */
function syncHtmlLang(lang) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export function LanguageProvider({ children }) {
  // 初始 "en" 与静态导出预渲染一致；挂载后用 useEffect 恢复用户偏好，避免 hydration 报错
  const [lang, setLangState] = useState("en");

  // 挂载时从 localStorage 恢复，并同步 <html lang>
  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== "en") setLangState(stored);
    syncHtmlLang(stored);
  }, []);

  const setLang = useCallback((next) => {
    const v = VALID.includes(next) ? next : "en";
    setLangState(v);
    writeStoredLang(v);
    syncHtmlLang(v);
  }, []);

  const toggle = useCallback(() => {
    setLangState((p) => {
      const v = p === "zh" ? "en" : "zh";
      writeStoredLang(v);
      syncHtmlLang(v);
      return v;
    });
  }, []);

  const value = useMemo(() => ({ lang, setLang, toggle, t: dictionaries[lang] }), [lang, setLang, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
