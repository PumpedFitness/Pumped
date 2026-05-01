package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.UserDto
import de.pumpedfitness.dumbbell.domain.model.User
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class UserDtoMapper {
    fun toModel(userDto: UserDto): User {
        val uuid = UUID.randomUUID()
        return User(
            id = uuid,
            username = userDto.username,
            password = userDto.password,
            description = userDto.description,
            profilePicture = userDto.profilePicture,
            createdAt = userDto.createdAt,
            updated = userDto.updated
        )
    }

    fun toDto(user: User): UserDto {
        return UserDto(
            username = user.username,
            password = user.password,
            description = user.description,
            profilePicture = user.profilePicture,
            createdAt = user.createdAt,
            updated = user.updated
        )
    }
}