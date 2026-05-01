package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

@Schema(description = "Request body for user login")
data class UserLoginRequest(
    @field:NotBlank(message = "Username must not be blank")
    @field:Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    @Schema(description = "The user's username", example = "john123")
    val username: String,

    @field:NotBlank(message = "Password must not be blank")
    @field:Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Schema(description = "The user's password", example = "Secret1!")
    val password: String
)
