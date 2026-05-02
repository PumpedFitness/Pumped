package de.pumpedfitness.dumbbell.infrastructure.web.usermetric.dto.response

import de.pumpedfitness.dumbbell.domain.model.enum.Gender
import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response representing a user metric snapshot")
data class UserMetricResponse(
    @Schema(description = "UUID of the metric entry", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Body weight in kg", example = "82.5")
    val weight: Double?,
    @Schema(description = "Body fat percentage", example = "15.2")
    val bodyFat: Double?,
    @Schema(description = "Height in cm", example = "183.0")
    val height: Double?,
    @Schema(description = "Biological gender", example = "MALE")
    val gender: Gender?,
    @Schema(description = "Birthdate as epoch ms", example = "631152000000")
    val birthdate: Long?,
    @Schema(description = "When the snapshot was recorded (epoch ms)", example = "1714500000000")
    val recordedAt: Long,
)
