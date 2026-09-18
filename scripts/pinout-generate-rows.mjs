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
import { inferDiagramRows } from "../src/app/playground/pinout/data/diagram/inferRows.js";

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
  },
  c3: {
    front: {
      left: ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "UFL_ANT"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot"],
    },
  },
  c6: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot", "RF_SW_PORT"],
      right: ["RF_SW_PWR", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "Boot", "USER_LED"],
    },
  },
  rp2040: {
    front: {
      left: ["USER_LED_R", "USER_LED_G", "USER_LED_B", "D0", "D1", "D2", "D3", "D4", "D5", "D6"],
      right: ["Boot", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "USER_LED_R", "USER_LED_G", "USER_LED_B"],
    },
  },
  ra4: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "RGB_LED", "Boot"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RGB_LED_EN", "ADC_BAT"],
    },
  },
  samd21plus: {
    front: {
      left: ["RGB_LED", "USER_BUTTON", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "VBAT_EN"],
      right: ["AIN11_VBAT", "5V", "GND", "3V3", "D10", "D9", "D8", "D7"],
    },
    back: {
      left: ["SWCLK", "D18", "D12", "D13", "D14", "D19", "D20", "D21", "D22", "D23"],
      right: ["SWDIO", "RST", "D17", "D16", "D15", "D24", "D25", "D26", "D27", "BAT-", "BAT+", "GND", "VIN", "3V3", "5V"],
    },
  },
  s3sense: {
    front: {
      left: ["USER_LED", "Boot", "D0", "D1", "D2"],
      right: ["UFL_ANT", "CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "D1", "D0", "Boot", "USER_LED"],
    },
  },
  nrf54l15sense: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "USER_KEY", "NFC1", "NFC2", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "AIN7_VBAT", "RF_SW_PORT", "RF_SW_PWR", "CHARGE_LED"],
    },
  },
  nrf54lm20a: {
    front: {
      left: ["USER_BUTTON", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX"],
      right: ["RGB_R", "RGB_G", "RGB_B", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX", "CHARGE_LED"],
    },
  },
  nrf54lm20asense: {
    front: {
      left: ["USER_BUTTON", "A0", "A1", "A2", "A3", "SDA", "SCL", "TX", "MIC_DAT", "MIC_CLK"],
      right: ["RGB_R", "RGB_G", "RGB_B", "IMU_SDA", "IMU_SCL", "IMU_CS", "IMU_INT1", "VBUS", "GND", "3V3", "MOSI", "MISO", "SCK", "RX", "MIC_DAT"],
    },
  },
  mg24sense: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "CHARGE_LED", "ADC_BAT", "RF_SW", "RF_SW_PWR"],
      right: ["USER_LED", "ADC_BAT", "RF_SW", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "RF_SW_PWR", "CHARGE_LED"],
    },
  },
  rp2040plus: {
    back: {
      left: ["SWCLK", "USB_D+", "D12", "D13", "D14", "D19", "D20", "D21", "D22", "D23", "D24"],
      right: ["SWDIO", "RST", "USB_D-", "Boot", "D17", "D16", "D15", "D25", "D26", "D27", "BAT-", "BAT+", "GND", "3V3", "5V"],
    },
  },
  stm32c5: {
    front: {
      left: ["USER_LED", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "Boot"],
      right: ["CHARGE_LED", "5V", "GND", "3V3", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "D1"],
    },
    back: {
      left: ["SWCLK", "GND", "3V3", "D0", "D1", "D2", "D3", "D4", "D5"],
      right: ["SWDIO", "RST", "BAT-", "BAT+", "D6", "D7", "D8", "D9", "D10", "Boot"],
    },
  },
};

const out = {};
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
    const layout = { ...layoutMod.default, rows: layoutMod.default.rows };
    const svg = readFileSync(path.join(ROOT, `public/xiao-products/pinout/${boardId}-${face}.svg`), "utf8");
    const rectCount = (svg.match(/<rect\b/g) || []).length;

    try {
      if (MANUAL[boardId]?.[face]) {
        out[boardId][face] = MANUAL[boardId][face];
        continue;
      }
      out[boardId][face] = inferDiagramRows(board, face, layout, {
        markerIds: meta.markerIds || [],
        backLeft: meta.back?.left || [],
        backRight: meta.back?.right || [],
        rectCount,
        minBackRects: meta.minBackRects ?? 24,
      });
    } catch (error) {
      failures.push({ boardId, face, rows: layout.rows.left.length + layout.rows.right.length, rectCount, error: error.message });
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
