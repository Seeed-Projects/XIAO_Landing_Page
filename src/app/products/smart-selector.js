"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import { withBase } from "../../lib/basePath";
import { PRODUCT_CATALOG } from "./catalog";
import styles from "./smart-selector.module.css";

/* 产品清单 —— 直接取自 dev_boards 产品目录（与产品页一致），按子分类映射无线能力/功耗定位。
   向导（wizard）已下线，但 scoreProducts 等仍会引用以下字段，故保留默认空值避免运行时报错。 */
const FAMILY_BY_SUB = {
  esp32: "ESP32", nrf52: "Nordic", nrf54: "Nordic",
  rp: "Raspberry Pi", mg: "Silicon Labs", samd: "Microchip", ra: "Renesas",
};
const BOARD_META = {
  "XIAO ESP32-C3": { wireless: ["Wi-Fi", "BLE"], power: "standard" },
  "XIAO ESP32-S3": { wireless: ["Wi-Fi", "BLE"], power: "standard" },
  "XIAO ESP32-S3 Sense": { wireless: ["Wi-Fi", "BLE"], power: "standard" },
  "XIAO ESP32-C6": { wireless: ["Wi-Fi", "BLE", "Matter", "Thread", "Zigbee"], power: "standard" },
  "XIAO ESP32-C5": { wireless: ["Wi-Fi", "BLE", "Matter", "Thread", "Zigbee"], power: "standard" },
  "XIAO nRF52840": { wireless: ["BLE", "NFC"], power: "low" },
  "XIAO nRF52840 Sense": { wireless: ["BLE", "NFC"], power: "low" },
  "XIAO nRF54L15": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO nRF54L15 Sense": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO nRF54LM20A": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO nRF54LM20A Sense": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO RP2040": { wireless: [], power: "standard" },
  "XIAO RP2350": { wireless: [], power: "standard" },
  "XIAO MG24": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO MG24 Sense": { wireless: ["BLE", "Matter", "Thread", "Zigbee"], power: "ultra-low" },
  "XIAO SAMD21": { wireless: [], power: "low" },
  "XIAO RA4M1": { wireless: [], power: "low" },
};
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* 向导用字段的默认空值（向导已下线，仅占位防崩；features 留空，筛选只展示无线标签） */
const WIZ_DEFAULTS = { scenarios: [], experience: [], production: false, scoreBias: 0, features: [], bestFor: { en: "", zh: "" }, caution: { en: "", zh: "" }, specs: {}, reasons: [] };
const devBoardsCatalog = PRODUCT_CATALOG.find((c) => c.id === "dev-boards");
const products = devBoardsCatalog.subcategories.flatMap((sub) =>
  sub.items.map((item) => {
    const m = BOARD_META[item.title] ?? { wireless: [], power: "standard" };
    const tag = item.descEn || item.desc || "";
    return {
      id: slug(item.title), name: item.title, family: FAMILY_BY_SUB[sub.id] ?? "Other",
      img: withBase(item.img), link: item.link,
      wireless: m.wireless, power: m.power, tagline: { en: tag, zh: tag },
      ...WIZ_DEFAULTS,
    };
  })
);

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

  const wirelessOptions = [
    ["all", "全部", "All"], ["Wi-Fi", "Wi-Fi", "Wi-Fi"], ["BLE", "BLE", "Bluetooth LE"],
    ["Matter", "Matter", "Matter"], ["Thread", "Thread", "Thread"], ["Zigbee", "Zigbee", "Zigbee"],
    ["NFC", "NFC", "NFC"], ["none", "无无线", "No wireless"],
  ];
  const familyOptions = [
    ["all", "全部", "All"], ["ESP32", "ESP32", "ESP32"], ["Nordic", "Nordic", "Nordic"],
    ["Silicon Labs", "Silicon Labs", "Silicon Labs"], ["Raspberry Pi", "Raspberry Pi", "Raspberry Pi"],
    ["Microchip", "Microchip", "Microchip"], ["Renesas", "Renesas", "Renesas"],
  ];
  const powerOptions = [
    ["all", "全部", "All"], ["standard", "标准", "Standard"],
    ["low", "低功耗", "Low power"], ["ultra-low", "超低功耗", "Ultra-low"],
  ];
  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchW = filter.wireless === "all" || (filter.wireless === "none" ? p.wireless.length === 0 : p.wireless.includes(filter.wireless));
    const matchF = filter.family === "all" || p.family === filter.family;
    const matchP = filter.power === "all" || p.power === filter.power;
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
    p: "Finding the right XIAO is now easier than ever. Filter by wireless protocol, chip family and power tier to shortlist the boards that fit your project.",
  };

  return (
    <div className={styles.xiaoSelector} id="smart-selector">
      <div className={styles.wrap}>
        <div className={styles.introBlock}>
          <Glow as="h2">{T.h2}</Glow>
          <p>{T.p}</p>
        </div>

        <section className={styles.workspace} id="selector-workspace">
          {/* 模式切换标签暂下线：8.21 版本仅保留"按参数筛选"，"帮我选 XIAO"向导先注释
          <div className={styles.modeTabs}>
            <button type="button" className={`${styles.modeTab} ${mode === "filter" ? styles.active : ""}`} onClick={() => setMode("filter")}>{lang === "zh" ? "按参数筛选" : "Filter by specs"}</button>
            <button type="button" className={`${styles.modeTab} ${mode === "wizard" ? styles.active : ""}`} onClick={() => setMode("wizard")}>{lang === "zh" ? "帮我选 XIAO" : "Help me choose"}</button>
          </div>
          */}

          <div className={styles.workspaceBody}>
            {/* "帮我选 XIAO" 向导（wizard）暂下线：6 步问答 + AI 关键词识别 + 推荐结果，整段注释保留待恢复
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
            */}
            {/* —— 以下为"按参数筛选"视图，保留 —— */}
            <section className={styles.filterView}>
                <div className={styles.filterHead}>
                  <div><h2>{lang === "zh" ? "按参数筛选" : "Filter by specs"}</h2><p>{lang === "zh" ? "适合已经明确无线协议、芯片平台或功耗方向的用户。" : "For users who already know the wireless protocol, chip family or power tier."}</p></div>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setFilter({ wireless: "all", family: "all", power: "all" })}>{lang === "zh" ? "重置筛选" : "Reset"}</button>
                </div>
                <div className={styles.filterToolbar}>
                  {[
                    ["wireless", lang === "zh" ? "无线能力" : "Wireless", wirelessOptions],
                    ["family", lang === "zh" ? "芯片平台" : "Chip family", familyOptions],
                    ["power", lang === "zh" ? "功耗定位" : "Power", powerOptions],
                  ].map(([key, label, options]) => (
                    <div key={key} className={styles.filterRow}>
                      <div className={styles.filterLabel}>{label}</div>
                      {options.map(([value, zh, en]) => (
                        <button key={value} type="button" className={`${styles.filterChip} ${filter[key] === value ? styles.active : ""}`} onClick={() => setFilter((prev) => ({ ...prev, [key]: value }))}>
                          {lang === "zh" ? zh : en}
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
