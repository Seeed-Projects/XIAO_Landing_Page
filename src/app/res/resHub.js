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
const OT = { en: "Others", zh: "其他资料" };

const CHIP_FAMILIES = [
  { id: "all", label: { en: "All chips", zh: "全部芯片" } },
  { id: "esp32-s3", label: { en: "ESP32-S3", zh: "ESP32-S3" } },
  { id: "esp32-c3", label: { en: "ESP32-C3", zh: "ESP32-C3" } },
  { id: "esp32-c6", label: { en: "ESP32-C6", zh: "ESP32-C6" } },
  { id: "esp32-c5", label: { en: "ESP32-C5", zh: "ESP32-C5" } },
  { id: "nrf54x", label: { en: "nRF54x", zh: "nRF54x" } },
  { id: "nrf52840", label: { en: "nRF52840", zh: "nRF52840" } },
  { id: "rp2040", label: { en: "RP2040", zh: "RP2040" } },
  { id: "samd21", label: { en: "SAMD21", zh: "SAMD21" } },
  { id: "ra4m1", label: { en: "RA4M1", zh: "RA4M1" } },
];

function resourceGroups({ hardware = [], mechanical = [], software = [], others = [] }) {
  return [
    hardware.length && { label: HW, items: hardware },
    mechanical.length && { label: ME, items: mechanical },
    software.length && { label: SW, items: software },
    others.length && { label: OT, items: others },
  ].filter(Boolean);
}

