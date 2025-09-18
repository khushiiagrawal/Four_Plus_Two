package dev.adithya.aquahealth

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.settings.repository.SettingsRepository
import dev.adithya.aquahealth.user.model.UserProfileState
import dev.adithya.aquahealth.user.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val userRepo: UserRepository,
    private val settingsRepo: SettingsRepository,
    private val fcm: FirebaseMessaging
): ViewModel() {

    val userProfileState: StateFlow<UserProfileState> = userRepo.userProfileState

    init {
        viewModelScope.launch {
            combine(
                userRepo.userProfileState,
                settingsRepo.allAlertsNotificationsEnabled
            ) { userProfileState, allAlertsNotificationsEnabled ->
                if (userProfileState is UserProfileState.LoggedIn && allAlertsNotificationsEnabled) {
                    fcm.subscribeToTopic(ALERT_FCM_TOPIC)
                    Log.d(TAG, "subscribed to alerts")
                } else {
                    fcm.unsubscribeFromTopic(ALERT_FCM_TOPIC)
                    Log.d(TAG, "subscribed to alerts")
                }
            }
                .flowOn(Dispatchers.Default)
                .collect()
        }
    }

    companion object {
        private const val TAG = "MainViewModel"
        private const val ALERT_FCM_TOPIC = "alerts"
    }

}