package dev.adithya.aquahealth.map.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import dev.adithya.aquahealth.common.ui.components.AppScaffold
import dev.adithya.aquahealth.common.ui.navigation.Route
import dev.adithya.aquahealth.map.viewmodel.MapViewModel

private val CENTER_OF_INDIA = LatLng(20.5937, 78.9629)
private const val MAP_LOADED_ZOOM = 14f

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    navController: NavHostController,
    viewModel: MapViewModel = hiltViewModel()
) {
    val waterSources by viewModel.waterSources.collectAsState()
    var isMapContentReady by rememberSaveable { mutableStateOf(false) }
    var isMapLoaded by rememberSaveable { mutableStateOf(false) }

    val cameraPositionState = rememberCameraPositionState {
        // initial position
        position = CameraPosition.fromLatLngZoom(CENTER_OF_INDIA, 1f)
    }

    // Load map only after data is available
    LaunchedEffect(waterSources, isMapLoaded) {
        if (waterSources.isNotEmpty()) {
            isMapContentReady = true
            if (isMapLoaded) {
                val firstSource = waterSources.first()
                val location = LatLng(firstSource.location.latitude, firstSource.location.longitude)

                // Move map to the first water source
                cameraPositionState.animate(
                    update = CameraUpdateFactory.newLatLngZoom(
                        location,
                        MAP_LOADED_ZOOM
                    ),
                    durationMs = 1000
                )
            }
        }
    }

    AppScaffold(
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Map View",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(vertical = 16.dp)
            )
            // Google Map composable
            Box(modifier = Modifier.fillMaxSize()) {
                GoogleMap(
                    onMapLoaded = { isMapLoaded = true },
                    cameraPositionState = cameraPositionState,
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Add markers for each water source
                    waterSources.forEach { source ->
                        Marker(
                            state = MarkerState(
                                position = LatLng(
                                    source.location.latitude,
                                    source.location.longitude
                                )
                            ),
                            title = source.name,
                            // TODO: show status
                            snippet = source.location.address,
                            onInfoWindowClick = {
                                navController.navigate(
                                    Route.WaterSourceDetail.createRoute(
                                        source.id
                                    )
                                )
                            }
                        )
                    }
                }
                if (!isMapLoaded || !isMapContentReady) {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}
