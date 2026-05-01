package de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateExerciseDto
import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response representing a workout template")
data class WorkoutTemplateResponse(
    @Schema(description = "UUID of the template", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Name of the template", example = "Push Day A")
    val name: String,
    @Schema(description = "Optional description", example = "Chest, shoulders and triceps")
    val description: String?,
    @Schema(description = "Ordered exercises in this template")
    val exercises: List<WorkoutTemplateExerciseDto>,
    @Schema(description = "Creation timestamp (epoch ms)", example = "1714500000000")
    val createdAt: Long,
    @Schema(description = "Last update timestamp (epoch ms)", example = "1714500000000")
    val updatedAt: Long,
)
