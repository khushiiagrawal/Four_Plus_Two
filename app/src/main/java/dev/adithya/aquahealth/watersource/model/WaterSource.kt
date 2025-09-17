package dev.adithya.aquahealth.watersource.model

import dev.adithya.aquahealth.model.Location

data class WaterSource(
    val id: String,
    val name: String,
    val location: Location
) {
    override fun equals(other: Any?): Boolean {
        return other is WaterSource && other.id == id
    }

    override fun hashCode(): Int {
        return id.hashCode()
    }
}