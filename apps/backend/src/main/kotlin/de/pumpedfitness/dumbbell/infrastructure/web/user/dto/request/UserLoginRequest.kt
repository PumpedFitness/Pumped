package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request body for user login")
data class UserLoginRequest(
    @Schema(description = "The user's username", example = "john123")
    val username: String,
    @Schema(description = "The user's password", example = "Secret1!")
    val password: String
)
