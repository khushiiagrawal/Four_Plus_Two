package dev.adithya.aquahealth.ui.navigation

sealed class Route(val key: String) {
    sealed class Onboarding(val subKey: String) : Route("$ONBOARDING_ROUTE/$subKey") {
        object SignOn : Onboarding("signOn")
        object UserInfo : Onboarding("userInfo")
        object AddSources : Onboarding("addSources")
    }

    object Splash : Route("splash")
    object Home : Route("home")
    object Search : Route("search")
    object Map : Route("map")
    object Report : Route("report")
    object Profile : Route("profile")
    object Settings : Route("settings")
    object Learn : Route("learn")

    object WaterSourceDetail : Route("waterSourceDetail/{waterSourceId}") {
        fun createRoute(waterSourceId: String) = "waterSourceDetail/$waterSourceId"
    }

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