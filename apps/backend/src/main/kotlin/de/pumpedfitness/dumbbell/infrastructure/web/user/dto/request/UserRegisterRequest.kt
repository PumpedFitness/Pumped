package de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

@Schema(description = "Request body for registering a new user account")
data class UserRegisterRequest(

    @field:NotBlank
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$",
        message = "Username must contain only letters and numbers")
    @Schema(
        description = "Unique username (3–100 alphanumeric characters)",
        example = "john123",
        minLength = 3,
        maxLength = 100
    )
    val username: String,

    @field:NotBlank
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}/",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")
    @Schema(
        description = "Password (min 8 chars, must include uppercase, lowercase, digit, and special character)",
        example = "Secret1!",
        minLength = 8,
        maxLength = 100
    )
    val password: String
) {
    companion object {}
}
