import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();
const firestore = admin.firestore();
const messaging = admin.messaging();

// Env-driven config
const CONFIG = {
  // Realtime Database paths (sensors code writes here)
  rtdbPath: process.env.RTDB_PATH || '/sensor_data_continuous/{readingId}',
  // ML service endpoint to decide alerts (optional). If not set, fallback thresholds are used
  mlUrl: process.env.ML_ALERT_URL || '',
  // Topic name for FCM broadcast
  fcmTopic: process.env.FCM_TOPIC || 'alerts',
  // Firestore collection to save alert records
  alertsCollection: process.env.FS_ALERTS_COLLECTION || 'alerts',
  // Simple thresholds used if ML is not configured
  tempHighC: Number(process.env.TEMP_HIGH_C || 38),
  humidityHighPct: Number(process.env.HUMIDITY_HIGH_PCT || 80),
};

type SensorReading = {
  humidity: number;
  temperature_celsius: number;
  timestamp_ist?: string;
  timestamp_unix?: number;
};

type MlAlertDecision = {
  isHigh: boolean;
  reason: string;
};

async function decideWithMl(reading: SensorReading): Promise<MlAlertDecision | null> {
  if (!CONFIG.mlUrl) return null;
  try {
    const response = await fetch(CONFIG.mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ humidity: reading.humidity, temperature_celsius: reading.temperature_celsius }),
    });
    if (!response.ok) {
      throw new Error(`ML responded ${response.status}`);
    }
    const payload = (await response.json()) as { isHigh: boolean; reason?: string };
    return { isHigh: !!payload.isHigh, reason: payload.reason || 'ML flagged high values' };
  } catch (error) {
    console.error('ML decision failed, falling back to threshold:', error);
    return null;
  }
}

function decideWithThreshold(reading: SensorReading): MlAlertDecision | null {
  const isTempHigh = reading.temperature_celsius >= CONFIG.tempHighC;
  const isHumidityHigh = reading.humidity >= CONFIG.humidityHighPct;
  if (isTempHigh || isHumidityHigh) {
    const reasons: string[] = [];
    if (isTempHigh) reasons.push(`Temperature too high: ${reading.temperature_celsius}°C`);
    if (isHumidityHigh) reasons.push(`Humidity too high: ${reading.humidity}%`);
    return { isHigh: true, reason: reasons.join('; ') };
  }
  return { isHigh: false, reason: 'Within normal range' };
}

async function sendNotification(title: string, body: string) {
  try {
    await messaging.send({
      topic: CONFIG.fcmTopic,
      notification: { title, body },
      data: { type: 'sensor_alert' },
    });
  } catch (e) {
    console.error('Failed to send FCM:', e);
  }
}

async function logAlert(readingId: string, reading: SensorReading, reason: string) {
  try {
    await firestore.collection(CONFIG.alertsCollection).add({
      readingId,
      title: 'Sensor Alert',
      description: reason,
      location: 'well-1',
      type: 'warning',
      status: 'active',
      reading,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('Failed to log alert:', e);
  }
}

export const onNewSensorReading = functions.database
  .ref(CONFIG.rtdbPath)
  .onCreate(async (snapshot, context) => {
    const readingId = context.params.readingId as string;
    const reading = snapshot.val() as SensorReading;
    if (!reading || typeof reading.temperature_celsius !== 'number' || typeof reading.humidity !== 'number') {
      console.log('Skipping invalid reading', reading);
      return null;
    }

    // Try ML first
    const mlDecision = await decideWithMl(reading);
    const decision = mlDecision ?? decideWithThreshold(reading)!;

    if (!decision.isHigh) {
      console.log('Reading within range. No alert.');
      return null;
    }

    const title = '🚨 Alert detected!';
    const body = `Reading ${readingId}: ${decision.reason}`;

    await Promise.all([
      sendNotification(title, body),
      logAlert(readingId, reading, decision.reason),
    ]);

    return null;
  });


