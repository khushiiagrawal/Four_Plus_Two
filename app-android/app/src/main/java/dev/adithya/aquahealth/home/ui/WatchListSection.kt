package dev.adithya.aquahealth.home.ui

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.animateScrollBy
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.adithya.aquahealth.common.ui.theme.AppColors
import dev.adithya.aquahealth.home.model.WatchListItem
import dev.adithya.aquahealth.home.viewmodel.HomeViewModel
import kotlinx.coroutines.launch

@Composable
fun WatchListSection(
    viewModel: HomeViewModel,
    onItemClick: (WatchListItem) -> Unit,
    onEditClick: () -> Unit
) {
    val watchListItems by viewModel.watchlistItems.collectAsState()
    val lazyListState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val density = LocalDensity.current

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "My Watchlist",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "Edit",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
                textDecoration = TextDecoration.Underline,
                modifier = Modifier
                    .clickable(onClick = onEditClick)
                    .padding(end = 8.dp)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))

        if (watchListItems.isEmpty()) {
            Text(
                text = "No water bodies in your watchlist.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
            ) {
                LazyRow(
                    state = lazyListState,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(watchListItems) { item ->
                        WatchlistItemCard(item = item, onClick = { onItemClick(item) })
                    }
                }

                // Floating arrows
                // Scroll by one card width + spacing
                val scrollAmount = with(density) { (160.dp + 12.dp).toPx() }
                androidx.compose.animation.AnimatedVisibility(
                    visible = lazyListState.canScrollBackward,
                    enter = fadeIn(),
                    exit = fadeOut(),
                    modifier = Modifier.align(Alignment.CenterStart)
                ) {
                    ArrowButton(
                        direction = ScrollDirection.LEFT,
                        onClick = {
                            coroutineScope.launch {
                                lazyListState.animateScrollBy(-scrollAmount)
                            }
                        }
                    )
                }
                androidx.compose.animation.AnimatedVisibility(
                    visible = lazyListState.canScrollForward,
                    enter = fadeIn(),
                    exit = fadeOut(),
                    modifier = Modifier.align(Alignment.CenterEnd)
                ) {
                    ArrowButton(
                        direction = ScrollDirection.RIGHT,
                        onClick = {
                            coroutineScope.launch {
                                lazyListState.animateScrollBy(scrollAmount)
                            }
                        }
                    )
                }
            }
        }
    }
}

enum class ScrollDirection { LEFT, RIGHT }

@Composable
fun ArrowButton(
    direction: ScrollDirection,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    IconButton(
        onClick = onClick,
        modifier = modifier
            .size(28.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.6f))
    ) {
        Icon(
            imageVector = if (direction == ScrollDirection.LEFT) Icons.Default.KeyboardArrowLeft else Icons.Default.KeyboardArrowRight,
            contentDescription = if (direction == ScrollDirection.LEFT) "Scroll left" else "Scroll right",
            tint = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.size(24.dp)
        )
    }
}

@Composable
fun WatchlistItemCard(item: WatchListItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .height(100.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = item.waterSource.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                val color = item.alertSeverity?.toColor() ?: AppColors.normal
                val label = item.alertSeverity?.toText() ?: "Safe"
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(color, CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}