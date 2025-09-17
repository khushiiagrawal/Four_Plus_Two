package dev.adithya.aquahealth.report.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dev.adithya.aquahealth.report.model.UserReport
import dev.adithya.aquahealth.user.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

interface UserReportRepository {
    suspend fun addUserReport(report: UserReport): Result<Unit>
}

@Singleton
class UserReportRepositoryImpl @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val userRepo: UserRepository
): UserReportRepository {

    override suspend fun addUserReport(report: UserReport): Result<Unit> {
        return withContext(Dispatchers.IO) {
            runCatching {
                firestore.collection("userReports")
                    .add(report.toMap())
                    .await()
                Unit
            }
        }
    }

    fun UserReport.toMap(): Map<String, Any?> = mapOf(
        "userId" to auth.currentUser?.uid,
        "waterSource" to waterSource.id,
        "symptoms" to symptoms.joinToString(","),
        "symptomStartTimestamp" to symptomStartTimestamp,
        "reportTimestamp" to reportTimestamp,
        "description" to description,
    )

}