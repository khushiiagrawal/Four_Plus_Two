package dev.adithya.aquahealth.home.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Message
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.alert.ui.AlertCard
import dev.adithya.aquahealth.home.viewmodel.HomeViewModel
import dev.adithya.aquahealth.ui.components.AppScaffold
import dev.adithya.aquahealth.ui.navigation.Route
import dev.adithya.aquahealth.ui.theme.AppColors

@Composable
fun HomeScreen(
    navController: NavHostController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val alerts by viewModel.recentAlerts.collectAsState()

    AppScaffold(
        navController = navController
    )  { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                // Live Statistics
                // TODO: use real data
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Live Statistics",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            MetricCard(
                                modifier = Modifier.weight(1f),
                                innerModifier = Modifier.fillMaxWidth(),
                                title = "Water Quality Index",
                                value = "Good (92)",
                                valueColor = AppColors.normal
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            MetricCard(
                                modifier = Modifier.weight(1f),
                                innerModifier = Modifier.fillMaxWidth(),
                                title = "Total Cases",
                                value = "24",
                                valueColor = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                item {
                    HorizontalDivider(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        thickness = 0.5.dp,
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                }

                // Watchlist
                item {
                    WatchListSection(
                        viewModel = viewModel,
                        onItemClick = {
                            navController.navigate(
                                Route.WaterSourceDetail.createRoute(it.waterSource.id)
                            )
                        },
                        onEditClick = {
                            navController.navigate(Route.Search.key)
                        }
                    )
                }

                item {
                    HorizontalDivider(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        thickness = 0.5.dp,
                        color = MaterialTheme.colorScheme.outlineVariant
                    )
                }

                // Alerts
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Recent Alerts",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                if (alerts.isEmpty()) {
                    item {
                        Text(
                            text = "No recent alerts.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                } else {
                    items(alerts) { alertItem ->
                        AlertCard(alertItem = alertItem, onClick = { /*TODO*/ })
                    }
                }
            }

            // Chatbot
            FloatingActionButton(
                onClick = { /* TODO */ },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Icon(Icons.Default.Message, "Chatbot")
            }
        }
    }
}