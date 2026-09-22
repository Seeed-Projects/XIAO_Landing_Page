/**
 * Hardware resource catalog for /res/.
 * /res/ 的硬件资源目录：板卡、分类文件、全系列共享库和学习条目。
 */
import { BAKED_THUMBS } from "./res-thumbs.generated.mjs";

const RESOURCE_KINDS = [
  "datasheet",
  "schematic",
  "kicad",
  "pinout",
  "dimension",
  "model3d",
  "step",
  "firmware",
  "guide",
  "link",
  "other",
];

const PREVIEW_MODES = ["pdf", "dxf", "dxf-zip", "kicad", "step", "xlsx"];

export { PREVIEW_MODES, RESOURCE_KINDS };

export const CHIP_FAMILIES = [
  { id: "esp32", label: { en: "ESP32", zh: "ESP32" }, chips: ["esp32-s3", "esp32-c3", "esp32-c6", "esp32-c5"] },
  { id: "nrf", label: { en: "nRF", zh: "nRF" }, chips: ["nrf52840", "nrf54x"] },
  { id: "rp", label: { en: "RP2040 / RP2350", zh: "RP2040 / RP2350" }, chips: ["rp2040", "rp2350"] },
  { id: "mg24", label: { en: "MG24", zh: "MG24" }, chips: ["mg24"] },
  { id: "samd21", label: { en: "SAMD21", zh: "SAMD21" }, chips: ["samd21"] },
  { id: "ra4m1", label: { en: "RA4M1", zh: "RA4M1" }, chips: ["ra4m1"] },
];

const GROUPS = {
  hardware: { id: "hardware", label: { en: "Hardware Design", zh: "硬件设计" } },
  mechanical: { id: "mechanical", label: { en: "Mechanical Design", zh: "结构设计" } },
  software: { id: "software", label: { en: "Software & Tools", zh: "软件与工具" } },
  others: { id: "others", label: { en: "Others", zh: "其他资料" } },
};

/**
 * Build one downloadable resource.
 * 生成一条可下载资源，并按格式决定默认预览方式。
 */
function res(name, format, url, kind, extra = {}) {
  const preview = Object.prototype.hasOwnProperty.call(extra, "preview")
    ? extra.preview
    : defaultPreview(kind, format);
  return { name, format, url, kind, preview, thumb: extra.thumb || null };
}

function defaultPreview(kind, format) {
  if (format === "PDF") return "pdf";
  if (format === "STP") return "step";
  if (format === "DXF") return "dxf";
  if (format === "XLSX") return "xlsx";
  if (format === "ZIP" && kind === "kicad") return "kicad";
  if (format === "ZIP" && kind === "dimension") return "dxf-zip";
  return null;
}

function resourceGroups({ hardware = [], mechanical = [], software = [], others = [] }) {
  return [
    hardware.length && { ...GROUPS.hardware, items: hardware },
    mechanical.length && { ...GROUPS.mechanical, items: mechanical },
    software.length && { ...GROUPS.software, items: software },
    others.length && { ...GROUPS.others, items: others },
  ].filter(Boolean);
}

const S3_DATASHEET = res(
  "Espressif ESP32-S3 Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/esp32-s3_datasheet.pdf",
  "datasheet",
);

export const SHARED_RESOURCES = [
  res(
    "XIAO Series KiCad Footprints",
    "ZIP",
    "https://files.seeedstudio.com/wiki/XIAO-KiCad-Library/New_XIAO_Series_Footprints.zip",
    "kicad",
    { preview: null },
  ),
  res(
    "XIAO Series KiCad SCH Symbols",
    "ZIP",
    "https://files.seeedstudio.com/wiki/XIAO-KiCad-Library/XIAO_Series_SCH_Symbols.zip",
    "kicad",
    { preview: null },
  ),
];

const NRF_DATASHEET = res(
  "Nordic nRF52840 Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/XIAO-BLE/nRF52840_PS_v1.5.pdf",
  "datasheet",
);
const FLASH_DATASHEET = res(
  "Flash P25Q16H-UXH-IR Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/github_weiruanexample/Flash_P25Q16H-UXH-IR_Datasheet.pdf",
  "datasheet",
);
const PLUS_BASE_WITH = res(
  "XIAO Plus Base (with bottom pad) KiCad",
  "ZIP",
  "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_with_botton_pad_lead_out_V1.0.zip",
  "kicad",
);
const PLUS_BASE_WITHOUT = res(
  "XIAO Plus Base (without bottom pad) KiCad",
  "ZIP",
  "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_Plus_Base_without_botton_pad_lead_out_V1.0.zip",
  "kicad",
);
const RP2040_DATASHEET = res(
  "Raspberry Pi RP2040 Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/rp2040_datasheet.pdf",
  "datasheet",
);
const SAMD_DATASHEET = res(
  "Atmel SAMD21G18 Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/ATSAMD21G18A-MU-Datasheet.pdf",
  "datasheet",
);
const SAMD_DIMENSION = res(
  "XIAO Dimension",
  "RAR",
  "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/102010328_Seeeduino_XIAO_Dimension.rar",
  "dimension",
);
const MG_DATASHEET = res(
  "Silicon Labs EFR32MG24 Datasheet",
  "PDF",
  "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/mg24-group-datasheet.PDF",
  "datasheet",
);
const MG_MANUAL = res(
  "EFR32MG24 Reference Manual",
  "PDF",
  "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/efr32xg24_rm.pdf",
  "datasheet",
);

function board(spec) {
  return spec;
}

