package dev.adithya.aquahealth.watersource.repository

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import dev.adithya.aquahealth.di.ApplicationScope
import dev.adithya.aquahealth.model.Location
import dev.adithya.aquahealth.watersource.model.WaterSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject
import javax.inject.Singleton

interface WaterSourceRepository {
    val waterSources: StateFlow<List<WaterSource>>
}

@Singleton
class WaterSourceRepositoryImpl @Inject constructor(
    firestore: FirebaseFirestore,
    @ApplicationScope private val applicationScope: CoroutineScope
) : WaterSourceRepository {

    override val waterSources = firestore.collection("waterBodies").snapshots()
        .map { snapshot ->
            snapshot.documents.mapNotNull { it.toWaterSourceObject() }
        }
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private fun DocumentSnapshot.toWaterSourceObject(): WaterSource? {
        val id = id
        val name = getString("name") ?: return null
        val location = getGeoPoint("location") ?: return null
        val address = getString("address")
        val lastUpdated = getLong("lastUpdated") ?: System.currentTimeMillis()
        return WaterSource(
            id = id,
            name = name,
            location = Location(
                latitude = location.latitude,
                longitude = location.longitude,
                address = address
            ),
            lastUpdated = lastUpdated
        )
    }
}