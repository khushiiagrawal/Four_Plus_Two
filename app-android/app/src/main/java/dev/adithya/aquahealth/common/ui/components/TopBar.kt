package dev.adithya.aquahealth.common.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import dev.adithya.aquahealth.R
import dev.adithya.aquahealth.common.ui.navigation.NavItem
import dev.adithya.aquahealth.common.ui.navigation.Route

@OptIn(ExperimentalMaterial3ExpressiveApi::class, ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    scrollBehavior: TopAppBarScrollBehavior,
    navController: NavHostController,
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Route.Home.key
    val currentNavItem = NavItem.fromRoute(currentRoute)
    val buttonsEnabled = currentRoute != Route.Splash.key

    TopAppBar(
        title = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(R.drawable.app_logo),
                    contentDescription = "Logo",
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    text = stringResource(R.string.app_name),
                    style = MaterialTheme.typography.headlineSmall
                )
            }
        },
        actions = {
            IconButton(
                enabled = buttonsEnabled,
                onClick = { /* TODO: navigate to account page */ }
            ) {
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = ""
                )
            }
            IconButton(
                enabled = buttonsEnabled,
                onClick = { navController.navigate(Route.Settings.key) }
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = ""
                )
            }
        },
        scrollBehavior = scrollBehavior
    )
}