package de.pumpedfitness.dumbbell.infrastructure.web.usermetric.dto.request

import de.pumpedfitness.dumbbell.domain.model.enum.Gender
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin

@Schema(description = "Request to log a new user metric snapshot")
data class LogUserMetricRequest(
    @field:DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
    @field:DecimalMax(value = "700.0", message = "Weight must be at most 700 kg")
    @Schema(description = "Body weight in kg", example = "82.5")
    val weight: Double?,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Body fat must be greater than 0")
    @field:DecimalMax(value = "100.0", message = "Body fat must be at most 100 %")
    @Schema(description = "Body fat percentage", example = "15.2")
    val bodyFat: Double?,

    @field:DecimalMin(value = "0.0", inclusive = false, message = "Height must be greater than 0")
    @field:DecimalMax(value = "300.0", message = "Height must be at most 300 cm")
    @Schema(description = "Height in cm", example = "183.0")
    val height: Double?,

    @Schema(description = "Biological gender", example = "MALE")
    val gender: Gender?,

    @Schema(description = "Birthdate as epoch ms", example = "631152000000")
    val birthdate: Long?,
)
