#include <SPI.h>
#include <MFRC522.h>

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <ArduinoJson.h>

// RFID Config
#define SS_PIN D4
#define RST_PIN D3

MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

WiFiClient client;
HTTPClient http;
LiquidCrystal_I2C lcd(0x27, 16, 2);

const char* ssid = "Phone";
const char* password = "12345678";
const String serverURL2 = "http://192.168.224.120:3001/saveAttendance/";

void setup() {
  Serial.begin(115200);
  SPI.begin();  // SCK=D4, MISO=D6, MOSI=D7, SS=D8
  mfrc522.PCD_Init();  // Initialize RFID reader

  Wire.begin(D2, D1);  // I2C setup for LCD: SDA=D2, SCL=D1
  lcd.begin();
  lcd.backlight();
  printLCD("Initializing...");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  printLCD("Connecting...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1200);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi: " + WiFi.SSID());
  printLCD("Connected!");

  http.begin(client, serverURL2);
  printLCD("Scan your card");

  Serial.println("NodeMCU Ready!");
}

void loop() {
  // RFID card detection and reading
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  Serial.println("***Card detected***");
  
  String cardUID = "";
  for (byte i = 0; i < mfrc522.uid.size; ++i) {
    cardUID += String(mfrc522.uid.uidByte[i], HEX);
  }
  
  Serial.print("Card UID: ");
  Serial.println(cardUID);
  
  // Send the UID to the server
  sendPostReq(cardUID);

  // Stop the RFID reading
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

void sendPostReq(String uid) {
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  http.addHeader("Authorization", "4A1ff8E237e8");
  String postData = "uid=" + uid;
  
  int httpResponseCode = http.POST(postData);
  String response = http.getString();
  
  if (httpResponseCode > 0) {
    blink50();
    Serial.println("Response:");
    Serial.println("Status code: " + String(httpResponseCode));
    Serial.println("Data: " + response);
    
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    String message = doc["message"];
    printLCD(message);
    delay(500);
    printLCD("Scan your card");
  } else {
    printLCD("Server error " + String(httpResponseCode));
    Serial.println("Error:");
    Serial.println("Status code: " + String(httpResponseCode));
  }
  http.end();
}

void blink50() {
  digitalWrite(D8, HIGH);
  delay(50);
  digitalWrite(D8, LOW);
  delay(50);
  digitalWrite(D8, HIGH);
  delay(50);
  digitalWrite(D8, LOW);
}

void printLCD(String str) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(str);
  delay(1000);
}
