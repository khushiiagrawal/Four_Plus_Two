package dev.adithya.aquahealth.report.ui

import android.widget.Toast
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.report.viewmodel.SubmissionState
import dev.adithya.aquahealth.report.viewmodel.UserReportViewModel
import dev.adithya.aquahealth.ui.components.AppScaffold
import dev.adithya.aquahealth.watersource.model.WaterSource
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class,
    ExperimentalMaterial3ExpressiveApi::class
)
@Composable
fun UserReportScreen(
    navController: NavHostController,
    viewModel: UserReportViewModel = hiltViewModel()
) {
    val selectedSymptoms by viewModel.selectedSymptoms.collectAsStateWithLifecycle()
    val symptomDate by viewModel.symptomDate.collectAsStateWithLifecycle()
    val symptomTime by viewModel.symptomTime.collectAsStateWithLifecycle()
    val selectedWaterSource by viewModel.selectedWaterSource.collectAsStateWithLifecycle()
    val waterSources by viewModel.waterSources.collectAsStateWithLifecycle()
    val description by viewModel.description.collectAsStateWithLifecycle()
    val isFormValid by viewModel.isFormValid.collectAsStateWithLifecycle()
    val submissionState by viewModel.submissionState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }

    LaunchedEffect(submissionState) {
        when (val state = submissionState) {
            is SubmissionState.Success -> {
                Toast.makeText(
                    context,
                    "Report submitted successfully!",
                    Toast.LENGTH_SHORT
                ).show()
                viewModel.resetSubmissionState()
            }
            is SubmissionState.Error -> {
                Toast.makeText(
                    context,
                    "Failed to submit report: ${state.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
            else -> {}
        }
    }

    AppScaffold(
        navController = navController
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .padding(top = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    "What symptoms are you experiencing? Choose all applicable.",
                    style = MaterialTheme.typography.titleMedium
                )
                FlowRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    viewModel.predefinedSymptoms.forEach { symptom ->
                        FilterChip(
                            selected = selectedSymptoms.contains(symptom),
                            onClick = { viewModel.onSymptomToggled(symptom) },
                            label = { Text(symptom) }
                        )
                    }
                }
            }

            item {
                Text("When did they start?", style = MaterialTheme.typography.titleMedium)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    OutlinedTextField(
                        value = symptomDate?.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            ?: "Select Date",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Date") },
                        modifier = Modifier
                            .weight(1f)
                            .pointerInput(symptomDate) {
                                awaitEachGesture {
                                    // https://github.com/android/snippets/blob/1da1d9d645cd1a8e693981900e04d6bc32287a5c/compose/snippets/src/main/java/com/example/compose/snippets/components/DatePickers.kt#L228-L320
                                    // Modifier.clickable doesn't work for text fields, so we use Modifier.pointerInput
                                    // in the Initial pass to observe events before the text field consumes them
                                    // in the Main pass.
                                    awaitFirstDown(pass = PointerEventPass.Initial)
                                    val upEvent =
                                        waitForUpOrCancellation(pass = PointerEventPass.Initial)
                                    if (upEvent != null) {
                                        showDatePicker = true
                                    }
                                }
                            }
                    )
                    OutlinedTextField(
                        value = symptomTime?.format(
                            DateTimeFormatter.ofPattern("HH:mm")
                        ) ?: "Select Time",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Time") },
                        modifier = Modifier
                            .weight(1f)
                            .pointerInput(symptomTime) {
                                awaitEachGesture {
                                    // Modifier.clickable doesn't work for text fields, so we use Modifier.pointerInput
                                    // in the Initial pass to observe events before the text field consumes them
                                    // in the Main pass.
                                    awaitFirstDown(pass = PointerEventPass.Initial)
                                    val upEvent =
                                        waitForUpOrCancellation(pass = PointerEventPass.Initial)
                                    if (upEvent != null) {
                                        showTimePicker = true
                                    }
                                }
                            }
                    )
                }
            }

            item {
                WaterSourceDropdown(
                    waterSources = waterSources,
                    selectedSource = selectedWaterSource,
                    onSourceSelected = viewModel::onWaterSourceSelected
                )
            }

            item {
                Text(
                    "Add more details (Optional)",
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier
                        .padding(top = 8.dp)
                        .padding(bottom = 4.dp)
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = viewModel::onDescriptionChanged,
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
            }

            item {
                FilledTonalButton(
                    onClick = viewModel::submitReport,
                    enabled = isFormValid && submissionState != SubmissionState.Submitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp, bottom = 16.dp)
                ) {
                    if (submissionState is SubmissionState.Submitting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text("Submit")
                    }
                }
            }
        }
    }

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            viewModel.onDateSelected(
                                Instant.ofEpochMilli(millis)
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate()
                            )
                        }
                        showDatePicker = false
                    }
                ) { Text("OK") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    if (showTimePicker) {
        val timePickerState = rememberTimePickerState()
        TimePickerDialog(
            onDismissRequest = { showTimePicker = false },
            onConfirm = {
                viewModel.onTimeSelected(
                    LocalTime.of(timePickerState.hour, timePickerState.minute)
                )
                showTimePicker = false
            }
        ) {
            TimePicker(state = timePickerState)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WaterSourceDropdown(
    waterSources: List<WaterSource>,
    selectedSource: WaterSource?,
    onSourceSelected: (WaterSource) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = selectedSource?.name ?: "Select a water source",
            onValueChange = {},
            readOnly = true,
            label = { Text("Water Source") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .menuAnchor(
                    ExposedDropdownMenuAnchorType.PrimaryNotEditable,
                    enabled = true
                )
                .fillMaxWidth()
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            waterSources.forEach { source ->
                DropdownMenuItem(
                    text = { Text(source.name, textAlign = TextAlign.Center) },
                    onClick = {
                        onSourceSelected(source)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun TimePickerDialog(
    onDismissRequest: () -> Unit,
    onConfirm: () -> Unit,
    content: @Composable () -> Unit = {}
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text("Select Time") },
        text = { content() },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Cancel")
            }
        }
    )
}