package de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

@Schema(description = "Request to create a new workout template")
data class CreateWorkoutTemplateRequest(
    @field:NotBlank(message = "Name must not be blank")
    @field:Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    @Schema(description = "Name of the workout template", example = "Push Day A")
    val name: String,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Optional description", example = "Chest, shoulders and triceps")
    val description: String?,
)
