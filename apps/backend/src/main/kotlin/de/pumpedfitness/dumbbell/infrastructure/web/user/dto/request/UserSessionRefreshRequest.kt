package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request body for refreshing a JWT session token")
data class UserSessionRefreshRequest(
    @Schema(description = "Username of the authenticated user requesting a new token", example = "john123")
    val username: String,
)
