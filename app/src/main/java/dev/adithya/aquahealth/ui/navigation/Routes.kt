package dev.adithya.aquahealth.ui.navigation

sealed class Route(val key: String) {
    sealed class Onboarding(val subKey: String) : Route("$ONBOARDING_ROUTE/$subKey") {
        data object SignOn : Onboarding("signOn")
        data object UserInfo : Onboarding("userInfo")
        data object AddSources : Onboarding("addSources")
    }

    data object Splash : Route("splash")
    data object Home : Route("home")
    data object Search : Route("search")
    data object Map : Route("map")
    data object Report : Route("report")
    data object Profile : Route("profile")
    data object Settings : Route("settings")

    companion object {
        const val ONBOARDING_ROUTE = "onboarding"
        const val MAIN_ROUTE = "main"

        fun fromRoute(route: String?): Route {
            return when (route) {
                Home.key -> Home
                Search.key -> Search
                Map.key -> Map
                Report.key -> Report
                Profile.key -> Profile
                Settings.key -> Settings
                else -> {
                    if (route?.startsWith(ONBOARDING_ROUTE) ?: false) {
                        val subRoute = route.substringAfter("$ONBOARDING_ROUTE/")
                        when (subRoute) {
                            Onboarding.SignOn.key -> Onboarding.SignOn
                            Onboarding.UserInfo.key -> Onboarding.UserInfo
                            Onboarding.AddSources.key -> Onboarding.AddSources
                            else -> Onboarding.SignOn
                        }
                    } else {
                        // Default to login screen
                        Onboarding.SignOn
                    }
                }
            }
        }
    }
}