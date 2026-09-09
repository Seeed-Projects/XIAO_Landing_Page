# XIAO ESP32-S3 firmware

- `blink.ino` —— Arduino 源码：用户 LED（GPIO21）闪烁 + 串口输出。
- `xiao-esp32-s3-blink.bin` —— 已用 PlatformIO + arduino-esp32 3.2.0 编译（`board = seeed_xiao_esp32s3`），烧录地址 `0x10000`。

服务副本：`code/frontend/public/firmware/xiao-esp32-s3/`，前端经 esptool-js 烧到 `0x10000`。
已在 `src/app/products/esp-flasher.js` 的 `FIRMWARES` 注册（`s3-blink`）。
