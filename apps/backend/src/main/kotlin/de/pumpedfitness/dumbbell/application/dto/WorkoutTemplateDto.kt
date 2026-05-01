package de.pumpedfitness.dumbbell.application.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Details of a workout template")
data class WorkoutTemplateDto(
    @Schema(description = "Unique identifier (UUID) of the template", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Owner user UUID", example = "a1b2c3d4-0000-0000-0000-000000000001")
    val userId: String,
    @Schema(description = "Name of the workout template", example = "Push Day A")
    val name: String,
    @Schema(description = "Optional description", example = "Chest, shoulders and triceps")
    val description: String?,
    @Schema(description = "Ordered list of exercises in this template")
    val exercises: List<WorkoutTemplateExerciseDto>,
    @Schema(description = "Creation timestamp (epoch ms)", example = "1714500000000")
    val createdAt: Long,
    @Schema(description = "Last update timestamp (epoch ms)", example = "1714500000000")
    val updatedAt: Long,
)
