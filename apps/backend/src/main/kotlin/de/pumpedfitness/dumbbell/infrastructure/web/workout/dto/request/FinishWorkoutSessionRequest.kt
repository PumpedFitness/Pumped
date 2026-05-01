package de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Size

@Schema(description = "Request to finish an ongoing workout session")
data class FinishWorkoutSessionRequest(
    @field:Size(max = 500, message = "Notes must not exceed 500 characters")
    @Schema(description = "Optional closing notes", example = "Great pump, PBs on bench")
    val notes: String?,
)
