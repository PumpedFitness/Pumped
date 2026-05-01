package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "User profile information")
data class GetMeResponse(
    @Schema(description = "The user's username", example = "john123")
    val username: String,
    @Schema(description = "The user's bio or description", example = "Fitness enthusiast")
    val description: String,
    @Schema(description = "URL of the user's profile picture", example = "https://example.com/avatar.png")
    val profilePicture: String,
    @Schema(description = "Timestamp of the last profile update (epoch milliseconds)", example = "1714216800000")
    val updatedAt: Long
)
