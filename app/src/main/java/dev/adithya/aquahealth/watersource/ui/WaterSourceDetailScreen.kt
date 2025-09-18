package dev.adithya.aquahealth.watersource.ui

import android.content.Intent
import android.icu.text.SimpleDateFormat
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.alert.ui.AlertCard
import dev.adithya.aquahealth.home.ui.MetricCard
import dev.adithya.aquahealth.ui.components.AppScaffold
import dev.adithya.aquahealth.ui.theme.AppColors
import dev.adithya.aquahealth.watersource.viewmodel.WaterSourceDetailViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WaterSourceDetailScreen(
    navController: NavHostController,
    viewModel: WaterSourceDetailViewModel = hiltViewModel()
) {
    val waterSource by viewModel.waterSource.collectAsStateWithLifecycle()
    val alerts by viewModel.alerts.collectAsStateWithLifecycle()
    val context = LocalContext.current

    val severity by remember {
        derivedStateOf {
            alerts.minByOrNull { it.severity }?.severity
        }
    }

    AppScaffold(
        navController = navController,
    ) { paddingValues ->
        waterSource?.let { source ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilledIconButton(
                            onClick = { navController.popBackStack() },
                            colors = IconButtonDefaults.filledIconButtonColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                            ),
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back"
                            )
                        }
                        Text(
                            text = source.name,
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val lastUpdated = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                            .format(waterSource?.lastUpdated)
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = "Last updated"
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "Last updated: ",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            lastUpdated,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Last updated"
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = source.location.address ?:
                            "Lat: ${source.location.latitude}, Lon: ${source.location.longitude}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary,
                            textDecoration = TextDecoration.Underline,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier
                                .clickable {
                                    val uri = "geo:${source.location.latitude},${source.location.longitude}".toUri()
                                    val mapIntent = Intent(Intent.ACTION_VIEW, uri)
                                    mapIntent.setPackage("com.google.android.apps.maps")
                                    context.startActivity(mapIntent)
                                }
                        )
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        MetricCard(
                            title = "Status",
                            value = severity?.toText() ?: "Safe",
                            valueColor = severity?.toColor() ?: AppColors.normal
                        )
                        MetricCard(
                            title = "Water Quality Index",
                            value = "Good (88)",
                            valueColor = AppColors.normal
                        )
                        MetricCard(
                            title = "Total Cases",
                            value = "8",
                            valueColor = MaterialTheme.colorScheme.primary
                        )
                        MetricCard(
                            title = "TDS",
                            value = "120 ppm",
                            valueColor = AppColors.normal
                        )
                        MetricCard(
                            title = "pH Level",
                            value = "7.2",
                            valueColor = AppColors.normal
                        )
                        MetricCard(
                            title = "Turbidity",
                            value = "4.5 NTU",
                            valueColor = AppColors.warning
                        )
                        MetricCard(
                            title = "Contaminant Risk",
                            value = "Low",
                            valueColor = AppColors.normal
                        )
                    }
                }

                item {
                    Text(
                        "Recent Alerts",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }

                if (alerts.isEmpty()) {
                    item {
                        Text(
                            "No recent alerts for this water source.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    items(alerts) { alert ->
                        AlertCard(
                            alertItem = alert,
                            onClick = { /* TODO: Navigate to alert detail */ }
                        )
                    }
                }
            }
        } ?: Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    }
}
