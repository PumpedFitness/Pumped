package de.pumpedfitness.dumbbell.application.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "A concrete logged workout session")
data class WorkoutSessionDto(
    @Schema(description = "UUID of the session", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Owner user UUID", example = "a1b2c3d4-0000-0000-0000-000000000001")
    val userId: String,
    @Schema(description = "Optional UUID of the template this session was based on", example = "b1c2d3e4-0000-0000-0000-000000000002")
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
