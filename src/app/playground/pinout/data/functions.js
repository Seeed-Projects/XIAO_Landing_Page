const T = (en, zh) => ({ en, zh });

function primer({ title, intro, wiring, code, pitfalls, links }) {
  return { title, intro, wiring, code, pitfalls, links };
}

const ARDUINO_I2C = `#include <Wire.h>
void setup() {
  Wire.begin();
  Wire.beginTransmission(0x3C);
  Wire.write(0x00);
  Wire.endTransmission();
}`;

const MP_I2C = `from machine import Pin, I2C
i2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=100000)
print(i2c.scan())`;

const ZEPHYR_I2C = `const struct device *i2c = DEVICE_DT_GET(DT_NODELABEL(i2c0));
uint8_t data = 0;
i2c_reg_read_byte(i2c, 0x3C, 0x00, &data);`;

const IDF_I2C = `i2c_config_t cfg = {
  .mode = I2C_MODE_MASTER,
  .sda_io_num = 5, .scl_io_num = 6,
  .master.clk_speed = 100000,
};
i2c_param_config(I2C_NUM_0, &cfg);
i2c_driver_install(I2C_NUM_0, cfg.mode, 0, 0, 0);`;

export const FUNCTION_KEYS = [
  "i2c", "spi", "uart", "adc", "pwm", "dac", "power", "gnd", "rst", "debug", "battery", "wireless", "touch",
];

