package dev.adithya.aquahealth.model

data class Location(
    val latitude: Double,
    val longitude: Double,
    val address: String? = null
)
