package de.pumpedfitness.dumbbell.infrastructure.web.workoutsession.dto.response

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response representing a logged set")
data class WorkoutSessionSetResponse(
    @Schema(description = "UUID of this set", example = "f1e2d3c4-0000-0000-0000-000000000001")
    val id: String,
    @Schema(description = "UUID of the exercise performed", example = "c1b2a3d4-0000-0000-0000-000000000002")
    val exerciseId: String,
    @Schema(description = "Index of this set (0-based)", example = "0")
    val setIndex: Int,
    @Schema(description = "Reps completed", example = "10")
    val reps: Int,
    @Schema(description = "Weight in kg", example = "80.0")
    val weight: Double?,
    @Schema(description = "Rest time in seconds", example = "90")
    val restSeconds: Int?,
    @Schema(description = "Duration in seconds", example = "30")
    val durationSeconds: Int?,
    @Schema(description = "Optional notes", example = "Felt heavy")
    val notes: String?,
    @Schema(description = "Time performed (epoch ms)", example = "1714500500000")
    val performedAt: Long,
)