export const FUNCTIONS = {
  i2c: primer({
    title: T("I²C", "I²C"),
    intro: T(
      "I²C is a two-wire bus: SDA carries data, SCL carries the clock. Many sensors share those two wires, each with its own 7-bit address. On XIAO the default pair is usually D4 (SDA) and D5 (SCL).",
      "I²C 是两根线的总线：SDA 传数据，SCL 传时钟。很多传感器可以共用这两根线，各自有一个 7 位地址。XIAO 默认一般是 D4（SDA）和 D5（SCL）。",
    ),
    wiring: T(
      "Tie every module ground to XIAO GND. Most XIAO boards already have onboard pull-ups on SDA/SCL, so extra 4.7 kΩ resistors are optional. Keep the bus at 3.3 V. Plus boards add a second I²C pair on the back header.",
      "所有模块的地接到 XIAO 的 GND。多数 XIAO 已在 SDA/SCL 上板载上拉，额外 4.7 kΩ 可以不加。总线保持 3.3V。Plus 系列背面还有第二组 I²C。",
    ),
    code: { arduino: ARDUINO_I2C, micropython: MP_I2C, zephyr: ZEPHYR_I2C, espidf: IDF_I2C },
    pitfalls: [
      T("Two devices with the same address will collide. Check the sensor datasheet or change the ADDR jumper.", "两个设备地址相同会冲突。看传感器手册，或改 ADDR 跳线。"),
      T("A missing GND is the usual reason a scan returns nothing.", "扫描不到设备，多半是地没共。"),
    ],
    links: [{ label: "I2C primer", href: "https://learn.sparkfun.com/tutorials/i2c" }],
  }),
  spi: primer({
    title: T("SPI", "SPI"),
    intro: T(
      "SPI is a four-wire bus: SCK (clock), MOSI (master out), MISO (master in), plus one CS (chip select) per device. It is faster than I²C and good for displays, SD cards and radios. XIAO defaults are D8 SCK, D9 MISO, D10 MOSI.",
      "SPI 是四线总线：SCK（时钟）、MOSI（主出）、MISO（主入），每个设备再加一根 CS（片选）。它比 I²C 快，适合屏幕、SD 卡和电台。XIAO 默认是 D8 SCK、D9 MISO、D10 MOSI。",
    ),
    wiring: T(
      "Share SCK/MOSI/MISO, give each chip its own CS GPIO, and common ground. Start with a low clock (a few MHz) until the device answers, then raise it. CS is active-low on most parts.",
      "SCK/MOSI/MISO 共用，每个芯片单独一根 CS，地要共。先用几 MHz 的低时钟确认能通，再提高。多数器件的 CS 是低电平有效。",
    ),
    code: {
      arduino: `SPI.begin();
digitalWrite(CS, LOW);
SPI.transfer(0x9F);
digitalWrite(CS, HIGH);`,
      micropython: `from machine import Pin, SPI
spi = SPI(1, baudrate=1_000_000, sck=Pin(8), mosi=Pin(10), miso=Pin(9))
cs = Pin(3, Pin.OUT, value=1)`,
      zephyr: `const struct device *spi = DEVICE_DT_GET(DT_NODELABEL(spi0));`,
      espidf: `spi_bus_config_t bus = { .mosi_io_num = 9, .miso_io_num = 8, .sclk_io_num = 7 };
spi_bus_initialize(SPI2_HOST, &bus, SPI_DMA_CH_AUTO);`,
    },
    pitfalls: [
      T("Forgetting CS leaves every chip listening, so MOSI/MISO look like noise.", "忘了 CS，所有芯片都在听，总线上像乱码。"),
      T("MISO needs a shared 3.3 V level. A 5 V slave can over-voltage the pin.", "MISO 必须是 3.3V 电平。5V 从设备会过压。"),
    ],
    links: [{ label: "SPI primer", href: "https://learn.sparkfun.com/tutorials/serial-peripheral-interface-spi" }],
  }),
  uart: primer({
    title: T("UART", "UART"),
    intro: T(
      "UART is a point-to-point serial link: TX on one side goes to RX on the other. XIAO header UART is usually D6 TX and D7 RX as Serial1. USB CDC is a different Serial object.",
      "UART 是点对点串口：这边的 TX 接那边的 RX。XIAO 排针串口一般是 D6 TX、D7 RX，对应 Serial1。USB 虚拟串口是另一个 Serial。",
    ),
    wiring: T(
      "Cross the wires (TX→RX, RX→TX), common ground, same baud (115200 8N1 is the usual default). ESP32 prints boot logs on TX — a GPS or LED UART that cannot ignore that text needs a delay or another pin.",
      "交叉接线（TX→RX、RX→TX），共地，波特率一致（常用 115200 8N1）。ESP32 会在 TX 上打启动日志——GPS 或灯带串口如果吃不消这些字，需要延时或换脚。",
    ),
    code: {
      arduino: `Serial1.begin(115200);
Serial1.println("hello");`,
      micropython: `from machine import UART, Pin
u = UART(1, baudrate=115200, tx=Pin(43), rx=Pin(44))
u.write(b"hello\\n")`,
      zephyr: `const struct device *uart = DEVICE_DT_GET(DT_NODELABEL(uart0));`,
      espidf: `uart_driver_install(UART_NUM_1, 1024, 0, 0, NULL, 0);`,
    },
    pitfalls: [
      T("TX to TX never talks. Swap one pair.", "TX 对 TX 永远没数据。换一根。"),
      T("3.3 V UART into a 5 V module may work; 5 V UART into XIAO will not.", "3.3V 串口进 5V 模块也许能通；5V 串口进 XIAO 会伤脚。"),
    ],
    links: [{ label: "UART primer", href: "https://learn.sparkfun.com/tutorials/serial-communication" }],
  }),
  adc: primer({
    title: T("ADC", "ADC"),
    intro: T(
      "An ADC turns a voltage into a number. On XIAO analog pins are labelled A0, A1… and sit on the same pads as D0, D1… Default range is 0–3.3 V.",
      "ADC 把电压变成数字。XIAO 的模拟脚标成 A0、A1…，和 D0、D1… 是同一排焊盘。默认量程 0–3.3V。",
    ),
    wiring: T(
      "Sensor output to an analog pad, sensor ground to GND, sensor VCC to 3V3 unless the module has its own supply. Add a 0.1 µF capacitor near the pin if the reading jumps.",
      "传感器输出接到模拟脚，地接 GND，电源一般接 3V3（模块自带电源除外）。读数乱跳就在脚边加 0.1 µF 电容。",
    ),
    code: {
      arduino: `int raw = analogRead(A0);
float volts = raw * 3.3 / 1023.0;`,
      micropython: `from machine import ADC, Pin
adc = ADC(Pin(1))
print(adc.read_uv())`,
      zephyr: `adc_sequence_init_dt(&adc_chan, &seq);`,
      espidf: `adc_oneshot_read(adc1, ADC_CHANNEL_0, &raw);`,
    },
    pitfalls: [
      T("More than 3.3 V on an analog pin can damage the SoC. Use a divider for batteries.", "模拟脚超过 3.3V 会损坏芯片。测电池要用分压。"),
      T("ESP32 ADC2 is busy while Wi-Fi is on. Prefer ADC1 for sensors.", "ESP32 开着 Wi-Fi 时 ADC2 不可用。传感器优先 ADC1。"),
    ],
    links: [{ label: "Seeed pin multiplexing", href: "https://wiki.seeedstudio.com/" }],
  }),
  pwm: primer({
    title: T("PWM", "PWM"),
    intro: T(
      "PWM is a fast on/off square wave. The duty cycle looks like a dimmable analog voltage to LEDs, buzzers and many motor drivers. Most XIAO digital pins can PWM.",
      "PWM 是快速开关的方波。占空比对 LED、蜂鸣器和多数电机驱动来说，看起来像可调的模拟电压。XIAO 多数数字脚都能 PWM。",
    ),
    wiring: T(
      "LED + resistor to the pin, other side to GND (or 3V3 for active-low LEDs). Motors need a driver — never feed a motor coil from a GPIO.",
      "LED 加电阻接到脚上，另一头接地（低电平点亮则接 3V3）。电机必须加驱动，不要用 GPIO 直接喂线圈。",
    ),
    code: {
      arduino: `analogWrite(D0, 128);`,
      micropython: `from machine import Pin, PWM
p = PWM(Pin(1), freq=1000, duty_u16=32768)`,
      zephyr: `pwm_set_dt(&pwm_led, PWM_HZ(1000), PWM_HZ(1000) / 2);`,
      espidf: `ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 128);
ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);`,
    },
    pitfalls: [
      T("analogWrite is not a DAC. The pin is still 0 V or 3.3 V, just switching fast.", "analogWrite 不是 DAC。脚上仍是 0V 或 3.3V，只是切得很快。"),
    ],
    links: [],
  }),
  dac: primer({
    title: T("DAC", "DAC"),
    intro: T(
      "A DAC outputs a real voltage, not a square wave. On XIAO SAMD21 only A0 (PA02) has a DAC. ESP32-S3 has two 8-bit DACs on GPIO17/18, which this footprint does not bring to the header.",
      "DAC 输出真正的电压，不是方波。XIAO SAMD21 只有 A0（PA02）有 DAC。ESP32-S3 的两路 8 位 DAC 在 GPIO17/18，这块板的排针没引出。",
    ),
    wiring: T(
      "Load the DAC with a high impedance (op-amp buffer or >10 kΩ). Do not drive a speaker directly.",
      "DAC 后面接高阻抗（运放缓冲或 >10 kΩ）。不要直接推喇叭。",
    ),
    code: {
      arduino: `analogWrite(A0, 512); // SAMD21 DAC`,
      micropython: `# SAMD21 Arduino core only on this footprint`,
      zephyr: `dac_write_value(dac, 0, 512);`,
      espidf: `dac_oneshot_output_voltage(dac_handle, 128);`,
    },
    pitfalls: [
      T("PWM is not a substitute when you need a quiet analog bias.", "需要安静的模拟偏置时，PWM 代替不了 DAC。"),
    ],
    links: [],
  }),
  power: primer({
    title: T("Power", "电源"),
    intro: T(
      "XIAO has three everyday power pads: 5V (USB VBUS), 3V3 (onboard regulator) and GND. 5V follows the USB cable. 3V3 is what the SoC drinks.",
      "XIAO 日常三颗电源脚：5V（USB VBUS）、3V3（板上稳压）和 GND。5V 跟着 USB 线走。3V3 才是芯片喝的电。",
    ),
    wiring: T(
      "Power sensors from 3V3 unless they need 5 V. Never inject 5 V into a 3.3 V GPIO. The 3V3 budget is a few hundred milliamps — see the fact chip on this page.",
      "传感器默认用 3V3 供电，除非它必须 5V。不要把 5V 灌进 3.3V GPIO。3V3 额度只有几百毫安——看本页顶部的参数条。",
    ),
    code: {
      arduino: `// Power pads are not driven from sketches.`,
      micropython: `# Power pads are not GPIO.`,
      zephyr: `/* Power pads are not GPIO. */`,
      espidf: `/* Power pads are not GPIO. */`,
    },
    pitfalls: [
      T("Back-feeding 5V while USB is plugged in can fight the host port.", "插着 USB 再从 5V 灌电，会和主机口顶牛。"),
    ],
    links: [],
  }),
  gnd: primer({
    title: T("Ground", "地"),
    intro: T(
      "Ground is the return path for every signal. If two boards do not share GND, UART/I²C/SPI look random.",
      "地是每条信号的回路。两块板不共地，UART/I²C/SPI 看起来会像乱码。",
    ),
    wiring: T(
      "Run a short GND wire next to the signal wire. Battery negative is also ground after the charger.",
      "地线跟信号线一起走，尽量短。电池负极经过充电电路后也是地。",
    ),
    code: {
      arduino: `// GND is a pad, not a GPIO.`,
      micropython: `# GND is a pad, not a GPIO.`,
      zephyr: `/* GND is a pad, not a GPIO. */`,
      espidf: `/* GND is a pad, not a GPIO. */`,
    },
    pitfalls: [
      T("A 'floating' module with only SDA/SCL connected will fail. Add GND.", "只接了 SDA/SCL 的模块会失败。把地接上。"),
    ],
    links: [],
  }),
  rst: primer({
    title: T("Reset & boot", "复位与启动"),
    intro: T(
      "RST (or RUN / CHIP_EN) restarts the MCU. BOOT is sampled at that moment and can force a download / UF2 / ROM loader mode. Many boards share BOOT with a header GPIO.",
      "RST（或 RUN / CHIP_EN）会重启 MCU。BOOT 在那一瞬间被采样，可以强制进入下载 / UF2 / ROM 模式。很多板子的 BOOT 和排针 GPIO 是同一只脚。",
    ),
    wiring: T(
      "A momentary button to GND is enough; the board already pulls the pin up. Do not hard-wire BOOT to GND.",
      "一只对地轻触开关就够了，板上已经上拉。不要把 BOOT 死接到地。",
    ),
    code: {
      arduino: `NVIC_SystemReset();`,
      micropython: `import machine
machine.reset()`,
      zephyr: `sys_reboot(SYS_REBOOT_COLD);`,
      espidf: `esp_restart();`,
    },
    pitfalls: [
      T("A peripheral that holds BOOT low at reset traps you in the bootloader.", "外设在复位时把 BOOT 拉低，会让你卡在引导程序里。"),
    ],
    links: [],
  }),
  debug: primer({
    title: T("SWD / JTAG", "SWD / JTAG"),
    intro: T(
      "The back of a XIAO has tiny debug pads: SWCLK/SWDIO on ARM parts, MTDO/MTDI/MTCK/MTMS on ESP32. They talk to a debug probe, not to Arduino Serial.",
      "XIAO 背面有很小的调试焊盘：ARM 系是 SWCLK/SWDIO，ESP32 是 MTDO/MTDI/MTCK/MTMS。它们连接调试器，不是 Arduino Serial。",
    ),
    wiring: T(
      "Four wires: clock, data, ground, and usually 3V3 sense. Some ESP32 JTAG pads are the same GPIOs as header pins — pick one job.",
      "四根线：时钟、数据、地，通常再加 3V3 检测。部分 ESP32 的 JTAG 焊盘和排针 GPIO 是同一只脚——一次只做一件事。",
    ),
    code: {
      arduino: `// Use a debug probe (CMSIS-DAP, J-Link, ESP-Prog).`,
      micropython: `# OpenOCD / probe, not a sketch.`,
      zephyr: `west debug`,
      espidf: `idf.py openocd`,
    },
    pitfalls: [
      T("Plus / MG24 / nRF54 boards may expose a second SWD port for the SAMD11 USB bridge.", "Plus / MG24 / nRF54 可能还有第二套 SWD，给 SAMD11 USB 桥用。"),
    ],
    links: [],
  }),
  battery: primer({
    title: T("Battery pads", "电池焊盘"),
    intro: T(
      "BAT+ / BAT− on the back take a single-cell LiPo (3.7 V). USB can charge it through the onboard charger. Charge current is modest, often around 100 mA.",
      "背面的 BAT+ / BAT− 接单节 3.7V 锂电。USB 可以通过板载充电芯片给它充电。电流不大，常常大约 100 mA。",
    ),
    wiring: T(
      "Match the silk polarity. Use a cell with a protection board. Do not put two cells in series.",
      "极性对着丝印。电芯要带保护板。不要两节串联。",
    ),
    code: {
      arduino: `int raw = analogRead(A0); // only if the board documents a VBAT ADC pin`,
      micropython: `# Read the documented VBAT ADC GPIO, after enabling the measure FET.`,
      zephyr: `/* nPM1300 boards report charge over I2C, not a divider. */`,
      espidf: `adc_oneshot_read(adc1, ADC_CHANNEL_0, &raw);`,
    },
    pitfalls: [
      T("Reverse polarity can kill the charger IC. Double-check + and − before soldering.", "接反可能毁掉充电芯片。焊之前再看一次正负极。"),
    ],
    links: [],
  }),
  wireless: primer({
    title: T("RF, antenna, NFC", "射频、天线、NFC"),
    intro: T(
      "Wi-Fi / BLE / Thread radios use either the onboard antenna or a U.FL connector. nRF boards also expose NFC pads. These are RF pins, not spare GPIO, unless the wiki says they are muxed.",
      "Wi-Fi / BLE / Thread 电台用板载天线或 U.FL。nRF 板还有 NFC 焊盘。它们是射频脚，不是备用 GPIO，除非 Wiki 写明可以复用。",
    ),
    wiring: T(
      "Keep metal away from the antenna keep-out. Use a matched U.FL cable. NFC wants a coil across NFC1/NFC2, not a jumper to 3V3.",
      "天线净空里不要放金属。U.FL 用匹配的馈线。NFC 是在 NFC1/NFC2 之间接线圈，不是接到 3V3。",
    ),
    code: {
      arduino: `WiFi.begin("ssid", "pass"); // ESP32
// Bluefruit / Zephyr for nRF`,
      micropython: `import network
wlan = network.WLAN(network.STA_IF)
wlan.active(True)`,
      zephyr: `bt_enable(NULL);`,
      espidf: `esp_wifi_start();`,
    },
    pitfalls: [
      T("An RF switch GPIO selects onboard vs U.FL. Wrong level = no range.", "射频开关 GPIO 选择板载天线还是 U.FL。电平错了就没距离。"),
    ],
    links: [],
  }),
  touch: primer({
    title: T("Capacitive touch", "电容触摸"),
    intro: T(
      "ESP32-S3 can measure touch on several GPIOs (Touch0–Touch13). A finger near the pad changes capacitance. XIAO S3 header pins that map to GPIO1–GPIO9 can do this.",
      "ESP32-S3 能在若干 GPIO 上测触摸（Touch0–Touch13）。手指靠近会改变电容。XIAO S3 排针映射到 GPIO1–GPIO9 的脚可以这么用。",
    ),
    wiring: T(
      "A bare pad or a piece of copper tape is enough. No pull-up. Keep traces short and away from 5V.",
      "裸焊盘或铜箔就够了。不用上拉。走线短，远离 5V。",
    ),
    code: {
      arduino: `int t = touchRead(T1);`,
      micropython: `from machine import TouchPad, Pin
t = TouchPad(Pin(1))
print(t.read())`,
      zephyr: `/* Touch is ESP-IDF / Arduino on ESP32. */`,
      espidf: `touch_pad_read_raw_data(TOUCH_PAD_NUM1, &val);`,
    },
    pitfalls: [
      T("Water and thick paint ruin the threshold. Recalibrate on the real enclosure.", "水和厚漆会毁掉阈值。要在真实外壳上重新标定。"),
    ],
    links: [],
  }),
};

