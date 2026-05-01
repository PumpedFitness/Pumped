package de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Request to update an existing workout template")
data class UpdateWorkoutTemplateRequest(
    @field:NotBlank(message = "Name must not be blank")
    @field:Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Schema(description = "New name of the workout template", example = "Push Day B")
    val name: String,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Updated description", example = "Updated chest and shoulder focus")
    val description: String?,

    @field:Valid
    @Schema(description = "Optional recurrence schedule for the template. Use null to remove the schedule.")
    val schedule: WorkoutTemplateScheduleRequest?,
)
