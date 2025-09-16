import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Interface for sensor data
interface SensorData {
  humidity: number;
  temperature_celsius: number;
  timestamp_ist: string;
  timestamp_unix: number;
}

// Interface for notification log
interface NotificationLog {
  sensorData: SensorData;
  condition: string;
  recipients: string[];
  sentAt: admin.firestore.Timestamp;
  status: 'sent' | 'failed';
  error?: string;
}

// Configuration for alert conditions
const ALERT_CONDITIONS = {
  // Temperature thresholds
  HIGH_TEMPERATURE: 35, // °C
  LOW_TEMPERATURE: 5,   // °C
  
  // Humidity thresholds
  HIGH_HUMIDITY: 80,    // %
  LOW_HUMIDITY: 20,     // %
};

// FCM tokens for different user groups (you'll need to populate these)
const NOTIFICATION_TOKENS = {
  admins: [
    // Add admin FCM tokens here
    // 'fcm_token_1', 'fcm_token_2'
  ],
  users: [
    // Add user FCM tokens here
    // 'fcm_token_3', 'fcm_token_4'
  ]
};

/**
 * Cloud Function that triggers when sensor data is written to Firestore
 * This function monitors sensor data and sends FCM notifications based on conditions
 */
export const monitorSensorData = functions.firestore
  .document('sensor_alerts/{docId}')
  .onWrite(async (change, context) => {
    const docId = context.params.docId;
    console.log(`Processing sensor data document: ${docId}`);

    try {
      // Get the document data
      const data = change.after.data() as SensorData;
      
      if (!data) {
        console.log('No data found in document');
        return;
      }

      // Check if this is a deletion
      if (!change.after.exists) {
        console.log('Document was deleted, skipping processing');
        return;
      }

      console.log('Sensor data:', data);

      // Check alert conditions
      const alerts = checkAlertConditions(data);
      
      if (alerts.length === 0) {
        console.log('No alert conditions met');
        return;
      }

      console.log(`Alert conditions met: ${alerts.join(', ')}`);

      // Send FCM notifications for each alert
      for (const alert of alerts) {
        await sendAlertNotification(data, alert, NOTIFICATION_TOKENS.admins);
        
        // Log the notification
        await logNotification(data, alert, NOTIFICATION_TOKENS.admins);
      }

      console.log('All notifications processed successfully');

    } catch (error) {
      console.error('Error processing sensor data:', error);
      
      // Log the error
      await logNotificationError(docId, error as Error);
    }
  });

/**
 * Alternative function that triggers on Realtime Database changes
 * This can be used if you want to monitor the existing sensor data collections
 */
export const monitorRealtimeSensorData = functions.database
  .ref('/sensor_data_continuous/{docId}')
  .onWrite(async (change, context) => {
    const docId = context.params.docId;
    console.log(`Processing realtime sensor data: ${docId}`);

    try {
      const data = change.after.val() as SensorData;
      
      if (!data) {
        console.log('No data found');
        return;
      }

      // Check if this is a deletion
      if (!change.after.exists()) {
        console.log('Data was deleted, skipping processing');
        return;
      }

      console.log('Realtime sensor data:', data);

      // Check alert conditions
      const alerts = checkAlertConditions(data);
      
      if (alerts.length === 0) {
        console.log('No alert conditions met');
        return;
      }

      console.log(`Alert conditions met: ${alerts.join(', ')}`);

      // Send FCM notifications for each alert
      for (const alert of alerts) {
        await sendAlertNotification(data, alert, NOTIFICATION_TOKENS.admins);
        
        // Log the notification
        await logNotification(data, alert, NOTIFICATION_TOKENS.admins);
      }

      console.log('All notifications processed successfully');

    } catch (error) {
      console.error('Error processing realtime sensor data:', error);
      
      // Log the error
      await logNotificationError(docId, error as Error);
    }
  });

/**
 * Check if sensor data meets any alert conditions
 */
function checkAlertConditions(data: SensorData): string[] {
  const alerts: string[] = [];

  if (data.temperature_celsius > ALERT_CONDITIONS.HIGH_TEMPERATURE) {
    alerts.push(`High Temperature: ${data.temperature_celsius}°C`);
  }

  if (data.temperature_celsius < ALERT_CONDITIONS.LOW_TEMPERATURE) {
    alerts.push(`Low Temperature: ${data.temperature_celsius}°C`);
  }

  if (data.humidity > ALERT_CONDITIONS.HIGH_HUMIDITY) {
    alerts.push(`High Humidity: ${data.humidity}%`);
  }

  if (data.humidity < ALERT_CONDITIONS.LOW_HUMIDITY) {
    alerts.push(`Low Humidity: ${data.humidity}%`);
  }

  return alerts;
}

