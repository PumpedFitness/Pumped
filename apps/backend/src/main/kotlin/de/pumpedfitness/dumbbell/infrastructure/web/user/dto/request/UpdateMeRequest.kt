package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request body for updating the current user's profile")
data class UpdateMeRequest(
    @Schema(description = "New username", example = "john456")
    val username: String,
    @Schema(description = "User bio or description", example = "Fitness enthusiast")
    val description: String,
    @Schema(description = "URL of the user's profile picture", example = "https://example.com/avatar.png")
    val profilePictureUrl: String,
)
