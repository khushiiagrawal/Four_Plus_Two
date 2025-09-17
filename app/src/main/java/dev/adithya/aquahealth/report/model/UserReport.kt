package dev.adithya.aquahealth.report.model

import dev.adithya.aquahealth.watersource.model.WaterSource

data class UserReport(
    val waterSource: WaterSource,
    val symptoms: List<String> = emptyList(),
    val symptomStartTimestamp: Long? = null,
    val reportTimestamp: Long = System.currentTimeMillis(),
    val description: String? = null,
)