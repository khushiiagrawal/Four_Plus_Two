package dev.adithya.aquahealth.onboarding.repository

import android.util.Log
import com.google.firebase.FirebaseException
import com.google.firebase.FirebaseTooManyRequestsException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import dev.adithya.aquahealth.onboarding.model.VerificationError
import dev.adithya.aquahealth.onboarding.model.VerificationStatus
import dev.adithya.aquahealth.user.repository.UserRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

const val TAG = "OnboardingRepository"

interface SignOnRepository {
    val verificationStatus: MutableStateFlow<VerificationStatus>
    suspend fun verifyPhone(phoneNumber: String)
    suspend fun verifyCode(code: String)
}

@Singleton
class SignOnRepositoryImpl @Inject constructor(
    private val userRepository: UserRepository,
    private val auth: FirebaseAuth,
) : SignOnRepository {

    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)

    private var verificationId = ""
    private val verificationCallback = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
        override fun onVerificationCompleted(credential: PhoneAuthCredential) {
            Log.d(TAG, "onVerificationCompleted:$credential")
            credential.signIn()
        }

        override fun onVerificationFailed(e: FirebaseException) {
            Log.w(TAG, "onVerificationFailed", e)
            verificationStatus.value = VerificationStatus.Error(
                reason = when (e) {
                    is FirebaseAuthInvalidCredentialsException -> VerificationError.InvalidCredentials
                    is FirebaseTooManyRequestsException -> VerificationError.RateLimited
                    else -> VerificationError.Unknown(e)
                }
            )
        }

        override fun onCodeSent(
            verificationId: String,
            token: PhoneAuthProvider.ForceResendingToken,
        ) {
            Log.d(TAG, "onCodeSent verificationId=$verificationId")
            this@SignOnRepositoryImpl.verificationId = verificationId
            verificationStatus.value = VerificationStatus.CodeSent
        }
    }

    override val verificationStatus: MutableStateFlow<VerificationStatus> =
        MutableStateFlow(VerificationStatus.None)

    override suspend fun verifyPhone(phoneNumber: String) {
        val options = PhoneAuthOptions.newBuilder(auth)
            .setPhoneNumber(phoneNumber)
            .setTimeout(30L, TimeUnit.SECONDS)
            .setCallbacks(verificationCallback)
            .build()
        PhoneAuthProvider.verifyPhoneNumber(options)
        verificationStatus.value = VerificationStatus.SendingCode
    }

    override suspend fun verifyCode(code: String) {
        PhoneAuthProvider.getCredential(verificationId, code)
            .signIn()
        verificationStatus.value = VerificationStatus.Verifying
    }

    private fun PhoneAuthCredential.signIn() {
        auth.signInWithCredential(this)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "signInWithCredential: success")
                    verificationStatus.value = VerificationStatus.Verified
                    scope.launch {
                        userRepository.createUser(task.result!!.user!!.uid)
                    }
                } else {
                    Log.w(TAG, "signInWithCredential: failure", task.exception)
                    verificationStatus.value = VerificationStatus.Error(
                        reason = if (task.exception is FirebaseAuthInvalidCredentialsException) {
                            VerificationError.InvalidCredentials
                        } else {
                            VerificationError.Unknown(task.exception)
                        }
                    )
                }
            }
    }
}