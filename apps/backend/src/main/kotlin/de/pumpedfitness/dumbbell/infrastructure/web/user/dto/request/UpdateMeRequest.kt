package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

@Schema(description = "Request body for updating the current user's profile")
data class UpdateMeRequest(
    @field:NotBlank(message = "Username must not be blank")
    @field:Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    @field:Pattern(
        regexp = "^[a-zA-Z0-9]+$",
        message = "Username must contain only letters and numbers"
    )
    @Schema(description = "New username", example = "john456")
    val username: String,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "User bio or description", example = "Fitness enthusiast")
    val description: String?,

    @field:Size(max = 2048, message = "Profile picture URL must not exceed 2048 characters")
    @Schema(description = "URL of the user's profile picture", example = "https://example.com/avatar.png")
    val profilePictureUrl: String?,
)
