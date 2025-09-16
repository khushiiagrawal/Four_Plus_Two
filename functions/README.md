# Firebase Cloud Functions for IoT Sensor Alerts

This directory contains Firebase Cloud Functions that monitor sensor data and send FCM notifications when certain conditions are met.

## Features

- **Automatic Monitoring**: Triggers on Firestore document changes or Realtime Database updates
- **FCM Notifications**: Sends push notifications to registered devices
- **Conditional Alerts**: Monitors temperature and humidity thresholds
- **Logging**: Records all notifications and errors in Firestore
- **Token Management**: Allows users to register/unregister FCM tokens

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Firebase

Make sure you have the Firebase CLI installed and are logged in:

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
```

### 3. Set Environment Variables

The functions will use the same Firebase project as your existing setup. Make sure your Firebase service account has the necessary permissions.

### 4. Deploy Functions

```bash
npm run deploy
```

## Configuration

### Alert Thresholds

Edit the `ALERT_CONDITIONS` object in `src/index.ts`:

```typescript
const ALERT_CONDITIONS = {
  HIGH_TEMPERATURE: 35, // °C
  LOW_TEMPERATURE: 5,   // °C
  HIGH_HUMIDITY: 80,    // %
  LOW_HUMIDITY: 20,     // %
};
```

### FCM Tokens

Update the `NOTIFICATION_TOKENS` object with your FCM tokens:

```typescript
const NOTIFICATION_TOKENS = {
  admins: [
    'your_admin_fcm_token_1',
    'your_admin_fcm_token_2'
  ],
  users: [
    'your_user_fcm_token_1',
    'your_user_fcm_token_2'
  ]
};
```

## Available Functions

### 1. `monitorSensorData`
- **Trigger**: Firestore document write in `sensor_alerts` collection
- **Purpose**: Monitors sensor data and sends alerts

### 2. `monitorRealtimeSensorData`
- **Trigger**: Realtime Database write in `sensor_data_continuous`
- **Purpose**: Monitors your existing sensor data stream

### 3. `manualSensorAlert`
- **Type**: HTTP function
- **Purpose**: Manually trigger alerts for testing
- **Usage**: `POST /manualSensorAlert` with `{temperature: 40, humidity: 85}`

### 4. `manageFCMTokens`
- **Type**: Callable function
- **Purpose**: Register/unregister FCM tokens
- **Usage**: From your frontend app

## Integration with Existing System

### Option 1: Use Existing Realtime Database
The `monitorRealtimeSensorData` function will work with your current setup immediately, monitoring the `sensor_data_continuous` collection.

### Option 2: Add Firestore Integration
To use Firestore monitoring, modify your sensor code to also write to Firestore:

```python
# Add to your firebase_utils.py
def send_to_firestore(data_packet):
    """Send sensor data to Firestore for alert monitoring."""
    try:
        db = firestore.client()
        doc_ref = db.collection('sensor_alerts').document()
        doc_ref.set(data_packet)
        print(f"Data sent to Firestore: {data_packet}")
        return True
    except Exception as e:
        print(f"Error sending to Firestore: {e}")
        return False
```

## Frontend Integration

### Register FCM Token

```typescript
import { getMessaging, getToken } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';

// Register FCM token
const registerFCMToken = async () => {
  const messaging = getMessaging();
  const token = await getToken(messaging, {
    vapidKey: 'your-vapid-key'
  });
  
  if (token) {
    const manageTokens = httpsCallable(functions, 'manageFCMTokens');
    await manageTokens({
      action: 'register',
      token: token,
      userType: 'admin' // or 'user'
    });
  }
};
```

### Listen for Notifications

```typescript
import { onMessage } from 'firebase/messaging';

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  
  // Show notification
  const notification = payload.notification;
  if (notification) {
    // Display notification in your app
    showNotification(notification.title, notification.body);
  }
});
```

## Testing

### Local Development

```bash
npm run serve
```

### Manual Testing

```bash
# Test manual alert function
curl -X POST https://your-region-your-project.cloudfunctions.net/manualSensorAlert \
  -H "Content-Type: application/json" \
  -d '{"temperature": 40, "humidity": 85}'
```

## Monitoring

- Check function logs: `firebase functions:log`
- Monitor Firestore `notification_logs` collection
- Check FCM delivery reports in Firebase Console

## Security

- Functions use Firebase Admin SDK with full privileges
- FCM tokens are stored in user documents
- Firestore rules restrict access appropriately
- All functions include proper error handling and logging