const note = (en, zh) => ({ en, zh });

export const BOARD_FUNCTION_NOTES = {
  c3: {
    adc: note("D0–D2 sit on ADC1; D3 is ADC2 and fights Wi-Fi.", "D0–D2 在 ADC1；D3 是 ADC2，会和 Wi-Fi 打架。"),
    uart: note("D6/GPIO21 is UART TX and prints ROM logs at boot.", "D6/GPIO21 是 UART TX，上电会打 ROM 日志。"),
    rst: note("GPIO9 is BOOT and D9/MISO. Hold the button at reset to flash.", "GPIO9 是 BOOT，也是 D9/MISO。复位时按住即可烧录。"),
  },
  c5: {
    adc: note("Only D0 is a documented ADC on the header. Battery sense uses GPIO6 after ADC_CRL enables the divider.", "排针里只有 D0 明确是 ADC。电池检测走 GPIO6，要先用 ADC_CRL 打开分压。"),
  },
  c6: {
    adc: note("D0–D2 have ADC. D3 (GPIO21) does not.", "D0–D2 有 ADC。D3（GPIO21）没有。"),
    wireless: note("GPIO14 / GPIO3 switch onboard antenna vs U.FL.", "GPIO14 / GPIO3 切换板载天线和 U.FL。"),
  },
  s3: {
    adc: note("D0–D5 and D8–D10 are ADC1 (Wi-Fi safe). Header does not bring ADC2.", "D0–D5 和 D8–D10 是 ADC1（开 Wi-Fi 也能用）。排针没有引出 ADC2。"),
    uart: note("D6/GPIO43 prints boot logs.", "D6/GPIO43 会打启动日志。"),
    touch: note("GPIO1–GPIO9 on this header can use the S3 touch engine.", "这排 GPIO1–GPIO9 可以用 S3 触摸。"),
    debug: note("Back JTAG pads share D11/D12 GPIOs.", "背面 JTAG 焊盘和 D11/D12 的 GPIO 共用。"),
  },
  s3sense: {
    wireless: note("Same radio as S3, plus camera and mic that occupy extra GPIOs off the header.", "电台和 S3 相同，另外摄像头和麦克风占用排针以外的 GPIO。"),
  },
  s3plus: {
    i2c: note("Front D4/D5 remain the default I²C. Extra GPIOs on the back can take a second matrix I²C.", "正面 D4/D5 仍是默认 I²C。背面扩展 GPIO 可以再开一组矩阵 I²C。"),
    debug: note("USB D+/D− pads on the back are native USB, not GPIO.", "背面 USB D+/D− 是原生 USB，不是 GPIO。"),
  },
  nrf52: {
    adc: note("AIN0–AIN3 are D0–D1 and D4–D5. NFC pads are P0.09/P0.10.", "AIN0–AIN3 在 D0–D1 和 D4–D5。NFC 焊盘是 P0.09/P0.10。"),
    wireless: note("NFC coil goes on the two NFC pads. BLE uses the onboard / U.FL antenna.", "NFC 线圈接两颗 NFC 焊盘。BLE 走板载或 U.FL 天线。"),
  },
  nrf52840sense: {
    wireless: note("IMU and PDM mic take extra GPIOs listed as onboard pins.", "IMU 和 PDM 麦克风占用板载 GPIO。"),
  },
  nrf52840plus: {
    i2c: note("Front D4/D5 are I²C0. Back D11–D13 are I2S by default; D17–D19 are SPI1.", "正面 D4/D5 是 I²C0。背面 D11–D13 默认 I2S；D17–D19 是 SPI1。"),
    uart: note("Back D14/D15 are UART1 and also NFC1/NFC2.", "背面 D14/D15 是 UART1，也是 NFC1/NFC2。"),
  },
  nrf52840senseplus: {
    i2c: note("Same Plus header as nRF52840 Plus, plus Sense IMU/mic.", "扩展排针和 nRF52840 Plus 相同，再加上 Sense 的 IMU/麦克风。"),
  },
  nrf54l15: {
    i2c: note("Default I²C is D4/D5. Back D11/D12 are a second I²C.", "默认 I²C 是 D4/D5。背面 D11/D12 是第二组 I²C。"),
    debug: note("Back has nRF54 SWD plus a SAMD11 SWD/RST set.", "背面既有 nRF54 SWD，也有一套 SAMD11 SWD/RST。"),
    battery: note("AIN7 reads the battery divider.", "AIN7 读电池分压。"),
  },
  nrf54l15sense: {
    wireless: note("Same NFC and RF switch as nRF54L15, plus Sense sensors.", "NFC 和射频开关与 nRF54L15 相同，外加 Sense 传感器。"),
  },
  nrf54lm20a: {
    battery: note("nPM1300 watches the cell over I²C. SHPHLD can ship-mode the board.", "nPM1300 经 I²C 看电池。SHPHLD 可以让板子进入 ship 模式。"),
    debug: note("SWCLK/SWDIO talk to the nRF54; SWCLK2/SWDIO2/RST2 talk to SAMD11.", "SWCLK/SWDIO 连 nRF54；SWCLK2/SWDIO2/RST2 连 SAMD11。"),
  },
  nrf54lm20asense: {
    i2c: note("Header I²C is P1.03/P1.07. IMU uses a private I²C on P0.08/P0.07.", "排针 I²C 是 P1.03/P1.07。IMU 用 P0.08/P0.07 上的私有 I²C。"),
  },
  samd21: {
    dac: note("Only A0/PA02 has a DAC.", "只有 A0/PA02 有 DAC。"),
    uart: note("Serial is USB CDC. Serial1 is D6/D7 SERCOM4.", "Serial 是 USB 虚拟串口。Serial1 才是 D6/D7 的 SERCOM4。"),
  },
  samd21plus: {
    i2c: note("Front D4/D5 are I²C0. Back D14/D13 are I²C1 (SDA1/SCL1).", "正面 D4/D5 是 I²C0。背面 D14/D13 是 I²C1（SDA1/SCL1）。"),
  },
  rp2040: {
    adc: note("ADC is GPIO26–29 only (D0–D3).", "ADC 只有 GPIO26–29（D0–D3）。"),
  },
  rp2040plus: {
    adc: note("Same ADC0–3 on D0–D3. Extra GPIOs on the back are digital / PIO.", "ADC0–3 仍在 D0–D3。背面扩展 GPIO 是数字 / PIO。"),
  },
  rp2350: {
    adc: note("D0–D2 are ADC0–2. D3 is SPI0 CS (GPIO5), not ADC3. ADC3 reads the battery.", "D0–D2 是 ADC0–2。D3 是 SPI0 CS（GPIO5），不是 ADC3。ADC3 读电池。"),
    i2c: note("Front D4/D5 are I2C1. Back D13/D14 are I2C0 (GPIO17/GPIO16).", "正面 D4/D5 是 I2C1。背面 D13/D14 是 I2C0（GPIO17/GPIO16）。"),
  },
  mg24: {
    debug: note("M_* pads are MG24 SWD; S_* pads are SAMD11 SWD.", "M_* 是 MG24 SWD；S_* 是 SAMD11 SWD。"),
    wireless: note("RF_SW / RF_SW_PWR pick onboard antenna or U.FL.", "RF_SW / RF_SW_PWR 选择板载天线或 U.FL。"),
  },
  mg24sense: {
    wireless: note("Same RF switch as MG24, plus mic and IMU.", "射频开关与 MG24 相同，外加麦克风和 IMU。"),
  },
  ra4: {
    adc: note("A0–A3 are the analog headers. Battery ADC is P015 through a divider.", "A0–A3 是模拟排针。电池 ADC 是 P015 经分压。"),
    uart: note("Front D6/D7 are UART. Back D11/D12 are UART9.", "正面 D6/D7 是 UART。背面 D11/D12 是 UART9。"),
  },
  stm32c5: {
    debug: note("SWCLK/SWDIO/NRST are on the back.", "背面是 SWCLK/SWDIO/NRST。"),
  },
};

