package dev.adithya.aquahealth.home.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.alert.AlertRepository
import dev.adithya.aquahealth.alert.model.Alert
import dev.adithya.aquahealth.home.model.WatchListItem
import dev.adithya.aquahealth.user.repository.UserRepository
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.take
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val waterSourceRepository: WaterSourceRepository,
    private val alertRepository: AlertRepository
): ViewModel() {

    @OptIn(ExperimentalCoroutinesApi::class)
    val watchlistItems: StateFlow<List<WatchListItem>> =
        userRepository.userWatchList
            .flatMapLatest { watchList ->
                if (watchList.isEmpty()) {
                    flowOf(emptyList())
                } else {
                    alertRepository.alerts.map { allAlerts ->
                        watchList.map { waterSource ->
                            val alertsForSource =
                                allAlerts.filter { it.waterSource?.id == waterSource.id }
                            // Enum is in ascending ordinal, but descending severity
                            val severity = alertsForSource.minByOrNull { it.severity }?.severity
                            Log.d("HomeVM", "allAlerts=$allAlerts alertsForSource=$alertsForSource id=${waterSource.id} severity=$severity")
                            WatchListItem(waterSource, severity)
                        }
                    }
                        .flowOn(Dispatchers.Default)
                }
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(),
                initialValue = emptyList()
            )

    @OptIn(ExperimentalCoroutinesApi::class)
    val recentAlerts: StateFlow<List<Alert>> =
        alertRepository.alerts
            .take(5)
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(),
                initialValue = emptyList()
            )
}