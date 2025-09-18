package dev.adithya.aquahealth.learn.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import dev.adithya.aquahealth.learn.model.InfoPage
import dev.adithya.aquahealth.learn.model.MultipleChoiceQuestion
import dev.adithya.aquahealth.learn.viewmodel.LearningViewModel
import dev.adithya.aquahealth.ui.components.AppScaffold

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LearningScreen(
    navController: NavHostController,
    viewModel: LearningViewModel = hiltViewModel()
) {
    val currentPageIndex by viewModel.currentPageIndex.collectAsStateWithLifecycle()
    val currentPage by viewModel.currentPage.collectAsStateWithLifecycle()
    val selectedAnswerIndex by viewModel.selectedAnswerIndex.collectAsStateWithLifecycle()
    val showFeedback by viewModel.showFeedback.collectAsStateWithLifecycle()
    val isCorrectAnswer by viewModel.isCorrectAnswer.collectAsStateWithLifecycle()

    val lessonProgress = viewModel.getLessonProgress()
    val pageCount = viewModel.getPageCount()

    AppScaffold(
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                when (val page = currentPage) {
                    is InfoPage -> InfoPageContent(page = page)
                    is MultipleChoiceQuestion -> MultipleChoiceQuestionContent(
                        question = page,
                        selectedAnswerIndex = selectedAnswerIndex,
                        onAnswerSelected = viewModel::onAnswerSelected,
                        showFeedback = showFeedback,
                        isCorrectAnswer = isCorrectAnswer
                    )
                    else -> Text("Error: Unknown Page Type", color = MaterialTheme.colorScheme.error)
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Progress indicator
                LinearProgressIndicator(
                    progress = lessonProgress,
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Page ${currentPageIndex + 1} of $pageCount",
                    style = MaterialTheme.typography.labelSmall,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Feedback/Explanation for Questions
                if (currentPage is MultipleChoiceQuestion && showFeedback) {
                    val explanation = (currentPage as MultipleChoiceQuestion).explanation
                    if (explanation != null) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isCorrectAnswer == true)
                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                                else
                                    MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                            )
                        ) {
                            Text(
                                text = explanation,
                                style = MaterialTheme.typography.bodySmall,
                                color = if (isCorrectAnswer == true)
                                    MaterialTheme.colorScheme.onPrimaryContainer
                                else
                                    MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }

                // Action Button (Check Answer / Continue)
                Button(
                    onClick = {
                        if (currentPage is MultipleChoiceQuestion && !showFeedback) {
                            viewModel.onCheckAnswerClicked()
                        } else {
                            viewModel.onContinueClicked {
                                navController.popBackStack()
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = when (currentPage) {
                        is MultipleChoiceQuestion -> showFeedback || viewModel.canCheckAnswer()
                        is InfoPage -> true
                        else -> false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (currentPage is MultipleChoiceQuestion && showFeedback) {
                            if (isCorrectAnswer == true) Color(0xFF4CAF50) /* Green */ else MaterialTheme.colorScheme.error /* Red */
                        } else {
                            MaterialTheme.colorScheme.primary
                        }
                    )
                ) {
                    Text(
                        text = if (currentPage is MultipleChoiceQuestion && !showFeedback) "Check Answer" else "Continue",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun InfoPageContent(page: InfoPage) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = page.title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        Text(
            text = page.content,
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

@Composable
fun MultipleChoiceQuestionContent(
    question: MultipleChoiceQuestion,
    selectedAnswerIndex: Int?,
    onAnswerSelected: (Int) -> Unit,
    showFeedback: Boolean,
    isCorrectAnswer: Boolean?
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = question.question,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        question.options.forEachIndexed { index, option ->
            val isSelected = index == selectedAnswerIndex

            val borderColor = if (showFeedback) {
                if (index == question.correctAnswerIndex) Color(0xFF4CAF50) // Green
                else if (isSelected && isCorrectAnswer == false) MaterialTheme.colorScheme.error
                else Color.Transparent
            } else if (isSelected) {
                MaterialTheme.colorScheme.primary // Highlight selected option
            } else {
                MaterialTheme.colorScheme.outlineVariant // Default border
            }

            val backgroundColor = if (showFeedback) {
                if (index == question.correctAnswerIndex) Color(0xFFE8F5E9) // Very light green
                else if (isSelected && isCorrectAnswer == false) Color(0xFFFFEBEE) // Very light red
                else MaterialTheme.colorScheme.surfaceVariant // Default for unselected wrong answers
            } else if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer // Light primary for selected
            } else {
                MaterialTheme.colorScheme.surface // Default
            }

            val textColor = if (showFeedback) {
                if (index == question.correctAnswerIndex) Color.DarkGray
                else if (isSelected && isCorrectAnswer == false) MaterialTheme.colorScheme.error
                else MaterialTheme.colorScheme.onSurfaceVariant
            } else {
                MaterialTheme.colorScheme.onSurface
            }


            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable(enabled = !showFeedback) { onAnswerSelected(index) },
                colors = CardDefaults.cardColors(
                    containerColor = backgroundColor,
                    contentColor = textColor
                ),
                border = BorderStroke(1.5.dp, borderColor),
                elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected && !showFeedback) 4.dp else 1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = option, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}