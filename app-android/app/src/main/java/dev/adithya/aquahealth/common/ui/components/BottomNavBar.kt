package dev.adithya.aquahealth.common.ui.components

import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import dev.adithya.aquahealth.common.ui.navigation.NavItem
import dev.adithya.aquahealth.common.ui.navigation.Route

@Composable
fun AppBottomNavBar(
    navController: NavHostController
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val enabled = currentRoute != Route.Splash.key

    NavigationBar {
        NavItem.entries.forEach { navItem ->
            NavigationBarItem(
                enabled = enabled,
                selected = currentRoute == navItem.route.key,
                onClick = {
                    if (currentRoute != navItem.route.key) {
                        navController.navigate(navItem.route.key) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                icon = {
                    Icon(
                        imageVector = navItem.icon,
                        contentDescription = navItem.title
                    )
                },
                label = {
                    Text(text = navItem.title)
                }
            )
        }
    }
}