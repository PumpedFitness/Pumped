package de.pumpedfitness.dumbbell.application.service

import at.favre.lib.crypto.bcrypt.BCrypt
import de.pumpedfitness.dumbbell.application.dto.UserDto
import de.pumpedfitness.dumbbell.application.exception.UserAlreadyExistsException
import de.pumpedfitness.dumbbell.application.mapper.UserDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.UserRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.User
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.security.core.userdetails.UsernameNotFoundException
import java.util.*

@ExtendWith(MockKExtension::class)
class UserServiceTest {

    @MockK
    private lateinit var userDtoMapper: UserDtoMapper

    @MockK
    private lateinit var userRepository: UserRepository

    @InjectMockKs
    private lateinit var userService: UserServiceAdapter

    @Nested
    inner class RegistrationTests {

        @Test
        fun `Should RegisterUserSuccessfully When Username Is Not Taken`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val user = User.validTestData(username = userDto.username)
            val savedUserDto = userDto.copy(password = user.password)

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(any()) } returns user
            every { userRepository.save(user) } returns user
            every { userDtoMapper.toDto(user) } returns savedUserDto

            // Act
            val result = userService.registerUser(userDto)

            // Assert
            assertEquals(savedUserDto, result)
            verify(exactly = 1) { userRepository.save(user) }
            verify(exactly = 1) { userDtoMapper.toDto(user) }
        }

        @Test
        fun `Should Throw UserAlreadyExistsException When Username Is Already Taken`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val existingUser = User.validTestData(username = userDto.username)
            every { userRepository.findByUsername(userDto.username) } returns existingUser

            // Act & Assert
            val exception = assertThrows<UserAlreadyExistsException> {
                userService.registerUser(userDto)
            }
            assertEquals("User with username: '${userDto.username}' already exists.", exception.message)
            verify(exactly = 0) { userRepository.save(any()) }
        }

        @Test
        fun `Should HashPassword When SavingUser`() {
            // Arrange
            val plainPassword = "plainPassword123"
            val userDto = UserDto.validTestData(password = plainPassword)
            val hashedDtoSlot = slot<UserDto>()

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(capture(hashedDtoSlot)) } answers {
                val capturedDto = hashedDtoSlot.captured
                User.validTestData(
                    username = capturedDto.username,
                    password = capturedDto.password
                )
            }
            every { userRepository.save(any()) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } answers {
                val savedUser = firstArg<User>()
                UserDto.validTestData(
                    username = savedUser.username,
                    password = savedUser.password
                )
            }

            // Act
            userService.registerUser(userDto)

            // Assert
            val capturedDto = hashedDtoSlot.captured
            assertNotEquals(plainPassword, capturedDto.password)
            assertTrue(BCrypt.verifyer().verify(plainPassword.toCharArray(), capturedDto.password).verified)
        }

        @Test
        fun `Should Not Save User When Username Is Already Taken`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val existingUser = User.validTestData(username = userDto.username)

            every { userRepository.findByUsername(userDto.username) } returns existingUser

            // Act & Assert
            assertThrows<UserAlreadyExistsException> { userService.registerUser(userDto) }
            verify(exactly = 0) { userDtoMapper.toModel(any()) }
            verify(exactly = 0) { userRepository.save(any()) }
        }

        @Test
        fun `Should Not Call Mapper When Username Is Already Taken`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val existingUser = User.validTestData(username = userDto.username)

            every { userRepository.findByUsername(userDto.username) } returns existingUser

            // Act & Assert
            assertThrows<UserAlreadyExistsException> { userService.registerUser(userDto) }
            verify(exactly = 0) { userDtoMapper.toDto(any()) }
        }

        @Test
        fun `Should Call MapperToModel Exactly Once When Registering Valid User`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val user = User.validTestData(username = userDto.username)

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(any()) } returns user
            every { userRepository.save(user) } returns user
            every { userDtoMapper.toDto(user) } returns userDto

            // Act
            userService.registerUser(userDto)

            // Assert
            verify(exactly = 1) { userDtoMapper.toModel(any()) }
        }

        @Test
        fun `Should Pass Hashed Password To Mapper When Registering User`() {
            // Arrange
            val plainPassword = "mySecret99"
            val userDto = UserDto.validTestData(password = plainPassword)
            val capturedDtoSlot = slot<UserDto>()

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(capture(capturedDtoSlot)) } returns User.validTestData(username = userDto.username)
            every { userRepository.save(any()) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } returns userDto

            // Act
            userService.registerUser(userDto)

            // Assert
            val passedDto = capturedDtoSlot.captured
            assertNotEquals(plainPassword, passedDto.password)
            assertTrue(BCrypt.verifyer().verify(plainPassword.toCharArray(), passedDto.password).verified)
        }

        @Test
        fun `Should Preserve Username When Hashing Password During Registration`() {
            // Arrange
            val userDto = UserDto.validTestData(username = "preservedUser", password = "password123")
            val capturedDtoSlot = slot<UserDto>()

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(capture(capturedDtoSlot)) } returns User.validTestData(username = userDto.username)
            every { userRepository.save(any()) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } returns userDto

            // Act
            userService.registerUser(userDto)

            // Assert
            assertEquals("preservedUser", capturedDtoSlot.captured.username)
        }

        @Test
        fun `Should Return Dto From Mapper After Successful Registration`() {
            // Arrange
            val userDto = UserDto.validTestData()
            val savedUser = User.validTestData(username = userDto.username)
            val expectedDto = userDto.copy(password = savedUser.password)

            every { userRepository.findByUsername(userDto.username) } returns null
            every { userDtoMapper.toModel(any()) } returns savedUser
            every { userRepository.save(savedUser) } returns savedUser
            every { userDtoMapper.toDto(savedUser) } returns expectedDto

            // Act
            val result = userService.registerUser(userDto)

            // Assert
            assertEquals(expectedDto, result)
            verify(exactly = 1) { userDtoMapper.toDto(savedUser) }
        }
    }

    @Nested
    inner class JwtAuthenticationTests {

        @Test
        fun `Should LoadUserDetails Successfully When Username Exists`() {
            // Arrange
            val username = "testuser"
            val user = User.validTestData(username = username)

            every { userRepository.findByUsername(username) } returns user

            // Act
            val result = userService.loadUserByUsername(username)

            // Assert
            assertEquals(username, result.username)
            assertEquals(user.password, result.password)
            assertTrue(result.authorities.isEmpty())
            verify(exactly = 1) { userRepository.findByUsername(username) }
        }

        @Test
        fun `Should Throw UsernameNotFoundException When Username Does Not Exist`() {
            // Arrange
            val username = "Nonexistent"

            every { userRepository.findByUsername(username) } returns null

            // Act & Assert
            val exception = assertThrows<UsernameNotFoundException> {
                userService.loadUserByUsername(username)
            }
            assertEquals("User with username $username not found", exception.message)
        }

        @Test
        fun `Should LoadUserDetailsById Successfully When UserId Exists`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId)

            every { userRepository.findById(userId) } returns Optional.of(user)

            // Act
            val result = userService.loadUserDetailsById(userId.toString())

            // Assert
            assertEquals(userId.toString(), result.username)
            assertEquals(user.password, result.password)
            assertTrue(result.authorities.isEmpty())
            verify(exactly = 1) { userRepository.findById(userId) }
        }

        @Test
        fun `Should Throw UsernameNotFoundException When UserId Not Found`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userRepository.findById(userId) } returns Optional.empty()

            // Act & Assert
            val exception = assertThrows<UsernameNotFoundException> {
                userService.loadUserDetailsById(userId.toString())
            }
            assertEquals("User with id $userId not found", exception.message)
        }

        @Test
        fun `Should FindUserId Successfully When Username Exists`() {
            // Arrange
            val username = "testuser"
            val user = User.validTestData(username = username)

            every { userRepository.findByUsername(username) } returns user

            // Act
            val result = userService.findUserIdByUsername(username)

            // Assert
            assertEquals(user.id.toString(), result)
            verify(exactly = 1) { userRepository.findByUsername(username) }
        }

        @Test
        fun `Should FindUserIdByUsername Successfully When Username Exists`() {
            // Arrange
            val username = "testuser"
            val user = User.validTestData(username = username)

            every { userRepository.findByUsername(username) } returns user

            // Act
            val result = userService.findUserIdByUsername(username)

            // Assert
            assertEquals(user.id.toString(), result)
            verify(exactly = 1) { userRepository.findByUsername(username) }
        }

        @Test
        fun `Should Throw UsernameNotFoundException When FindingUserIdByUsername For Nonexistent Username`() {
            // Arrange
            val username = "Nonexistent"

            every { userRepository.findByUsername(username) } returns null

            // Act & Assert
            val exception = assertThrows<UsernameNotFoundException> {
                userService.findUserIdByUsername(username)
            }
            assertEquals("User with username $username not found", exception.message)
        }

        @Test
        fun `Should FindUserById Successfully When UserId Exists`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId)
            val userDto = UserDto.validTestData()

            every { userRepository.findById(userId) } returns Optional.of(user)
            every { userDtoMapper.toDto(user) } returns userDto

            // Act
            val result = userService.findUserById(userId.toString())

            // Assert
            assertEquals(userDto, result)
            verify(exactly = 1) { userRepository.findById(userId) }
            verify(exactly = 1) { userDtoMapper.toDto(user) }
        }

        @Test
        fun `Should Throw UsernameNotFoundException When FindUserById By Nonexistent Id`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userRepository.findById(userId) } returns Optional.empty()

            // Act & Assert
            val exception = assertThrows<UsernameNotFoundException> {
                userService.findUserById(userId.toString())
            }
            assertEquals("User with id $userId not found", exception.message)
        }

        @Test
        fun `Should Return Correct Description And ProfilePicture When FindUserById`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId, description = "My bio", profilePicture = "avatar.png")
            val expectedDto = UserDto.validTestData(description = "My bio", profilePicture = "avatar.png")

            every { userRepository.findById(userId) } returns Optional.of(user)
            every { userDtoMapper.toDto(user) } returns expectedDto

            // Act
            val result = userService.findUserById(userId.toString())

            // Assert
            assertEquals("My bio", result.description)
            assertEquals("avatar.png", result.profilePicture)
        }

        @Test
        fun `Should Return Empty Authorities When LoadUserByUsername`() {
            // Arrange
            val username = "testuser"
            val user = User.validTestData(username = username)

            every { userRepository.findByUsername(username) } returns user

            // Act
            val result = userService.loadUserByUsername(username)

            // Assert
            assertTrue(result.authorities.isEmpty())
        }

        @Test
        fun `Should Return UserId As Username When LoadUserDetailsById`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId)

            every { userRepository.findById(userId) } returns Optional.of(user)

            // Act
            val result = userService.loadUserDetailsById(userId.toString())

            // Assert
            assertEquals(userId.toString(), result.username)
        }

        @Test
        fun `Should Return Empty Authorities When LoadUserDetailsById`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId)

            every { userRepository.findById(userId) } returns Optional.of(user)

            // Act
            val result = userService.loadUserDetailsById(userId.toString())

            // Assert
            assertTrue(result.authorities.isEmpty())
        }

        @Test
        fun `Should Return UserPassword When LoadUserDetailsById`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId, password = "secureHash")

            every { userRepository.findById(userId) } returns Optional.of(user)

            // Act
            val result = userService.loadUserDetailsById(userId.toString())

            // Assert
            assertEquals("secureHash", result.password)
        }

        @Test
        fun `Should Return Valid UUID String When FindUserIdByUsername`() {
            // Arrange
            val userId = UUID.randomUUID()
            val user = User.validTestData(id = userId, username = "specificUser")

            every { userRepository.findByUsername("specificUser") } returns user

            // Act
            val result = userService.findUserIdByUsername("specificUser")

            // Assert
            assertEquals(userId.toString(), result)
            assertDoesNotThrow { UUID.fromString(result) }
        }
    }

    @Nested
    inner class UpdateUserTests {

        @Test
        fun `Should UpdateUser Successfully When User Exists`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existingUser = User.validTestData(id = userId)
            val newUsername = "updatedUser"
            val newDescription = "Updated description"
            val newProfilePicture = "updated.jpg"
            val updatedUser = existingUser.copy(
                username = newUsername,
                description = newDescription,
                profilePicture = newProfilePicture
            )
            val expectedDto = UserDto.validTestData(
                username = newUsername,
                description = newDescription,
                profilePicture = newProfilePicture
            )

            every { userRepository.findById(userId) } returns Optional.of(existingUser)
            every { userRepository.save(any()) } returns updatedUser
            every { userDtoMapper.toDto(updatedUser) } returns expectedDto

            // Act
            val result = userService.updateUser(userId.toString(), newUsername, newDescription, newProfilePicture)

            // Assert
            assertEquals(expectedDto, result)
            verify(exactly = 1) { userRepository.findById(userId) }
            verify(exactly = 1) { userRepository.save(any()) }
            verify(exactly = 1) { userDtoMapper.toDto(updatedUser) }
        }

        @Test
        fun `Should Throw UsernameNotFoundException When Updating Nonexistent User`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userRepository.findById(userId) } returns Optional.empty()

            // Act & Assert
            val exception = assertThrows<UsernameNotFoundException> {
                userService.updateUser(userId.toString(), "newName", "newDesc", "new.jpg")
            }
            assertEquals("User with id $userId not found", exception.message)
            verify(exactly = 0) { userRepository.save(any()) }
        }

        @Test
        fun `Should Persist Updated Fields When Updating User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existingUser = User.validTestData(
                id = userId,
                username = "oldUser",
                description = "old desc",
                profilePicture = "old.jpg"
            )
            val savedUserSlot = slot<User>()
            val expectedDto =
                UserDto.validTestData(username = "newUser", description = "new desc", profilePicture = "new.jpg")

            every { userRepository.findById(userId) } returns Optional.of(existingUser)
            every { userRepository.save(capture(savedUserSlot)) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } returns expectedDto

            // Act
            userService.updateUser(userId.toString(), "newUser", "new desc", "new.jpg")

            // Assert
            val saved = savedUserSlot.captured
            assertEquals("newUser", saved.username)
            assertEquals("new desc", saved.description)
            assertEquals("new.jpg", saved.profilePicture)
            assertEquals(userId, saved.id)
        }

        @Test
        fun `Should Preserve UserId And CreatedAt When Updating User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existingUser = User.validTestData(id = userId)
            val savedUserSlot = slot<User>()

            every { userRepository.findById(userId) } returns Optional.of(existingUser)
            every { userRepository.save(capture(savedUserSlot)) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } returns UserDto.validTestData()

            // Act
            userService.updateUser(userId.toString(), "anyName", "anyDesc", "any.jpg")

            // Assert
            val saved = savedUserSlot.captured
            assertEquals(userId, saved.id)
            assertEquals(existingUser.createdAt, saved.createdAt)
        }

        @Test
        fun `Should Update Timestamp When Updating User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existingUser = User.validTestData(id = userId)
            val savedUserSlot = slot<User>()
            val beforeUpdate = System.currentTimeMillis()

            every { userRepository.findById(userId) } returns Optional.of(existingUser)
            every { userRepository.save(capture(savedUserSlot)) } answers { firstArg() }
            every { userDtoMapper.toDto(any()) } returns UserDto.validTestData()

            // Act
            userService.updateUser(userId.toString(), "anyName", "anyDesc", "any.jpg")

            // Assert
            val saved = savedUserSlot.captured
            assertTrue(saved.updated >= beforeUpdate)
        }

        @Test
        fun `Should Return Mapped Dto From Repository After Update`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existingUser = User.validTestData(id = userId)
            val savedUser = existingUser.copy(username = "savedName")
            val expectedDto = UserDto.validTestData(username = "savedName")

            every { userRepository.findById(userId) } returns Optional.of(existingUser)
            every { userRepository.save(any()) } returns savedUser
            every { userDtoMapper.toDto(savedUser) } returns expectedDto

            // Act
            val result = userService.updateUser(userId.toString(), "savedName", "desc", "pic.jpg")

            // Assert
            assertEquals(expectedDto, result)
            verify(exactly = 1) { userDtoMapper.toDto(savedUser) }
        }
    }
}