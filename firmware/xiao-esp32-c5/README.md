# XIAO ESP32-C5 firmware

- `blink.ino` —— Arduino 源码：板载用户指示灯（GPIO27，黄色）闪烁 + 串口输出。
- `xiao-esp32-c5-blink.bin` —— Arduino CLI 1.4.1 + ESP32 core 3.3.11 生成的应用镜像，烧录地址 `0x10000`。
- `xiao-esp32-c5-blink-merged.bin` —— 同一次构建生成的 8 MB 完整镜像，包含 bootloader、分区表、boot app 与应用程序，从 `0x0` 写入。

服务副本位于 `public/firmware/xiao-esp32-c5/`。网页默认使用完整镜像，并支持整片擦除后恢复。
网页烧录信息由 `public/firmware/xiao-esp32-c5/manifest.json` 描述，并在
`public/firmware/catalog.json` 注册为已发布官方固件。
