/*
 * XIAO ESP32-C6 — Blink
 * 闪烁板载用户指示灯（GPIO15），并向 USB 串口打印状态。
 * Blinks the onboard user LED (GPIO15) and prints state over USB Serial.
 *
 * 注意：当前安装的 arduino-esp32 (3.2.0) 暂无 ESP32-C6 变体，
 * 本 .bin 需用 ESP-IDF 或带 C6 支持的 arduino-esp32 编译。
 */
#define USER_LED 15  // GPIO15

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(USER_LED, OUTPUT);
  Serial.println("XIAO ESP32-C6 blink start");
}

void loop() {
  digitalWrite(USER_LED, HIGH);
  Serial.println("LED on");
  delay(500);
  digitalWrite(USER_LED, LOW);
  Serial.println("LED off");
  delay(500);
}
