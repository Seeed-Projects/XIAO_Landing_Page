const CORRECTED_SPI_REGISTER_BASE = 0x60003000;
const AFFECTED_CHIPS = new Set(["ESP32-C5", "ESP32-C6"]);

/**
 * Apply Espressif's corrected SPI register base before a flash command runs.
 * 在执行闪存命令前，为 C5/C6 应用 Espressif 已确认的 SPI 寄存器地址。
 */
export function applyXiaoEspFlashCompatibility(chip) {
  if (!AFFECTED_CHIPS.has(chip?.CHIP_NAME)) return false;
  chip.SPI_REG_BASE = CORRECTED_SPI_REGISTER_BASE;
  return true;
}

/**
 * Create an ESPLoader that keeps the upstream API while applying the C5/C6 fix.
 * 创建保持上游接口不变的烧录器，并在内部应用 C5/C6 兼容修正。
 */
export function createCompatibleEspLoader(ESPLoader, options) {
  return new class extends ESPLoader {
    async runSpiflashCommand(...args) {
      applyXiaoEspFlashCompatibility(this.chip);
      return super.runSpiflashCommand(...args);
    }
  }(options);
}
