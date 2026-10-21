/** Categories named by a printed label, including each slash-separated function.
 * 标签文字包含的类别，涵盖斜线分隔的每项功能。 */
export function labelCategories(text) {
  const categories = new Set();
  const legend = { POWER: "power", SYSTEM: "system", "DIGITAL GPIO": "digital", "PIN NAME": "pinname", PERIPHERAL: "peripheral", "ARDUINO NAME": "digital", "SEEED USAGE": "seeed", "SIGNAL PIN": "signal", "N/A": "nc" };
  if (legend[text.toUpperCase()]) return [legend[text.toUpperCase()]];
  const normalized = text.toUpperCase().replaceAll("²", "2").replace(/[−–]/g, "-").replace(/\bN\/A\b/g, "NC");
  for (const part of normalized.split("/")) {
    const label = part.trim().replaceAll("-", "_");
    const indicator = /(?:^|[\s_])(LED|BUTTON|KEY)(?:$|[\s_])/.test(label);
    const can = /\bCAN(?:FD)?(?:\d|\b|_)/.test(label);
    const add = (category, matches) => { if (matches) categories.add(category); };
    add("peripheral", indicator || /(?:DVP|CAM|PDM|MIC|IMU|NFC|USB|U[._]?FL|ANTENNA|RF_|RGB|XMCLK|I2S|GRTC|DAC)/.test(label));
    if (indicator) continue;
    add("can", can);
    add("spi", !/I2S/.test(label) && /(?:^|[^A-Z])Q?SPI\d*|(?:^|[\s_])(?:MOSI|MISO|SCK|SCLK|CS|SS)(?:\d|$|[\s_])/.test(label));
    add("i2c", /I2C|(?:^|[\s_])(?:SDA|SCL)(?:\d|$|[\s_])/.test(label));
    add("uart", !can && /UART|USART|U\d+[TR]XD|(?:^|[\s_])(?:TXD?|RXD?)(?:\d|$|[\s_])/.test(label));
    add("analog", /(?:^|[\s_(])(?:A\d+|AIN\d+|AN\d+|ADC\w*)(?:$|[\s_)])/.test(label));
    add("digital", /^\d+$/.test(label) || /(?:^|[\s_(])D\d+(?:$|[\s_)])/.test(label));
    add("gnd", /(?:^|[\s_])GND(?:$|[\s_])|^BAT_\s*$/.test(label));
    add("power", /(?:^|[\s_])(?:3V3|3\.3V|5V|VIN|VBUS|VBAT|VCC|PWR|BAT\+?)(?:$|[\s_])/.test(label) && !/^BAT_$/.test(label));
    add("system", /^(?:EN|CHIP_(?:EN|PU))$/.test(label) || /(?:^|[\s_])(?:N?RST\d*|RESETN?\d*|RUN|RTC|BOOT\w*|SWD\w*|SWCLK\d*|JTAG\w*|MT(?:CK|DO|DI|MS)|SHPHLD)(?:$|[\s_])/.test(label));
    add("ptc", /(?:^|[\s_])PTC(?:$|[\s_])/.test(label));
    add("pinname", /(?:^|[\s_(])(?:GPIO\d+|P\d\.\d+|P[A-Z]\d+|P\d{3}|LNA_IN)(?:$|[\s_)])/.test(label));
    add("nc", /^(?:NC|SHIELD)$/.test(label));
  }
  return [...categories].sort();
}

export function categoryValue(categories) {
  return categories.length === 1 ? categories[0] : categories;
}
