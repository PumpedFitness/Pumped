package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response returned after successfully registering a new user")
data class UserRegisterResponse(
    @Schema(description = "The registered username", example = "john123")
    val username: String,
    @Schema(description = "Account creation timestamp (epoch milliseconds)", example = "1714216800000")
    val createdAt: Long,
    @Schema(description = "Account last-updated timestamp (epoch milliseconds)", example = "1714216800000")
    val updatedAt: Long
) {
    companion object {}
}
