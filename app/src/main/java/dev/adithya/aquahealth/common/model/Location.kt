package dev.adithya.aquahealth.common.model

data class Location(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val address: String? = null
)
