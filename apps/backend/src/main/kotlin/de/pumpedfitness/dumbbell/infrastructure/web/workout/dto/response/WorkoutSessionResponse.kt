package de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response representing a workout session")
data class WorkoutSessionResponse(
    @Schema(description = "UUID of the session", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Optional UUID of the source template", example = "b1c2d3e4-0000-0000-0000-000000000002")
    val workoutTemplateId: String?,
    @Schema(description = "Name of the session", example = "Monday Push")
    val name: String,
    @Schema(description = "Start time (epoch ms)", example = "1714500000000")
    val startedAt: Long,
    @Schema(description = "End time (epoch ms), null if still in progress", example = "1714503600000")
    val endedAt: Long?,
    @Schema(description = "Optional notes", example = "Felt strong today")
    val notes: String?,
)
