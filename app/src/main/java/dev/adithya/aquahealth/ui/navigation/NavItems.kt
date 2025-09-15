package dev.adithya.aquahealth.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Search
import androidx.compose.ui.graphics.vector.ImageVector

enum class NavItem(
    val title: String,
    val icon: ImageVector,
    val route: Route
) {
    Home(
        title = "Home",
        icon = Icons.Default.Home,
        route = Route.Home
    ),
    Search(
        title = "Search",
        icon = Icons.Default.Search,
        route = Route.Search
    ),
    Map(
        title = "Map",
        icon = Icons.Default.Map,
        route = Route.Map
    ),
    Report(
        title = "Report",
        icon = Icons.Default.Report,
        route = Route.Report
    );

     companion object {
         fun fromRoute(route: String): NavItem {
             return NavItem.entries.find { it.route.key == route } ?: Home
         }
     }
}