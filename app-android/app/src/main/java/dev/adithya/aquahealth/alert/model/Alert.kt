package dev.adithya.aquahealth.alert.model

import androidx.compose.ui.graphics.Color
import dev.adithya.aquahealth.ui.theme.AppColors
import dev.adithya.aquahealth.watersource.model.WaterSource

data class Alert(
    val id: String,
    // we can have alerts unrelated to a particular water body
    val waterSource: WaterSource? = null,
    val title: String,
    val shortSummary: String,
    val longSummary: String? = null,
    val timestamp: Long,
    val severity: AlertSeverity
)

enum class AlertSeverity(val key: String) {
    CRITICAL("critical"),
    WARNING("warning"),
    INFO("info");

    fun toText(): String {
        return when (this) {
            CRITICAL -> "Critical Danger"
            WARNING -> "Caution"
            INFO -> "Safe"
        }
    }

    fun toColor(): Color {
        return when (this) {
            CRITICAL -> AppColors.critical
            WARNING -> AppColors.warning
            INFO -> AppColors.normal
        }
    }

    companion object {
        fun fromKey(key: String): AlertSeverity {
            return entries.firstOrNull { it.key == key } ?: INFO
        }
    }
}