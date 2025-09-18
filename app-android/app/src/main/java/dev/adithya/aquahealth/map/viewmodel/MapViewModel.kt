package dev.adithya.aquahealth.map.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val waterSourceRepo: WaterSourceRepository
) : ViewModel() {

    val waterSources: StateFlow<List<WaterSource>> = waterSourceRepo.waterSources
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}