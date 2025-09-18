package dev.adithya.aquahealth.search.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.search.model.SearchItem
import dev.adithya.aquahealth.user.repository.UserRepository
import dev.adithya.aquahealth.watersource.repository.WaterSourceRepository
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val waterSourceRepository: WaterSourceRepository
): ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    @OptIn(FlowPreview::class)
    val searchResults: StateFlow<List<SearchItem>> =
        combine(
            waterSourceRepository.waterSources,
            userRepository.userWatchList,
            _searchQuery.debounce(500)
        ) { waterSources, watchList, searchQuery ->
            waterSources
                .filter {
                    searchQuery.isBlank() || it.name.contains(searchQuery, ignoreCase = true)
                }
                .map {
                    SearchItem(
                        waterSource = it,
                        isInWatchList = watchList.contains(it)
                    )
                }
        }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(),
                initialValue = emptyList()
            )

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun addToWatchList(item: SearchItem) {
        viewModelScope.launch {
            userRepository.addToWatchList(item.waterSource)
        }
    }

    fun removeFromWatchList(item: SearchItem) {
        viewModelScope.launch {
            userRepository.removeFromWatchList(item.waterSource)
        }
    }
}