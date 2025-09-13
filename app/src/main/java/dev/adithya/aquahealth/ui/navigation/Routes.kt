package dev.adithya.aquahealth.ui.navigation

sealed class Route(val route: String) {
    data object Home : Route("home")

    companion object {
        fun fromRoute(route: String?): Route {
            return when (route) {
                Home.route -> Home
                else -> Home
            }
        }
    }
}