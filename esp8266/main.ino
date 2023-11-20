#include <NewPing.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266WebServer.h>
#define TRIG_PIN D0
#define ECHO_PIN D1
#define LED_GREEN_PIN D4
#define LED_RED_PIN D8
#define LDR_PIN_1 D7
#define LDR_PIN_2 D5
#define LDR_PIN_3 D2
#define LDR_PIN_4 D6

NewPing sonar(TRIG_PIN, ECHO_PIN);
long distance;

const char* ssid = "INFINITUM54AC";
const char* password = "fHHqUGWR4z";

String previousCycle = "";

void handleCycle(String url) {
  digitalWrite(LED_RED_PIN, HIGH);
  digitalWrite(LED_GREEN_PIN, LOW);

  int squezzing = digitalRead(LDR_PIN_2);
  int rinsing = digitalRead(LDR_PIN_3);
  int washing = digitalRead(LDR_PIN_4);

  String newUrl = url;
  if (washing == 0 && previousCycle != "Washing" ){
    Serial.println("Washing");
    newUrl += "&cycle=Washing";
    previousCycle = "Washing";
  } else if (rinsing == 0 && previousCycle != "Rinsing"){
    Serial.println("Rinsing");
    newUrl += "&cycle=Rinsing";
    previousCycle = "Rinsing";
  } else if (squezzing == 0 && previousCycle != "Squeezing"){
    Serial.println("Squeezing");
    newUrl += "&cycle=Squeezing";
    previousCycle = "Squeezing";
  } else {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect("dora-production.up.railway.app", 443)) {
    Serial.println("connection failed");
    return;
  }
  client.println("PUT " + newUrl + " HTTP/1.1");
  client.println("Host: dora-production.up.railway.app");
  client.println("Content-Type: application/x-www-form-urlencoded");
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

int previousState = -1;

void handleTap(String url) {
  digitalWrite(LED_GREEN_PIN, HIGH);
  String newUrl = url;
  long distance = sonar.ping_cm();
  Serial.println(distance <= 10 ? "Washing machine tap opened" : "Washing machine tap closed");

  if (distance < 10){
    digitalWrite(LED_RED_PIN, LOW);
    newUrl += "&onUse=0";

    if (previousState == 0){
      return;
    }
    previousState = 0;

  } else {
    if (previousState == 1){
      return;
    }
    previousState = 1;

  }

  WiFiClientSecure client;
  client.setInsecure();

  if (!client.connect("dora-production.up.railway.app", 443)) {
    Serial.println("connection failed");
    return;
  }

  client.println("PUT " + String(newUrl) + " HTTP/1.1");
  client.println("Host: dora-production.up.railway.app");
  client.println("Content-Type: application/x-www-form-urlencoded");
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
  int turnedOff = digitalRead(LDR_PIN_1);
  Serial.println(turnedOff == 1 ? "Washing machine led turned OFF" : "Washing machine led turned ON");
  if (turnedOff == 0 ){
    handleCycle("https://dora-production.up.railway.app/washroom/machine/1?washing=1&onUse=1");
  } else {
    handleTap("https://dora-production.up.railway.app/washroom/machine/1?washing=0");
    
  };
}


void setup() {
  Serial.begin(9600);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LDR_PIN_1, INPUT);
  pinMode(LDR_PIN_2, INPUT);
  pinMode(LDR_PIN_3, INPUT);
  pinMode(LDR_PIN_4, INPUT);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(2500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  handleRoot();
  delay(1000);
  Serial.println("--------------------------------");
}