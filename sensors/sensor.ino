#include "DHT.h"

#define DHTPIN 2  

#define DHTTYPE DHT11   // DHT 11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println(F("Sensors!"));

  dht.begin();
}

void loop() {
  // Wait 10 seconds between measurements (10 * 1000 milliseconds).
  delay(10000);

  float h = dht.readHumidity();
  float t = dht.readTemperature(); // Celsius

  // Check if any reads failed and exit early.
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  // We only need humidity and temperature in Celsius.
  // The Python script will handle timestamps and other data.
  
  // Print data in a simple comma-separated format: "humidity,temperature"
  Serial.print(h);
  Serial.print(",");
  Serial.println(t);
}