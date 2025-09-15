package dev.adithya.aquahealth.onboarding.ui

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import dev.adithya.aquahealth.ui.navigation.Route

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScaffold(
    navController: NavHostController,
    content: @Composable (PaddingValues) -> Unit
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val title = when (currentRoute) {
        Route.Onboarding.SignOn.key -> "Welcome"
        Route.Onboarding.UserInfo.key -> "Register"
        Route.Onboarding.AddSources.key -> "Add Water Sources"
        else -> ""
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(title) }
            )
        },
        // TODO ADD BACK BUTTON
        content = content
    )
}