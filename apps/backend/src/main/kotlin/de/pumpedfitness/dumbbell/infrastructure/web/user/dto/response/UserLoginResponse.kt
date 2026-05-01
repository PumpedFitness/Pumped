package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response returned after a successful login or token refresh")
data class UserLoginResponse(
    @Schema(
        description = "JWT bearer token to use in the Authorization header",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    val token: String
)
