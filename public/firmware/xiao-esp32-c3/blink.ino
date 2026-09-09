/*
 * XIAO ESP32-C3 — Blink
 * 该板没有板载用户 LED。把一颗 LED（串联约 220Ω 电阻）接在 D0 (GPIO2) 与 GND 之间即可看到闪烁。
 * 同时向 USB 串口打印状态。
 * This board has no onboard user LED. Connect an LED (+ ~220Ω resistor)
 * between D0 (GPIO2) and GND to see it blink. Prints state over USB Serial.
 */
#define BLINK_PIN 2  // D0 / GPIO2

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(BLINK_PIN, OUTPUT);
  Serial.println("XIAO ESP32-C3 blink start");
}

void loop() {
  digitalWrite(BLINK_PIN, HIGH);
  Serial.println("LED on");
  delay(500);
  digitalWrite(BLINK_PIN, LOW);
  Serial.println("LED off");
  delay(500);
}
