package dev.adithya.aquahealth.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dev.adithya.aquahealth.MainActivity
import dev.adithya.aquahealth.R

class AppFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        // TODO
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "onMessageReceived: $remoteMessage")

        remoteMessage.notification?.let {
            showNotification(
                it.title ?: "Water Quality Alert",
                it.body ?: "A new alert has been issued."
            )
        }
    }

    private fun showNotification(title: String, body: String, waterSourceId: String? = null) {
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        val channel = NotificationChannel(
            ALL_ALERTS_CHANNEL_ID,
            ALL_ALERTS_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifications for water quality alerts."
        }
        notificationManager.createNotificationChannel(channel)

        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(this, ALL_ALERTS_CHANNEL_ID)
            .setSmallIcon(R.drawable.water_drop_24px)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        notificationManager.notify(ALL_ALERTS_NOTIFICATION_ID, notificationBuilder.build())
    }

    companion object {
        private const val TAG = "AquaHealthFCM"
        private const val ALL_ALERTS_CHANNEL_ID = "all_alerts_channel"
        private const val ALL_ALERTS_CHANNEL_NAME = "All Alerts"
        private const val ALL_ALERTS_NOTIFICATION_ID = 1000
    }
}