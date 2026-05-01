package de.pumpedfitness.dumbbell.infrastructure.web.workoutsession.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

private const val UUID_REGEXP = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"

@Schema(description = "Request to log a set within a workout session")
data class LogSetRequest(
    @field:NotBlank(message = "Exercise ID must not be blank")
    @field:Pattern(regexp = UUID_REGEXP, message = "exerciseId must be a valid UUID")
    @Schema(description = "UUID of the exercise performed", example = "c1b2a3d4-0000-0000-0000-000000000002")
    val exerciseId: String,

    @field:Min(value = 0, message = "Set index must be 0 or greater")
    @Schema(description = "Index of this set within the exercise (0-based)", example = "0")
    val setIndex: Int,

    @field:Min(value = 1, message = "Reps must be at least 1")
    @Schema(description = "Number of reps completed", example = "10")
    val reps: Int,

    @Schema(description = "Weight used in kg", example = "80.0")
    val weight: Double?,

    @field:DecimalMin(value = "1.0", message = "RPE must be at least 1")
    @field:DecimalMax(value = "10.0", message = "RPE must be at most 10")
    @Schema(description = "Rate of perceived exertion on a 1-10 scale", example = "8.5")
    val rpe: Double?,

    @field:Min(value = 0, message = "Rest seconds must be 0 or greater")
    @Schema(description = "Rest time in seconds after this set", example = "90")
    val restSeconds: Int?,

    @field:Min(value = 1, message = "Duration seconds must be at least 1")
    @Schema(description = "Duration of the set in seconds (for timed exercises)", example = "30")
    val durationSeconds: Int?,

    @field:Size(max = 500, message = "Notes must not exceed 500 characters")
    @Schema(description = "Optional notes", example = "Felt heavy")
    val notes: String?,
)
