import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = process.env.SENSORS_ENDPOINT || "http://localhost:5001";
    const res = await fetch(`${base}/sensor/current`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json || !json.success) {
      return NextResponse.json({ success: false, error: json?.error || "sensor error" }, { status: 502 });
    }
    const data = json.data || {};
    let water_ph = data.water_ph;
    let water_turbidity_ntu = data.water_turbidity_ntu;
    const temperature_celsius = data.temperature_celsius;
    const humidity = data.humidity;
    
    // Fallback calculation if service does not provide derived values
    if ((water_ph == null || Number.isNaN(Number(water_ph))) && typeof temperature_celsius === "number") {
      const ph = 7.0 + (25.0 - Number(temperature_celsius)) * 0.02;
      water_ph = Math.max(5.5, Math.min(9.5, ph));
    }
    if ((water_turbidity_ntu == null || Number.isNaN(Number(water_turbidity_ntu))) && typeof temperature_celsius === "number" && typeof humidity === "number") {
      const turb = (Number(humidity) / 100.0) * 5.0 + Math.max(0, Math.abs(25.0 - Number(temperature_celsius))) * 0.1;
      water_turbidity_ntu = Math.max(0.1, Math.min(10.0, turb));
    }
    return NextResponse.json({ success: true, data: { water_ph, water_turbidity_ntu, temperature_celsius, humidity } });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "network error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}


