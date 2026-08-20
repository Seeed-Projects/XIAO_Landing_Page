"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import styles from "./smart-selector.module.css";

/* 8 款产品 */
const products = [
  {
    id: "esp32s3plus", name: "XIAO ESP32-S3 Plus", family: "ESP32",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-102010671-seeedstudio-xiao-esp32s3-plus_1.jpg",
    link: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Plus-p-6361.html",
    wireless: ["Wi-Fi", "BLE"], features: [{ en: "High perf", zh: "高性能" }, { en: "PSRAM", zh: "PSRAM" }, { en: "Rich GPIO", zh: "丰富 GPIO" }, { en: "USB", zh: "USB" }],
    scenarios: ["vision", "voice", "display", "robot", "iot", "usb"], power: "standard",
    experience: ["beginner", "arduino", "platformio", "espidf"], production: true, scoreBias: 7,
    tagline: { en: "For GUI, voice, camera and complex connected projects.", zh: "适合图形界面、语音、摄像头和复杂联网项目。" },
    caution: { en: "If the project runs on a coin cell long-term, it's usually not the first pick.", zh: "如果项目主要依靠纽扣电池长期运行，它通常不是第一选择。" },
    bestFor: { en: "Projects needing Wi-Fi, BLE, strong compute and larger program space.", zh: "需要 Wi-Fi、BLE、较强算力和较大程序空间的项目。" },
    specs: { wireless: { en: "Wi-Fi + Bluetooth LE", zh: "Wi-Fi + Bluetooth LE" }, perf: { en: "High-perf connected MCU", zh: "高性能联网 MCU" }, app: { en: "Screen, voice, vision, robot", zh: "屏幕、语音、视觉、机器人" }, battery: { en: "Usable, not ultra-low-power focused", zh: "可用，但不以极低功耗为主" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "esp32c6", name: "XIAO ESP32-C6", family: "ESP32",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/w/e/wechatimg291.jpg",
    link: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html",
    wireless: ["Wi-Fi", "BLE", "Matter", "Thread", "Zigbee"], features: [{ en: "Wi-Fi 6", zh: "Wi-Fi 6" }, { en: "Smart home", zh: "智能家居" }, { en: "Low cost", zh: "低成本" }],
    scenarios: ["iot", "matter", "sensor", "home"], power: "standard",
    experience: ["beginner", "arduino", "platformio", "espidf"], production: true, scoreBias: 5,
    tagline: { en: "For Matter, Thread, Zigbee and smart-home devices.", zh: "适合 Matter、Thread、Zigbee 和智能家居设备。" },
    caution: { en: "Not ideal when graphics, camera or large memory matter most.", zh: "不适合对图形、摄像头或大内存有明显要求的项目。" },
    bestFor: { en: "Smart-home products needing Wi-Fi and 802.15.4 multi-protocol.", zh: "需要 Wi-Fi 与 802.15.4 多协议能力的智能家居产品。" },
    specs: { wireless: { en: "Wi-Fi 6 + BLE + Thread/Zigbee", zh: "Wi-Fi 6 + BLE + Thread/Zigbee" }, perf: { en: "Multi-protocol connected MCU", zh: "多协议联网 MCU" }, app: { en: "Matter, gateway, smart home", zh: "Matter、网关节点、智能家居" }, battery: { en: "Fine for general low-power", zh: "适合一般低功耗设计" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "esp32c3", name: "XIAO ESP32-C3", family: "ESP32",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-113991054-seeed-studio-xiao-esp32c3-45font_1.jpg",
    link: "https://www.seeedstudio.com/Seeed-XIAO-ESP32C3-p-5431.html",
    wireless: ["Wi-Fi", "BLE"], features: [{ en: "Cost-effective", zh: "高性价比" }, { en: "Mature ecosystem", zh: "成熟生态" }],
    scenarios: ["iot", "sensor", "home"], power: "standard",
    experience: ["beginner", "arduino", "platformio", "espidf"], production: true, scoreBias: 4,
    tagline: { en: "A cost-friendly Wi-Fi and BLE entry point.", zh: "成本友好的 Wi-Fi 与 BLE 入门选择。" },
    caution: { en: "For complex UI, vision or heavy AI, prefer the ESP32-S3 Plus.", zh: "复杂 UI、视觉和较重的 AI 工作负载建议选择 ESP32-S3 Plus。" },
    bestFor: { en: "Basic connected sensors, controllers and cost-sensitive projects.", zh: "基础联网传感器、控制器和成本敏感型项目。" },
    specs: { wireless: { en: "Wi-Fi + Bluetooth LE", zh: "Wi-Fi + Bluetooth LE" }, perf: { en: "Entry connected MCU", zh: "入门联网 MCU" }, app: { en: "Sensors, controllers, simple IoT", zh: "传感器、控制器、简单 IoT" }, battery: { en: "Fine for ordinary battery use", zh: "适合普通电池项目" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "nrf52840plus", name: "XIAO nRF52840 Plus", family: "Nordic",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/2/-/2-102010448-seeed-studio-xiao-nrf52840-45font-logo.jpg",
    link: "https://www.seeedstudio.com/Seeed-XIAO-BLE-nRF52840-p-5201.html",
    wireless: ["BLE", "NFC"], features: [{ en: "Low power", zh: "低功耗" }, { en: "USB", zh: "USB" }, { en: "NFC", zh: "NFC" }],
    scenarios: ["wearable", "sensor", "usb", "battery"], power: "low",
    experience: ["beginner", "arduino", "zephyr"], production: true, scoreBias: 5,
    tagline: { en: "A mature BLE, USB HID, NFC and low-power solution.", zh: "成熟的 BLE、USB HID、NFC 与低功耗方案。" },
    caution: { en: "No Wi-Fi; reaching the cloud usually needs a gateway or phone.", zh: "不提供 Wi-Fi；需要直接联网到云端时通常需要网关或手机。" },
    bestFor: { en: "BLE wearables, wireless sensors, keyboards/mice and NFC.", zh: "BLE 可穿戴、无线传感器、键鼠和 NFC 项目。" },
    specs: { wireless: { en: "Bluetooth LE + NFC", zh: "Bluetooth LE + NFC" }, perf: { en: "Mature low-power wireless MCU", zh: "成熟低功耗无线 MCU" }, app: { en: "Wearable, HID, sensor, NFC", zh: "可穿戴、HID、传感器、NFC" }, battery: { en: "Suitable", zh: "适合" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "nrf54l15", name: "XIAO nRF54L15", family: "Nordic",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-101991421-xiao-nrf54l14.jpg",
    link: "https://www.seeedstudio.com/XIAO-nRF54L15-p-6493.html",
    wireless: ["BLE", "Matter", "Thread", "Zigbee"], features: [{ en: "New-gen low power", zh: "新一代低功耗" }, { en: "Multi-protocol", zh: "多协议" }, { en: "Secure", zh: "安全" }],
    scenarios: ["wearable", "sensor", "matter", "battery", "home"], power: "ultra-low",
    experience: ["zephyr", "ncs", "advanced"], production: true, scoreBias: 6,
    tagline: { en: "For new-gen low-power, multi-protocol and battery devices.", zh: "面向新一代低功耗、多协议与电池设备。" },
    caution: { en: "Toolchain leans nRF Connect SDK / Zephyr — steeper than Arduino-flagship boards.", zh: "开发链路更偏 nRF Connect SDK / Zephyr，初学者上手成本高于 Arduino 主力产品。" },
    bestFor: { en: "Long-term battery, BLE 6.0 and Matter over Thread products.", zh: "长期电池供电、BLE 6.0 和 Matter over Thread 产品。" },
    specs: { wireless: { en: "BLE + Thread/Zigbee", zh: "BLE + Thread/Zigbee" }, perf: { en: "New-gen ultra-low-power wireless MCU", zh: "新一代超低功耗无线 MCU" }, app: { en: "Wearable, Matter, long-life battery node", zh: "可穿戴、Matter、长期电池节点" }, battery: { en: "Excellent", zh: "非常适合" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "mg24", name: "XIAO MG24", family: "Silicon Labs",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/n/e/new-1-102010590-seeed-studio-xiao-mg24_1.jpg",
    link: "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-p-6247.html",
    wireless: ["BLE", "Matter", "Thread", "Zigbee"], features: [{ en: "Low power", zh: "低功耗" }, { en: "Matter", zh: "Matter" }, { en: "AI/ML", zh: "AI/ML" }],
    scenarios: ["matter", "sensor", "battery", "home"], power: "ultra-low",
    experience: ["arduino", "advanced"], production: true, scoreBias: 5,
    tagline: { en: "A practical pick for low-power Matter, Thread and BLE devices.", zh: "低功耗 Matter、Thread 和 BLE 设备的实用选择。" },
    caution: { en: "Need Wi-Fi? Pick the ESP32-C6. Complex UI? Pick the ESP32-S3 Plus.", zh: "如果需要 Wi-Fi，应该选择 ESP32-C6；如果要做复杂 UI，建议 ESP32-S3 Plus。" },
    bestFor: { en: "Low-power smart-home, Thread end devices and wireless sensors.", zh: "低功耗智能家居、Thread 终端和无线传感器。" },
    specs: { wireless: { en: "BLE + Thread/Zigbee", zh: "BLE + Thread/Zigbee" }, perf: { en: "Low-power multi-protocol MCU", zh: "低功耗多协议 MCU" }, app: { en: "Matter, sensor, smart home", zh: "Matter、传感器、智能家居" }, battery: { en: "Excellent", zh: "非常适合" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "rp2350", name: "XIAO RP2350", family: "Raspberry Pi",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/g/r/group_1.jpg",
    link: "https://www.seeedstudio.com/Seeed-XIAO-RP2350-p-5944.html",
    wireless: [], features: [{ en: "PIO", zh: "PIO" }, { en: "High-perf control", zh: "高性能控制" }, { en: "No wireless", zh: "无无线" }],
    scenarios: ["usb", "robot", "control", "education"], power: "standard",
    experience: ["beginner", "arduino", "micropython"], production: true, scoreBias: 3,
    tagline: { en: "For USB, real-time control, education and PIO projects.", zh: "适合 USB、实时控制、教育和 PIO 外设项目。" },
    caution: { en: "No onboard wireless; add a comms module for connected projects.", zh: "没有板载无线连接；联网项目需要外接通信模块。" },
    bestFor: { en: "Wireless-free projects valuing real-time control and rich I/O.", zh: "不需要无线、重视实时控制和丰富外设玩法的项目。" },
    specs: { wireless: { en: "No onboard wireless", zh: "无板载无线" }, perf: { en: "High-perf general MCU", zh: "高性能通用 MCU" }, app: { en: "USB, PIO, robot, education", zh: "USB、PIO、机器人、教育" }, battery: { en: "Fine for ordinary projects", zh: "适合一般项目" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
  {
    id: "ra4m1", name: "XIAO RA4M1", family: "Renesas",
    img: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/1/-/1-102010551-seeed-studio-xiao-ra4m1.jpg",
    link: "https://www.seeedstudio.com/Seeed-XIAO-RA4M1-p-5943.html",
    wireless: [], features: [{ en: "Stable control", zh: "稳定控制" }, { en: "Arduino", zh: "Arduino" }, { en: "No wireless", zh: "无无线" }],
    scenarios: ["control", "education", "sensor"], power: "low",
    experience: ["beginner", "arduino"], production: true, scoreBias: 3,
    tagline: { en: "For stable control, sensors and Arduino teaching.", zh: "适合稳定控制、传感器和 Arduino 教学项目。" },
    caution: { en: "No onboard wireless; pick another XIAO when Wi-Fi or BLE is needed.", zh: "没有板载无线；需要 Wi-Fi 或 BLE 时应选择其他 XIAO。" },
    bestFor: { en: "Wireless-free projects valuing stable control and Arduino UX.", zh: "不依赖无线、重视稳定控制和 Arduino 体验的项目。" },
    specs: { wireless: { en: "No onboard wireless", zh: "无板载无线" }, perf: { en: "General control MCU", zh: "通用控制 MCU" }, app: { en: "Sensor, control, education", zh: "传感器、控制、教育" }, battery: { en: "Suitable", zh: "适合" }, prod: { en: "SMT & custom base supported", zh: "支持贴片与自定义底板" } },
  },
];

/* 6 步问答 */
const steps = [
  { id: "scenario", title: { en: "Project scene", zh: "项目场景" }, kicker: { en: "Step 1", zh: "第 1 步" }, question: { en: "What are you building?", zh: "你准备做什么项目？" }, desc: { en: "Pick the closest direction — you can refine later.", zh: "先选最接近的方向，后面还可以继续补充。" }, multi: true, options: [
    ["iot", "☁️", { en: "Wi-Fi IoT", zh: "Wi-Fi 物联网" }, { en: "Sensor-to-cloud, web control, remote devices", zh: "传感器上云、网页控制、远程设备" }],
    ["wearable", "⌚", { en: "Wearable / portable", zh: "可穿戴 / 便携设备" }, { en: "Bands, badges, carry-along devices", zh: "手环、徽章、随身设备" }],
    ["matter", "🏠", { en: "Matter / smart home", zh: "Matter / 智能家居" }, { en: "Thread, Zigbee, home automation", zh: "Thread、Zigbee、家庭自动化" }],
    ["vision", "📷", { en: "Camera / vision", zh: "摄像头 / 视觉" }, { en: "Image capture, recognition, AI cam", zh: "图像采集、识别、AI 摄像头" }],
    ["voice", "🎙️", { en: "Voice / audio", zh: "语音 / 音频" }, { en: "Microphone, voice interaction, sound classifying", zh: "麦克风、语音交互、声音分类" }],
    ["usb", "⌨️", { en: "USB keyboard / controller", zh: "USB 键鼠 / 控制器" }, { en: "HID, macro pads, game controllers", zh: "HID、宏键盘、游戏控制器" }],
    ["robot", "🤖", { en: "Robot / car", zh: "机器人 / 小车" }, { en: "Motors, servos, sensor linkage", zh: "电机、舵机、传感器联动" }],
    ["sensor", "🌡️", { en: "Wireless sensor", zh: "无线传感器" }, { en: "Temp/humidity, air quality, status", zh: "温湿度、空气质量、状态监测" }],
    ["education", "🧪", { en: "Learning / general", zh: "学习 / 通用开发" }, { en: "Courses, labs, fast prototyping", zh: "课程、实验、快速原型" }],
  ] },
  { id: "wireless", title: { en: "Connectivity", zh: "连接方式" }, kicker: { en: "Step 2", zh: "第 2 步" }, question: { en: "Which wireless capabilities do you need?", zh: "项目需要哪些无线能力？" }, desc: { en: "Multi-select; or pick “Not sure”.", zh: "可以多选；不知道时也可以选择“暂不确定”。" }, multi: true, options: [
    ["Wi-Fi", "📶", { en: "Wi-Fi", zh: "Wi-Fi" }, { en: "Direct to router or cloud", zh: "直接连接路由器或云服务" }],
    ["BLE", "🔵", { en: "Bluetooth LE", zh: "Bluetooth LE" }, { en: "Pair with phone, low-power devices", zh: "连接手机、低功耗设备" }],
    ["Matter", "🏡", { en: "Matter", zh: "Matter" }, { en: "Cross-brand smart-home interop", zh: "跨品牌智能家居互联" }],
    ["Thread", "🕸️", { en: "Thread", zh: "Thread" }, { en: "Low-power mesh network", zh: "低功耗 Mesh 网络" }],
    ["Zigbee", "🔗", { en: "Zigbee", zh: "Zigbee" }, { en: "Mature smart-home network", zh: "成熟的智能家居网络" }],
    ["NFC", "💳", { en: "NFC", zh: "NFC" }, { en: "Tags, pairing, identity, near-field", zh: "标签、配对、身份与近场交互" }],
    ["none", "➖", { en: "No wireless", zh: "不需要无线" }, { en: "USB or local control is enough", zh: "USB 或本地控制即可" }],
    ["unknown", "❔", { en: "Not sure", zh: "暂不确定" }, { en: "Let the system infer from the scene", zh: "由系统根据场景判断" }],
  ] },
  { id: "hardware", title: { en: "Hardware", zh: "硬件能力" }, kicker: { en: "Step 3", zh: "第 3 步" }, question: { en: "Which hardware matters most to you?", zh: "你更看重哪些硬件能力？" }, desc: { en: "Used to separate high-perf, low-power and general controllers.", zh: "用于区分高性能主控、低功耗主控和通用控制器。" }, multi: true, options: [
    ["performance", "⚡", { en: "Stronger perf", zh: "更强性能" }, { en: "Complex logic, GUI, AI", zh: "复杂逻辑、图形界面、AI" }],
    ["memory", "🧠", { en: "More memory", zh: "更大内存" }, { en: "Screen assets, audio buffers, models", zh: "屏幕资源、音频缓存、模型" }],
    ["usb", "🔌", { en: "USB Device / HID", zh: "USB Device / HID" }, { en: "Keyboard, controller, serial", zh: "键鼠、控制器、串口设备" }],
    ["gpio", "🧩", { en: "More GPIO", zh: "更多 GPIO" }, { en: "More sensors and actuators", zh: "连接更多传感器和执行器" }],
    ["lowpower", "🔋", { en: "Low power", zh: "低功耗" }, { en: "Longer battery life", zh: "延长电池续航" }],
    ["simple", "🪄", { en: "Keep it simple", zh: "越简单越好" }, { en: "Mature tutorials, fast blink", zh: "成熟教程、快速点亮" }],
    ["unknown", "❔", { en: "Not sure", zh: "暂不确定" }, { en: "Let the system infer", zh: "由系统根据项目推断" }],
  ] },
  { id: "power", title: { en: "Power source", zh: "供电方式" }, kicker: { en: "Step 4", zh: "第 4 步" }, question: { en: "How is the device mainly powered?", zh: "设备主要怎么供电？" }, desc: { en: "Power source strongly affects Wi-Fi vs low-power priority.", zh: "供电方式会显著影响 Wi-Fi 与低功耗产品的优先级。" }, multi: false, options: [
    ["usb", "🔌", { en: "Always USB-powered", zh: "长期 USB 供电" }, { en: "Desk devices, fixed installs, always-on", zh: "桌面设备、固定安装、持续联网" }],
    ["battery-normal", "🔋", { en: "Normal battery", zh: "普通电池供电" }, { en: "Days to weeks, not extreme runtime", zh: "一天到数周，不追求极限续航" }],
    ["battery-long", "🪫", { en: "Long-term battery", zh: "长期电池供电" }, { en: "Months or longer", zh: "希望运行数月甚至更久" }],
    ["unknown", "❔", { en: "Not sure", zh: "暂不确定" }, { en: "Skip for now", zh: "先不作为硬性条件" }],
  ] },
  { id: "experience", title: { en: "Workflow", zh: "开发方式" }, kicker: { en: "Step 5", zh: "第 5 步" }, question: { en: "Which workflow do you prefer?", zh: "你更习惯哪种开发方式？" }, desc: { en: "Boards with better-matched docs and toolchain rank higher.", zh: "结果会优先推荐资料和工具链更匹配的型号。" }, multi: true, options: [
    ["beginner", "🌱", { en: "First dev board", zh: "第一次使用开发板" }, { en: "Want mature tutorials, easy start", zh: "希望教程成熟、上手简单" }],
    ["arduino", "♾️", { en: "Arduino", zh: "Arduino" }, { en: "Arduino IDE or Core", zh: "使用 Arduino IDE 或 Arduino Core" }],
    ["micropython", "🐍", { en: "MicroPython", zh: "MicroPython" }, { en: "Prefer Python UX", zh: "偏好 Python 开发体验" }],
    ["platformio", "🧰", { en: "PlatformIO", zh: "PlatformIO" }, { en: "Manage projects in VS Code", zh: "使用 VS Code 管理工程" }],
    ["espidf", "🟠", { en: "ESP-IDF", zh: "ESP-IDF" }, { en: "Espressif native framework", zh: "Espressif 原生开发框架" }],
    ["zephyr", "🟣", { en: "Zephyr / NCS", zh: "Zephyr / NCS" }, { en: "Nordic or RTOS pro dev", zh: "Nordic 或 RTOS 专业开发" }],
    ["advanced", "🧑‍💻", { en: "Any toolchain", zh: "工具链不限" }, { en: "Care more about hardware itself", zh: "更关注硬件能力本身" }],
  ] },
  { id: "stage", title: { en: "Project stage", zh: "项目阶段" }, kicker: { en: "Step 6", zh: "第 6 步" }, question: { en: "What stage is your project at?", zh: "你的项目现在处于什么阶段？" }, desc: { en: "Tunes the weight of “easy start” vs “production-ready”.", zh: "用于调整“易上手”和“量产能力”的推荐权重。" }, multi: false, options: [
    ["learning", "📘", { en: "Learning / personal", zh: "学习 / 个人项目" }, { en: "Value docs, examples, onboarding speed", zh: "重视资料、案例和上手速度" }],
    ["prototype", "🧱", { en: "Functional prototype", zh: "功能原型" }, { en: "Validate core features fast", zh: "需要快速验证核心功能" }],
    ["custompcb", "📐", { en: "Custom PCB ahead", zh: "准备画自定义 PCB" }, { en: "Need footprints, dims, hardware docs", zh: "需要封装、尺寸和硬件资料" }],
    ["production", "🏭", { en: "Small batch / production", zh: "小批量或量产" }, { en: "Care about supply, cost, long-term", zh: "关注供货、成本和长期维护" }],
  ] },
];

const SPEC_LABELS = {
  wireless: { en: "Wireless", zh: "无线能力" },
  perf: { en: "Positioning", zh: "性能定位" },
  app: { en: "Typical apps", zh: "典型应用" },
  battery: { en: "Battery use", zh: "电池项目" },
  prod: { en: "Production", zh: "量产集成" },
};
const COMPARE_ROWS = ["wireless", "perf", "app", "battery", "prod"];

function labelFor(stepId, value, lang) {
  const step = steps.find((s) => s.id === stepId);
  const item = step?.options.find((o) => o[0] === value);
  if (!item) return value;
  const title = item[2];
  return title[lang] || title.en;
}

function scoreProducts(answers, lang) {
  const a = answers;
  const L = (s) => s[lang] || s.en;
  return products
    .map((p) => {
      let score = p.scoreBias;
      const reasons = [];

      a.scenario.forEach((s) => {
        if (p.scenarios.includes(s)) { score += 9; reasons.push(lang === "zh" ? `适合“${labelFor("scenario", s, lang)}”场景` : `Fits the “${labelFor("scenario", s, lang)}” scene`); }
        if (s === "vision" && p.id !== "esp32s3plus") score -= 8;
        if (s === "voice" && p.id === "esp32s3plus") score += 5;
      });

      a.wireless.forEach((w) => {
        if (w === "unknown") return;
        if (w === "none") {
          if (!p.wireless.length) { score += 7; reasons.push(lang === "zh" ? "不需要板载无线，可避免无效配置" : "No onboard wireless needed — avoids unused config"); }
          else score -= 2;
        } else if (p.wireless.includes(w)) {
          score += 11;
          reasons.push(lang === "zh" ? `支持 ${w}` : `Supports ${w}`);
        } else {
          score -= 14;
        }
      });

      a.hardware.forEach((h) => {
        if (h === "performance" && (p.id === "esp32s3plus" || p.id === "rp2350")) { score += 8; reasons.push(lang === "zh" ? "满足较高性能需求" : "Meets higher performance needs"); }
        if (h === "memory" && p.id === "esp32s3plus") { score += 10; reasons.push(lang === "zh" ? "更适合较大 UI 与资源文件" : "Better for larger UI and assets"); }
        if (h === "usb" && ["esp32s3plus", "nrf52840plus", "rp2350"].includes(p.id)) { score += 6; reasons.push(lang === "zh" ? "适合 USB Device / HID" : "Suited for USB Device / HID"); }
        if (h === "gpio" && p.id === "esp32s3plus") { score += 6; reasons.push(lang === "zh" ? "扩展接口更充足" : "Richer expansion I/O"); }
        if (h === "lowpower") {
          if (p.power === "ultra-low") { score += 12; reasons.push(lang === "zh" ? "面向超低功耗设备" : "Aimed at ultra-low-power devices"); }
          else if (p.power === "low") score += 7;
          else score -= 4;
        }
        if (h === "simple" && p.experience.includes("beginner")) { score += 7; reasons.push(lang === "zh" ? "教程和入门路径更友好" : "Friendlier tutorials and onboarding"); }
      });

      const power = a.power[0];
      if (power === "battery-long") {
        if (p.power === "ultra-low") { score += 14; reasons.push(lang === "zh" ? "更适合长期电池供电" : "Better for long-term battery power"); }
        else if (p.power === "low") score += 8;
        else score -= 8;
      }
      if (power === "usb" && p.id === "esp32s3plus") score += 4;

      a.experience.forEach((e) => {
        if (p.experience.includes(e)) { score += 5; reasons.push(lang === "zh" ? `匹配 ${labelFor("experience", e, lang)} 开发方式` : `Matches the ${labelFor("experience", e, lang)} workflow`); }
        if (e === "beginner" && !p.experience.includes("beginner")) score -= 6;
      });

      if (["custompcb", "production"].includes(a.stage[0]) && p.production) {
        score += 5;
        reasons.push(lang === "zh" ? "适合进一步集成到自定义 PCB" : "Ready to integrate into a custom PCB");
      }

      return { ...p, score, reasons: [...new Set(reasons)].slice(0, 4) };
    })
    .sort((x, y) => y.score - x.score);
}

function parseNaturalLanguage(text, prevAnswers) {
  const t = text.toLowerCase();
  const a = {
    scenario: [...prevAnswers.scenario],
    wireless: [...prevAnswers.wireless],
    hardware: [...prevAnswers.hardware],
    power: [...prevAnswers.power],
    experience: [...prevAnswers.experience],
    stage: [...prevAnswers.stage],
  };
  const add = (step, value) => { if (!a[step].includes(value)) a[step].push(value); };

  if (/温湿度|空气|传感器|监测|监控|sensor|air|temp/.test(t)) add("scenario", "sensor");
  if (/小车|机器人|电机|舵机|robot|motor|servo/.test(t)) add("scenario", "robot");
  if (/摄像|图像|视觉|识别|camera|vision/.test(t)) add("scenario", "vision");
  if (/语音|麦克风|声音|音频|voice|audio|microphone/.test(t)) add("scenario", "voice");
  if (/键盘|鼠标|hid|usb|keyboard|mouse/.test(t)) add("scenario", "usb");
  if (/穿戴|手环|徽章|随身|wearable|badge/.test(t)) add("scenario", "wearable");
  if (/智能家居|matter|thread|zigbee|smart home/.test(t)) add("scenario", "matter");
  if (/上云|联网|网页|云端|wifi|wi-fi|cloud|internet/.test(t)) { add("scenario", "iot"); add("wireless", "Wi-Fi"); }
  if (/蓝牙|ble|bluetooth|手机|phone/.test(t)) add("wireless", "BLE");
  if (/matter/.test(t)) add("wireless", "Matter");
  if (/thread/.test(t)) add("wireless", "Thread");
  if (/zigbee/.test(t)) add("wireless", "Zigbee");
  if (/nfc|门禁|刷卡/.test(t)) add("wireless", "NFC");
  if (/电池|续航|低功耗|纽扣|battery|coin cell/.test(t)) { add("hardware", "lowpower"); a.power = [/几个月|半年|一年|长期|纽扣|months|year|long term|coin/.test(t) ? "battery-long" : "battery-normal"]; }
  if (/屏幕|界面|lvgl|显示|screen|display|ui/.test(t)) { add("hardware", "performance"); add("hardware", "memory"); }
  if (/初学|第一次|新手|beginner|first time|new/.test(t)) { add("hardware", "simple"); add("experience", "beginner"); }
  if (/arduino/.test(t)) add("experience", "arduino");
  if (/python|micropython/.test(t)) add("experience", "micropython");
  if (/量产|批量|产品化|production|mass/.test(t)) a.stage = ["production"];
  if (!a.stage.length) a.stage = ["prototype"];
  if (!a.experience.length) a.experience = ["arduino"];
  if (!a.power.length) a.power = ["unknown"];
  if (!a.hardware.length) a.hardware = ["unknown"];
  if (!a.wireless.length) a.wireless = ["unknown"];
  if (!a.scenario.length) a.scenario = ["education"];
  return a;
}

const emptyAnswers = () => Object.fromEntries(steps.map((s) => [s.id, []]));
const powerLabel = { standard: { en: "Standard", zh: "标准" }, low: { en: "Low power", zh: "低功耗" }, "ultra-low": { en: "Ultra-low", zh: "超低功耗" } };

export function SmartSelector() {
  const { lang } = useLang();
  const [mode, setMode] = useState("filter");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [showResult, setShowResult] = useState(false);
  const [aiText, setAiText] = useState("");
  const [compare, setCompare] = useState([]);
  const [filter, setFilter] = useState({ wireless: "all", family: "all", power: "all" });
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";
  const L = (s) => (s && s[lang]) || (s && s.en) || "";

  const showToast = (text) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  const ranked = useMemo(() => scoreProducts(answers, lang), [answers, lang]);
  const top3 = ranked.slice(0, 3);
  const step = steps[currentStep];

  const summary = useMemo(() => [
    ...answers.scenario.map((v) => labelFor("scenario", v, lang)),
    ...answers.wireless.filter((v) => !["unknown"].includes(v)).map((v) => labelFor("wireless", v, lang)),
    ...answers.hardware.filter((v) => !["unknown"].includes(v)).map((v) => labelFor("hardware", v, lang)),
    ...answers.power.map((v) => labelFor("power", v, lang)),
  ].slice(0, 9), [answers, lang]);

  const selectOption = (value) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.id]: [...prev[step.id]] };
      if (step.multi) {
        if (value === "none" || value === "unknown") {
          next[step.id] = next[step.id].includes(value) ? [] : [value];
        } else {
          next[step.id] = next[step.id].filter((v) => v !== "none" && v !== "unknown");
          const idx = next[step.id].indexOf(value);
          if (idx >= 0) next[step.id].splice(idx, 1);
          else next[step.id].push(value);
        }
      } else {
        next[step.id] = [value];
      }
      return next;
    });
  };

  const onNext = () => {
    if (!answers[step.id].length) {
      showToast(lang === "zh" ? "请至少选择一项，或选择“暂不确定”" : "Pick at least one, or choose “Not sure”");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      document.getElementById("selector-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setShowResult(true);
      document.getElementById("selector-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const onPrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const onParseAi = () => {
    const text = aiText.trim();
    if (!text) { showToast(lang === "zh" ? "先描述一下你想做的项目" : "Describe your project first"); return; }
    setAnswers((prev) => parseNaturalLanguage(text, prev));
    showToast(lang === "zh" ? "已识别需求并自动填写，仍可手动修改" : "Needs parsed and filled in — still editable");
  };

  const restart = () => { setCurrentStep(0); setAnswers(emptyAnswers()); setShowResult(false); };

  const toggleCompare = (id) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) { showToast(lang === "zh" ? "最多同时对比 4 款产品" : "Compare up to 4 boards at once"); return prev; }
      return [...prev, id];
    });
  };
  const openCompare = () => {
    if (compare.length < 2) { showToast(lang === "zh" ? "至少选择 2 款产品" : "Pick at least 2 boards"); return; }
    setCompareOpen(true);
  };

  const share = async () => {
    const text = lang === "zh" ? `XIAO 选型结果：${top3.map((p) => p.name).join(" / ")}` : `XIAO selection: ${top3.map((p) => p.name).join(" / ")}`;
    try { await navigator.clipboard.writeText(text); showToast(lang === "zh" ? "推荐结果已复制" : "Results copied"); }
    catch { showToast(text); }
  };

  // Filter mode
  const wirelessOptions = [
    { v: "all", label: { en: "All", zh: "全部" } },
    { v: "Wi-Fi", label: { en: "Wi-Fi", zh: "Wi-Fi" } },
    { v: "BLE", label: { en: "Bluetooth LE", zh: "BLE" } },
    { v: "Matter", label: { en: "Matter", zh: "Matter" } },
    { v: "Thread", label: { en: "Thread", zh: "Thread" } },
    { v: "Zigbee", label: { en: "Zigbee", zh: "Zigbee" } },
    { v: "NFC", label: { en: "NFC", zh: "NFC" } },
    { v: "none", label: { en: "No wireless", zh: "无无线" } },
  ];
  const familyOptions = [
    { v: "all", label: { en: "All", zh: "全部" } },
    { v: "ESP32", label: { en: "ESP32", zh: "ESP32" } },
    { v: "Nordic", label: { en: "Nordic", zh: "Nordic" } },
    { v: "Silicon Labs", label: { en: "Silicon Labs", zh: "Silicon Labs" } },
    { v: "Raspberry Pi", label: { en: "Raspberry Pi", zh: "Raspberry Pi" } },
    { v: "Renesas", label: { en: "Renesas", zh: "Renesas" } },
  ];
  const powerOptions = [
    { v: "all", label: { en: "All", zh: "全部" } },
    { v: "standard", label: { en: "Standard", zh: "标准" } },
    { v: "low", label: { en: "Low power", zh: "低功耗" } },
    { v: "ultra-low", label: { en: "Ultra-low", zh: "超低功耗" } },
  ];

  const filteredProducts = useMemo(() => products.filter((p) => {
    const w = filter.wireless, f = filter.family, power = filter.power;
    const matchW = w === "all" || (w === "none" ? p.wireless.length === 0 : p.wireless.includes(w));
    const matchF = f === "all" || p.family === f;
    const matchP = power === "all" || p.power === power;
    return matchW && matchF && matchP;
  }), [filter]);

  const compareSelected = compare.map((id) => products.find((p) => p.id === id));

  const nextSteps = lang === "zh" ? [
    "进入产品页查看对应的入门教程和示例项目。",
    "将主推荐和备选产品加入对比，确认无线能力、功耗和开发框架。",
    "量产项目继续查看 Pinout、原理图、封装和认证资料。",
  ] : [
    "Open the product page for getting-started tutorials and example projects.",
    "Add the top pick and alternatives to compare wireless, power and toolchain.",
    "For production, review Pinout, schematic, footprint and certification docs.",
  ];

  const renderProductCard = (p, rank) => {
    const badges = [...p.wireless, ...p.features.map(pick)].slice(0, 5);
    return (
      <article key={p.id} className={`${styles.productCard} ${rank === 0 ? styles.primary : ""}`}>
        <span className={styles.rankBadge}>{rank === 0 ? (lang === "zh" ? "★ 主推荐" : "★ Top pick") : (lang === "zh" ? `备选 ${rank}` : `Alt ${rank}`)}</span>
        <div className={styles.productVisual}><div className={styles.productImg} style={{ backgroundImage: `url("${p.img}")` }} role="img" aria-label={p.name} /></div>
        <h3 className={styles.productName}>{p.name}</h3>
        <p className={styles.productTagline}>{pick(p.tagline)}</p>
        <div className={styles.tagRow}>{badges.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}</div>
        <div className={styles.whyBox}><strong>{lang === "zh" ? "适合你的原因" : "Why it fits"}</strong>{p.reasons.slice(0, 2).join("；") || pick(p.bestFor)}</div>
        <div className={styles.cautionBox}><strong>{lang === "zh" ? "需要注意" : "Keep in mind"}</strong>{pick(p.caution)}</div>
        <div className={styles.productFooter}>
          <a className={`${styles.miniBtn} ${styles.emphasis}`} href={p.link} target="_blank" rel="noopener noreferrer">{lang === "zh" ? "查看产品" : "View product"}</a>
          <button className={styles.miniBtn} type="button" onClick={() => toggleCompare(p.id)}>{lang === "zh" ? "加入对比" : "Compare"}</button>
        </div>
      </article>
    );
  };

  const T = {
    h2: "XIAO Selector",
    p: "Finding the right XIAO is now easier than ever. Filter by specs, or get personalized recommendations with our LLM‑powered XIAO Shop Guide.",
  };

  return (
    <div className={styles.xiaoSelector} id="smart-selector">
      <div className={styles.wrap}>
        <div className={styles.introBlock}>
          <Glow as="h2">{T.h2}</Glow>
          <p>{T.p}</p>
        </div>

        <section className={styles.workspace} id="selector-workspace">
          <div className={styles.modeTabs}>
            <button type="button" className={`${styles.modeTab} ${mode === "filter" ? styles.active : ""}`} onClick={() => setMode("filter")}>{lang === "zh" ? "按参数筛选" : "Filter by specs"}</button>
            <button type="button" className={`${styles.modeTab} ${mode === "wizard" ? styles.active : ""}`} onClick={() => setMode("wizard")}>{lang === "zh" ? "帮我选 XIAO" : "Help me choose"}</button>
          </div>

          <div className={styles.workspaceBody}>
            {mode === "wizard" ? (
              showResult ? (
                <section className={styles.resultView}>
                  <div className={styles.resultTop}>
                    <div>
                      <div className={styles.questionKicker}>{lang === "zh" ? "推荐结果" : "Results"}</div>
                      <h2 className={styles.resultTitle}>{lang === "zh" ? "更适合你的 3 款 XIAO" : "3 XIAO boards that fit you"}</h2>
                      <p className={styles.resultSub}>{lang === "zh" ? "排序基于你填写的项目场景、无线能力、供电方式和开发习惯。结果同时说明优势与限制。" : "Ranked by your project scene, wireless, power and workflow. Results explain strengths and limits."}</p>
                    </div>
                    <div className={styles.resultActions}>
                      <button className={styles.ghostBtn} type="button" onClick={restart}>{lang === "zh" ? "重新选型" : "Start over"}</button>
                      <button className={styles.secondaryBtn} type="button" onClick={share}>{lang === "zh" ? "分享结果" : "Share"}</button>
                    </div>
                  </div>
                  <div className={styles.needSummary}>
                    {summary.map((x, i) => <span key={i} className={styles.summaryChip}>{x}</span>)}
                  </div>
                  <div className={styles.recommendGrid}>
                    {top3.map((p, i) => renderProductCard(p, i))}
                  </div>
                  <div className={styles.explainPanel}>
                    <div className={styles.infoPanel}>
                      <h4>{lang === "zh" ? `为什么把 ${top3[0]?.name} 放在第一位？` : `Why is ${top3[0]?.name} ranked first?`}</h4>
                      <div className={styles.reasonList}>
                        {top3[0]?.reasons.map((r, i) => (
                          <div key={i} className={styles.reasonItem}><span className={styles.reasonDot}>{i + 1}</span><span>{r}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.infoPanel}>
                      <h4>{lang === "zh" ? "下一步建议" : "Next steps"}</h4>
                      <div className={styles.reasonList}>
                        {nextSteps.map((s, i) => (
                          <div key={i} className={styles.reasonItem}><span className={styles.reasonDot}>{i + 1}</span><span>{s}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <div className={styles.wizardLayout}>
                  <aside className={styles.sidebar}>
                    <div className={styles.sidebarLabel}>{lang === "zh" ? "选型进度" : "Progress"}</div>
                    <div className={styles.stepList}>
                      {steps.map((s, i) => {
                        const done = i < currentStep || answers[s.id].length > 0;
                        const active = i === currentStep;
                        return (
                          <div key={s.id} className={`${styles.stepItem} ${active ? styles.active : ""} ${done ? styles.done : ""}`}>
                            <div className={styles.stepIndex}>{done && !active ? "✓" : i + 1}</div>
                            <div className={styles.stepTitle}>{pick(s.title)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.sidebarTip}>
                      <strong>{lang === "zh" ? "不用担心选错" : "Don't worry about picking wrong"}</strong>
                      {lang === "zh" ? "每一步都可以返回修改。结果页会同时给出主推荐、备选产品和不推荐的原因。" : "Every step is editable. The results show a top pick, alternatives and reasons to avoid."}
                    </div>
                  </aside>

                  <section className={styles.contentArea}>
                    <div className={styles.questionHead}>
                      <div>
                        <div className={styles.questionKicker}>{pick(step.kicker)}</div>
                        <h2 className={styles.questionTitle}>{pick(step.question)}</h2>
                        <p className={styles.questionDesc}>{pick(step.desc)}</p>
                      </div>
                      <div className={styles.progressPill}>{currentStep + 1} / {steps.length}</div>
                    </div>

                    {currentStep === 0 && (
                      <div className={styles.aiInputCard}>
                        <div className={styles.aiInputTop}>
                          <div className={styles.aiInputTitle}><span className={styles.aiBadge}>AI</span> {lang === "zh" ? "直接描述你的项目" : "Describe your project"}</div>
                          <div className={styles.aiHint}>{lang === "zh" ? "当前使用关键词规则模拟识别" : "Currently using keyword rules to simulate parsing"}</div>
                        </div>
                        <div className={styles.aiField}>
                          <input
                            value={aiText}
                            onChange={(e) => setAiText(e.target.value)}
                            placeholder={lang === "zh" ? "例如：我想做一个用电池供电、通过蓝牙把温湿度发到手机的传感器" : "e.g. a battery-powered sensor that sends temperature to a phone over Bluetooth"}
                          />
                          <button className={styles.primaryBtn} type="button" onClick={onParseAi}>{lang === "zh" ? "识别需求" : "Parse needs"}</button>
                        </div>
                      </div>
                    )}

                    <div className={styles.optionGrid}>
                      {step.options.map((opt) => {
                        const value = opt[0], icon = opt[1], title = opt[2], text = opt[3];
                        const selected = answers[step.id].includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectOption(value)}
                            className={`${styles.optionCard} ${selected ? styles.selected : ""}`}
                          >
                            <span className={styles.checkMark}>✓</span>
                            <span className={styles.optionIcon}>{icon}</span>
                            <div className={styles.optionTitle}>{pick(title)}</div>
                            <div className={styles.optionText}>{pick(text)}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className={styles.wizardFooter}>
                      <div className={styles.footerNote}>{step.multi ? (lang === "zh" ? "可多选" : "Multi-select") : (lang === "zh" ? "请选择一项" : "Pick one")} · {lang === "zh" ? "所有答案都可以返回修改" : "All answers are editable"}</div>
                      <div className={styles.footerActions}>
                        <button className={`${styles.ghostBtn} ${currentStep === 0 ? styles.hiddenBtn : ""}`} type="button" onClick={onPrev}>{lang === "zh" ? "上一步" : "Back"}</button>
                        <button className={`${styles.primaryBtn} ${styles.btnWide}`} type="button" onClick={onNext}>
                          {currentStep === steps.length - 1 ? (lang === "zh" ? "查看推荐结果" : "See results") : (lang === "zh" ? "下一步" : "Next")}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )
            ) : (
              <section className={styles.filterView}>
                <div className={styles.filterHead}>
                  <div><h2>{lang === "zh" ? "按参数筛选" : "Filter by specs"}</h2><p>{lang === "zh" ? "适合已经明确无线协议、芯片平台或功耗方向的用户。" : "For users who already know the wireless protocol, chip family or power tier."}</p></div>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setFilter({ wireless: "all", family: "all", power: "all" })}>{lang === "zh" ? "重置筛选" : "Reset"}</button>
                </div>
                <div className={styles.filterToolbar}>
                  {[
                    { key: "wireless", label: lang === "zh" ? "无线能力" : "Wireless", options: wirelessOptions },
                    { key: "family", label: lang === "zh" ? "芯片平台" : "Chip family", options: familyOptions },
                    { key: "power", label: lang === "zh" ? "功耗定位" : "Power", options: powerOptions },
                  ].map((row) => (
                    <div key={row.key} className={styles.filterRow}>
                      <div className={styles.filterLabel}>{row.label}</div>
                      {row.options.map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          className={`${styles.filterChip} ${filter[row.key] === o.v ? styles.active : ""}`}
                          onClick={() => setFilter((prev) => ({ ...prev, [row.key]: o.v }))}
                        >
                          {pick(o.label)}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className={styles.catalogHead}>
                  <strong>{lang === "zh" ? "符合条件的产品" : "Matching boards"}</strong>
                  <span className={styles.catalogCount}>{filteredProducts.length} {lang === "zh" ? "款" : "boards"}</span>
                </div>
                <div className={styles.catalogGrid}>
                  {filteredProducts.map((p) => (
                    <article key={p.id} className={styles.catalogCard}>
                      <div className={styles.catalogVisual}><div className={styles.productImg} style={{ backgroundImage: `url("${p.img}")` }} role="img" aria-label={p.name} /></div>
                      <h3>{p.name}</h3>
                      <p>{pick(p.tagline)}</p>
                      <div className={styles.tagRow}>{[...p.wireless, ...p.features.map(pick)].slice(0, 4).map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}</div>
                      <div className={styles.productFooter}>
                        <a className={`${styles.miniBtn} ${styles.emphasis}`} href={p.link} target="_blank" rel="noopener noreferrer">{lang === "zh" ? "查看产品" : "View product"}</a>
                        <button className={styles.miniBtn} type="button" onClick={() => toggleCompare(p.id)}>{lang === "zh" ? "对比" : "Compare"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </div>

      {compare.length > 0 && (
        <div className={styles.compareBar}>
          <div className={styles.compareItems}>
            {compareSelected.map((p) => <span key={p.id} className={styles.compareItem}>{p.name}</span>)}
          </div>
          <div className={styles.compareActions}>
            <button className={`${styles.darkBtn} ${styles.muted}`} type="button" onClick={() => setCompare([])}>{lang === "zh" ? "清空" : "Clear"}</button>
            <button className={`${styles.darkBtn} ${styles.primary}`} type="button" onClick={openCompare}>{lang === "zh" ? "开始对比" : "Compare"}</button>
          </div>
        </div>
      )}

      {compareOpen && (
        <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) setCompareOpen(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>{lang === "zh" ? "产品对比" : "Compare boards"}</h3>
              <button className={styles.closeBtn} type="button" onClick={() => setCompareOpen(false)}>×</button>
            </div>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>{lang === "zh" ? "对比项" : "Spec"}</th>
                  {compareSelected.map((p) => <th key={p.id}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r) => (
                  <tr key={r}>
                    <th>{pick(SPEC_LABELS[r])}</th>
                    {compareSelected.map((p) => <td key={p.id}>{pick(p.specs[r])}</td>)}
                  </tr>
                ))}
                <tr>
                  <th>{lang === "zh" ? "主要提醒" : "Key caveat"}</th>
                  {compareSelected.map((p) => <td key={p.id}>{pick(p.caution)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
