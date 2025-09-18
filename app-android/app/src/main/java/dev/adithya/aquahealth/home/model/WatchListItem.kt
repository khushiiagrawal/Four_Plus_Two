package dev.adithya.aquahealth.home.model

import dev.adithya.aquahealth.alert.model.AlertSeverity
import dev.adithya.aquahealth.watersource.model.WaterSource

data class WatchListItem(
    val waterSource: WaterSource,
    val alertSeverity: AlertSeverity?
)