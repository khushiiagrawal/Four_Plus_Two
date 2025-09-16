package dev.adithya.aquahealth.watersource.repository

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import dev.adithya.aquahealth.model.Location
import dev.adithya.aquahealth.watersource.model.WaterSource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

interface WaterSourceRepository {
    val waterSources: Flow<List<WaterSource>>
}

@Singleton
class WaterSourceRepositoryImpl @Inject constructor(
    firestore: FirebaseFirestore
) : WaterSourceRepository {

    override val waterSources = firestore.collection("waterBodies").snapshots()
        .map { snapshot ->
            snapshot.documents.mapNotNull { it.toWaterSource() }
        }

    private fun DocumentSnapshot.toWaterSource(): WaterSource? {
        val id = id
        val name = getString("name") ?: return null
        val location = getGeoPoint("location") ?: return null
        val address = getString("address")
        return WaterSource(
            id = id,
            name = name,
            location = Location(
                latitude = location.latitude,
                longitude = location.longitude,
                address = address
            )
        )
    }
}