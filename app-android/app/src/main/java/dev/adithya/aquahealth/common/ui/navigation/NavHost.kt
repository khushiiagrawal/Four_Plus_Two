package dev.adithya.aquahealth.common.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import dev.adithya.aquahealth.MainViewModel
import dev.adithya.aquahealth.common.ui.components.SplashScreen
import dev.adithya.aquahealth.common.ui.navigation.Route.Companion.MAIN_ROUTE
import dev.adithya.aquahealth.common.ui.navigation.Route.Companion.ONBOARDING_ROUTE
import dev.adithya.aquahealth.home.ui.HomeScreen
import dev.adithya.aquahealth.learn.ui.LearningScreen
import dev.adithya.aquahealth.map.ui.MapScreen
import dev.adithya.aquahealth.onboarding.ui.SignOnScreen
import dev.adithya.aquahealth.report.ui.UserReportScreen
import dev.adithya.aquahealth.search.ui.SearchScreen
import dev.adithya.aquahealth.settings.ui.SettingsScreen
import dev.adithya.aquahealth.user.model.UserProfileState
import dev.adithya.aquahealth.watersource.ui.WaterSourceDetailScreen

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
            composable(Route.Search.key) {
                SearchScreen(
                    navController = navController
                )
            }
            composable(Route.Report.key) {
                UserReportScreen(
                    navController = navController
                )
            }
            composable(Route.Settings.key) {
                SettingsScreen(
                    navController = navController
                )
            }
            composable(Route.Learn.key) {
                LearningScreen(
                    navController = navController
                )
            }
            composable(Route.Map.key) {
                MapScreen(
                    navController = navController
                )
            }
            composable(
                route = Route.WaterSourceDetail.key,
                arguments = listOf(
                    navArgument("waterSourceId") { type = NavType.StringType }
                )
            ) {
                WaterSourceDetailScreen(
                    navController = navController
                )
            }
        }
    }
}