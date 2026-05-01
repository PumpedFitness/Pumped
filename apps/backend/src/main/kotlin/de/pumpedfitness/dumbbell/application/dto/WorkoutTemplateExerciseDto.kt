package de.pumpedfitness.dumbbell.application.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "An exercise entry within a workout template")
data class WorkoutTemplateExerciseDto(
    @Schema(description = "Unique identifier (UUID) of this entry", example = "e1f2a3b4-0000-0000-0000-000000000001")
    val id: String,
    @Schema(description = "UUID of the parent workout template", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val workoutTemplateId: String,
    @Schema(description = "UUID of the exercise", example = "c1b2a3d4-0000-0000-0000-000000000002")
    val exerciseId: String,
    @Schema(description = "Position index within the template (0-based)", example = "0")
    val orderIndex: Int,
    @Schema(description = "Number of sets", example = "4")
    val sets: Int,
    @Schema(description = "Target reps (can be a range like '8-12')", example = "8-12")
    val targetReps: String,
    @Schema(description = "Target weight in kg", example = "80.0")
    val targetWeight: Double?,
    @Schema(description = "Rest between sets in seconds", example = "90")
    val restSeconds: Int?,
    @Schema(description = "Optional notes for this exercise", example = "Keep elbows tucked")
    val notes: String?,
    @Schema(description = "Creation timestamp (epoch ms)", example = "1714500000000")
    val createdAt: Long,
    @Schema(description = "Last update timestamp (epoch ms)", example = "1714500000000")
    val updatedAt: Long,
)
