package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.UserDto
import org.springframework.security.core.userdetails.UserDetails

interface UserServicePort {
    fun registerUser(userDto: UserDto) : UserDto
    fun loadUserByUsername(username: String): UserDetails
    fun findUserById(id: String): UserDto
    fun findUserIdByUsername(username: String): String
    fun loadUserDetailsById(id: String): UserDetails
    fun updateUser(userId: String, username: String, description: String?, profilePictureUrl: String?): UserDto
}