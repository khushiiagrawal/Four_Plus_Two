package dev.adithya.aquahealth.report.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.report.model.UserReport
import dev.adithya.aquahealth.report.repository.UserReportRepository
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import javax.inject.Inject

sealed interface SubmissionState {
    object Idle : SubmissionState
    object Submitting : SubmissionState
    object Success : SubmissionState
    data class Error(val message: String) : SubmissionState
}

@HiltViewModel
class UserReportViewModel @Inject constructor(
    private val repo: UserReportRepository,
    private val waterSourceRepository: WaterSourceRepository
): ViewModel() {

    val predefinedSymptoms = listOf(
        "Nausea",
        "Diarrhea",
        "Stomach Cramps",
        "Vomiting",
        "Fever",
        "Headache",
        "Skin Rash",
        "Other"
    )

    private val _selectedSymptoms = MutableStateFlow<Set<String>>(emptySet())
    val selectedSymptoms: StateFlow<Set<String>> = _selectedSymptoms.asStateFlow()

    private val _symptomDate = MutableStateFlow<LocalDate>(LocalDate.now())
    val symptomDate: StateFlow<LocalDate?> = _symptomDate.asStateFlow()

    private val _symptomTime = MutableStateFlow<LocalTime>(LocalTime.now())
    val symptomTime: StateFlow<LocalTime?> = _symptomTime.asStateFlow()

    private val _selectedWaterSource = MutableStateFlow<WaterSource?>(null)
    val selectedWaterSource: StateFlow<WaterSource?> = _selectedWaterSource.asStateFlow()

    private val _description = MutableStateFlow("")
    val description: StateFlow<String> = _description.asStateFlow()

    private val _submissionState = MutableStateFlow<SubmissionState>(SubmissionState.Idle)
    val submissionState: StateFlow<SubmissionState> = _submissionState.asStateFlow()

    val waterSources: StateFlow<List<WaterSource>> = waterSourceRepository.waterSources

    val isFormValid: StateFlow<Boolean> = combine(
        _selectedSymptoms, _selectedWaterSource
    ) { symptoms, source ->
        symptoms.isNotEmpty() && source != null
    }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = false
        )

    fun onSymptomToggled(symptom: String) {
        _selectedSymptoms.value = if (_selectedSymptoms.value.contains(symptom)) {
            _selectedSymptoms.value - symptom
        } else {
            _selectedSymptoms.value + symptom
        }
    }

    fun onDateSelected(date: LocalDate) {
        _symptomDate.value = date
    }

    fun onTimeSelected(time: LocalTime) {
        _symptomTime.value = time
    }

    fun onWaterSourceSelected(source: WaterSource) {
        _selectedWaterSource.value = source
    }

    fun onDescriptionChanged(text: String) {
        _description.value = text
    }

    fun resetSubmissionState() {
        _submissionState.value = SubmissionState.Idle
        _selectedSymptoms.value = emptySet()
        _symptomDate.value = LocalDate.now()
        _symptomTime.value = LocalTime.now()
        _selectedWaterSource.value = null
        _description.value = ""
    }

    fun submitReport() {
        if (!isFormValid.value) return

        _submissionState.value = SubmissionState.Submitting

        val localDateTime = LocalDateTime.of(_symptomDate.value, _symptomTime.value)
        val instant = localDateTime.atZone(ZoneId.systemDefault()).toInstant()

        val report = UserReport(
            waterSource = _selectedWaterSource.value!!,
            symptoms = _selectedSymptoms.value.toList(),
            symptomStartTimestamp = instant.toEpochMilli(),
            description = _description.value.takeIf { it.isNotBlank() }
        )

        viewModelScope.launch {
            val result = repo.addUserReport(report)
            _submissionState.value = if (result.isSuccess) {
                SubmissionState.Success
            } else {
                SubmissionState.Error(
                    result.exceptionOrNull()?.message ?: "An unknown error occurred."
                )
            }
        }
    }

}