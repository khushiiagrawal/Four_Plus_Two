package dev.adithya.aquahealth.settings.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore("user_prefs")

interface SettingsRepository {
    val allAlertsNotificationsEnabled: Flow<Boolean>
    suspend fun setAllAlertsNotificationEnabled(enabled: Boolean)
}

@Singleton
class SettingsRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context
): SettingsRepository {

    private object PrefKeys {
        val NOTIFY_ALL_ALERTS = booleanPreferencesKey("notify_all_alerts")
    }

    override val allAlertsNotificationsEnabled: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[PrefKeys.NOTIFY_ALL_ALERTS] ?: true
        }

    override suspend fun setAllAlertsNotificationEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PrefKeys.NOTIFY_ALL_ALERTS] = enabled
        }
    }
}