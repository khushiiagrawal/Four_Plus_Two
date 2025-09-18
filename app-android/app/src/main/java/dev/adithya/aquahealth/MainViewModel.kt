package dev.adithya.aquahealth

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.user.model.UserProfileState
import dev.adithya.aquahealth.user.repository.UserRepository
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val userRepo: UserRepository
): ViewModel() {

    val userProfileState: StateFlow<UserProfileState> = userRepo.userProfileState

}