package dev.adithya.aquahealth.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.ui.graphics.vector.ImageVector

enum class NavItem(
    val title: String,
    val icon: ImageVector,
    val route: Route
) {
    Home(
        title = "AquaHealth",
        icon = Icons.Default.Home,
        route = Route.Home
    );

     companion object {
         fun fromRoute(route: String): NavItem {
             return NavItem.entries.find { it.route.route == route } ?: Home
         }
     }
}