export const BOARD_LINKS = {
  samd21: {
    wiki: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    schematic: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0-SCH-191112.pdf",
  },
  samd21plus: {
    wiki: "https://wiki.seeedstudio.com/Seeeduino-XIAO/",
    schematic: "https://files.seeedstudio.com/wiki/Seeeduino-XIAO/res/Seeeduino-XIAO-v1.0-SCH-191112.pdf",
  },
  c3: {
    wiki: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/",
    schematic: "https://wiki.seeedstudio.com/XIAO_ESP32C3_Pin_Multiplexing/",
  },
  c5: {
    wiki: "https://wiki.seeedstudio.com/xiao_esp32c5_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_esp32c5_pin_multiplexing/",
  },
  c6: {
    wiki: "https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_pin_multiplexing_esp32c6/",
  },
  s3: {
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_esp32s3_pin_multiplexing/",
  },
  s3sense: {
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_esp32s3_pin_multiplexing/",
  },
  s3plus: {
    wiki: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_esp32s3_pin_multiplexing/",
  },
  nrf52: {
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    schematic: "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/",
  },
  nrf52840sense: {
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    schematic: "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/",
  },
  nrf52840plus: {
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    schematic: "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/",
  },
  nrf52840senseplus: {
    wiki: "https://wiki.seeedstudio.com/XIAO_BLE/",
    schematic: "https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/",
  },
  nrf54l15: {
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_pin_multiplexing/",
  },
  nrf54l15sense: {
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_pin_multiplexing/",
  },
  nrf54lm20a: {
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_pin_multiplexing/",
  },
  nrf54lm20asense: {
    wiki: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_nrf54l15_sense_pin_multiplexing/",
  },
  rp2040: {
    wiki: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    schematic: "https://wiki.seeedstudio.com/XIAO-RP2040-with-Arduino/#pin-multuiplexing-on-the-seeed-studio-xiao-rp2040",
  },
  rp2040plus: {
    wiki: "https://wiki.seeedstudio.com/XIAO-RP2040/",
    schematic: "https://wiki.seeedstudio.com/XIAO-RP2040-with-Arduino/#pin-multuiplexing-on-the-seeed-studio-xiao-rp2040",
  },
  rp2350: {
    wiki: "https://wiki.seeedstudio.com/getting-started-xiao-rp2350/",
    schematic: "https://wiki.seeedstudio.com/getting-started-xiao-rp2350/",
  },
  ra4: {
    wiki: "https://wiki.seeedstudio.com/getting_started_xiao_ra4m1/",
    schematic: "https://wiki.seeedstudio.com/xiao_ra4m1_pin_multiplexing/",
  },
  mg24: {
    wiki: "https://wiki.seeedstudio.com/xiao_mg24_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_mg24_pin_multiplexing/",
  },
  mg24sense: {
    wiki: "https://wiki.seeedstudio.com/xiao_mg24_getting_started/",
    schematic: "https://wiki.seeedstudio.com/xiao_mg24_pin_multiplexing/",
  },
  stm32c5: {
    wiki: "https://wiki.seeedstudio.com/",
    schematic: "https://wiki.seeedstudio.com/",
  },
};

