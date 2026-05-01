package de.pumpedfitness.dumbbell.infrastructure.web.user.mapper

import de.pumpedfitness.dumbbell.application.dto.UserDto
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request.UserRegisterRequest
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response.UserRegisterResponse
import org.springframework.stereotype.Component

@Component
class UserRegisterMapper {


    fun toDto(userRegisterRequest: UserRegisterRequest): UserDto {
        return UserDto(
            username = userRegisterRequest.username,
            password = userRegisterRequest.password,
            description = "",
            profilePicture = "",
            createdAt = System.currentTimeMillis(),
            updated = System.currentTimeMillis()
        )
    }

    fun toResponse(userDto: UserDto) : UserRegisterResponse {
        return UserRegisterResponse(
            username = userDto.username,
            createdAt = userDto.createdAt,
            updatedAt = userDto.updated
        )
    }
}