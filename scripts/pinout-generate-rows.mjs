/**
 * Build diagram row-id mappings for every ingested board face.
 * 为每个已 ingest 的板面生成 diagram 行 id 映射。
 *
 * Usage / 用法:
 *   node scripts/pinout-generate-rows.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inferDiagramRows, regroupDiagramLayout } from "../src/app/playground/pinout/data/diagram/inferRows.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(ROOT, "src/app/playground/pinout/data/diagrams/manifest.json"), "utf8"));
const { BOARDS } = await import(pathToFileURL(path.join(ROOT, "src/app/playground/pinout/data/catalog.js")).href);
const { BOARD_DIAGRAM_META } = await import(pathToFileURL(path.join(ROOT, "src/app/playground/pinout/data/diagram/catalogMeta.js")).href);

const MANUAL = {
  samd21: {
    front: {
      left: ["USER_LED", "POWER_LED", "RST", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["TX_LED", "RX_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "GND_SWD", "GND_VIN"],
      right: ["SWDIO", "RST", "VIN"],
    },
  },
  samd21plus: {
    front: {
      left: ["CHARGE_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "RST", "RGB_LED"],
      right: ["5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D12", "D13", "D14", "D25", "D26", "D27", "BAT-"],
      right: ["SWDIO", "RST", "D18", "D17", "D16", "D15", "D19", "D20", "D21", "D22", "D23", "D24", "BAT+"],
    },
  },
  c3: {
    front: {
      left: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "UFL_ANT"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RST"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK"],
      right: ["MTDI", "RST", "MTMS", "BAT-", "BAT+"],
    },
  },
  c5: {
    front: {
      left: ["CHARGE_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST", "UFL_ANT"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "3V3", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "Boot", "BAT+"],
    },
  },
  c6: {
    front: {
      left: ["RST", "CHARGE_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RF_SW_PORT"],
      right: ["Boot", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW_PWR"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "3V3", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "Boot", "BAT+"],
    },
  },
  s3: {
    front: {
      left: ["RST", "CHARGE_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "UFL_ANT"],
      right: ["Boot", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "BAT-", "BAT+"],
    },
  },
  s3plus: {
    front: {
      left: ["RST", "CHARGE_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "UFL_ANT"],
      right: ["Boot", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+", "D17", "D18", "D19", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  s3sense: {
    // The official s3sense front diagram is the Sense expansion board
    // (camera / mic / SD card) — its rows carry expansion-board labels, not
    // the main header. The s3sense front now reuses the s3 main-board front
    // diagram, so its rows follow the verified s3 mapping.
    // s3sense 官方正面图是 Sense 扩展板（摄像头/麦克风/SD），行标签并非主板引脚；
    // 现在正面复用 s3 主板图，行映射与 s3 保持一致。
    front: {
      left: ["RST", "CHARGE_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "UFL_ANT"],
      right: ["Boot", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "BAT-", "BAT+"],
    },
    // The expansion board's own pinout (s3sense-module.svg): the board-to-board
    // connector table. Each band holds one left-column and one right-column
    // pin; regroup splits them into left / right rows, which map to the Sense
    // signals they label. The top banner rows (JTAG_MTMS/GPIO42/D11 —
    // D12/GPIO41/JTAG_MTDI) map to the main-board JTAG pins MTMS / MTDI, and
    // the connector's VIN rows map to the VIN pin, so every card title matches
    // the label the user clicked. PDM_CLK / PDM_DATA / SHIELD appear twice
    // (banner JTAG pins and the PDM labels below describe the same GPIOs).
    // 扩展板自身引脚图（s3sense-module.svg）的板对板连接器表：每个水平带含左右
    // 两列引脚，regroup 拆成左右行后按其所指的 Sense 信号命名，保证卡片标题与
    // 点击的图上文字一致。顶部横幅两行是主板 JTAG 引脚 MTMS/MTDI；连接器两端
    // 的 VIN 行对应 VIN 引脚；PDM_CLK / PDM_DATA / SHIELD 重复出现。
    module: {
      left: ["MTMS", "SHIELD", "USER_LED", "GND", "3V3", "3V3", "NC", "DVP_Y9", "DVP_HREF", "DVP_VSYNC", "CAM_SCL", "CAM_SDA", "PDM_DATA", "PDM_CLK", "GND", "GND", "VIN", "SHIELD"],
      right: ["MTDI", "SHIELD", "VIN", "DVP_Y4", "DVP_Y3", "DVP_Y5", "DVP_Y2", "DVP_Y6", "DVP_PCLK", "DVP_Y7", "DVP_Y8", "XMCLK", "SD_MOSI", "SD_MISO", "SD_SCK", "SD_CS", "NC", "SHIELD"],
    },
  },
  nrf52: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"]],
      right: ["CHARGE_LED", "USER_LED_B", "USER_LED_G", "USER_LED_R", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "GND"],
      right: ["SWDIO", "RST", "BAT-", "BAT+", "NFC1", "NFC2"],
    },
  },
  nrf52840sense: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"], "IMU_SDA", "IMU_SCL", "IMU"],
      right: ["CHARGE_LED", "USER_LED_B", "USER_LED_G", "USER_LED_R", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "MIC_PWR", "MIC_CLK", "MIC_DATA"],
    },
    back: {
      left: ["SWCLK", "GND"],
      right: ["SWDIO", "RST", "BAT-", "BAT+", "NFC1", "NFC2"],
    },
  },
  nrf52840plus: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"]],
      right: ["CHARGE_LED", "USER_LED_B", "USER_LED_G", "USER_LED_R", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "GND", "D19", "D18", "D17", "BAT-"],
      right: ["SWDIO", "RST", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  nrf52840senseplus: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"], "IMU_SDA", "IMU_SCL", "IMU"],
      right: ["CHARGE_LED", "USER_LED_B", "USER_LED_G", "USER_LED_R", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "MIC_PWR", "MIC_CLK", "MIC_DATA"],
    },
    back: {
      left: ["SWCLK", "GND", "D19", "D18", "D17", "BAT-"],
      right: ["SWDIO", "RST", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  nrf54l15: {
    front: {
      left: ["CHARGE_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST", "RF_SW_PORT"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "USER_KEY", "RF_SW_PWR"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "SAMD11_SWCLK", "GND", "GND", "D11", "D12", "BAT-"],
      right: ["SWDIO", "nRST", "SAMD11_RST", "SAMD11_SWDIO", "GND", "D15", "D14", "D13", "NFC2", "NFC1", "BAT+"],
    },
  },
  nrf54l15sense: {
    front: {
      left: ["CHARGE_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST", "RF_SW_PORT", "D12", "D11", "IMU_INT1", "IMU"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "USER_KEY", "RF_SW_PWR", "MIC_CLK", "MIC_DAT"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "SAMD11_SWCLK", "GND", "GND", "D11", "D12", "BAT-"],
      right: ["SWDIO", "nRST", "SAMD11_RST", "SAMD11_SWDIO", "GND", "D15", "D14", "D13", "NFC2", "NFC1", "BAT+"],
    },
  },
  nrf54lm20a: {
    front: {
      left: ["RESET", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX"],
      right: ["USER_BUTTON", "RGB_B", "RGB_G", "RGB_R", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX"],
    },
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD", "BAT-"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P0.00", "P3.06", "P0.01", "P3.05", "P0.02", "P3.04", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT+"],
    },
  },
  nrf54lm20asense: {
    front: {
      left: ["RESET", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX", "MIC_DAT", "MIC_CLK"],
      right: ["USER_BUTTON", "RGB_B", "RGB_G", "RGB_R", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1"],
    },
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD", "BAT-"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P3.07", "P0.00", "P3.06", "P0.01", "P3.05", "P0.02", "P3.04", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2", "BAT+"],
    },
  },
  rp2040: {
    front: {
      left: ["POWER_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST", "RGB_LED"],
      right: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
    back: {
      left: ["SWCLK", "GND", "5V"],
      right: ["SWDIO", "RST", "GND"],
    },
  },
  rp2040plus: {
    front: {
      left: ["CHARGE_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "RST", "RGB_LED", "RGB_EN"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
    back: {
      left: ["SWCLK", "GND", "USB_D+", "3V3", "D12", "D13", "D14", "D25", "D26", "D27", "BAT-"],
      right: ["SWDIO", "RST", "USB_D-", "Boot", "D17", "D16", "D15", "D19", "D20", "D21", "D22", "D23", "D24", "BAT+"],
    },
  },
  rp2350: {
    front: {
      left: ["CHARGE_LED", "USER_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST"],
      right: ["RGB_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  mg24: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"], "RF_SW"],
      right: ["CHARGE_LED", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW_PWR"],
    },
    back: {
      left: ["M_CLK", "GND", "3V3", "S_CLK", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["M_DIO", "M_RST", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  mg24sense: {
    front: {
      left: ["RST", ...["D0","D1","D2","D3","D4","D5","D6"], "D14", "D13", "IMU", "RF_SW"],
      right: ["CHARGE_LED", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "MIC_EN", "MIC_ADC", "RF_SW_PWR"],
    },
    back: {
      left: ["M_CLK", "GND", "3V3", "S_CLK", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["M_DIO", "M_RST", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  ra4: {
    front: {
      left: ["POWER_LED", ...["D0","D1","D2","D3","D4","D5","D6"], "RST", "RGB_LED_EN"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot", "RGB_LED"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  stm32c5: {
    front: {
      left: ["RST", "CHARGE_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["Boot", "USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "IMU", "IMU_SDA", "IMU_SCL", "IMU_INT", "IMU_PWM"],
    },
    back: {
      left: ["SWCLK", "GND", "USB_D+", "3V3", "D11", "D12", "D13", "D14", "BAT-", "CAN_H"],
      right: ["SWDIO", "RST", "USB_D-", "Boot", "D15", "BAT+", "CAN_L"],
    },
  },
};

const out = {};
const groupedLayouts = {};
const failures = [];

for (const boardId of manifest.boards) {
  const board = BOARDS[boardId];
  if (!board) {
    failures.push({ boardId, error: "missing board data" });
    continue;
  }
  out[boardId] = {};
  const meta = BOARD_DIAGRAM_META[boardId] || {};

  for (const face of ["front", "back", "module"]) {
    const key = `${boardId}-${face}`;
    if (!manifest.assets[key]) continue;
    const layoutMod = await import(pathToFileURL(path.join(ROOT, `src/app/playground/pinout/data/diagrams/${boardId}-${face}.js`)).href);
    const grouped = regroupDiagramLayout(layoutMod.default);
    groupedLayouts[key] = grouped;
    const svg = readFileSync(path.join(ROOT, `public/xiao-products/pinout/${boardId}-${face}.svg`), "utf8");
    const rectCount = (svg.match(/<rect\b/g) || []).length;

    try {
      const mapped = MANUAL[boardId]?.[face] || inferDiagramRows(board, face, grouped, {
        markerIds: meta.markerIds || [],
        backLeft: meta.back?.left || [],
        backRight: meta.back?.right || [],
        rectCount,
      });
      if (mapped.left.length !== grouped.rows.left.length || mapped.right.length !== grouped.rows.right.length) {
        throw new Error(`${face} map L${mapped.left.length}/R${mapped.right.length} vs rows L${grouped.rows.left.length}/R${grouped.rows.right.length}`);
      }
      out[boardId][face] = mapped;
    } catch (error) {
      failures.push({
        boardId,
        face,
        rows: grouped.rows.left.length + grouped.rows.right.length,
        rectCount,
        error: error.message,
      });
    }
  }
}

const target = path.join(ROOT, "src/app/playground/pinout/data/diagram/rows.js");
writeFileSync(target, `/** Generated by pinout-generate-rows.mjs */
export const DIAGRAM_ROWS = ${JSON.stringify(out, null, 2)};
`);
writeFileSync(path.join(ROOT, "src/app/playground/pinout/data/diagram/rows.failures.json"), `${JSON.stringify(failures, null, 2)}\n`);

const layoutKeys = Object.keys(manifest.assets).sort();
const bundle = [
  "/** Generated by pinout-generate-rows.mjs — diagram layouts + row ids */",
  ...layoutKeys.map((key) => `import ${key.replace(/-/g, "_")} from "../diagrams/${key}.js";`),
  "",
  "export const BOARD_DIAGRAMS = {",
];
for (const boardId of manifest.boards) {
  if (!out[boardId] || (!out[boardId].front && !out[boardId].back)) continue;
  bundle.push(`  ${JSON.stringify(boardId)}: {`);
  for (const face of ["front", "back", "module"]) {
    if (!out[boardId][face]) continue;
    const key = `${boardId}-${face}`;
    const layoutVar = key.replace(/-/g, "_");
    bundle.push(`    ${face}: { src: ${JSON.stringify(manifest.assets[key])}, layout: ${layoutVar}, rows: ${JSON.stringify(out[boardId][face])} },`);
  }
  bundle.push("  },");
}
bundle.push("};");
writeFileSync(path.join(ROOT, "src/app/playground/pinout/data/diagram/boardDiagrams.js"), `${bundle.join("\n")}\n`);

console.log(`Wrote ${target}`);
console.log(`Failures: ${failures.length}`);
for (const item of failures) console.log(`  ${item.boardId}${item.face ? `-${item.face}` : ""}: ${item.error}`);
