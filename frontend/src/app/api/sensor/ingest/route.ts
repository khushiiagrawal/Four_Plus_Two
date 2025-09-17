import { NextRequest, NextResponse } from "next/server";
import { initializeFirestore, getMessagingClient } from "@/lib/firestore";

type SensorReading = {
  humidity: number;
  temperature_celsius: number;
  timestamp_ist?: string;
  timestamp_unix?: number;
};

type MlDecision = { isHigh: boolean; reason: string };

const CONFIG = {
  mlUrl: process.env.ML_ALERT_URL || "",
  fcmTopic: process.env.FCM_TOPIC || "alerts",
  alertsCollection: process.env.FS_ALERTS_COLLECTION || "alerts",
  tempHighC: Number(process.env.TEMP_HIGH_C || 38),
  humidityHighPct: Number(process.env.HUMIDITY_HIGH_PCT || 80),
};

async function decideWithMl(reading: SensorReading): Promise<MlDecision | null> {
  if (!CONFIG.mlUrl) return null;
  try {
    const res = await fetch(CONFIG.mlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        humidity: reading.humidity,
        temperature_celsius: reading.temperature_celsius,
      }),
    });
    if (!res.ok) throw new Error(`ML responded ${res.status}`);
    const data = (await res.json()) as MlDecision;
    return data;
  } catch (e) {
    console.error("ML decision failed:", e);
    return null;
  }
}

function decideWithThreshold(reading: SensorReading): MlDecision {
  const isTempHigh = reading.temperature_celsius >= CONFIG.tempHighC;
  const isHumidityHigh = reading.humidity >= CONFIG.humidityHighPct;
  if (isTempHigh || isHumidityHigh) {
    const reasons: string[] = [];
    if (isTempHigh) reasons.push(`Temperature too high: ${reading.temperature_celsius}°C`);
    if (isHumidityHigh) reasons.push(`Humidity too high: ${reading.humidity}%`);
    return { isHigh: true, reason: reasons.join("; ") };
  }
  return { isHigh: false, reason: "Within normal range" };
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Partial<SensorReading> & { readingId?: string };
    const humidity = Number(payload.humidity);
    const temperature = Number(payload.temperature_celsius);
    if (Number.isNaN(humidity) || Number.isNaN(temperature)) {
      return NextResponse.json({ error: "Invalid humidity/temperature" }, { status: 400 });
    }
    const reading: SensorReading = {
      humidity,
      temperature_celsius: temperature,
    };
    if (typeof payload.timestamp_ist === "string") {
      reading.timestamp_ist = payload.timestamp_ist;
    }
    if (payload.timestamp_unix !== undefined && payload.timestamp_unix !== null) {
      const ts = Number(payload.timestamp_unix);
      if (!Number.isNaN(ts)) reading.timestamp_unix = ts;
    }

    // Decide via ML first, else threshold
    const ml = await decideWithMl(reading);
    const decision = ml ?? decideWithThreshold(reading);

    if (!decision.isHigh) {
      return NextResponse.json({ ok: true, decision });
    }

    const firestore = initializeFirestore();
    const messaging = getMessagingClient();

    const title = "🚨 Alert detected!";
    const body = `${decision.reason}`;

    // Send FCM and log alert
    const [_, docRef] = await Promise.all([
      messaging.send({
        topic: CONFIG.fcmTopic,
        notification: { title, body },
        data: { type: "sensor_alert" },
      }),
      firestore.collection(CONFIG.alertsCollection).add({
        readingId: payload.readingId ?? null,
        title: "Sensor Alert",
        description: decision.reason,
        location: "well-1",
        type: "warning",
        status: "active",
        reading,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    return NextResponse.json({ ok: true, decision, alertId: docRef.id });
  } catch (e) {
    console.error("Ingest failed:", e);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}


