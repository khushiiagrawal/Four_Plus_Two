package dev.adithya.aquahealth.alert

import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.snapshots
import dev.adithya.aquahealth.alert.model.Alert
import dev.adithya.aquahealth.alert.model.AlertSeverity
import dev.adithya.aquahealth.di.ApplicationScope
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject
import javax.inject.Singleton

interface AlertRepository {
    val alerts: StateFlow<List<Alert>>
}

@Singleton
class AlertRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val waterSourceRepo: WaterSourceRepository,
    @ApplicationScope private val applicationScope: CoroutineScope
) : AlertRepository {

    override val alerts: StateFlow<List<Alert>> = firestore.collection("alerts")
        .orderBy("timestamp", Query.Direction.DESCENDING)
        .snapshots()
        .combine(waterSourceRepo.waterSources) { snapshot, waterSources ->
            snapshot.documents.mapNotNull { it.toAlert(waterSources) }
        }
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private fun DocumentSnapshot.toAlert(
        waterSources: List<WaterSource>
    ): Alert? {
        val id = id
        val title = getString("title") ?: return null
        val waterSource = getString("waterSource")?.let { waterSourceId ->
            waterSources.find { it.id == waterSourceId }
        }
        val shortSummary = getString("shortSummary") ?: return null
        val longSummary = getString("longSummary")
        val timestamp = getTimestamp("timestamp")?.toDate()?.time ?: return null
        val severity = getString("severity") ?: return null

        return Alert(
            id = id,
            title = title,
            waterSource = waterSource,
            shortSummary = shortSummary,
            longSummary = longSummary,
            timestamp = timestamp,
            severity = AlertSeverity.fromKey(severity)
        )
    }

}