import { NextRequest, NextResponse } from "next/server";
import { initializeFirestore, getMessagingClient } from "@/lib/firestore";

type SensorReading = {
  humidity: number;
  temperature_celsius: number;
  timestamp_ist?: string;
  timestamp_unix?: number;
};

type MlDecision = { 
  isHigh: boolean; 
  reason: string;
  water_quality_prediction?: Record<string, unknown>;
  environmental_conditions?: Record<string, unknown>;
  health_risks_summary?: string;
  severity?: string;
};

const CONFIG = {
  mlUrl: process.env.ML_ALERT_URL || "http://localhost:8000",
  mlAnalysisUrl: process.env.ML_ANALYSIS_URL || "http://localhost:8000",
  fcmTopic: process.env.FCM_TOPIC || "alerts",
  alertsCollection: process.env.FS_ALERTS_COLLECTION || "alerts",
  tempHighC: Number(process.env.TEMP_HIGH_C || 38),
  humidityHighPct: Number(process.env.HUMIDITY_HIGH_PCT || 80),
};

async function decideWithMl(reading: SensorReading): Promise<MlDecision | null> {
  // Try comprehensive analysis first, then fallback to simple alert
  console.log(`Attempting ML analysis with URL: ${CONFIG.mlAnalysisUrl}`);
  
  if (CONFIG.mlAnalysisUrl) {
    try {
      const analysisUrl = `${CONFIG.mlAnalysisUrl}/sensor-analysis`;
      console.log(`Calling comprehensive analysis: ${analysisUrl}`);
      
      const res = await fetch(analysisUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humidity: reading.humidity,
          temperature_celsius: reading.temperature_celsius,
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML analysis responded ${res.status}: ${errorText}`);
      }
      
      const data = (await res.json()) as MlDecision;
      console.log("Comprehensive analysis successful:", data);
      return data;
    } catch (e) {
      console.error("ML comprehensive analysis failed:", e);
      console.log("Falling back to simple alert endpoint...");
    }
  }
  
  // Fallback to simple alert endpoint
  if (!CONFIG.mlUrl) {
    console.log("No ML URL configured, using threshold-based decision");
    return null;
  }
  
  try {
    const alertUrl = `${CONFIG.mlUrl}/alert`;
    console.log(`Calling simple alert endpoint: ${alertUrl}`);
    
    const res = await fetch(alertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        humidity: reading.humidity,
        temperature_celsius: reading.temperature_celsius,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`ML responded ${res.status}: ${errorText}`);
    }
    
    const data = (await res.json()) as MlDecision;
    console.log("Simple alert analysis successful:", data);
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

    // Create alert with proper schema matching mobile app requirements
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Determine severity based on ML analysis or fallback to threshold-based
    const severity = decision.severity || (decision.isHigh ? "warning" : "info");
    
    // Create comprehensive short summary including health risks
    let shortSummary = decision.reason;
    if (decision.health_risks_summary) {
      shortSummary = `${decision.reason}. ${decision.health_risks_summary}`;
    }
    
    // Create title based on severity
    let title = "🚨 Water Quality Alert";
    if (severity === "critical") {
      title = "🚨 CRITICAL Water Quality Alert";
    } else if (severity === "warning") {
      title = "⚠️ Water Quality Warning";
    } else {
      title = "ℹ️ Water Quality Info";
    }

    // Create comprehensive long summary
    let longSummary = `Environmental Conditions: Humidity ${reading.humidity}%, Temperature ${reading.temperature_celsius}°C`;
    
    if (decision.water_quality_prediction) {
      longSummary += `\n\nWater Quality Analysis:\n${JSON.stringify(decision.water_quality_prediction, null, 2)}`;
    }
    
    if (decision.environmental_conditions) {
      longSummary += `\n\nEnvironmental Assessment:\n${JSON.stringify(decision.environmental_conditions, null, 2)}`;
    }
    
    if (decision.health_risks_summary) {
      longSummary += `\n\nHealth Risk Assessment: ${decision.health_risks_summary}`;
    }

    const alertData = {
      id: alertId,
      waterSource: null, // Can be linked to specific water body if needed
      title: title,
      shortSummary: shortSummary,
      longSummary: longSummary || null,
      timestamp: timestamp,
      severity: severity,
    };

    // Send FCM notification
    const fcmBody = decision.health_risks_summary || decision.reason;
    
    // Send FCM and log alert
    const [, docRef] = await Promise.all([
      messaging.send({
        topic: CONFIG.fcmTopic,
        notification: { title, body: fcmBody },
        data: { 
          type: "water_quality_alert",
          alertId: alertId,
          severity: severity,
          timestamp: timestamp.toString()
        },
      }),
      firestore.collection(CONFIG.alertsCollection).add(alertData),
    ]);

    return NextResponse.json({ ok: true, decision, alertId: docRef.id });
  } catch (e) {
    console.error("Ingest failed:", e);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}


