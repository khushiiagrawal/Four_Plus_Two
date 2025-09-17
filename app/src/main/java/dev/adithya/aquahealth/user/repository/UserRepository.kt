package dev.adithya.aquahealth.user.repository

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.GeoPoint
import com.google.firebase.firestore.snapshots
import dev.adithya.aquahealth.di.ApplicationScope
import dev.adithya.aquahealth.model.Location
import dev.adithya.aquahealth.onboarding.model.OnboardingStage
import dev.adithya.aquahealth.user.model.UserProfile
import dev.adithya.aquahealth.user.model.UserProfileState
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.lastOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.shareIn
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

const val TAG = "UserRepository"

interface UserRepository {
    val userProfileState: StateFlow<UserProfileState>
    val userName: StateFlow<String?>
    val userHomeLocation: StateFlow<Location?>
    val userOnboardingStage: StateFlow<OnboardingStage?>
    val userWatchList: StateFlow<List<WaterSource>>
    suspend fun createUser(uid: String)
    suspend fun setName(name: String)
    suspend fun setHomeLocation(location: Location)
    suspend fun setOnboardingStage(stage: OnboardingStage)
    suspend fun addToWatchList(waterSource: WaterSource)
    suspend fun removeFromWatchList(waterSource: WaterSource)
}

@Singleton
class UserRepositoryImpl @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val waterSourcesRepo: WaterSourceRepository,
    @ApplicationScope private val applicationScope: CoroutineScope
) : UserRepository {

    private val userId: Flow<String?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { auth ->
            trySend(auth.uid)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    private val userProfile: SharedFlow<UserProfile?> = userId
        .distinctUntilChanged()
        .flatMapLatest { uid ->
            if (uid != null) {
                firestore.collection("users").document(uid).snapshots()
                    .combine(waterSourcesRepo.waterSources) { snapshot, waterSources ->
                        snapshot.toUserProfileObject(waterSources)
                    }
            } else {
                flowOf(null)
            }
        }
        .shareIn(
            scope = applicationScope,
            started = SharingStarted.Eagerly,
            replay = 1
        )

    override val userProfileState: StateFlow<UserProfileState> = userProfile
        .map {
            Log.d(TAG, "userProfile=$it")
            it?.let { UserProfileState.LoggedIn } ?: UserProfileState.LoggedOut
        }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.Eagerly,
            initialValue = UserProfileState.Loading
        )

    override val userName: StateFlow<String?> = userProfile
        .map { it?.name }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    override val userHomeLocation: StateFlow<Location?> = userProfile
        .map { it?.homeLocation }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    override val userOnboardingStage: StateFlow<OnboardingStage?> = userProfile
        .map { it?.onboardingStage }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    override val userWatchList: StateFlow<List<WaterSource>> = userProfile
        .map { it?.watchList?.distinct() ?: emptyList() }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    override suspend fun createUser(uid: String) {
        withContext(Dispatchers.IO) {
            val docRef = uid.getUserDoc()
            if (!docRef.get().await().exists()) {
                docRef.set(UserProfile(uid).toMap())
            }
        }
    }

    override suspend fun setName(name: String) {
        userProfile.lastOrNull()?.let {
            it.uid.getUserDoc()
                .set(it.copy(name = name).toMap())
        }
    }

    override suspend fun setHomeLocation(location: Location) {
        userProfile.lastOrNull()?.let {
            it.uid.getUserDoc()
                .set(it.copy(homeLocation = location).toMap())
        }
    }

    override suspend fun setOnboardingStage(stage: OnboardingStage) {
        userProfile.lastOrNull()?.let {
            it.uid.getUserDoc()
                .set(it.copy(onboardingStage = stage).toMap())
        }
    }

    override suspend fun addToWatchList(waterSource: WaterSource) {
        Log.d(TAG, "addToWatchList")
        userProfile.replayCache.lastOrNull()?.let {
            Log.d(TAG, "addToWatchList2")
            it.uid.getUserDoc()
                .set(it.copy(watchList = it.watchList + waterSource).toMap())
        } ?: run { Log.d(TAG, "fucked")}
    }

    override suspend fun removeFromWatchList(waterSource: WaterSource) {
        Log.d(TAG, "removeFromWatchList")
        userProfile.replayCache.lastOrNull()?.let {
            Log.d(TAG, "removeFromWatchList2")
            it.uid.getUserDoc()
                .set(it.copy(watchList = it.watchList - waterSource).toMap())
        } ?: run { Log.d(TAG, "fucked")}
    }

    // Firebase doc helpers
    private fun String.getUserDoc() = firestore.collection("users").document(this)

    private fun UserProfile.toMap(): Map<String, Any?> = mapOf(
        "name" to name,
        "homeLocation" to GeoPoint(
            homeLocation?.latitude ?: 0.0,
            homeLocation?.longitude ?: 0.0
        ),
        "onboardingStage" to onboardingStage.key,
        "watchList" to watchList.map { it.id }
    )

    private fun DocumentSnapshot.toUserProfileObject(
        waterSources: List<WaterSource>
    ): UserProfile? {
        val uid = id
        val phone = auth.currentUser?.phoneNumber ?: return null
        val name = getString("name")
        val homeLocation = getGeoPoint("homeLocation")
        val onboardingStage = getString("onboardingStage")
        @Suppress("UNCHECKED_CAST")
        val watchListIds = get("watchList") as? List<String>
        val watchList = watchListIds
            ?.mapNotNull { id -> waterSources.find { it.id == id } }
            ?: emptyList()
        Log.d(TAG, "watchListIds: $watchListIds waterSources: $waterSources watchList: $watchList")

        return UserProfile(
            uid = uid,
            name = name,
            phone = phone,
            homeLocation = homeLocation?.let { Location(it.latitude, it.longitude) },
            onboardingStage = OnboardingStage.fromKey(onboardingStage),
            watchList = watchList
        )
    }
}