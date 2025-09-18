package dev.adithya.aquahealth.learn.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.adithya.aquahealth.learn.model.LearningContent
import dev.adithya.aquahealth.learn.model.LearningPage
import dev.adithya.aquahealth.learn.model.MultipleChoiceQuestion
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LearningViewModel @Inject constructor() : ViewModel() {
    private val lessonContent = LearningContent.basicWaterHealthLesson

    private val _currentPageIndex = MutableStateFlow(0)
    val currentPageIndex: StateFlow<Int> = _currentPageIndex.asStateFlow()

    val currentPage: StateFlow<LearningPage> = MutableStateFlow(lessonContent.first())

    private val _selectedAnswerIndex = MutableStateFlow<Int?>(null)
    val selectedAnswerIndex: StateFlow<Int?> = _selectedAnswerIndex.asStateFlow()

    private val _showFeedback = MutableStateFlow(false)
    val showFeedback: StateFlow<Boolean> = _showFeedback.asStateFlow()

    private val _isCorrectAnswer = MutableStateFlow<Boolean?>(null)
    val isCorrectAnswer: StateFlow<Boolean?> = _isCorrectAnswer.asStateFlow()

    init {
        // Update currentPage whenever currentPageIndex changes
        viewModelScope.launch {
            currentPageIndex.collect { index ->
                if (index < lessonContent.size) {
                    (currentPage as MutableStateFlow).value = lessonContent[index]
                    resetPageState()
                }
            }
        }
    }

    private fun resetPageState() {
        _selectedAnswerIndex.value = null
        _showFeedback.value = false
        _isCorrectAnswer.value = null
    }

    fun onContinueClicked(onLessonComplete: () -> Unit) {
        if (_currentPageIndex.value < lessonContent.size - 1) {
            _currentPageIndex.update { it + 1 }
        } else {
            onLessonComplete()
        }
    }

    fun onAnswerSelected(index: Int) {
        // Only allow selection if it's a question page and feedback isn't already shown
        if (currentPage.value is MultipleChoiceQuestion && !_showFeedback.value) {
            _selectedAnswerIndex.value = index
        }
    }

    fun onCheckAnswerClicked() {
        val currentQuestion = currentPage.value as? MultipleChoiceQuestion
        if (currentQuestion != null && _selectedAnswerIndex.value != null) {
            val isCorrect = _selectedAnswerIndex.value == currentQuestion.correctAnswerIndex
            _isCorrectAnswer.value = isCorrect
            _showFeedback.value = true
        }
    }

    fun canCheckAnswer(): Boolean {
        return currentPage.value is MultipleChoiceQuestion &&
                _selectedAnswerIndex.value != null &&
                !_showFeedback.value
    }

    fun getLessonProgress(): Float {
        return (_currentPageIndex.value + 1).toFloat() / lessonContent.size.toFloat()
    }

    fun getPageCount(): Int = lessonContent.size
}