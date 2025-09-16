package dev.adithya.aquahealth.onboarding.model

sealed class VerificationStatus {
    data object None : VerificationStatus()
    data object SendingCode : VerificationStatus()
    data object CodeSent : VerificationStatus()
    data object Verifying : VerificationStatus()
    data object Verified : VerificationStatus()
    data class Error(val reason: VerificationError) : VerificationStatus()
}

sealed class VerificationError {
    data object InvalidCredentials : VerificationError()
    data object RateLimited : VerificationError()
    data class Unknown(val exception: Exception?) : VerificationError()
}