export const RESOURCE_PRODUCTS = [
  board({
    id: "s3",
    chip: "esp32-s3",
    name: "XIAO ESP32-S3",
    pinoutId: "s3",
    image: "/xiao-products/dev_boards/s3-front.webp",
    shop: "https://www.seeedstudio.com/XIAO-ESP32S3-p-5627.html",
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    intro: { en: "The Wi-Fi + BLE workhorse of the XIAO lineup.", zh: "XIAO 系列里 Wi-Fi + BLE 的主力通用板。" },
    badges: ["ESP32-S3", "Wi-Fi", "BLE"],
    groups: resourceGroups({
      hardware: [
        S3_DATASHEET,
        res("XIAO ESP32-S3 Schematic", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003751_XIAO%20ESP32S3_v1.4_SCH_260226.pdf.pdf", "schematic"),
        res("XIAO ESP32-S3 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003751_XIAO%20ESP32S3_v1.4_SCH&PCB_260226.zip", "kicad"),
        res("XIAO ESP32-S3 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Sense_Pinout.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO ESP32-S3 Dimension (DXF)", "DXF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_v1.1_Dimensioning.dxf", "dimension"),
        res("XIAO ESP32-S3 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/seeed-studio-xiao-esp32s3-3d_model.zip", "model3d", { thumb: "/res-thumb/s3-3d.png" }),
      ],
      software: [
        res("XIAO ESP32-S3 Factory Firmware", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-firmware-20240814.zip", "firmware"),
      ],
    }),
  }),
  board({
    id: "s3sense",
    chip: "esp32-s3",
    name: "XIAO ESP32-S3 Sense",
    pinoutId: "s3sense",
    image: "/xiao-products/dev_boards/XIAO落地页素材-21-1536x1257.jpg",
    shop: "https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html",
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    intro: { en: "Adds an onboard camera and microphone for vision and voice.", zh: "板载摄像头与麦克风，面向视觉与语音。" },
    badges: ["Camera", "Microphone", "Wi-Fi", "BLE"],
    groups: resourceGroups({
      hardware: [
        S3_DATASHEET,
        res("XIAO ESP32-S3 Sense Schematic", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003753_XIAO%20ESP32S3%20Sense_v1.5_SCH_260226.pdf.pdf", "schematic"),
        res("XIAO ESP32-S3 ExpBoard Schematic", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_SCH.pdf", "schematic"),
        res("XIAO ESP32-S3 Sense KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/202003753_XIAO%20ESP32S3%20Sense_v1.5_SCH&PCB_260226.zip", "kicad"),
        res("XIAO ESP32-S3 Sense Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Sense_Pinout.xlsx", "pinout"),
      ],
      mechanical: [
        res("Sense Dimension (DXF, Top)", "DXF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_top.dxf", "dimension"),
        res("Sense Dimension (DXF, Bottom)", "DXF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_ExpBoard_v1.0_bot.dxf", "dimension"),
        res("Sense 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/seeed-studio-xiao-esp32s3-sense-3d_model.zip", "model3d", { thumb: "/res-thumb/s3sense-3d.png" }),
        res("Sense Purple Enclosure (Top)", "STP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-housing-design(top).stp", "step"),
        res("Sense Purple Enclosure (Bottom)", "STP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-housing-design(bottom).stp", "step"),
      ],
      software: [
        res("Sense Factory Firmware", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO-ESP32S3-Sense-firmware-20240814.zip", "firmware"),
      ],
    }),
  }),
  board({
    id: "s3plus",
    chip: "esp32-s3",
    name: "XIAO ESP32-S3 Plus",
    pinoutId: "s3plus",
    image: "/xiao-products/dev_boards/s3plus-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Plus-p-6361.html",
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    intro: { en: "Larger GPIO count and PSRAM for heavier connected projects.", zh: "更多 GPIO 与 PSRAM，适合更重的联网项目。" },
    badges: ["ESP32-S3", "Wi-Fi", "BLE", "Plus"],
    groups: resourceGroups({
      hardware: [
        S3_DATASHEET,
        res("XIAO ESP32-S3 Plus Schematic", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Plus_V1.1_SCH_260115.pdf", "schematic"),
        res("Plus KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_Plus_V1.1_KiCad_260115.zip", "kicad"),
        PLUS_BASE_WITH,
        PLUS_BASE_WITHOUT,
        res("Plus Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/Seeed_Studio_XIAO_ESP32S3_Plus_Pinout.xlsx", "pinout"),
      ],
      mechanical: [
        res("Plus Dimension (DXF, Top)", "DXF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/TOP.dxf", "dimension"),
        res("Plus Dimension (DXF, Bottom)", "DXF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/BOTTOM.dxf", "dimension"),
        res("Plus 3D Model (GrabCAD)", "Link", "https://grabcad.com/library/seeed-studio-xiao-esp32s3-plus-1/files", "model3d"),
      ],
    }),
  }),
  board({
    id: "s3cam",
    chip: "esp32-s3",
    name: "XIAO ESP32-S3 Sense Camera",
    pinoutId: null,
    image: "/xiao-products/dev_boards/XIAO落地页素材-21-1536x1257.jpg",
    shop: null,
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    intro: { en: "Camera module datasheets for the Sense camera attachments.", zh: "Sense 摄像头模组的摄像头规格书与传感器手册。" },
    badges: ["OV3660", "OV5640", "OV2640", "Camera"],
    groups: resourceGroups({
      hardware: [
        res("OV3660 Camera Module Specification", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/OV3660_Camera_Module_Specification.pdf", "datasheet"),
        res("OV3660 CMOS Sensor Datasheet", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV3660_datasheet.pdf", "datasheet"),
        res("OV5640 Camera Module Specification", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/new-res/OV5640_Camera_Module_Specification.pdf", "datasheet"),
        res("OV5640 CMOS Sensor Datasheet", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV5640_datasheet.pdf", "datasheet"),
        res("OV2640 CMOS Sensor Datasheet", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/OV2640_datasheet.pdf", "datasheet"),
      ],
    }),
  }),
  board({
    id: "esp32c3",
    chip: "esp32-c3",
    name: "XIAO ESP32-C3",
    pinoutId: "c3",
    image: "/xiao-products/dev_boards/c3-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-XIAO-ESP32C3-p-5431.html",
    wiki: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/",
    intro: { en: "Compact Wi-Fi and Bluetooth LE board based on ESP32-C3.", zh: "基于 ESP32-C3 的紧凑型 Wi-Fi 与蓝牙开发板。" },
    badges: ["ESP32-C3", "Wi-Fi", "Bluetooth LE"],
    groups: resourceGroups({
      hardware: [
        res("Espressif ESP32-C3 Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/esp32-c3_datasheet.pdf", "datasheet"),
        res("XIAO ESP32-C3 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO_ESP32C3_v1.3_SCH_260116.pdf", "schematic"),
        res("XIAO ESP32-C3 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO_ESP32C3_v1.3_KiCad_260116.zip", "kicad"),
        res("XIAO ESP32-C3 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO-ESP32C3-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO ESP32-C3 Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO-ESP32C3-DXF.zip", "dimension"),
        res("XIAO ESP32-C3 Bottom Pad Data", "ZIP", "https://files.seeedstudio.com/wiki/Seeed-Studio-XIAO-ESP32/XIAO_ESP32C3_v1.2_Dimensioning.zip", "dimension"),
        res("XIAO ESP32-C3 3D Model", "Link", "https://grabcad.com/library/seeed-studio-xiao-esp32-c3-1", "model3d"),
      ],
      software: [
        res("XIAO ESP32-C3 Factory Firmware", "BIN", "https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/ESP32-C3_RFTest_108_2b9b157_20211014.bin", "firmware"),
        res("XIAO ESP32-C3 MicroPython Library", "Link", "https://github.com/IcingTomato/micropython_xiao_esp32c3", "link"),
        res("PlatformIO for XIAO ESP32-C3", "Link", "https://docs.platformio.org/en/latest/boards/espressif32/seeed_xiao_esp32c3.html", "link"),
      ],
      others: [
        res("First Look at XIAO ESP32-C3", "Wiki", "https://sigmdel.ca/michel/ha/xiao/xiao_esp32c3_intro_en.html", "link"),
        res("XIAO ESP32-C3 Low Power Consumption Report", "PDF", "https://files.seeedstudio.com/wiki/Seeed-Studio-XIAO-ESP32/Low_Power_Consumption.pdf", "other"),
      ],
    }),
  }),
  board({
    id: "esp32c6",
    chip: "esp32-c6",
    name: "XIAO ESP32-C6",
    pinoutId: "c6",
    image: "/xiao-products/dev_boards/c6-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C6-p-5884.html",
    wiki: "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/",
    intro: { en: "ESP32-C6 wireless board with Wi-Fi 6, Bluetooth LE and Zigbee support.", zh: "支持 Wi-Fi 6、蓝牙与 Zigbee 的 ESP32-C6 无线开发板。" },
    badges: ["ESP32-C6", "Wi-Fi 6", "Zigbee", "Thread"],
    groups: resourceGroups({
      hardware: [
        res("Espressif ESP32-C6 Datasheet", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/res/esp32-c6_datasheet_en.pdf", "datasheet"),
        res("XIAO ESP32-C6 Schematic", "PDF", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/XIAO_ESP32_C6_v1.0_SCH_260114.pdf", "schematic"),
        res("XIAO ESP32-C6 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/XIAO_ESP32_C6_v1.0_SCH&PCB_260114.zip", "kicad"),
        res("XIAO ESP32-C6 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32C6/res/XIAO_ESP32C6_Pinout.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO ESP32-C6 3D Model", "Link", "https://grabcad.com/library/seeed-studio-xiao-esp32-c6-1", "model3d"),
      ],
      software: [
        res("XIAO ESP32-C6 Getting Started", "Guide", "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/", "guide"),
      ],
    }),
  }),
  board({
    id: "esp32c5",
    chip: "esp32-c5",
    name: "XIAO ESP32-C5",
    pinoutId: "c5",
    image: "/xiao-products/dev_boards/c5-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32C5-p-6609.html",
    wiki: "https://wiki.seeedstudio.com/xiao_esp32c5_getting_started/",
    intro: { en: "ESP32-C5 wireless board for next-generation connected projects.", zh: "面向新一代联网项目的 ESP32-C5 无线开发板。" },
    badges: ["ESP32-C5", "Wi-Fi", "Bluetooth LE"],
    groups: resourceGroups({
      hardware: [
        res("Espressif ESP32-C5 Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/esp32-c5_datasheet_en.pdf", "datasheet"),
        res("XIAO ESP32-C5 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/Seeed_Studio_XIAO_ESP32C5.pdf", "schematic"),
        res("XIAO ESP32-C5 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/Seeed_Studio_XIAO_ESP32C5.zip", "kicad"),
        res("XIAO ESP32-C5 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO_ESP32C5/res/XIAO_ESP32C5_Pinout.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO ESP32-C5 3D Model", "Link", "https://grabcad.com/library/seeed-studio-xiao-esp32-c5-1", "model3d"),
      ],
      software: [
        res("XIAO ESP32-C5 Getting Started", "Guide", "https://wiki.seeedstudio.com/xiao_esp32c5_getting_started/", "guide"),
      ],
    }),
  }),
  board({
    id: "nrf52840",
    chip: "nrf52840",
    name: "XIAO nRF52840",
    pinoutId: "nrf52",
    image: "/xiao-products/dev_boards/nrf52-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-XIAO-BLE-nRF52840-p-5201.html",
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    intro: { en: "Nordic nRF52840 board for Bluetooth and low-power wireless projects.", zh: "面向蓝牙与低功耗无线项目的 Nordic nRF52840 开发板。" },
    badges: ["nRF52840", "Bluetooth 5.0", "NFC"],
    groups: resourceGroups({
      hardware: [
        NRF_DATASHEET,
        FLASH_DATASHEET,
        res("XIAO nRF52840 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_PDF.pdf", "schematic"),
        res("XIAO nRF52840 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed-Studio-XIAO-nRF52840V1.1-KiCad-Project-260105.zip", "kicad"),
        res("XIAO nRF52840 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO nRF52840 Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-DXF.zip", "dimension"),
        res("XIAO nRF52840 Bottom Pad Data", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Bottom-pad-positioning.zip", "dimension"),
      ],
      software: [
        res("XIAO nRF52840 Getting Started", "Guide", "https://wiki.seeedstudio.com/XIAO_BLE/", "guide"),
      ],
    }),
  }),
  board({
    id: "nrf52840sense",
    chip: "nrf52840",
    name: "XIAO nRF52840 Sense",
    pinoutId: "nrf52840sense",
    image: "/xiao-products/dev_boards/XIAO落地页素材-04-1536x1257.jpg",
    shop: "https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html",
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    intro: { en: "nRF52840 with an onboard IMU and microphone for TinyML sensing.", zh: "集成 IMU 与麦克风的 nRF52840 TinyML 感知开发板。" },
    badges: ["nRF52840", "IMU", "Microphone"],
    groups: resourceGroups({
      hardware: [
        NRF_DATASHEET,
        FLASH_DATASHEET,
        res("Charger BQ25101 Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/BQ25101.pdf", "datasheet"),
        res("IMU LSM6DS3TR Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/ST_LSM6DS3TR_Datasheet.pdf", "datasheet"),
        res("Microphone MSM261D3526H1CPM Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/mic-MSM261D3526H1CPM-ENG.pdf", "datasheet"),
        res("XIAO nRF52840 Sense Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_PDF.pdf", "schematic"),
        res("XIAO nRF52840 Sense KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed-Studio-XIAO-nRF52840V1.1-KiCad-Project-260105.zip", "kicad"),
        res("XIAO nRF52840 Sense Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Senese-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO nRF52840 Sense Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip", "dimension"),
        res("XIAO nRF52840 Bottom Pad Data", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Bottom-pad-positioning.zip", "dimension"),
        res("XIAO nRF52840 Sense 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/seeed-studio-xiao-nrf52840-3d-model.zip", "model3d"),
      ],
      others: [
        res("XIAO nRF52840 Sense BLE Distance Test Report", "PDF", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_XIAO_BLE_nRF52840_BLE_Communication_Distance_Test_Report.pdf", "other"),
      ],
    }),
  }),
  board({
    id: "nrf52840plus",
    chip: "nrf52840",
    name: "XIAO nRF52840 Plus",
    pinoutId: "nrf52840plus",
    image: "/xiao-products/dev_boards/nrf52840plus-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Plus-p-6359.html",
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    intro: { en: "Expanded nRF52840 board for wireless development.", zh: "面向无线开发的扩展型 nRF52840 开发板。" },
    badges: ["nRF52840", "Bluetooth 5.0", "Plus"],
    groups: resourceGroups({
      hardware: [
        NRF_DATASHEET,
        res("XIAO nRF52840 Plus Schematic", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus_SCH_PCB_v1.1.zip", "schematic"),
        res("XIAO nRF52840 Plus KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus.zip", "kicad"),
        PLUS_BASE_WITH,
        PLUS_BASE_WITHOUT,
      ],
      mechanical: [
        res("XIAO nRF52840 Sense Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip", "dimension"),
      ],
    }),
  }),
  board({
    id: "nrf52840senseplus",
    chip: "nrf52840",
    name: "XIAO nRF52840 Sense Plus",
    pinoutId: "nrf52840senseplus",
    image: "/xiao-products/dev_boards/nrf52840plus-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Sense-Plus-p-6360.html",
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    intro: { en: "Expanded nRF52840 Sense board for wireless sensing projects.", zh: "面向无线感知项目的扩展型 nRF52840 Sense 开发板。" },
    badges: ["nRF52840", "IMU", "Microphone", "Plus"],
    groups: resourceGroups({
      hardware: [
        NRF_DATASHEET,
        res("XIAO nRF52840 Sense Plus Schematic", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus_SCH_PCB_v1.1.zip", "schematic"),
        res("XIAO nRF52840 Sense Plus KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed_Studio_XIAO_nRF52840_Plus.zip", "kicad"),
      ],
      mechanical: [
        res("XIAO nRF52840 Sense Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-BLE/XIAO-nRF52840-Sense-DXF.zip", "dimension"),
      ],
    }),
  }),
  board({
    id: "nrf54l15",
    chip: "nrf54x",
    name: "XIAO nRF54L15",
    pinoutId: "nrf54l15",
    image: "/xiao-products/dev_boards/nrf54l15-front.webp",
    shop: "https://www.seeedstudio.com/XIAO-nRF54L15-p-6493.html",
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    intro: { en: "Ultra-low-power Nordic wireless board for secure connected devices.", zh: "基于 Nordic nRF54L15 的超低功耗无线开发板。" },
    badges: ["nRF54L15", "Bluetooth LE 6.0", "Matter", "Thread"],
    groups: resourceGroups({
      software: [
        res("XIAO nRF54L15 Getting Started", "Guide", "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/", "guide"),
      ],
    }),
  }),
  board({
    id: "nrf54l15sense",
    chip: "nrf54x",
    name: "XIAO nRF54L15 Sense",
    pinoutId: "nrf54l15sense",
    image: "/xiao-products/dev_boards/nRF54L15-Sense-1536x1256.jpg",
    shop: "https://www.seeedstudio.com/XIAO-nRF54L15-Sense-p-6494.html",
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    intro: { en: "nRF54L15 with onboard IMU and microphone for sensing projects.", zh: "集成 IMU 与麦克风的 nRF54L15 感知开发板。" },
    badges: ["nRF54L15", "IMU", "Microphone", "Bluetooth LE 6.0"],
    groups: resourceGroups({
      hardware: [
        res("Nordic nRF54L15 Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/Nordic_nRF54L15_Datasheet_v1.0.pdf", "datasheet"),
        res("XIAO nRF54L15 Sense Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15_Sense_Schematic.pdf", "schematic"),
        res("XIAO nRF54L15 Sense KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15_Sense_KICAD.zip", "kicad"),
        res("XIAO nRF54L15 Sense Flux.ai Project", "Link", "https://www.flux.ai/seeedstudio/seeed-studio-xiao-nrf54l15-sense", "link"),
        res("XIAO nRF54L15 Sense Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/XIAO_nRF54L15datasheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO nRF54L15 Sense Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_nRF54L15/Getting_Start/nRF54L15(Sense)_DXF.zip", "dimension"),
        res("XIAO nRF54L15 Sense 3D Model", "Link", "https://grabcad.com/library/seeed-studio-xiao-nrf54l15-sense-1", "model3d"),
      ],
    }),
  }),
  board({
    id: "nrf54lm20a",
    chip: "nrf54x",
    name: "XIAO nRF54LM20A",
    pinoutId: "nrf54lm20a",
    image: "/xiao-products/dev_boards/nrf54-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-p-6841.html",
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54lm20a_getting_started/",
    intro: { en: "A higher-memory Nordic nRF54 wireless board with power management.", zh: "具备更大内存与电源管理能力的 Nordic nRF54 无线开发板。" },
    badges: ["nRF54LM20A", "Bluetooth LE 6.0", "NFC", "Matter"],
    groups: resourceGroups({
      software: [
        res("XIAO nRF54LM20A Getting Started", "Guide", "https://wiki.seeedstudio.com/xiao_nrf54lm20a_getting_started/", "guide"),
      ],
    }),
  }),
  board({
    id: "nrf54lm20asense",
    chip: "nrf54x",
    name: "XIAO nRF54LM20A Sense",
    pinoutId: "nrf54lm20asense",
    image: "/xiao-products/dev_boards/Group-48-1536x1256.jpg",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF54LM20A-Sense-p-6840.html",
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54lm20a_getting_started/",
    intro: { en: "nRF54LM20A with an IMU and microphone for advanced edge sensing.", zh: "集成 IMU 与麦克风的 nRF54LM20A 边缘感知开发板。" },
    badges: ["nRF54LM20A", "IMU", "Microphone", "8 MB Flash"],
    groups: resourceGroups({
      hardware: [
        res("Nordic nRF54LM20A Datasheet", "PDF", "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/nRF54LM20A_nRF54LM20B_Datasheet_v1.0.pdf", "datasheet"),
        res("XIAO nRF54LM20A Sense Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_Schematic.pdf", "schematic"),
        res("XIAO nRF54LM20A KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_V1.0_SCH&PCB_260508.zip", "kicad"),
        res("XIAO nRF54LM20A Sense Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO_nRF54LM20A/getting_start/RES/XIAO_nRF54LM20A_Pin_definition.xlsx", "pinout"),
      ],
    }),
  }),
  board({
    id: "rp2040",
    chip: "rp2040",
    name: "XIAO RP2040",
    pinoutId: "rp2040",
    image: "/xiao-products/dev_boards/rp2040-front.webp",
    shop: "https://www.seeedstudio.com/XIAO-RP2040-v1-0-p-5026.html",
    wiki: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    intro: { en: "Dual-core RP2040 board for compact embedded projects.", zh: "基于双核 RP2040 的紧凑型嵌入式开发板。" },
    badges: ["RP2040", "Dual-core", "MicroPython"],
    groups: resourceGroups({
      hardware: [
        RP2040_DATASHEET,
        res("XIAO RP2040 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/Seeed-Studio-XIAO-RP2040-v1.3.pdf", "schematic"),
        res("XIAO RP2040 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040_v1.3_SCH&PCB_20260304.zip", "kicad"),
        res("XIAO RP2040 Eagle Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040_v1.22_SCH&PCB.zip", "other"),
        res("XIAO RP2040 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO RP2040 Dimension", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-DXF.zip", "dimension"),
        res("XIAO RP2040 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/seeed-studio-xiao-rp2040-3d-model.zip", "model3d"),
      ],
    }),
  }),
  board({
    id: "rp2040plus",
    chip: "rp2040",
    name: "XIAO RP2040 Plus",
    pinoutId: "rp2040plus",
    image: "/xiao-products/dev_boards/rp2040plus-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Plus-p-6932.html",
    wiki: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    intro: { en: "RP2040 Plus board with expanded capabilities.", zh: "具备扩展能力的 RP2040 Plus 开发板。" },
    badges: ["RP2040", "Plus", "MicroPython"],
    groups: resourceGroups({
      hardware: [
        RP2040_DATASHEET,
        res("XIAO RP2040 Plus Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040-Plus_SCH.pdf", "schematic"),
        res("XIAO RP2040 Plus KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO_RP2040-Plus_V1.0_SCH&PCB.zip", "kicad"),
        res("XIAO RP2040 Plus Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO-RP2040/res/XIAO-RP2040-Plus-pinout.xlsx", "pinout"),
      ],
    }),
  }),
  board({
    id: "rp2350",
    chip: "rp2350",
    name: "XIAO RP2350",
    pinoutId: "rp2350",
    image: "/xiao-products/dev_boards/rp2350-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-XIAO-RP2350-p-5944.html",
    wiki: "https://wiki.seeedstudio.com/getting-started-xiao-rp2350/",
    intro: { en: "RP2350 board for modern Raspberry Pi Pico-series projects.", zh: "面向新一代 Raspberry Pi Pico 系列项目的 RP2350 开发板。" },
    badges: ["RP2350", "Pico", "MicroPython"],
    groups: resourceGroups({
      hardware: [
        res("Raspberry Pi RP2350 Datasheet", "PDF", "https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf", "datasheet"),
        res("XIAO RP2350 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/Seeed-Studio-XIAO-RP2350-v1.0.pdf", "schematic"),
        res("XIAO RP2350 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO_RP2350_v1.0_SCH&PCB_240626.zip", "kicad"),
        res("XIAO RP2350 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO-RP2350-pinout-sheet.xlsx", "pinout"),
      ],
      mechanical: [
        res("XIAO RP2350 Dimension", "DXF", "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/XIAO-RP2350-dimension-v1.0.dxf", "dimension"),
        res("XIAO RP2350 3D Model", "Link", "https://grabcad.com/library/seeed-studio-xiao-rp2350-2", "model3d"),
      ],
      software: [
        res("XIAO RP2350 Low Power Test Firmware", "UF2", "https://files.seeedstudio.com/wiki/XIAO-RP2350/res/powman_timer-56.uf2", "firmware"),
      ],
      others: [
        res("Getting Started with Raspberry Pi Pico-series", "PDF", "https://datasheets.raspberrypi.com/pico/getting-started-with-pico.pdf", "guide"),
        res("Raspberry Pi Pico-series Python SDK", "PDF", "https://datasheets.raspberrypi.com/pico/raspberry-pi-pico-python-sdk.pdf", "guide"),
        res("Raspberry Pi Pico-series C/C++ SDK", "PDF", "https://datasheets.raspberrypi.com/pico/raspberry-pi-pico-c-sdk.pdf", "guide"),
        res("arduino-pico GitHub", "Link", "https://github.com/earlephilhower/arduino-pico", "link"),
        res("Arduino-Pico Core Documentation", "Link", "https://arduino-pico.readthedocs.io/en/latest/install.html", "link"),
      ],
    }),
  }),
  board({
    id: "mg24",
    chip: "mg24",
    name: "XIAO MG24",
    pinoutId: "mg24",
    image: "/xiao-products/dev_boards/mg24-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-p-6247.html",
    wiki: "https://wiki.seeedstudio.com/xiao_mg24_getting_started/",
    intro: { en: "Silicon Labs MG24 wireless board for low-power connected devices.", zh: "面向低功耗无线设备的 Silicon Labs MG24 开发板。" },
    badges: ["MG24", "Matter", "Thread"],
    groups: resourceGroups({
      hardware: [
        MG_DATASHEET,
        MG_MANUAL,
        res("XIAO MG24 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MGM240S_KICAD_Prj.pdf", "schematic"),
        res("XIAO MG24 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MG24_v1.0_KiCad_260114.zip", "kicad"),
      ],
    }),
  }),
  board({
    id: "mg24sense",
    chip: "mg24",
    name: "XIAO MG24 Sense",
    pinoutId: "mg24sense",
    image: "/xiao-products/dev_boards/MG24-Sense-1536x1256.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-MG24-Sense-p-6248.html",
    wiki: "https://wiki.seeedstudio.com/xiao_mg24_getting_started/",
    intro: { en: "MG24 Sense board with expanded sensing capability.", zh: "具备扩展感知能力的 MG24 Sense 开发板。" },
    badges: ["MG24", "Sense", "Matter"],
    groups: resourceGroups({
      hardware: [
        MG_DATASHEET,
        MG_MANUAL,
        res("XIAO MG24 Sense Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MGM240S_KICAD_Prj.pdf", "schematic"),
        res("XIAO MG24 Sense KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO_MG24/Getting_Start/XIAO_MG24_v1.0_KiCad_260114.zip", "kicad"),
      ],
    }),
  }),
  board({
    id: "samd21",
    chip: "samd21",
    name: "XIAO SAMD21",
    pinoutId: "samd21",
    image: "/xiao-products/dev_boards/samd21-front.webp",
    shop: "https://www.seeedstudio.com/Seeeduino-XIAO-Arduino-Microcontroller-SAMD21-Cortex-M0+-p-4426.html",
    wiki: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    intro: { en: "The original XIAO board, based on the SAMD21 microcontroller.", zh: "基于 SAMD21 微控制器的初代 XIAO 开发板。" },
    badges: ["SAMD21", "Arduino", "Classic XIAO"],
    groups: resourceGroups({
      hardware: [
        SAMD_DATASHEET,
        res("XIAO SAMD21 Schematic", "PDF", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0-SCH-191112.pdf", "schematic"),
        res("XIAO SAMD21 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO_SAMD21_v2.1_SCH&PCB_20260304.zip", "kicad"),
        res("XIAO SAMD21 Eagle Project", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0.zip", "other"),
        res("XIAO SAMD21 Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO-SAMD21-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        SAMD_DIMENSION,
        res("XIAO SAMD21 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/seeeduino-xiao-samd21-3d-model.zip", "model3d"),
      ],
      software: [
        res("XIAO SAMD21 Factory Firmware", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/102010328_Seeeduino_XIAO_final_firmware.zip", "firmware"),
      ],
    }),
  }),
  board({
    id: "samd21plus",
    chip: "samd21",
    name: "XIAO SAMD21 Plus",
    pinoutId: "samd21plus",
    image: "/xiao-products/dev_boards/samd21plus-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-Studio-XIAO-SAMD21-Plus-p-6933.html",
    wiki: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    intro: { en: "SAMD21 Plus board with expanded design resources.", zh: "提供扩展设计资源的 SAMD21 Plus 开发板。" },
    badges: ["SAMD21", "Arduino", "Plus"],
    groups: resourceGroups({
      hardware: [
        SAMD_DATASHEET,
        res("XIAO SAMD21 Plus Schematic", "PDF", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/202004620_XIAO-SAMD21Plus_260422.pdf", "schematic"),
        res("XIAO SAMD21 Plus KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/202004620_XIAO-SAMD21-Plus_V1.0_SCH&PCB_20260422.zip", "kicad"),
        res("XIAO SAMD21 Plus Eagle Project", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0.zip", "other"),
        res("XIAO SAMD21 Plus Pinout Sheet", "XLSX", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/XIAO-SAMD21-PLUS-pinout_sheet.xlsx", "pinout"),
      ],
      mechanical: [
        SAMD_DIMENSION,
        res("XIAO SAMD21 Plus 3D Model", "ZIP", "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/seeeduino-xiao-samd21-3d-model.zip", "model3d"),
      ],
    }),
  }),
  board({
    id: "ra4m1",
    chip: "ra4m1",
    name: "XIAO RA4M1",
    pinoutId: "ra4",
    image: "/xiao-products/dev_boards/ra4-front.webp",
    shop: "https://www.seeedstudio.com/Seeed-XIAO-RA4M1-p-5943.html",
    wiki: "https://wiki.seeedstudio.com/getting_started_xiao_ra4m1/",
    intro: { en: "Renesas RA4M1 board with CAN, DAC and expanded I/O.", zh: "具备 CAN、DAC 与扩展 I/O 的 Renesas RA4M1 开发板。" },
    badges: ["RA4M1", "CAN", "DAC", "Arduino"],
    groups: resourceGroups({
      hardware: [
        res("Renesas RA4M1 Datasheet", "PDF", "https://www.renesas.com/us/en/document/dst/ra4m1-group-datasheet", "datasheet"),
        res("XIAO RA4M1 Schematic", "PDF", "https://files.seeedstudio.com/wiki/XIAO-R4AM1/res/XIAO%20RA4M1%20V1.01_SCH_PDF_260114%20.pdf.pdf", "schematic"),
        res("XIAO RA4M1 KiCad Project", "ZIP", "https://files.seeedstudio.com/wiki/XIAO-R4AM1/res/202003977_XIAO%20RA4M1%20v1.01_SCH&PCB_260114.zip", "kicad"),
      ],
    }),
  }),
];

export const DESIGN_KIT = {
  eyebrow: { en: "XIAO Design Kit", zh: "XIAO 设计套件" },
  title: { en: "Design your own board around XIAO", zh: "围绕 XIAO 设计你自己的板子" },
  intro: {
    en: "Footprints and schematic symbols for the whole XIAO family, ready to drop into KiCad. One set of files fits every board.",
    zh: "整个 XIAO 系列的封装与原理图符号，直接放进 KiCad 就能用。一套文件，所有板子通用。",
  },
  files: [
    {
      id: "footprints",
      name: { en: "KiCad Footprints", zh: "KiCad 封装库" },
      detail: { en: "Land patterns for every XIAO board", zh: "全部 XIAO 板的焊盘图形" },
      format: ".kicad_mod · ZIP",
      url: SHARED_RESOURCES[0].url,
    },
    {
      id: "symbols",
      name: { en: "KiCad Schematic Symbols", zh: "KiCad 原理图符号" },
      detail: { en: "Pin-accurate symbols for your schematic", zh: "引脚对应准确的原理图符号" },
      format: ".kicad_sym · ZIP",
      url: SHARED_RESOURCES[1].url,
    },
  ],
};

export const EXTRAS = {
  eyebrow: { en: "Learn & Build", zh: "学习与实践" },
  title: { en: "Go further with XIAO", zh: "带着 XIAO 走得更远" },
  intro: {
    en: "Books, courses and community projects that pair with the whole XIAO family. Each card names the boards it covers.",
    zh: "面向整个 XIAO 系列的书籍、课程与社区项目，每张卡片都标注了适用的开发板。",
  },
};

export const COURSE_GROUPS = [
  {
    label: { en: "Getting Started", zh: "入门" },
    items: [
      {
        title: "XIAO: Big Power, Small Board",
        intro: {
          en: "Marcelo Rovai's free ebook walks the whole XIAO family from first blink to TinyML, with Arduino projects you can build in an evening.",
          zh: "Marcelo Rovai 的免费电子书，从第一次点灯讲到 TinyML，覆盖整个 XIAO 系列，附带一晚上就能做完的 Arduino 项目。",
        },
        cover: "https://mjrovai.github.io/XIAO_Big_Power_Small_Board-ebook/cover.jpg",
        url: "https://mjrovai.github.io/XIAO_Big_Power_Small_Board-ebook/",
        action: { en: "Read the ebook", zh: "阅读电子书" },
        featured: true,
        type: "course",
        boards: ["all"],
      },
      {
        title: "No-Code Programming to Get Started with TinyML",
        intro: { en: "Learn TinyML with block-based, no-code programming — no prior coding needed.", zh: "无需写代码，用图形化积木编程入门 TinyML 机器学习。" },
        cover: "https://raw.githubusercontent.com/TinkerGen/No-code-Programming-to-Get-Started-with-TinyML/main/images/No-code-Programming-to-Get-Started-with-TinyML-title-1280x640.png",
        url: "https://tinkergen.github.io/No-code-Programming-to-Get-Started-with-TinyML/",
        type: "course",
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
        type: "course",
        boards: ["s3", "s3sense", "s3plus", "s3cam"],
      },
      {
        title: "IoT for Beginners",
        intro: { en: "Microsoft's 12-week curriculum covering IoT hardware, cloud and hands-on projects.", zh: "微软 12 周 IoT 入门课：硬件、云端与项目实战。" },
        cover: "https://repository-images.githubusercontent.com/344192338/b2a83580-df09-11eb-9176-5da7cf890576",
        url: "https://microsoft.github.io/IoT-For-Beginners/",
        type: "course",
        boards: ["esp32c3", "esp32c6", "s3", "s3sense", "s3plus", "s3cam"],
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
        coverFromPdf: true,
        url: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-in-Action-Minitype&Wearable-Projects-Step-by-Step.pdf",
        type: "project",
        boards: ["samd21"],
      },
      {
        title: "Fab-Xiao",
        intro: { en: "A Fab Academy student project — open-source hardware built around XIAO.", zh: "Fab Academy 学生作品：围绕 XIAO 的开源硬件项目。" },
        cover: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/images/fabxiao/fabxiao_board.jpg",
        url: "https://fabacademy.org/2020/labs/leon/students/adrian-torres/fabxiao.html",
        type: "project",
        boards: ["all"],
      },
      {
        title: "maker100-eco",
        intro: { en: "Robotics, IoT & TinyML with the $14 XIAO ESP32 — 100 maker experiments.", zh: "用 $14 的 XIAO ESP32 玩机器人 / IoT / TinyML，100 个创客实验。" },
        cover: "https://opengraph.githubassets.com/f3ca4a588f9aa4f35f0687941b94fb6763592891ba561e9b5f046a411cd66bfb/hpssjellis/maker100-eco",
        url: "https://github.com/hpssjellis/maker100-eco",
        type: "project",
        boards: ["esp32c3", "esp32c6", "s3", "s3sense", "s3plus", "s3cam"],
      },
      {
        title: "Seeed Studio on YouTube",
        intro: { en: "Official channel with XIAO unboxings, tutorials and project builds.", zh: "官方频道：XIAO 开箱、教学与项目实战视频。" },
        cover: null,
        video: true,
        url: "https://www.youtube.com/@SeeedStudio",
        type: "video",
        boards: ["all"],
      },
    ],
  },
];

/**
 * Cover image for a learning item: its own image, or a baked PDF first page.
 * 学习条目的封面：自带图片，或预生成的 PDF 首页。
 */
export function courseCover(item, available = BAKED_THUMBS) {
  if (item.cover) return item.cover;
  if (item.coverFromPdf) return bakedThumb({ url: item.url, preview: "pdf", thumb: null }, available);
  return null;
}

/**
 * Short stable hash of a string, used to keep thumbnail names unique per URL.
 * 字符串的短哈希，让同一地址的缩略图只生成一份。
 */
function shortHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36).padStart(7, "0").slice(0, 7);
}

/**
 * Thumbnail path a bake job would write for this file, keyed by URL.
 * 这份文件预生成缩略图的落盘路径，按地址决定。
 */
export function bakedThumbPath(item) {
  const drawn = ["dxf", "dxf-zip", "kicad", "xlsx"].includes(item.preview);
  if (!drawn && item.preview !== "pdf") return null;
  const base = decodeURIComponent(item.url.split("/").pop() || "file")
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `/res-thumb/${base}-${shortHash(item.url)}.${drawn ? "svg" : "webp"}`;
}

/**
 * Static thumbnail to show on a card, or null when only an illustration fits.
 * 卡片上该显示的静态缩略图；没有合适的图就返回 null。
 */
export function bakedThumb(item, available = BAKED_THUMBS) {
  if (item.thumb) return item.thumb;
  const path = bakedThumbPath(item);
  return path && available.includes(path) ? path : null;
}

/**
 * Files the thumbnail bake script should download and render, one per URL.
 * 缩略图生成脚本需要下载并渲染的文件清单，每个地址一份。
 */
export function bakeJobs() {
  const seen = new Set();
  const jobs = [];
  for (const board of RESOURCE_PRODUCTS) {
    for (const group of board.groups) {
      for (const item of group.items) {
        const file = bakedThumbPath(item);
        if (!file || seen.has(item.url)) continue;
        seen.add(item.url);
        jobs.push({ boardId: board.id, name: item.name, url: item.url, preview: item.preview, file });
      }
    }
  }
  for (const item of COURSE_GROUPS.flatMap((group) => group.items)) {
    if (!item.coverFromPdf || seen.has(item.url)) continue;
    seen.add(item.url);
    const probe = { url: item.url, preview: "pdf" };
    jobs.push({ boardId: "learn", name: item.title, url: item.url, preview: "pdf", file: bakedThumbPath(probe) });
  }
  return jobs;
}

export function familyOf(board) {
  return CHIP_FAMILIES.find((family) => family.chips.includes(board.chip)) || CHIP_FAMILIES[0];
}

export function boardsInFamily(familyId) {
  const family = CHIP_FAMILIES.find((item) => item.id === familyId) || CHIP_FAMILIES[0];
  return RESOURCE_PRODUCTS.filter((board) => family.chips.includes(board.chip));
}

export function fileCount(board) {
  return board.groups.reduce((sum, group) => sum + group.items.length, 0);
}

export function boardItems(board) {
  return board.groups.flatMap((group) => group.items.map((item) => ({ item, group })));
}

export function isExternalOpen(item) {
  return item.format === "Link" || item.format === "Guide" || item.format === "Wiki";
}

export function pickText(field, lang) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.en || "";
}

export function shortBoardName(name) {
  return name.replace(/^Seeeduino /, "").replace(/^XIAO /, "");
}

/**
 * Score a query against a haystack. Every word must hit.
 * 给搜索词打分：每个词都要命中，子串优先，否则按顺序容错。
 */
export function fuzzyScore(query, haystack) {
  const h = haystack.toLowerCase();
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  let total = 0;
  for (const term of terms) {
    const subIdx = h.indexOf(term);
    if (subIdx >= 0) {
      total += 100 + (subIdx === 0 ? 40 : 0);
    } else {
      let ti = 0;
      let hi = 0;
      let compact = 0;
      let gap = 0;
      while (ti < term.length && hi < h.length) {
        if (term[ti] === h[hi]) {
          ti += 1;
          compact += 1;
        } else {
          gap += 1;
        }
        hi += 1;
      }
      if (ti === term.length) total += 28 * (compact / (compact + gap || 1));
      else return 0;
    }
  }
  return total;
}
