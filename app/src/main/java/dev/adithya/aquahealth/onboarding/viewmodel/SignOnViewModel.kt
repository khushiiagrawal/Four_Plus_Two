package dev.adithya.aquahealth.onboarding.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.onboarding.repository.SignOnRepository
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SignOnViewModel @Inject constructor(
    private val repository: SignOnRepository
): ViewModel() {
    val verificationStatus = repository.verificationStatus

    fun verifyPhone(phoneNumber: String) {
        viewModelScope.launch {
            repository.verifyPhone("+91$phoneNumber")
        }
    }

    fun verifyCode(code: String) {
        viewModelScope.launch {
            repository.verifyCode(code)
        }
    }
}