const FN_TO_GUIDE = {
  analog: "adc",
  i2c: "i2c",
  spi: "spi",
  uart: "uart",
  power: "power",
  gnd: "gnd",
  rst: "rst",
  digital: null,
};

export function functionKeysForPin(pin) {
  const keys = [];
  const add = (key) => {
    if (key && FUNCTION_KEYS.includes(key) && !keys.includes(key)) keys.push(key);
  };
  add(FN_TO_GUIDE[pin.fn]);
  if (pin.caps?.adc) add("adc");
  if (pin.caps?.dac) add("dac");
  if (pin.caps?.i2c) add("i2c");
  if (pin.caps?.spi) add("spi");
  if (pin.caps?.uart) add("uart");
  if (pin.caps?.pwm) add("pwm");
  if (pin.caps?.touch) add("touch");
  const blob = `${pin.id} ${pin.names?.chip || ""} ${pin.names?.silk || ""}`;
  if (/BAT/i.test(blob)) add("battery");
  if (/SWD|SWCLK|SWDIO|MTD|MTCK|MTMS|JTAG|SAMD11|M_CLK|M_DIO|S_CLK|S_DIO/i.test(blob)) add("debug");
  if (/NFC|UFL|ANT|RF_SW|LNA|WIRELESS/i.test(blob)) add("wireless");
  if (/TOUCH/i.test(blob) || pin.caps?.touch) add("touch");
  return keys;
}
