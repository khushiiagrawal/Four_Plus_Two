package dev.adithya.aquahealth.user.repository

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.GeoPoint
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.snapshots
import dev.adithya.aquahealth.di.ApplicationScope
import dev.adithya.aquahealth.model.Location
import dev.adithya.aquahealth.onboarding.model.OnboardingStage
import dev.adithya.aquahealth.user.model.UserProfile
import dev.adithya.aquahealth.user.model.UserProfileState
import dev.adithya.aquahealth.watersource.model.WaterSource
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
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
    suspend fun setWatchList(watchList: List<WaterSource>)
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
    override val userProfileState = userId
        .distinctUntilChanged()
        .flatMapLatest { uid ->
            if (uid != null) {
                firestore.collection("users").document(uid).snapshots()
                    .combine(waterSourcesRepo.waterSources) { snapshot, waterSources ->
                        snapshot.toUserProfileObject(waterSources)?.let {
                            UserProfileState.LoggedIn(it)
                        } ?: UserProfileState.LoggedOut
                    }
            } else {
                flowOf(UserProfileState.LoggedOut)
            }
        }
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.Eagerly,
            initialValue = UserProfileState.Loading
        )

    private val userProfile: StateFlow<UserProfile?> = userProfileState
        .map {
            Log.d(TAG, "userProfile=$it")
            if (it is UserProfileState.LoggedIn) {
                it.userProfile
            } else {
                null
            }
        }
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.Eagerly,
            initialValue = null
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
        .map { it?.watchList ?: emptyList() }
        .distinctUntilChanged()
        .stateIn(
            scope = applicationScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    override suspend fun createUser(uid: String) {
        // Do not create a full UserProfile class here to avoid overwriting.
        uid.getUserDoc()
            .set(
                mapOf("uid" to uid),
                SetOptions.merge()
            )
    }

    override suspend fun setName(name: String) {
        userProfile.value?.let {
            it.uid.getUserDoc()
                .set(it.copy(name = name).toMap())
        }
    }

    override suspend fun setHomeLocation(location: Location) {
        userProfile.value?.let {
            it.uid.getUserDoc()
                .set(it.copy(homeLocation = location).toMap())
        }
    }

    override suspend fun setOnboardingStage(stage: OnboardingStage) {
        userProfile.value?.let {
            it.uid.getUserDoc()
                .set(it.copy(onboardingStage = stage).toMap())
        }
    }

    override suspend fun setWatchList(watchList: List<WaterSource>) {
        userProfile.value?.let {
            it.uid.getUserDoc()
                .set(it.copy(watchList = watchList).toMap())
        }
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