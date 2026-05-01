package de.pumpedfitness.dumbbell.common

import de.pumpedfitness.dumbbell.application.dto.UserDto
import de.pumpedfitness.dumbbell.domain.model.User
import java.util.UUID

fun UserDto.Companion.validTestData(
    username: String = "testUser",
    password: String = "plainPassword123",
    description: String = "A test user.",
    profilePicture: String = "picture.jpg"
): UserDto {
    val now = System.currentTimeMillis()
    return UserDto(
        username = username,
        password = password,
        description = description,
        profilePicture = profilePicture,
        createdAt = now,
        updated = now
    )
}

fun User.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    username: String = "testUser",
    password: String = "hashedPassword",
    description: String = "A test user.",
    profilePicture: String = "picture.jpg"
): User {
    val now = System.currentTimeMillis()
    return User(
        id = id,
        username = username,
        password = password,
        description = description,
        profilePicture = profilePicture,
        createdAt = now,
        updated = now
    )
}