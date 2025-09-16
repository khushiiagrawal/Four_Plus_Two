package dev.adithya.aquahealth.watersource.model

import dev.adithya.aquahealth.model.Location

data class WaterSource(
    val id: String,
    val name: String,
    val location: Location
)