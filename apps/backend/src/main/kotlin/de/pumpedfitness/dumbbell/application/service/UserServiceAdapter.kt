package de.pumpedfitness.dumbbell.application.service

import at.favre.lib.crypto.bcrypt.BCrypt
import de.pumpedfitness.dumbbell.application.dto.UserDto
import de.pumpedfitness.dumbbell.application.exception.UserAlreadyExistsException
import de.pumpedfitness.dumbbell.application.mapper.UserDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.UserServicePort
import de.pumpedfitness.dumbbell.application.port.out.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserServiceAdapter(
    @Autowired private val userDtoMapper: UserDtoMapper,
    @Autowired private val userRepository: UserRepository

) : UserServicePort, UserDetailsService {

    override fun registerUser(userDto: UserDto): UserDto {
        if (userRepository.findByUsername(userDto.username) != null) {
            throw UserAlreadyExistsException(userDto.username)
        }
        val hashedUserDto = userDto.copy(password = hashPassword(userDto.password))
        val userModel = userDtoMapper.toModel(hashedUserDto)
        val savedUserModel = userRepository.save(userModel)
        return userDtoMapper.toDto(savedUserModel)
    }

    override fun findUserIdByUsername(username: String): String {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User with username $username not found")
        return user.id.toString()
    }

    override fun findUserById(id: String): UserDto {
        val id = UUID.fromString(id)
        val user =
            userRepository.findById(id).orElseThrow { throw UsernameNotFoundException("User with id $id not found") }
        return userDtoMapper.toDto(user)
    }

    /**
     * Required by Spring Security's DaoAuthenticationProvider for initial authentication.
     * This method is called internally by AuthenticationManager.authenticate() during login
     * to verify username/password credentials, even though it shows 0 explicit usages in our code.
     *
     * After successful authentication, JWT tokens contain the user ID instead of username,
     * and subsequent requests use loadUserDetailsById() for token validation.
     *
     * @param username The username provided during login
     * @return UserDetails with username for Spring Security's authentication process
     * @throws UsernameNotFoundException if user doesn't exist
     */
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User with username $username not found")
        return User(user.username, user.password, emptyList())
    }

    override fun loadUserDetailsById(id: String): UserDetails {
        val uuid = UUID.fromString(id)
        val user = userRepository.findById(uuid)
            .orElseThrow { throw UsernameNotFoundException("User with id $id not found") }
        return User(user.id.toString(), user.password, emptyList())
    }

    override fun updateUser(
        userId: String,
        username: String,
        description: String,
        profilePictureUrl: String
    ): UserDto {
        val userId = UUID.fromString(userId)
        val user = userRepository.findById(userId).orElseThrow(
            { throw UsernameNotFoundException("User with id $userId not found") }
        )
        val updatedUser = user.copy(
            username = username,
            description = description,
            profilePicture = profilePictureUrl,
            updated = System.currentTimeMillis()
        )
        val savedUser = userRepository.save(updatedUser)
        return userDtoMapper.toDto(savedUser)
    }

    private fun hashPassword(password: String): String {
        return BCrypt.withDefaults()
            .hashToString(12, password.toCharArray())
    }
}