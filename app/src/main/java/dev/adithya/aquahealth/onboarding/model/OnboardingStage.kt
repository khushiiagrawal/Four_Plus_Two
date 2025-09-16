package dev.adithya.aquahealth.onboarding.model

enum class OnboardingStage(val key: String) {
    SIGN_ON("signOn"),
    PROFILE("profile"),
    ADD_SOURCES("addSources"),
    COMPLETED("completed");

    companion object {
        fun fromKey(key: String?) = entries.find { it.key == key } ?: PROFILE
    }
}