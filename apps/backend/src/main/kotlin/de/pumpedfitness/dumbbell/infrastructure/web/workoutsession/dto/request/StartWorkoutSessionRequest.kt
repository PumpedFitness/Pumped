package de.pumpedfitness.dumbbell.infrastructure.web.workoutsession.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

private const val UUID_REGEXP = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"

@Schema(description = "Request to start a new workout session")
data class StartWorkoutSessionRequest(
    @field:NotBlank(message = "Name must not be blank")
    @field:Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Schema(description = "Name of the session", example = "Monday Push")
    val name: String,

    @field:Pattern(regexp = UUID_REGEXP, message = "workoutTemplateId must be a valid UUID")
    @Schema(description = "Optional UUID of a workout template to base this session on", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val workoutTemplateId: String?,

    @field:Size(max = 500, message = "Notes must not exceed 500 characters")
    @Schema(description = "Optional notes", example = "Feeling strong")
    val notes: String?,
)
