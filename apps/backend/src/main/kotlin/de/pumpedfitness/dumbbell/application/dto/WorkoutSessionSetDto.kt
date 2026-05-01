package de.pumpedfitness.dumbbell.application.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "A single set performed within a workout session")
data class WorkoutSessionSetDto(
    @Schema(description = "UUID of this set", example = "f1e2d3c4-0000-0000-0000-000000000001")
    val id: String,
    @Schema(description = "UUID of the parent workout session", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val workoutSessionId: String,
    @Schema(description = "UUID of the exercise performed", example = "c1b2a3d4-0000-0000-0000-000000000002")
    val exerciseId: String,
    @Schema(description = "Index of this set within the exercise (0-based)", example = "0")
    val setIndex: Int,
    @Schema(description = "Number of reps completed", example = "10")
    val reps: Int,
    @Schema(description = "Weight used in kg", example = "80.0")
    val weight: Double?,
    @Schema(description = "Rest time after this set in seconds", example = "90")
    val restSeconds: Int?,
    @Schema(description = "Duration of the set in seconds (for timed exercises)", example = "30")
    val durationSeconds: Int?,
    @Schema(description = "Optional notes", example = "Felt heavy")
    val notes: String?,
    @Schema(description = "Time this set was performed (epoch ms)", example = "1714500500000")
    val performedAt: Long,
)
