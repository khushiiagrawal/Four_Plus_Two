package dev.adithya.aquahealth.user.model

import dev.adithya.aquahealth.common.model.Location
import dev.adithya.aquahealth.onboarding.model.OnboardingStage
import dev.adithya.aquahealth.watersource.model.WaterSource

data class UserProfile(
    val uid: String,
    val name: String? = null,
    val phone: String? = null,
    val homeLocation: Location? = null,
    // Assume profile is created only after a successful login so skip SignOn.
    val onboardingStage: OnboardingStage = OnboardingStage.PROFILE,
    val watchList: List<WaterSource> = emptyList()
)

sealed interface UserProfileState {
    object Loading : UserProfileState
    object LoggedOut : UserProfileState
    object LoggedIn : UserProfileState
}