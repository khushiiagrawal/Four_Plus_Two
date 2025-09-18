package dev.adithya.aquahealth.watersource.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.alert.AlertRepository
import dev.adithya.aquahealth.alert.model.Alert
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class WaterSourceDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    waterSourceRepository: WaterSourceRepository,
    alertRepository: AlertRepository
) : ViewModel() {

    private val waterSourceId: StateFlow<String> =
        savedStateHandle.getStateFlow(
            key = "waterSourceId",
            initialValue = ""
        )

    val waterSource: StateFlow<WaterSource?> = combine(
        waterSourceRepository.waterSources,
        waterSourceId
    ) { sources, id ->
        sources.find { it.id == id }
    }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    val alerts: StateFlow<List<Alert>> = combine(
        waterSourceId,
        alertRepository.alerts
    ) { id, alerts ->
        alerts.filter { it.waterSource?.id == id }
    }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}