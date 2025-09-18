package dev.adithya.aquahealth.search.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SearchBar
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.search.model.SearchItem
import dev.adithya.aquahealth.search.viewmodel.SearchViewModel
import dev.adithya.aquahealth.ui.components.AppScaffold
import dev.adithya.aquahealth.ui.navigation.Route

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    navController: NavHostController,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val searchResults by viewModel.searchResults.collectAsStateWithLifecycle()

    AppScaffold(
        navController = navController,
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            Text(
                text = "Water Bodies",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(top = 16.dp)
            )
            SearchBar(
                inputField = {
                    SearchBarDefaults.InputField(
                        query = searchQuery,
                        onQueryChange = { viewModel.updateSearchQuery(it) },
                        onSearch = {},
                        expanded = false,
                        onExpandedChange = { },
                        placeholder = { Text("Search for a water body") }
                    )
                },
                expanded = false,
                onExpandedChange = { },
                modifier = Modifier.padding(bottom = 32.dp)
            ) {}

            if (searchQuery.isNotBlank() && searchResults.isEmpty()) {
                Text(
                    text = "No water sources found for \"$searchQuery\".",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(searchResults) { item ->
                        SearchResultListItem(
                            item = item,
                            onAddToWatchList = { viewModel.addToWatchList(item) },
                            onRemoveFromWatchList = { viewModel.removeFromWatchList(item) },
                            onClick = {
                                navController.navigate(Route.WaterSourceDetail.createRoute(item.waterSource.id))
                            }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun SearchResultListItem(
    item: SearchItem,
    onAddToWatchList: (SearchItem) -> Unit,
    onRemoveFromWatchList: (SearchItem) -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ListItem(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        headlineContent = {
            Text(
                text = item.waterSource.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        supportingContent = {
            item.waterSource.location.address?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        },
        trailingContent = {
            IconButton(
                onClick = {
                    if (item.isInWatchList) onRemoveFromWatchList(item) else onAddToWatchList(item)
                }
            ) {
                Icon(
                    imageVector = if (item.isInWatchList) {
                        Icons.Default.Star
                    } else {
                        Icons.Filled.StarBorder
                    },
                    contentDescription = if (item.isInWatchList) {
                        "Remove from watchlist"
                    } else {
                        "Add to watchlist"
                    },
                )
            }
        }
    )
}