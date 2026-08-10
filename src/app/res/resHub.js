"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "../i18n";
import { Glow } from "../Glow";
import styles from "./res.module.css";
import CourseCard from "./CourseCard";

/* 按 format/url 推断缩略图渲染方式。
   只把确认渲染成功的（3D 静态图 / STEP 外壳）保留为缩略图卡片；
   其余"图纸"类（PDF/PCB/DXF/XLSX/固件/库/外链）恢复成原样下载行。 */
function renderKind(it) {
  if (it.render) return it.render;
  if (it.thumb) return "img";      // 3D 模型静态图
  if (it.format === "STP") return "step"; // STEP 外壳（结构设计）
  return "link";                   // 其余恢复原样
}

/* 共享资源 */
const ESP32S3_DATASHEET = { icon: "📄", name: "Espressif ESP32-S3 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/esp32-s3_datasheet.pdf" };
const KICAD_FOOTPRINTS = { icon: "🗃️", name: "XIAO Series KiCad Footprints", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-KiCad-Library/New_XIAO_Series_Footprints.zip" };
const KICAD_SYMBOLS = { icon: "🗃️", name: "XIAO Series KiCad SCH Symbols", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-KiCad-Library/XIAO_Series_SCH_Symbols.zip" };

const HW = { en: "Hardware Design", zh: "硬件设计" };
const ME = { en: "Mechanical Design", zh: "结构设计" };
const SW = { en: "Software & Tools", zh: "软件与工具" };

const CHIP_FAMILIES = [
  { id: "all", label: { en: "All chips", zh: "全部芯片" } },
  { id: "esp32-s3", label: { en: "ESP32-S3", zh: "ESP32-S3" } },
  { id: "esp32-c3", label: { en: "ESP32-C3", zh: "ESP32-C3" } },
  { id: "esp32-c6", label: { en: "ESP32-C6", zh: "ESP32-C6" } },
  { id: "nrf54x", label: { en: "nRF54x", zh: "nRF54x" } },
  { id: "nrf52840", label: { en: "nRF52840", zh: "nRF52840" } },
  { id: "rp2040", label: { en: "RP2040", zh: "RP2040" } },
  { id: "samd21", label: { en: "SAMD21", zh: "SAMD21" } },
  { id: "ra4m1", label: { en: "RA4M1", zh: "RA4M1" } },
];

/* 4 款 S3 系列产品 + 真实资源 */
const RESOURCE_PRODUCTS = [
  {
    id: "s3", chip: "esp32-s3", name: "XIAO ESP32-S3", color: "#276046", shield: "#d5d8da",
    intro: { en: "The Wi-Fi + BLE workhorse of the XIAO lineup.", zh: "XIAO 系列里 Wi-Fi + BLE 的主力通用板。" },
    badges: ["ESP32-S3", "Wi-Fi", "BLE"],
    groups: [
      { label: HW, items: [
        ESP32S3_DATASHEET,
        { icon: "📄", name: "XIAO ESP32-S3 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003751_XIAO%20ESP32S3_v1.4_SCH_260226.pdf.pdf" },
        { icon: "🗃️", name: "XIAO ESP32-S3 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003751_XIAO%20ESP32S3_v1.4_SCH&PCB_260226.zip" },
        KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO ESP32-S3 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Sense_Pinout.xlsx" },
      ] },
      { label: ME, items: [
        { icon: "📐", name: "XIAO ESP32-S3 Dimension (DXF)", format: "DXF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_v1.1_Dimensioning.dxf" },
        { icon: "🧊", name: "XIAO ESP32-S3 3D Model", format: "ZIP", thumb: "/res-thumb/s3-3d.png", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/seeed-studio-xiao-esp32s3-3d_model.zip" },
      ] },
      { label: SW, items: [
        { icon: "🗃️", name: "XIAO ESP32-S3 Factory Firmware", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-firmware-20240814.zip" },
      ] },
    ],
  },
  {
    id: "s3sense", chip: "esp32-s3", name: "XIAO ESP32-S3 Sense", color: "#315d4c", shield: "#d1d5d7",
    intro: { en: "Adds an onboard camera and microphone for vision and voice.", zh: "板载摄像头与麦克风，面向视觉与语音。" },
    badges: ["Camera", "Microphone", "Wi-Fi", "BLE"],
    groups: [
      { label: HW, items: [
        ESP32S3_DATASHEET,
        { icon: "📄", name: "XIAO ESP32-S3 Sense Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003753_XIAO%20ESP32S3%20Sense_v1.5_SCH_260226.pdf.pdf" },
        { icon: "📄", name: "XIAO ESP32-S3 ExpBoard Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_SCH.pdf" },
        { icon: "🗃️", name: "XIAO ESP32-S3 Sense KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003753_XIAO%20ESP32S3%20Sense_v1.5_SCH&PCB_260226.zip" },
        KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO ESP32-S3 Sense Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Sense_Pinout.xlsx" },
      ] },
      { label: ME, items: [
        { icon: "📐", name: "Sense Dimension (DXF, Top)", format: "DXF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_top.dxf" },
        { icon: "📐", name: "Sense Dimension (DXF, Bottom)", format: "DXF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_bot.dxf" },
        { icon: "🧊", name: "Sense 3D Model", format: "ZIP", thumb: "/res-thumb/s3sense-3d.png", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/seeed-studio-xiao-esp32s3-sense-3d_model.zip" },
        { icon: "🧊", name: "Sense Purple Enclosure (Top)", format: "STP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-housing-design(top).stp" },
        { icon: "🧊", name: "Sense Purple Enclosure (Bottom)", format: "STP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-housing-design(bottom).stp" },
      ] },
      { label: SW, items: [
        { icon: "🗃️", name: "Sense Factory Firmware", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-firmware-20240814.zip" },
      ] },
    ],
  },
  {
    id: "s3plus", chip: "esp32-s3", name: "XIAO ESP32-S3 Plus", color: "#2f5b78", shield: "#d3d7dc",
    intro: { en: "Larger GPIO count and PSRAM for heavier connected projects.", zh: "更多 GPIO 与 PSRAM，适合更重的联网项目。" },
    badges: ["ESP32-S3", "Wi-Fi", "BLE", "Plus"],
    groups: [
      { label: HW, items: [
        ESP32S3_DATASHEET,
        { icon: "📄", name: "XIAO ESP32-S3 Plus Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Plus_V1.1_SCH_260115.pdf" },
        { icon: "🗃️", name: "Plus KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Plus_V1.1_KiCad_260115.zip" },
        { icon: "🗃️", name: "Plus Base (with bottom pad) KiCad", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_with_botton_pad_lead_out_V1.0.zip" },
        { icon: "🗃️", name: "Plus Base (without bottom pad) KiCad", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_without_botton_pad_lead_out_V1.0.zip" },
        KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "Plus Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/Seeed_Studio_XIAO_ESP32S3_Plus_Pinout.xlsx" },
      ] },
      { label: ME, items: [
        { icon: "📐", name: "Plus Dimension (DXF, Top)", format: "DXF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/TOP.dxf" },
        { icon: "📐", name: "Plus Dimension (DXF, Bottom)", format: "DXF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/BOTTOM.dxf" },
        { icon: "🔗", name: "Plus 3D Model (GrabCAD)", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-esp32s3-plus-1/files" },
      ] },
    ],
  },
  {
    id: "s3cam", chip: "esp32-s3", name: "XIAO ESP32-S3 Sense Camera", color: "#5b3f73", shield: "#d8d5dd",
    intro: { en: "Camera module datasheets for the Sense camera attachments.", zh: "Sense 摄像头模组的摄像头规格书与传感器手册。" },
    badges: ["OV3660", "OV5640", "OV2640", "Camera"],
    groups: [
      { label: HW, items: [
        { icon: "📄", name: "OV3660 Camera Module Specification", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/OV3660_Camera_Module_Specification.pdf" },
        { icon: "📄", name: "OV3660 CMOS Sensor Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV3660_datasheet.pdf" },
        { icon: "📄", name: "OV5640 Camera Module Specification", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/OV5640_Camera_Module_Specification.pdf" },
        { icon: "📄", name: "OV5640 CMOS Sensor Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV5640_datasheet.pdf" },
        { icon: "📄", name: "OV2640 CMOS Sensor Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV2640_datasheet.pdf" },
      ] },
    ],
  },
  {
    id: "nrf54l15", chip: "nrf54x", name: "XIAO nRF54L15", color: "#1f5f74", shield: "#d2d9db",
    intro: { en: "Ultra-low-power Nordic wireless board for secure connected devices.", zh: "基于 Nordic nRF54L15 的超低功耗无线开发板。" },
    badges: ["nRF54L15", "Bluetooth LE 6.0", "Matter", "Thread"],
    groups: [
      { label: SW, items: [
        { icon: "📚", name: "XIAO nRF54L15 Getting Started", format: "Guide", url: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/" },
      ] },
    ],
  },
  {
    id: "nrf54l15sense", chip: "nrf54x", name: "XIAO nRF54L15 Sense", color: "#2e6f59", shield: "#d4d9d1",
    intro: { en: "nRF54L15 with onboard IMU and microphone for sensing projects.", zh: "集成 IMU 与麦克风的 nRF54L15 感知开发板。" },
    badges: ["nRF54L15", "IMU", "Microphone", "Bluetooth LE 6.0"],
    groups: [
      { label: SW, items: [
        { icon: "📚", name: "XIAO nRF54L15 Sense Getting Started", format: "Guide", url: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/" },
      ] },
    ],
  },
  {
    id: "nrf54lm20a", chip: "nrf54x", name: "XIAO nRF54LM20A", color: "#4a5d85", shield: "#d6d9e2",
    intro: { en: "A higher-memory Nordic nRF54 wireless board with power management.", zh: "具备更大内存与电源管理能力的 Nordic nRF54 无线开发板。" },
    badges: ["nRF54LM20A", "Bluetooth LE 6.0", "NFC", "Matter"],
    groups: [
      { label: SW, items: [
        { icon: "📚", name: "XIAO nRF54LM20A Getting Started", format: "Guide", url: "https://wiki.seeedstudio.com/xiao_nrf54lm20a_getting_started/" },
      ] },
    ],
  },
  {
    id: "nrf54lm20asense", chip: "nrf54x", name: "XIAO nRF54LM20A Sense", color: "#5e4d75", shield: "#ddd7e2",
    intro: { en: "nRF54LM20A with an IMU and microphone for advanced edge sensing.", zh: "集成 IMU 与麦克风的 nRF54LM20A 边缘感知开发板。" },
    badges: ["nRF54LM20A", "IMU", "Microphone", "8 MB Flash"],
    groups: [
      { label: SW, items: [
        { icon: "📚", name: "XIAO nRF54LM20A Sense Getting Started", format: "Guide", url: "https://wiki.seeedstudio.com/xiao_nrf54lm20a_getting_started/" },
      ] },
    ],
  },
];

/* 全局课程资源：按主题分组，封面 + 一段话介绍 */
const EXTRAS = {
  title: { en: "Course & More", zh: "课程与更多" },
  eyebrow: { en: "Learn with XIAO", zh: "跟 XIAO 一起学" },
  intro: {
    en: "Open books, courses and hands-on projects built around the XIAO family.",
    zh: "围绕 XIAO 的开源电子书、系统课程与实战项目，封面预览先看一眼再打开。",
  },
  note: { en: "The remaining open-source material is being compiled — stay tuned.", zh: "其余开源资料正在整理中，敬请期待。" },
};

const COURSE_GROUPS = [
  {
    label: { en: "Getting Started", zh: "入门" },
    items: [
      {
        title: "XIAO: Big Power, Small Board",
        intro: { en: "A full ebook on the XIAO family — Arduino and TinyML on a tiny, powerful board.", zh: "XIAO 系列电子书：在小巧强悍的板子上讲透 Arduino 与 TinyML。" },
        cover: "https://mjrovai.github.io/XIAO_Big_Power_Small_Board-ebook/cover.jpg",
        url: "https://mjrovai.github.io/XIAO_Big_Power_Small_Board-ebook/",
        kind: "img", accent: "#276046",
      },
      {
        title: "No-Code Programming to Get Started with TinyML",
        intro: { en: "Learn TinyML with block-based, no-code programming — no prior coding needed.", zh: "无需写代码，用图形化积木编程入门 TinyML 机器学习。" },
        cover: null,
        url: "https://tinkergen.github.io/No-code-Programming-to-Get-Started-with-TinyML/",
        kind: "fallback", accent: "#2f5b78",
      },
    ],
  },
  {
    label: { en: "Courses", zh: "系统课程" },
    items: [
      {
        title: "Machine Learning Systems",
        intro: { en: "Open textbook on ML systems — the full path from training to production deployment.", zh: "机器学习系统开源教材：从训练到生产部署的完整链路。" },
        cover: "https://mlsysbook.ai/vol1/assets/images/covers/cover-hardcover-book-vol1.png",
        url: "https://www.mlsysbook.ai/",
        kind: "img", accent: "#5b3f73",
      },
      {
        title: "IoT for Beginners",
        intro: { en: "Microsoft's 12-week curriculum covering IoT hardware, cloud and hands-on projects.", zh: "微软 12 周 IoT 入门课：硬件、云端与项目实战。" },
        cover: null,
        url: "https://microsoft.github.io/IoT-For-Beginners/",
        kind: "fallback", accent: "#315d4c",
      },
    ],
  },
  {
    label: { en: "Hands-on Projects", zh: "项目实战" },
    items: [
      {
        title: "Seeeduino XIAO in Action",
        intro: { en: "Step-by-step mini & wearable projects built with Seeeduino XIAO (PDF).", zh: "XIAO 迷你与可穿戴项目分步教程合集（PDF）。" },
        cover: null,
        url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-in-Action-Minitype&Wearable-Projects-Step-by-Step.pdf",
        kind: "pdf", accent: "#7a4a2f",
      },
      {
        title: "Fab-Xiao",
        intro: { en: "A Fab Academy student project — open-source hardware built around XIAO.", zh: "Fab Academy 学生作品：围绕 XIAO 的开源硬件项目。" },
        cover: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/images/fabxiao/fabxiao_board.jpg",
        url: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/fabxiao.html",
        kind: "img", accent: "#3a4a2f",
      },
      {
        title: "maker100-eco",
        intro: { en: "Robotics, IoT & TinyML with the $14 XIAO ESP32 — 100 maker experiments.", zh: "用 $14 的 XIAO ESP32 玩机器人 / IoT / TinyML，100 个创客实验。" },
        cover: "https://opengraph.githubassets.com/f3ca4a588f9aa4f35f0687941b94fb6763592891ba561e9b5f046a411cd66bfb/hpssjellis/maker100-eco",
        url: "https://github.com/hpssjellis/maker100-eco",
        kind: "img", accent: "#2f5b78",
      },
      {
        title: "XIAO on YouTube",
        intro: { en: "A curated YouTube playlist of XIAO tutorials and builds.", zh: "精选 XIAO 教程与实战视频。" },
        cover: null,
        url: "https://www.youtube.com/watch?v=Zs0-jXdnRY",
        kind: "fallback", accent: "#7a2f2f",
      },
    ],
  },
];

const HERO_SHEET_S1 = `<svg viewBox="0 0 300 360"><rect width="300" height="360" fill="#fff"/><rect x="95" y="52" width="110" height="160" rx="16" fill="#2f7c55"/><rect x="118" y="38" width="64" height="38" rx="7" fill="#d4d7da"/><g stroke="#71a600" stroke-width="2"><path d="M95 88H38"/><path d="M95 122H30"/><path d="M95 156H42"/><path d="M205 88h57"/><path d="M205 122h65"/><path d="M205 156h53"/></g><g fill="#26313d" font-family="Arial" font-size="9"><text x="18" y="91">D0 / A0</text><text x="14" y="125">D1 / A1</text><text x="22" y="159">D2 / A2</text><text x="246" y="91">5V</text><text x="244" y="125">GND</text><text x="240" y="159">3V3</text></g><text x="24" y="316" fill="#121a26" font-family="Arial" font-weight="800" font-size="16">PINOUT</text></svg>`;
const HERO_SHEET_S2 = `<svg viewBox="0 0 300 360"><rect width="300" height="360" fill="#fff"/><g stroke="#48515a" fill="none" stroke-width="1.5"><rect x="95" y="100" width="110" height="120"/><path d="M95 126H38V58H20"/><path d="M95 166H45V280H18"/><path d="M205 130h58V66h20"/><path d="M205 182h70V280h10"/></g><rect x="116" y="127" width="68" height="66" fill="#dfe3df"/><text x="150" y="165" text-anchor="middle" font-family="Arial" font-size="10">CORE</text><text x="24" y="316" fill="#121a26" font-family="Arial" font-weight="800" font-size="16">SCHEMATIC</text></svg>`;
const HERO_SHEET_S3 = `<svg viewBox="0 0 300 250"><rect width="300" height="250" fill="#eef1ec"/><g transform="translate(58 46) skewY(-6)"><path d="M10 20L165 0L202 35L47 56Z" fill="#2f7c55"/><path d="M47 56L202 35V126L47 150Z" fill="#174333"/><path d="M10 20L47 56V150L10 116Z" fill="#245f48"/><path d="M74 35L133 28L154 47L94 55Z" fill="#d5d8da"/><path d="M83 68L156 58V105L83 116Z" fill="#c3c7ca"/></g><text x="20" y="220" fill="#121a26" font-family="Arial" font-weight="800" font-size="15">3D MODEL</text></svg>`;

function boardSvg(p) {
  return `<svg viewBox="0 0 320 230"><rect x="38" y="32" width="244" height="166" rx="22" fill="${p.color}"/><rect x="111" y="19" width="98" height="45" rx="9" fill="#cfd3d8"/><rect x="128" y="29" width="64" height="25" rx="5" fill="#20242b"/><rect x="96" y="77" width="128" height="74" rx="10" fill="${p.shield}"/><rect x="109" y="89" width="102" height="49" rx="7" fill="#b9bdc2"/><g fill="#e7bd5e">${[55, 82, 109, 136, 163].map((y) => `<circle cx="50" cy="${y}" r="6"/><circle cx="270" cy="${y}" r="6"/>`).join("")}</g><circle cx="75" cy="72" r="9" fill="#dfe2e5"/><circle cx="245" cy="72" r="9" fill="#dfe2e5"/><text x="160" y="119" fill="#282b31" font-size="15" font-family="Arial" font-weight="800" text-anchor="middle">XIAO</text></svg>`;
}
const stripSvg = (s) => s.replace(/^<svg[^>]*>|<\/svg>$/g, "");

export function ResHub() {
  const { lang } = useLang();
  const [activeChip, setActiveChip] = useState("esp32-s3");
  const [activeId, setActiveId] = useState(RESOURCE_PRODUCTS[0].id);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", url: "" });

  const chipProducts = useMemo(
    () => activeChip === "all" ? RESOURCE_PRODUCTS : RESOURCE_PRODUCTS.filter((p) => p.chip === activeChip),
    [activeChip]
  );
  const active = useMemo(
    () => chipProducts.find((p) => p.id === activeId) ?? chipProducts[0] ?? RESOURCE_PRODUCTS[0],
    [activeId, chipProducts]
  );

  const T = {
    heroEyebrow: lang === "zh" ? "XIAO 硬件资源" : "XIAO Hardware Resources",
    heroH1: lang === "zh" ? "看得到资料，再决定打开哪一个。" : "See the resources before opening a single link.",
    heroP: lang === "zh"
      ? "把 Wiki 里的原理图、Pinout、PCB、尺寸图和 3D 模型搬到统一页面，用图片预览代替长篇文字链接。"
      : "Bring schematics, pinouts, PCB, dimensions and 3D models from the Wiki onto one page — preview by image instead of long text links.",
    btnBrowse: lang === "zh" ? "浏览资源" : "Browse resources",
    btnSelector: lang === "zh" ? "进入智能选型" : "Open Smart Selector",
    secEyebrow: lang === "zh" ? "可视化资源库" : "Visual resource library",
    secH2: lang === "zh" ? "不用读链接，先看资料是什么。" : "Don't read links — see what the resource is first.",
    secP: lang === "zh"
      ? "选择产品后，直接浏览 Pinout、原理图、PCB、尺寸图和 3D 模型。常用资料先预览，工程文件再下载。"
      : "Pick a product, then browse real Pinout, schematic, PCB, dimensions and 3D files — preview PDFs inline, download the rest.",
    searchPlaceholder: lang === "zh" ? "搜索资源，如 Schematic / KiCad / DXF / 3D" : "Search resources, e.g. Schematic / KiCad / DXF / 3D",
    chipFilter: lang === "zh" ? "按芯片筛选开发板" : "Filter boards by chip",
    chipHint: lang === "zh" ? "先选芯片，再选具体开发板" : "Choose a chip, then a board.",
    chipEmpty: lang === "zh" ? "该芯片系列的资源正在整理中。" : "Resources for this chip family are being prepared.",
    selected: lang === "zh" ? "当前产品" : "Selected product",
    countFiles: (n) => lang === "zh" ? `${n} 个文件` : `${n} files`,
    modalKicker: lang === "zh" ? "资源预览" : "Resource preview",
    download: lang === "zh" ? "下载" : "Download",
    preview: lang === "zh" ? "预览" : "Preview",
    footerH3: lang === "zh" ? "先看，再下载。" : "Look first. Download second.",
    footerP: lang === "zh" ? "可视化硬件资源概念" : "Visual hardware resource concept",
    footerSmall: lang === "zh" ? "内部概念" : "Internal concept",
    noResults: lang === "zh" ? "没有匹配的资源，换个关键词试试。" : "No matching resources — try another keyword.",
  };

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";

  // 过滤当前产品的资源条目
  const filteredGroups = useMemo(() => {
    const f = query.trim().toLowerCase();
    if (!f) return active.groups;
    return active.groups
      .map((g) => ({ ...g, items: g.items.filter((it) => (it.name + " " + it.format + " " + it.url).toLowerCase().includes(f)) }))
      .filter((g) => g.items.length > 0);
  }, [query, active]);

  const totalItems = filteredGroups.reduce((n, g) => n + g.items.length, 0);

  useEffect(() => {
    if (chipProducts.some((p) => p.id === activeId)) return;
    setActiveId(chipProducts[0]?.id ?? "");
  }, [activeId, chipProducts]);

  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e) => { if (e.key === "Escape") setModal((m) => ({ ...m, open: false })); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal.open]);

  const year = new Date().getFullYear();

  return (
    <div className={styles.res}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{T.heroEyebrow}</span>
            <Glow as="h1">{T.heroH1}</Glow>
            <p>{T.heroP}</p>
            <div className={styles.heroActions}>
              <a className={`${styles.btn} ${styles.btnGreen}`} href="#resources">{T.btnBrowse}</a>
              <a className={`${styles.btn} ${styles.btnLight}`} href="/products">{T.btnSelector}</a>
            </div>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.resourceHeroVisual} aria-hidden="true">
              <div className={`${styles.resourceSheet} ${styles.s1}`} dangerouslySetInnerHTML={{ __html: HERO_SHEET_S1 }} />
              <div className={`${styles.resourceSheet} ${styles.s2}`} dangerouslySetInnerHTML={{ __html: HERO_SHEET_S2 }} />
              <div className={`${styles.resourceSheet} ${styles.s3}`} dangerouslySetInnerHTML={{ __html: HERO_SHEET_S3 }} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dots}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{T.secEyebrow}</span>
            <Glow as="h2">{T.secH2}</Glow>
            <p>{T.secP}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.resourcesSection} ${styles.dots}`} id="resources" style={{ paddingTop: 0 }}>
        <div className={styles.container}>
          <div className={styles.resourceControls}>
            <div className={styles.searchbox}>
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={T.searchPlaceholder} />
            </div>
          </div>

          <div className={styles.chipBrowser}>
            <div className={styles.chipBrowserHead}>
              <span>{T.chipFilter}</span>
              <small>{T.chipHint}</small>
            </div>
            <div className={styles.chipTabs} role="tablist" aria-label={T.chipFilter}>
              {CHIP_FAMILIES.map((chip) => {
                const count = chip.id === "all"
                  ? RESOURCE_PRODUCTS.length
                  : RESOURCE_PRODUCTS.filter((p) => p.chip === chip.id).length;
                return (
                  <button
                    key={chip.id}
                    role="tab"
                    aria-selected={chip.id === activeChip}
                    className={`${styles.chipTab} ${chip.id === activeChip ? styles.active : ""}`}
                    onClick={() => { setActiveChip(chip.id); setQuery(""); }}
                  >
                    {pick(chip.label)} <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.productTabs}>
            {chipProducts.map((p) => (
              <button
                key={p.id}
                className={`${styles.productTab} ${p.id === activeId ? styles.active : ""}`}
                onClick={() => { setActiveId(p.id); setQuery(""); }}
              >
                {p.name.replace("XIAO ", "")}
              </button>
            ))}
          </div>

          {chipProducts.length === 0 ? (
            <div className={styles.chipEmpty}>
              <strong>{pick(CHIP_FAMILIES.find((chip) => chip.id === activeChip)?.label)}</strong>
              <p>{T.chipEmpty}</p>
            </div>
          ) : (
            <>
          <section className={styles.resourceBanner}>
            <div>
              <span className={styles.eyebrow}>{T.selected}</span>
              <h2>{active.name}</h2>
              <p>{pick(active.intro)}</p>
              <div className={styles.badgeRow} style={{ marginTop: 18 }}>
                {active.badges.map((x) => <span key={x} className={styles.badge}>{x}</span>)}
              </div>
            </div>
            <svg className={styles.productVisual} viewBox="0 0 320 230" aria-hidden="true" dangerouslySetInnerHTML={{ __html: stripSvg(boardSvg(active)) }} />
          </section>

          {totalItems === 0 ? (
            <div className={styles.resEmpty}>{T.noResults}</div>
          ) : (
            <div className={styles.resGroups}>
              {filteredGroups.map((g, gi) => (
                <div key={gi} className={styles.resGroup}>
                  <div className={styles.resGroupHead}>
                    <h3>{pick(g.label)}</h3>
                    <span>{T.countFiles(g.items.length)}</span>
                  </div>
                  <div className={styles.resList}>
                    {g.items.map((it, ii) => {
                      return (
                        <div key={ii} className={styles.resItem}>
                          <span className={styles.resItemIcon}>{it.icon}</span>
                          <div className={styles.resItemMain}>
                            <div className={styles.resItemName} title={it.name}>{it.name}</div>
                            <div className={styles.resItemMeta}>
                              <span className={styles.resItemFormat}>{it.format}</span>
                            </div>
                          </div>
                          <div className={styles.resItemActions}>
                            {it.format === "PDF" && (
                              <button
                                className={`${styles.iconBtn} ${styles.previewBtn}`}
                                title={T.preview}
                                onClick={() => setModal({ open: true, title: it.name, url: it.url })}
                              >↗</button>
                            )}
                            <a
                              className={styles.iconBtn}
                              href={it.url}
                              target="_blank"
                              rel="noopener"
                              title={T.download}
                              download
                            >↓</a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          )}

          {/* 课程与更多：封面 + 介绍卡片，按主题分组 */}
          <div className={styles.extras}>
            <div className={styles.extrasHead}>
              <span className={styles.eyebrow}>{pick(EXTRAS.eyebrow)}</span>
              <h3>{pick(EXTRAS.title)}</h3>
              <p>{pick(EXTRAS.intro)}</p>
            </div>
            {COURSE_GROUPS.map((g, gi) => (
              <div key={gi} className={styles.courseGroup}>
                <div className={styles.courseGroupHead}><h4>{pick(g.label)}</h4></div>
                <div className={styles.courseGrid}>
                  {g.items.map((it, i) => (
                    <CourseCard key={i} item={{ ...it, intro: pick(it.intro) }} />
                  ))}
                </div>
              </div>
            ))}
            <p className={styles.extrasNote}>{pick(EXTRAS.note)}</p>
          </div>
        </div>
      </section>

      <div
        className={`${styles.modal} ${modal.open ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => { if (e.target === e.currentTarget) setModal((m) => ({ ...m, open: false })); }}
      >
        <div className={styles.modalCard}>
          <div className={styles.modalHead}>
            <div>
              <div className={styles.questionKicker}>{T.modalKicker}</div>
              <h3>{modal.title || "Preview"}</h3>
            </div>
            <button className={styles.closeBtn} onClick={() => setModal((m) => ({ ...m, open: false }))}>×</button>
          </div>
          <div className={styles.modalPreview}>
            {modal.url && (
              <iframe src={modal.url} title={modal.title || "Preview"} style={{ width: "100%", height: "70vh", border: 0 }} />
            )}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <h3>{T.footerH3}</h3>
            <p>{T.footerP}</p>
          </div>
          <small>© {year} Seeed Studio — {T.footerSmall}</small>
        </div>
      </footer>
    </div>
  );
}
