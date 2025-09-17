package dev.adithya.aquahealth.search.model

import dev.adithya.aquahealth.watersource.model.WaterSource

data class SearchItem(
    val waterSource: WaterSource,
    val isInWatchList: Boolean
)