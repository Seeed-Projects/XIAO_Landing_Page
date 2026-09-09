/*
 * XIAO ESP32-S3 — Blink
 * 闪烁板载用户指示灯（GPIO21），并向 USB 串口打印状态。
 * Blinks the onboard user LED (GPIO21) and prints state over USB Serial.
 */
#ifndef LED_BUILTIN
#define LED_BUILTIN 21
#endif

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("XIAO ESP32-S3 blink start");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED on");
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED off");
  delay(500);
}
