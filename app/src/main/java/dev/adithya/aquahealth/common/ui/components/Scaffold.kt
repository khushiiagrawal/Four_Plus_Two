package dev.adithya.aquahealth.common.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffold(
    navController: NavHostController,
    content: @Composable ((PaddingValues) -> Unit)
) {
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            AppTopBar(
                scrollBehavior = scrollBehavior,
                navController = navController
            )
        },
        bottomBar = {
            AppBottomNavBar(
                navController = navController
            )
        },
        content = content
    )
}