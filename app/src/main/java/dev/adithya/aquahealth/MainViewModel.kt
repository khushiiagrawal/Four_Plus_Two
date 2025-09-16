package dev.adithya.aquahealth

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.user.repository.UserRepository
import kotlinx.coroutines.flow.map
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val userRepo: UserRepository
): ViewModel() {

    val isLoggedIn = userRepo.userProfile
        .map { it != null }
}