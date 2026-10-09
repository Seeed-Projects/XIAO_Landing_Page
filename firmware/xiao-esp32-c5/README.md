# XIAO ESP32-C5 firmware

- `blink.ino` —— Arduino 源码：板载用户指示灯（GPIO27，黄色）闪烁 + 串口输出。
- `xiao-esp32-c5-blink.bin` —— 已用 PlatformIO + SeeedStudio 平台（arduino-esp32 3.3.7、riscv32 工具链 14.2.0、esptoolpy v5.1.2）编译，烧录地址 `0x10000`。

服务副本：`code/frontend/public/firmware/xiao-esp32-c5/`，前端经 esptool-js 烧到 `0x10000`。
已在 `src/app/products/esp-flasher.js` 的 `FIRMWARES` 注册（`c5-blink`）。
