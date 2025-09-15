package dev.adithya.aquahealth.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import dev.adithya.aquahealth.home.ui.HomeScreen
import dev.adithya.aquahealth.onboarding.ui.SignOnScreen
import dev.adithya.aquahealth.ui.navigation.Route.Companion.MAIN_ROUTE
import dev.adithya.aquahealth.ui.navigation.Route.Companion.ONBOARDING_ROUTE

@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    val isLoggedIn = remember { mutableStateOf(true) }
    NavHost(
        navController = navController,
        startDestination = if (isLoggedIn.value) MAIN_ROUTE else ONBOARDING_ROUTE
    ) {
        navigation(startDestination = Route.Onboarding.SignOn.subKey, route = ONBOARDING_ROUTE) {
            composable(Route.Onboarding.SignOn.subKey) {
                SignOnScreen(
                    navController = navController,
                    onSubmit = {
                        // TODO
                        isLoggedIn.value = true
                    }
                )
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