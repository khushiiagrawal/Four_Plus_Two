package dev.adithya.aquahealth.learn.model

import java.util.UUID

sealed class LearningPage(
    val id: String = UUID.randomUUID().toString()
)

data class InfoPage(
    val title: String,
    val content: String
) : LearningPage()

data class MultipleChoiceQuestion(
    val question: String,
    val options: List<String>,
    val correctAnswerIndex: Int,
    val explanation: String? = null
) : LearningPage()

/**
 * Predefined data for now.
 * TODO: load from firebase
 */
object LearningContent {
    val basicWaterHealthLesson = listOf(
        InfoPage(
            title = "Introduction to Water Health",
            content = "Clean water is fundamental to human health. Contaminated water can lead to various diseases affecting millions globally. Understanding common waterborne illnesses and prevention is key to a healthier community."
        ),
        MultipleChoiceQuestion(
            question = "Which of these is a primary benefit of clean drinking water?",
            options = listOf(
                "It makes laundry cleaner",
                "It prevents waterborne diseases",
                "It improves electricity supply",
                "It has no direct health benefits"
            ),
            correctAnswerIndex = 1,
            explanation = "Clean drinking water significantly reduces the risk of contracting waterborne diseases like cholera, typhoid, and dysentery, which are major public health concerns."
        ),
        InfoPage(
            title = "Common Waterborne Diseases",
            content = "Waterborne diseases are caused by pathogenic microorganisms transmitted through contaminated water. Common examples include:\n\n" +
                    "• Cholera: Severe watery diarrhea, dehydration.\n" +
                    "• Typhoid Fever: High fever, weakness, stomach pain, headache.\n" +
                    "• Dysentery: Bloody diarrhea, fever, abdominal cramps.\n" +
                    "• Giardiasis: Diarrhea, gas, stomach cramps, nausea.\n" +
                    "• Hepatitis A: Liver inflammation, fatigue, nausea, jaundice.\n\n" +
                    "These diseases can be life-threatening, especially for children and immunocompromised individuals."
        ),
        MultipleChoiceQuestion(
            question = "What is a common symptom of Cholera?",
            options = listOf(
                "Skin rash",
                "Severe watery diarrhea",
                "Joint pain",
                "Difficulty breathing"
            ),
            correctAnswerIndex = 1,
            explanation = "Cholera is characterized by severe watery diarrhea, often leading to rapid dehydration if untreated."
        ),
        InfoPage(
            title = "Prevention Strategies",
            content = "Preventing waterborne diseases involves several key strategies:\n\n" +
                    "1.  Safe Water Sources: Using protected wells, boreholes, or treated municipal water.\n" +
                    "2.  Water Treatment: Boiling, chlorination, filtration, or solar disinfection at home.\n" +
                    "3.  Proper Sanitation: Using improved latrines and disposing of waste safely.\n" +
                    "4.  Hygiene Practices: Regular handwashing with soap and water, especially before eating and after using the toilet.\n" +
                    "5.  Food Safety: Washing fruits and vegetables with clean water, cooking food thoroughly."
        ),
        MultipleChoiceQuestion(
            question = "Which method is effective for treating water at home to make it safe to drink?",
            options = listOf(
                "Adding sugar",
                "Leaving it uncovered overnight",
                "Boiling for at least one minute",
                "Stirring vigorously"
            ),
            correctAnswerIndex = 2,
            explanation = "Boiling water for at least one minute (or longer at high altitudes) effectively kills most bacteria, viruses, and parasites that cause waterborne diseases."
        ),
        InfoPage(
            title = "Conclusion: Your Role",
            content = "By understanding the risks and practicing prevention, you can contribute to better water health for yourself and your community. Stay informed and advocate for clean water access!"
        )
    )
}