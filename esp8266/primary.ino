#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266WebServer.h>
#include <NewPing.h>

const char* ssid = "iPhone de Miguel (2)";
const char* password = "password";

#define LDR A0
#define TRIG_PIN D5
#define ECHO_PIN D6

NewPing sonar(TRIG_PIN, ECHO_PIN);

void handleTap() {

  long distance = sonar.ping_cm();
  Serial.println(distance <= 10 ? "Washing machine tap opened" : "Washing machine tap closed");

  if (distance > 10){
    return;
  }

  String url = "https://dora-production.up.railway.app/washroom/1";

  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect("dora-production.up.railway.app", 443)) {
    Serial.println("connection failed");
    return;
  }

  client.println("PUT " + String(url) + " HTTP/1.1");
  client.println("Host: dora-production.up.railway.app/washroom/1");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();

  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }

  String response = "";
  while (client.available()) {
    char c = client.read();
    response += c;
    
  }
  Serial.println(response);

  client.stop();
}

void handleRoot() {
  int light = analogRead(A0);
  Serial.println(light < 70 ? "Washing machine led turned OFF" : "Washing machine led turned ON");

  String url = "https://dora-production.up.railway.app/washroom/1";

  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect("dora-production.up.railway.app", 443)) {
    Serial.println("connection failed");
    return;
  }

  if (light < 70){
    client.println("PATCH " + String(url) + " HTTP/1.1");
  } else {
    client.println("POST " + String(url) + " HTTP/1.1");
  }

  client.println("Host: dora-production.up.railway.app/washroom/1");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();

  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }

  String response = "";
  while (client.available()) {
    char c = client.read();
    response += c;
    
  }
  Serial.println(response);
  client.stop();

  if (light > 70 ){
    return;
  }

  delay(2000);
  handleTap();
}

void setup() {
  Serial.begin(9600);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  handleRoot();
  delay(4000);
}