/**
 * Send FCM notification
 */
async function sendAlertNotification(
  sensorData: SensorData, 
  alert: string, 
  tokens: string[]
): Promise<void> {
  if (tokens.length === 0) {
    console.log('No FCM tokens available, skipping notification');
    return;
  }

  const message = {
    notification: {
      title: '🚨 Sensor Alert',
      body: `${alert} detected at ${sensorData.timestamp_ist}`,
    },
    data: {
      type: 'sensor_alert',
      temperature: sensorData.temperature_celsius.toString(),
      humidity: sensorData.humidity.toString(),
      timestamp: sensorData.timestamp_ist,
      alert: alert,
    },
    tokens: tokens,
  };

  try {
    const response = await messaging.sendMulticast(message);
    console.log('FCM notification sent:', response);
    
    if (response.failureCount > 0) {
      console.log('Some notifications failed:', response.responses);
    }
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    throw error;
  }
}

/**
 * Log notification to Firestore
 */
async function logNotification(
  sensorData: SensorData,
  alert: string,
  recipients: string[]
): Promise<void> {
  const logEntry: NotificationLog = {
    sensorData,
    condition: alert,
    recipients,
    sentAt: admin.firestore.Timestamp.now(),
    status: 'sent',
  };

  try {
    await db.collection('notification_logs').add(logEntry);
    console.log('Notification logged successfully');
  } catch (error) {
    console.error('Error logging notification:', error);
    throw error;
  }
}

/**
 * Log notification error
 */
async function logNotificationError(docId: string, error: Error): Promise<void> {
  const logEntry: Partial<NotificationLog> = {
    condition: 'Processing Error',
    recipients: [],
    sentAt: admin.firestore.Timestamp.now(),
    status: 'failed',
    error: error.message,
  };

  try {
    await db.collection('notification_logs').add({
      ...logEntry,
      sensorData: null,
    });
    console.log('Error logged successfully');
  } catch (logError) {
    console.error('Error logging error:', logError);
  }
}

/**
 * HTTP function to manually trigger sensor data monitoring
 * This can be used for testing or manual alerts
 */
export const manualSensorAlert = functions.https.onRequest(async (req, res) => {
  try {
    const { temperature, humidity } = req.body;

    if (typeof temperature !== 'number' || typeof humidity !== 'number') {
      res.status(400).json({
        error: 'Invalid data. Please provide temperature and humidity as numbers.',
      });
      return;
    }

    const sensorData: SensorData = {
      temperature_celsius: temperature,
      humidity: humidity,
      timestamp_ist: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' IST',
      timestamp_unix: Math.floor(Date.now() / 1000),
    };

    // Check alert conditions
    const alerts = checkAlertConditions(sensorData);
    
    if (alerts.length === 0) {
      res.json({
        message: 'No alert conditions met',
        data: sensorData,
      });
      return;
    }

    // Send notifications
    for (const alert of alerts) {
      await sendAlertNotification(sensorData, alert, NOTIFICATION_TOKENS.admins);
      await logNotification(sensorData, alert, NOTIFICATION_TOKENS.admins);
    }

    res.json({
      message: 'Alert notifications sent',
      alerts: alerts,
      data: sensorData,
    });

  } catch (error) {
    console.error('Error in manual sensor alert:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * Function to manage FCM tokens
 * This allows users to register/unregister their FCM tokens
 */
export const manageFCMTokens = functions.https.onCall(async (data, context) => {
  // Verify user authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to manage FCM tokens'
    );
  }

  const { action, token, userType } = data;
  const userId = context.auth.uid;

  try {
    const userDoc = db.collection('users').doc(userId);
    
    switch (action) {
      case 'register':
        if (!token || !userType) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Token and userType are required for registration'
          );
        }

        await userDoc.set({
          fcmToken: token,
          userType: userType, // 'admin' or 'user'
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return { success: true, message: 'FCM token registered successfully' };

      case 'unregister':
        await userDoc.update({
          fcmToken: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: 'FCM token unregistered successfully' };

      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid action. Use "register" or "unregister"'
        );
    }
  } catch (error) {
    console.error('Error managing FCM tokens:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to manage FCM tokens'
    );
  }
});
