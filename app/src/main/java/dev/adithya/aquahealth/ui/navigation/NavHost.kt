package dev.adithya.aquahealth.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import dev.adithya.aquahealth.MainViewModel
import dev.adithya.aquahealth.home.ui.HomeScreen
import dev.adithya.aquahealth.onboarding.ui.SignOnScreen
import dev.adithya.aquahealth.ui.components.SplashScreen
import dev.adithya.aquahealth.ui.navigation.Route.Companion.MAIN_ROUTE
import dev.adithya.aquahealth.ui.navigation.Route.Companion.ONBOARDING_ROUTE
import dev.adithya.aquahealth.user.model.UserProfileState

@Composable
fun AppNavHost(
    viewModel: MainViewModel = hiltViewModel()
) {
    val navController = rememberNavController()
    val profileState = viewModel.userProfileState.collectAsState()

    LaunchedEffect(profileState.value) {
        val destination = when (profileState.value) {
            is UserProfileState.LoggedIn -> MAIN_ROUTE
            is UserProfileState.LoggedOut -> ONBOARDING_ROUTE
            else -> null
        }

        destination?.let {
            navController.navigate(it) {
                popUpTo(Route.Splash.key) {
                    inclusive = true
                }
                launchSingleTop = true
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = Route.Splash.key
    ) {
        composable(Route.Splash.key) {
            SplashScreen(navController = navController)
        }
        navigation(startDestination = Route.Onboarding.SignOn.subKey, route = ONBOARDING_ROUTE) {
            composable(Route.Onboarding.SignOn.subKey) {
                SignOnScreen(navController = navController)
            }
            // TODO add rem
        }
        navigation(startDestination = Route.Home.key, route = MAIN_ROUTE) {
            composable(Route.Home.key) {
                HomeScreen(
                    navController = navController
                )
            }
            // TODO add rem
        }
    }
}