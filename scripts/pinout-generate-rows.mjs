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
      left: ["RGB_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "USER_BUTTON", "VBAT_EN"],
      right: ["5V", "GND", "3V3", "D10", "D9", "D8", "D7", "CHARGE_LED"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D18", "D12", "D13", "D14", "D19", "D20", "BAT-"],
      right: ["SWDIO", "RST", "D17", "D16", "D15", "D24", "D25", "D26", "D27", "D21", "D22", "D23", "BAT+", "AIN11_VBAT", "5V"],
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
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "CHARGE_LED"],
      right: ["ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "ADC_CRL"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "3V3", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "Boot", "BAT+"],
    },
  },
  c6: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "RF_SW_PORT"],
      right: ["RF_SW_PWR", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot", "USER_LED"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "3V3", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "Boot", "BAT+"],
    },
  },
  s3: {
    front: {
      left: ["USER_LED", "Boot", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "UFL_ANT"],
      right: ["CHARGE_LED", "D11", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "BAT-", "BAT+"],
    },
  },
  s3plus: {
    front: {
      left: ["USER_LED", "Boot", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "CHARGE_LED"],
      right: ["ADC_BAT", "UFL_ANT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+", "D17", "D18", "D19", "BAT-"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  s3sense: {
    front: {
      left: ["USER_LED", "Boot", "UFL_ANT", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "CHARGE_LED"],
      right: ["USER_LED", "Boot", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "D1", "D0", "UFL_ANT", "CHARGE_LED"],
    },
    back: {
      left: ["MTDO", "GND", "MTCK", "USB_D+"],
      right: ["MTDI", "RST", "MTMS", "USB_D-", "BAT-", "BAT+"],
    },
  },
  nrf52: {
    front: {
      left: ["USER_LED_R", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["USER_LED_G", "USER_LED_B", "CHARGE_LED", "ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "GND"],
      right: ["SWDIO", "RST", "BAT-", "BAT+", "NFC1", "NFC2"],
    },
  },
  nrf52840sense: {
    front: {
      left: ["USER_LED_R", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "IMU_INT1", "MIC_DATA", "MIC_CLK"],
      right: ["USER_LED_G", "USER_LED_B", "CHARGE_LED", "ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW_PORT", "RF_SW_PWR", "NFC1"],
    },
    back: {
      left: ["SWCLK", "GND"],
      right: ["SWDIO", "RST", "BAT-", "BAT+", "NFC1", "NFC2"],
    },
  },
  nrf52840plus: {
    front: {
      left: ["USER_LED_R", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["USER_LED_G", "USER_LED_B", "CHARGE_LED", "ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "GND", "D19", "D18", "D17", "BAT-"],
      right: ["SWDIO", "RST", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  nrf52840senseplus: {
    front: {
      left: ["USER_LED_R", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "IMU_INT1", "MIC_DATA", "MIC_CLK"],
      right: ["USER_LED_G", "USER_LED_B", "CHARGE_LED", "ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "IMU_PWR", "RF_SW_PORT", "RF_SW_PWR"],
    },
    back: {
      left: ["SWCLK", "GND", "D19", "D18", "D17", "BAT-"],
      right: ["SWDIO", "RST", "D11", "D12", "D13", "D14", "D15", "D16", "BAT+"],
    },
  },
  nrf54l15: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "USER_KEY", "NFC1"],
      right: ["NFC2", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "AIN7_VBAT", "RF_SW_PORT"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "SAMD11_SWCLK", "GND", "GND", "D11", "D12", "BAT-"],
      right: ["SWDIO", "nRST", "SAMD11_RST", "SAMD11_SWDIO", "GND", "D15", "D14", "D13", "NFC2", "NFC1", "BAT+"],
    },
  },
  nrf54l15sense: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "USER_KEY", "NFC1", "NFC2", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR", "CHARGE_LED"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "SAMD11_SWCLK", "GND", "GND", "D11", "D12", "BAT-"],
      right: ["SWDIO", "nRST", "SAMD11_RST", "SAMD11_SWDIO", "GND", "D15", "D14", "D13", "NFC2", "NFC1", "BAT+"],
    },
  },
  nrf54lm20a: {
    front: {
      left: ["USER_BUTTON", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX"],
      right: ["RGB_R", "RGB_G", "RGB_B", "CHARGE_LED", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX"],
    },
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2"],
    },
  },
  nrf54lm20asense: {
    front: {
      left: ["USER_BUTTON", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX", "MIC_DAT", "MIC_CLK"],
      right: ["RGB_R", "RGB_G", "RGB_B", "IMU_SDA", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX", "IMU_SCL", "IMU_CS", "IMU_INT1", "CHARGE_LED"],
    },
    back: {
      left: ["SWCLK", "GND", "SWCLK2", "3V3", "P3.00", "P3.01", "P3.02", "P3.03", "P3.11", "P3.10", "P3.09", "SHPHLD"],
      right: ["SWDIO", "RESET", "SWDIO2", "RST2", "P0.00", "P0.01", "P0.02", "P0.03", "P0.04", "P0.05", "NFC1", "NFC2"],
    },
  },
  rp2040: {
    front: {
      left: ["USER_LED_R", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "USER_LED_G"],
      right: ["USER_LED_B", "Boot", "USER_LED_R", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "USER_LED_G"],
    },
    back: {
      left: ["SWCLK", "GND", "5V"],
      right: ["SWDIO", "RST", "GND"],
    },
  },
  rp2040plus: {
    front: {
      left: ["Boot", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "BAT_EN", "RGB_LED", "RGB_EN"],
      right: ["USER_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "CHARGE_LED"],
    },
    back: {
      left: ["SWCLK", "GND", "USB_D+", "5V", "D12", "D13", "D14", "D19", "D20", "D21", "BAT-"],
      right: ["SWDIO", "RST", "USB_D-", "Boot", "D17", "D16", "D15", "D22", "D23", "D24", "D25", "D26", "D27", "BAT+", "CHARGE_LED"],
    },
  },
  rp2350: {
    front: {
      left: ["Boot", "RGB_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "USER_LED"],
      right: ["ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "ADC_BAT_EN"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  mg24: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "CHARGE_LED"],
      right: ["ADC_BAT", "RF_SW", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW_PWR"],
    },
    back: {
      left: ["M_CLK", "GND", "3V3", "S_CLK", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["M_DIO", "M_RST", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  mg24sense: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "CHARGE_LED", "ADC_BAT", "RF_SW", "RF_SW_PWR"],
      right: ["USER_LED", "ADC_BAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW", "RF_SW_PWR", "CHARGE_LED"],
    },
    back: {
      left: ["M_CLK", "GND", "3V3", "S_CLK", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["M_DIO", "M_RST", "S_RST", "S_DIO", "D18", "D17", "D16", "D15", "BAT+"],
    },
  },
  ra4: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "RGB_LED", "Boot"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RGB_LED_EN", "ADC_BAT"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D11", "D12", "D13", "D14", "BAT-"],
      right: ["SWDIO", "RST", "Boot", "D18", "D17", "D16", "D15"],
    },
  },
  stm32c5: {
    front: {
      left: ["USER_LED", "Boot", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["CHARGE_LED", "Boot", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "5V", "D0", "D1", "D2", "D3", "BAT-"],
      right: ["SWDIO", "RST", "Boot", "BAT+", "D7", "D8", "D9", "D10", "D4", "D5"],
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

  for (const face of ["front", "back"]) {
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
  for (const face of ["front", "back"]) {
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