function guideProduct({ id, chip, name, color, shield, intro, badges, url, groups }) {
  return {
    id, chip, name, color, shield, intro, badges,
    groups: groups || [{ label: SW, items: [
      { icon: "📚", name: `${name} Getting Started`, format: "Guide", url },
    ] }],
  };
}

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
  guideProduct({
    id: "esp32c3", chip: "esp32-c3", name: "XIAO ESP32-C3", color: "#3c6f5d", shield: "#d3d9d4",
    intro: { en: "Compact Wi-Fi and Bluetooth LE board based on ESP32-C3.", zh: "基于 ESP32-C3 的紧凑型 Wi-Fi 与蓝牙开发板。" },
    badges: ["ESP32-C3", "Wi-Fi", "Bluetooth LE"], url: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Espressif ESP32-C3 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/esp32-c3_datasheet.pdf" },
        { icon: "📄", name: "XIAO ESP32-C3 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO_ESP32C3_v1.3_SCH_260116.pdf" },
        { icon: "🗃️", name: "XIAO ESP32-C3 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO_ESP32C3_v1.3_KiCad_260116.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO ESP32-C3 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO-ESP32C3-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO ESP32-C3 Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO-ESP32C3-DXF.zip" },
        { icon: "📐", name: "XIAO ESP32-C3 Bottom Pad Data", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeed-Studio-XIAO-ESP32/XIAO_ESP32C3_v1.2_Dimensioning.zip" },
        { icon: "🔗", name: "XIAO ESP32-C3 3D Model", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-esp32-c3-1" },
      ],
      software: [
        { icon: "🗃️", name: "XIAO ESP32-C3 Factory Firmware", format: "BIN", url: "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/ESP32-C3_RFTest_108_2b9b157_20211014.bin" },
        { icon: "🔗", name: "XIAO ESP32-C3 MicroPython Library", format: "Link", url: "https://github.com/IcingTomato/micropython_xiao_esp32c3" },
        { icon: "🔗", name: "PlatformIO for XIAO ESP32-C3", format: "Link", url: "https://docs.platformio.org/en/latest/boards/espressif32/seeed_xiao_esp32c3.html" },
      ],
      others: [
        { icon: "🔗", name: "First Look at XIAO ESP32-C3", format: "Wiki", url: "https://sigmdel.ca/michel/ha/xiao/xiao_esp32c3_intro_en.html" },
        { icon: "📄", name: "XIAO ESP32-C3 Low Power Consumption Report", format: "PDF", url: "https://files.seeedstudio.com/wiki/Seeed-Studio-XIAO-ESP32/Low_Power_Consumption.pdf" },
      ],
    }),
  }),
  guideProduct({
    id: "esp32c6", chip: "esp32-c6", name: "XIAO ESP32-C6", color: "#46678c", shield: "#d7dce3",
    intro: { en: "ESP32-C6 wireless board with Wi-Fi 6, Bluetooth LE and Zigbee support.", zh: "支持 Wi-Fi 6、蓝牙与 Zigbee 的 ESP32-C6 无线开发板。" },
    badges: ["ESP32-C6", "Wi-Fi 6", "Zigbee", "Thread"], url: "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Espressif ESP32-C6 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/res/esp32-c6_datasheet_en.pdf" },
        { icon: "📄", name: "XIAO ESP32-C6 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/XIAO_ESP32_C6_v1.0_SCH_260114.pdf" },
        { icon: "🗃️", name: "XIAO ESP32-C6 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/XIAO_ESP32_C6_v1.0_SCH&PCB_260114.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO ESP32-C6 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/res/XIAO_ESP32C6_Pinout.xlsx" },
      ],
      mechanical: [{ icon: "🔗", name: "XIAO ESP32-C6 3D Model", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-esp32-c6-1" }],
    }),
  }),
  guideProduct({
    id: "esp32c5", chip: "esp32-c5", name: "XIAO ESP32-C5", color: "#4e6288", shield: "#d9dee4",
    intro: { en: "ESP32-C5 wireless board for next-generation connected projects.", zh: "面向新一代联网项目的 ESP32-C5 无线开发板。" },
    badges: ["ESP32-C5", "Wi-Fi", "Bluetooth LE"], url: "https://wiki.seeedstudio.com/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Espressif ESP32-C5 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/esp32-c5_datasheet_en.pdf" },
        { icon: "📄", name: "XIAO ESP32-C5 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/Seeed_Studio_XIAO_ESP32C5.pdf" },
        { icon: "🗃️", name: "XIAO ESP32-C5 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/Seeed_Studio_XIAO_ESP32C5.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO ESP32-C5 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/XIAO_ESP32C5_Pinout.xlsx" },
      ],
      mechanical: [{ icon: "🔗", name: "XIAO ESP32-C5 3D Model", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-esp32-c5-1" }],
    }),
  }),
  guideProduct({
    id: "nrf52840", chip: "nrf52840", name: "XIAO nRF52840", color: "#356b72", shield: "#d1dcdd",
    intro: { en: "Nordic nRF52840 board for Bluetooth and low-power wireless projects.", zh: "面向蓝牙与低功耗无线项目的 Nordic nRF52840 开发板。" },
    badges: ["nRF52840", "Bluetooth 5.0", "NFC"], url: "https://wiki.seeedstudio.com/XIAO_BLE/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Nordic nRF52840 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/nRF52840_PS_v1.5.pdf" },
        { icon: "📄", name: "Flash P25Q16H-UXH-IR Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/github_weiruanexample/Flash_P25Q16H-UXH-IR_Datasheet.pdf" },
        { icon: "📄", name: "XIAO nRF52840 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_PDF.pdf" },
        { icon: "🗃️", name: "XIAO nRF52840 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed-Studio-XIAO-nRF52840V1.1-KiCad-Project-260105.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO nRF52840 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO nRF52840 Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-DXF.zip" },
        { icon: "📐", name: "XIAO nRF52840 Bottom Pad Data", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Bottom-pad-positioning.zip" },
      ],
    }),
  }),
  guideProduct({
    id: "nrf52840sense", chip: "nrf52840", name: "XIAO nRF52840 Sense", color: "#4f765f", shield: "#d9dfd4",
    intro: { en: "nRF52840 with an onboard IMU and microphone for TinyML sensing.", zh: "集成 IMU 与麦克风的 nRF52840 TinyML 感知开发板。" },
    badges: ["nRF52840", "IMU", "Microphone"], url: "https://wiki.seeedstudio.com/XIAO_BLE/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Nordic nRF52840 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/nRF52840_PS_v1.5.pdf" },
        { icon: "📄", name: "Flash P25Q16H-UXH-IR Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/github_weiruanexample/Flash_P25Q16H-UXH-IR_Datasheet.pdf" },
        { icon: "📄", name: "Charger BQ25101 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/BQ25101.pdf" },
        { icon: "📄", name: "IMU LSM6DS3TR Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/ST_LSM6DS3TR_Datasheet.pdf" },
        { icon: "📄", name: "Microphone MSM261D3526H1CPM Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/mic-MSM261D3526H1CPM-ENG.pdf" },
        { icon: "📄", name: "XIAO nRF52840 Sense Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_PDF.pdf" },
        { icon: "🗃️", name: "XIAO nRF52840 Sense KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed-Studio-XIAO-nRF52840V1.1-KiCad-Project-260105.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO nRF52840 Sense Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Senese-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO nRF52840 Sense Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip" },
        { icon: "📐", name: "XIAO nRF52840 Bottom Pad Data", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Bottom-pad-positioning.zip" },
        { icon: "🗃️", name: "XIAO nRF52840 Sense 3D Model", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/seeed-studio-xiao-nrf52840-3d-model.zip" },
      ],
      others: [{ icon: "📄", name: "XIAO nRF52840 Sense BLE Distance Test Report", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_XIAO_BLE_nRF52840_BLE_Communication_Distance_Test_Report.pdf" }],
    }),
  }),
  guideProduct({
    id: "nrf52840plus", chip: "nrf52840", name: "XIAO nRF52840 Plus", color: "#516c88", shield: "#d6dce5",
    intro: { en: "Expanded nRF52840 board for wireless development.", zh: "面向无线开发的扩展型 nRF52840 开发板。" },
    badges: ["nRF52840", "Bluetooth 5.0", "Plus"], url: "https://wiki.seeedstudio.com/XIAO_BLE/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Nordic nRF52840 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/nRF52840_PS_v1.5.pdf" },
        { icon: "📄", name: "XIAO nRF52840 Plus Schematic", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus_SCH_PCB_v1.1.zip" },
        { icon: "🗃️", name: "XIAO nRF52840 Plus KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus.zip" },
        { icon: "🗃️", name: "XIAO Plus Base (with bottom pad) KiCad", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_with_botton_pad_lead_out_V1.0.zip" },
        { icon: "🗃️", name: "XIAO Plus Base (without bottom pad) KiCad", format: "ZIP", url: "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_without_botton_pad_lead_out_V1.0.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
      ],
      mechanical: [{ icon: "📐", name: "XIAO nRF52840 Sense Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip" }],
    }),
  }),
  guideProduct({
    id: "nrf52840senseplus", chip: "nrf52840", name: "XIAO nRF52840 Sense Plus", color: "#65547c", shield: "#ded8e4",
    intro: { en: "Expanded nRF52840 Sense board for wireless sensing projects.", zh: "面向无线感知项目的扩展型 nRF52840 Sense 开发板。" },
    badges: ["nRF52840", "IMU", "Microphone", "Plus"], url: "https://wiki.seeedstudio.com/XIAO_BLE/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Nordic nRF52840 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/nRF52840_PS_v1.5.pdf" },
        { icon: "📄", name: "XIAO nRF52840 Sense Plus Schematic", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus_SCH_PCB_v1.1.zip" },
        { icon: "🗃️", name: "XIAO nRF52840 Sense Plus KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
      ],
      mechanical: [{ icon: "📐", name: "XIAO nRF52840 Sense Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip" }],
    }),
  }),
  guideProduct({
    id: "rp2040", chip: "rp2040", name: "XIAO RP2040", color: "#6b5f96", shield: "#ddd9e5",
    intro: { en: "Dual-core RP2040 board for compact embedded projects.", zh: "基于双核 RP2040 的紧凑型嵌入式开发板。" },
    badges: ["RP2040", "Dual-core", "MicroPython"], url: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Raspberry Pi RP2040 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/rp2040_datasheet.pdf" },
        { icon: "📄", name: "XIAO RP2040 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/Seeed-Studio-XIAO-RP2040-v1.3.pdf" },
        { icon: "🗃️", name: "XIAO RP2040 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040_v1.3_SCH&PCB_20260304.zip" },
        { icon: "🗃️", name: "XIAO RP2040 Eagle Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040_v1.22_SCH&PCB.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO RP2040 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO RP2040 Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-DXF.zip" },
        { icon: "🗃️", name: "XIAO RP2040 3D Model", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/seeed-studio-xiao-rp2040-3d-model.zip" },
      ],
    }),
  }),
  guideProduct({
    id: "rp2040plus", chip: "rp2040", name: "XIAO RP2040 Plus", color: "#785e96", shield: "#e1dbe8",
    intro: { en: "RP2040 Plus board with expanded capabilities.", zh: "具备扩展能力的 RP2040 Plus 开发板。" },
    badges: ["RP2040", "Plus", "MicroPython"], url: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Raspberry Pi RP2040 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/rp2040_datasheet.pdf" },
        { icon: "📄", name: "XIAO RP2040 Plus Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040-Plus_SCH.pdf" },
        { icon: "🗃️", name: "XIAO RP2040 Plus KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040-Plus_V1.0_SCH&PCB.zip" },
        { icon: "🗃️", name: "XIAO RP2040 Plus Eagle Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040-Plus_V1.0_SCH&PCB.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO RP2040 Plus Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-Plus-pinout.xlsx" },
      ],
    }),
  }),
  guideProduct({
    id: "rp2350", chip: "rp2040", name: "XIAO RP2350", color: "#6f668c", shield: "#ddd9e8",
    intro: { en: "RP2350 board for modern Raspberry Pi Pico-series projects.", zh: "面向新一代 Raspberry Pi Pico 系列项目的 RP2350 开发板。" },
    badges: ["RP2350", "Pico", "MicroPython"], url: "https://wiki.seeedstudio.com/xiao_rp2350/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Raspberry Pi RP2350 Datasheet", format: "PDF", url: "https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf" },
        { icon: "📄", name: "XIAO RP2350 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/Seeed-Studio-XIAO-RP2350-v1.0.pdf" },
        { icon: "🗃️", name: "XIAO RP2350 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO_RP2350_v1.0_SCH&PCB_240626.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO RP2350 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO-RP2350-pinout-sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO RP2350 Dimension", format: "DXF", url: "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO-RP2350-dimension-v1.0.dxf" },
        { icon: "🔗", name: "XIAO RP2350 3D Model", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-rp2350-2" },
      ],
      software: [{ icon: "📄", name: "XIAO RP2350 Low Power Test Firmware", format: "UF2", url: "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/powman_timer-56.uf2" }],
      others: [
        { icon: "📄", name: "Getting Started with Raspberry Pi Pico-series", format: "PDF", url: "https://datasheets.raspberrypi.com/pico/getting-started-with-pico.pdf" },
        { icon: "📄", name: "Raspberry Pi Pico-series Python SDK", format: "PDF", url: "https://datasheets.raspberrypi.com/pico/raspberry-pi-pico-python-sdk.pdf" },
        { icon: "📄", name: "Raspberry Pi Pico-series C/C++ SDK", format: "PDF", url: "https://datasheets.raspberrypi.com/pico/raspberry-pi-pico-c-sdk.pdf" },
        { icon: "🔗", name: "arduino-pico GitHub", format: "Link", url: "https://github.com/earlephilhower/arduino-pico" },
        { icon: "🔗", name: "Arduino-Pico Core Documentation", format: "Link", url: "https://arduino-pico.readthedocs.io/en/latest/install.html" },
      ],
    }),
  }),
  guideProduct({
    id: "samd21", chip: "samd21", name: "Seeeduino XIAO", color: "#a0663e", shield: "#e3d6ca",
    intro: { en: "The original XIAO board, based on the SAMD21 microcontroller.", zh: "基于 SAMD21 微控制器的初代 XIAO 开发板。" },
    badges: ["SAMD21", "Arduino", "Classic XIAO"], url: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Atmel SAMD21G18 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/ATSAMD21G18A-MU-Datasheet.pdf" },
        { icon: "📄", name: "XIAO SAMD21 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0-SCH-191112.pdf" },
        { icon: "🗃️", name: "XIAO SAMD21 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO_SAMD21_v2.1_SCH&PCB_20260304.zip" },
        { icon: "🗃️", name: "XIAO SAMD21 Eagle Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO SAMD21 Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO-SAMD21-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO Dimension", format: "RAR", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/102010328_Seeeduino_XIAO_Dimension.rar" },
        { icon: "🗃️", name: "XIAO SAMD21 3D Model", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/seeeduino-xiao-samd21-3d-model.zip" },
      ],
      software: [{ icon: "🗃️", name: "XIAO SAMD21 Factory Firmware", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/102010328_Seeeduino_XIAO_final_firmware.zip" }],
    }),
  }),
  guideProduct({
    id: "samd21plus", chip: "samd21", name: "XIAO SAMD21 Plus", color: "#a87143", shield: "#e5d9cb",
    intro: { en: "SAMD21 Plus board with expanded design resources.", zh: "提供扩展设计资源的 SAMD21 Plus 开发板。" },
    badges: ["SAMD21", "Arduino", "Plus"], url: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    groups: resourceGroups({
      hardware: [
        { icon: "📄", name: "Atmel SAMD21G18 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/ATSAMD21G18A-MU-Datasheet.pdf" },
        { icon: "📄", name: "XIAO SAMD21 Plus Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/202004620_XIAO-SAMD21Plus_260422.pdf" },
        { icon: "🗃️", name: "XIAO SAMD21 Plus KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/202004620_XIAO-SAMD21-Plus_V1.0_SCH&PCB_20260422.zip" },
        { icon: "🗃️", name: "XIAO SAMD21 Plus Eagle Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
        { icon: "📊", name: "XIAO SAMD21 Plus Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO-SAMD21-PLUS-pinout_sheet.xlsx" },
      ],
      mechanical: [
        { icon: "📐", name: "XIAO Dimension", format: "RAR", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/102010328_Seeeduino_XIAO_Dimension.rar" },
        { icon: "🗃️", name: "XIAO SAMD21 Plus 3D Model", format: "ZIP", url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/seeeduino-xiao-samd21-3d-model.zip" },
      ],
    }),
  }),
  guideProduct({
    id: "ra4m1", chip: "ra4m1", name: "XIAO RA4M1", color: "#6f5847", shield: "#e0d7cf",
    intro: { en: "Renesas RA4M1 board with CAN, DAC and expanded I/O.", zh: "具备 CAN、DAC 与扩展 I/O 的 Renesas RA4M1 开发板。" },
    badges: ["RA4M1", "CAN", "DAC", "Arduino"], url: "https://wiki.seeedstudio.com/getting_started_xiao_ra4m1/",
  }),
];

// Additional and recently released boards share the same resource presentation.
const replaceGroups = (id, groups) => {
  const product = RESOURCE_PRODUCTS.find((item) => item.id === id);
  if (product) product.groups = groups;
};

replaceGroups("nrf54l15sense", resourceGroups({
  hardware: [
    { icon: "📄", name: "Nordic nRF54L15 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/Nordic_nRF54L15_Datasheet_v1.0.pdf" },
    { icon: "📄", name: "XIAO nRF54L15 Sense Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15_Sense_Schematic.pdf" },
    { icon: "🗃️", name: "XIAO nRF54L15 Sense KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15_Sense_KICAD.zip" },
    { icon: "🔗", name: "XIAO nRF54L15 Sense Flux.ai Project", format: "Link", url: "https://www.flux.ai/seeedstudio/seeed-studio-xiao-nrf54l15-sense" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
    { icon: "📊", name: "XIAO nRF54L15 Sense Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/XIAO_nRF54L15datasheet.xlsx" },
  ],
  mechanical: [
    { icon: "📐", name: "XIAO nRF54L15 Sense Dimension", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15(Sense)_DXF.zip" },
    { icon: "🔗", name: "XIAO nRF54L15 Sense 3D Model", format: "Link", url: "https://grabcad.com/library/seeed-studio-xiao-nrf54l15-sense-1" },
  ],
}));

replaceGroups("nrf54lm20asense", resourceGroups({
  hardware: [
    { icon: "📄", name: "Nordic nRF54LM20A Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/nRF54LM20A_nRF54LM20B_Datasheet_v1.0.pdf" },
    { icon: "📄", name: "XIAO nRF54LM20A Sense Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_Schematic.pdf" },
    { icon: "🗃️", name: "XIAO nRF54LM20A KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_V1.0_SCH&PCB_260508.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
    { icon: "📊", name: "XIAO nRF54LM20A Sense Pinout Sheet", format: "XLSX", url: "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_Pin_definition.xlsx" },
  ],
}));

replaceGroups("ra4m1", resourceGroups({
  hardware: [
    { icon: "📄", name: "Renesas RA4M1 Datasheet", format: "PDF", url: "https://www.renesas.com/us/en/document/dst/ra4m1-group-datasheet" },
    { icon: "📄", name: "XIAO RA4M1 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO-R4AM1/res/XIAO%20RA4M1%20V1.01_SCH_PDF_260114%20.pdf.pdf" },
    { icon: "🗃️", name: "XIAO RA4M1 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO-R4AM1/res/202003977_XIAO%20RA4M1%20v1.01_SCH&PCB_260114.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
  ],
}));

RESOURCE_PRODUCTS.push(
  {
    id: "mg24", chip: "nrf54x", name: "XIAO MG24", color: "#35616a", shield: "#d6dfda",
    intro: { en: "Silicon Labs MG24 wireless board for low-power connected devices.", zh: "面向低功耗无线设备的 Silicon Labs MG24 开发板。" }, badges: ["MG24", "Matter", "Thread"],
    groups: resourceGroups({ hardware: [
      { icon: "📄", name: "Silicon Labs EFR32MG24 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/mg24-group-datasheet.PDF" },
      { icon: "📄", name: "EFR32MG24 Reference Manual", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/efr32xg24_rm.pdf" },
      { icon: "📄", name: "XIAO MG24 Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MGM240S_KICAD_Prj.pdf" },
      { icon: "🗃️", name: "XIAO MG24 KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MG24_v1.0_KiCad_260114.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
    ] }),
  },
  {
    id: "mg24sense", chip: "nrf54x", name: "XIAO MG24 Sense", color: "#476b59", shield: "#d8dfd6",
    intro: { en: "MG24 Sense board with expanded sensing capability.", zh: "具备扩展感知能力的 MG24 Sense 开发板。" }, badges: ["MG24", "Sense", "Matter"],
    groups: resourceGroups({ hardware: [
      { icon: "📄", name: "Silicon Labs EFR32MG24 Datasheet", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/mg24-group-datasheet.PDF" },
      { icon: "📄", name: "EFR32MG24 Reference Manual", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/efr32xg24_rm.pdf" },
      { icon: "📄", name: "XIAO MG24 Sense Schematic", format: "PDF", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MGM240S_KICAD_Prj.pdf" },
      { icon: "🗃️", name: "XIAO MG24 Sense KiCad Project", format: "ZIP", url: "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MG24_v1.0_KiCad_260114.zip" }, KICAD_FOOTPRINTS, KICAD_SYMBOLS,
    ] }),
  }
);

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
        boards: ["all"],
      },
      {
        title: "No-Code Programming to Get Started with TinyML",
        intro: { en: "Learn TinyML with block-based, no-code programming — no prior coding needed.", zh: "无需写代码，用图形化积木编程入门 TinyML 机器学习。" },
        cover: null,
        url: "https://tinkergen.github.io/No-code-Programming-to-Get-Started-with-TinyML/",
        kind: "fallback", accent: "#2f5b78",
        boards: ["all"],
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
        boards: ["esp32-s3", "esp32-s3-sense", "esp32-s3-plus", "esp32-s3-sense-camera"],
      },
      {
        title: "IoT for Beginners",
        intro: { en: "Microsoft's 12-week curriculum covering IoT hardware, cloud and hands-on projects.", zh: "微软 12 周 IoT 入门课：硬件、云端与项目实战。" },
        cover: null,
        url: "https://microsoft.github.io/IoT-For-Beginners/",
        kind: "fallback", accent: "#315d4c",
        boards: ["esp32-c3", "esp32-c6", "esp32-s3", "esp32-s3-sense", "esp32-s3-plus", "esp32-s3-sense-camera"],
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
        boards: ["samd21"],
      },
      {
        title: "Fab-Xiao",
        intro: { en: "A Fab Academy student project — open-source hardware built around XIAO.", zh: "Fab Academy 学生作品：围绕 XIAO 的开源硬件项目。" },
        cover: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/images/fabxiao/fabxiao_board.jpg",
        url: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/fabxiao.html",
        kind: "img", accent: "#3a4a2f",
        boards: ["all"],
      },
      {
        title: "maker100-eco",
        intro: { en: "Robotics, IoT & TinyML with the $14 XIAO ESP32 — 100 maker experiments.", zh: "用 $14 的 XIAO ESP32 玩机器人 / IoT / TinyML，100 个创客实验。" },
        cover: "https://opengraph.githubassets.com/f3ca4a588f9aa4f35f0687941b94fb6763592891ba561e9b5f046a411cd66bfb/hpssjellis/maker100-eco",
        url: "https://github.com/hpssjellis/maker100-eco",
        kind: "img", accent: "#2f5b78",
        boards: ["esp32-c3", "esp32-c6", "esp32-s3", "esp32-s3-sense", "esp32-s3-plus", "esp32-s3-sense-camera"],
      },
      {
        title: "XIAO on YouTube",
        intro: { en: "A curated YouTube playlist of XIAO tutorials and builds.", zh: "精选 XIAO 教程与实战视频。" },
        cover: null,
        url: "https://www.youtube.com/watch?v=Zs0-jXdnRY",
        kind: "fallback", accent: "#7a2f2f",
        boards: ["all"],
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
      ? "从规格到实现，汇聚原理图、Pinout、PCB、尺寸与 3D 资料，让每一次查找都更清晰、更从容。"
      : "From specification to implementation, bring schematics, Pinout, PCB, dimensions and 3D resources together—so every search feels clearer and more effortless.",
    btnBrowse: lang === "zh" ? "浏览资源" : "Browse resources",
    btnSelector: lang === "zh" ? "进入智能选型" : "Open Smart Selector",
    secEyebrow: lang === "zh" ? "可视化资源库" : "Visual resource library",
    secH2: lang === "zh" ? "不用读链接，先看资料是什么。" : "Don't read links — see what the resource is first.",
    secP: lang === "zh"
      ? "从规格到实现，一站汇集 Pinout、原理图、PCB、尺寸与 3D 资料，让每一份设计资料都触手可及。"
      : "From specification to implementation, explore Pinout, schematics, PCB, dimensions and 3D resources in one place—so every design resource is always within reach.",
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
    generalCourses: lang === "zh" ? "通用课程" : "General courses",
    boardCourses: lang === "zh" ? `适用于 ${active.name} 的课程` : `Courses for ${active.name}`,
    universalTag: lang === "zh" ? "全系列 XIAO" : "All XIAO boards",
    boardTag: lang === "zh" ? `适用 ${active.name}` : active.name,
  };

  const pick = (field) => (field && field[lang]) || (field && field.en) || "";
  const allCourses = COURSE_GROUPS.flatMap((group) => group.items);
  const generalCourses = allCourses.filter((item) => item.boards.includes("all"));
  const boardCourses = allCourses.filter(
    (item) => !item.boards.includes("all") && item.boards.includes(active.id)
  );

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
            <Glow as="h2" start={0.48} end={0.12}>{T.secH2}</Glow>
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
            <div className={styles.courseGroup}>
              <div className={styles.courseGroupHead}><h4>{T.generalCourses}</h4></div>
              <div className={styles.courseGrid}>
                {generalCourses.map((it) => (
                  <CourseCard key={it.title} item={{ ...it, intro: pick(it.intro), tags: [T.universalTag] }} />
                ))}
              </div>
            </div>
            {boardCourses.length > 0 && (
              <div className={styles.courseGroup}>
                <div className={styles.courseGroupHead}><h4>{T.boardCourses}</h4></div>
                <div className={styles.courseGrid}>
                  {boardCourses.map((it) => (
                    <CourseCard key={it.title} item={{ ...it, intro: pick(it.intro), tags: [T.boardTag] }} />
                  ))}
                </div>
              </div>
            )}
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
