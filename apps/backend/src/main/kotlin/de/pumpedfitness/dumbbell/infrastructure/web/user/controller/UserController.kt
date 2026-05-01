package de.pumpedfitness.dumbbell.infrastructure.web.user.controller

import de.pumpedfitness.dumbbell.application.port.`in`.JwtServicePort
import de.pumpedfitness.dumbbell.application.port.`in`.UserServicePort
import de.pumpedfitness.dumbbell.infrastructure.security.JwtUtil
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request.UpdateMeRequest
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request.UserLoginRequest
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request.UserRegisterRequest
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.request.UserSessionRefreshRequest
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response.GetMeResponse
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response.UserLoginResponse
import de.pumpedfitness.dumbbell.infrastructure.web.user.dto.response.UserRegisterResponse
import de.pumpedfitness.dumbbell.infrastructure.web.user.mapper.UserRegisterMapper
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.Duration
import java.util.*

@RestController()
@RequestMapping("/user")
@Tag(name = "User", description = "User registration, authentication, and profile management")
class UserController(
    @Autowired
    val userRegisterMapper: UserRegisterMapper,

    @Autowired
    val userServicePort: UserServicePort,

    @Autowired
    private var authenticationManager: AuthenticationManager,

    @Autowired
    val jwtUtil: JwtUtil,

    @Autowired
    val jwtService: JwtServicePort,

    ) {

    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account. Returns the created user's username and timestamps."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "User successfully registered"),
        ApiResponse(responseCode = "400", description = "Invalid request body (validation failure)"),
        ApiResponse(responseCode = "409", description = "Username already taken"),
    )
    @PostMapping()
    fun registerUser(@Valid @RequestBody userRegisterRequest: UserRegisterRequest): ResponseEntity<UserRegisterResponse> {
        val userDto = userRegisterMapper.toDto(userRegisterRequest)
        val registeredUser = userServicePort.registerUser(userDto)
        val body = userRegisterMapper.toResponse(registeredUser)
        return ResponseEntity.ok(body)
    }

    @Operation(summary = "Login", description = "Authenticates the user and returns a JWT bearer token.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Login successful, JWT token returned"),
        ApiResponse(responseCode = "401", description = "Invalid credentials"),
    )
    @PostMapping("/login")
    fun loginUser(@Valid @RequestBody userLoginRequest: UserLoginRequest): ResponseEntity<UserLoginResponse> {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                userLoginRequest.username,
                userLoginRequest.password
            )
        )
        val userId = userServicePort.findUserIdByUsername(userLoginRequest.username)
        val token = jwtUtil.generateToken(userId)
        return ResponseEntity.ok(UserLoginResponse(token))
    }

    @Operation(
        summary = "Get current user profile",
        description = "Returns the profile of the currently authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "User profile returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/auth/me")
    fun getMe(principal: Principal): ResponseEntity<GetMeResponse> {
        val user = userServicePort.findUserById(principal.name)
        val getMeResponse = GetMeResponse(
            username = user.username,
            description = user.description,
            profilePicture = user.profilePicture,
            updatedAt = user.updated
        )
        return ResponseEntity.ok(getMeResponse)
    }

    @Operation(summary = "Logout", description = "Invalidates the current JWT token by adding it to the denylist.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Successfully logged out"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/auth/logout")
    fun logoutUser(request: HttpServletRequest): ResponseEntity<Unit> {
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            val expiration: Date = jwtUtil.extractAllClaims(token).expiration
            val remainingMillis = Duration.between(Date().toInstant(), expiration.toInstant()).toMillis()
            if (remainingMillis >= 0) {
                jwtService.denyToken(token, remainingMillis)
            }
        }
        return ResponseEntity.ok().build()
    }

    @Operation(
        summary = "Refresh JWT token",
        description = "Issues a new JWT token and invalidates the current one. The username in the request body must match the authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "New JWT token returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/auth/refresh")
    fun refreshToken(
        @RequestBody userSessionRefreshRequest: UserSessionRefreshRequest,
        request: HttpServletRequest
    ): ResponseEntity<UserLoginResponse> {
        val user = userServicePort.findUserIdByUsername(userSessionRefreshRequest.username)
        val newToken = jwtUtil.generateToken(user)
        val oldToken = request.getHeader("Authorization").substring(7)
        val oldTokenExpiration: Date = jwtUtil.extractAllClaims(oldToken).expiration
        val remainingMillis = Duration.between(Date().toInstant(), oldTokenExpiration.toInstant()).toMillis()
        jwtService.denyToken(oldToken, remainingMillis)
        return ResponseEntity.ok(UserLoginResponse(newToken))
    }

    @Operation(
        summary = "Update current user profile",
        description = "Updates the username, description, and/or profile picture of the currently authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profile updated, returns updated profile"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/auth/me")
    fun updateMe(@Valid @RequestBody updateMeRequest: UpdateMeRequest, principal: Principal): ResponseEntity<GetMeResponse> {
        val updatedUser = userServicePort.updateUser(
            userId = principal.name,
            updateMeRequest.username,
            updateMeRequest.description,
            updateMeRequest.profilePictureUrl
        )
        val response = GetMeResponse(
            username = updatedUser.username,
            description = updatedUser.description,
            profilePicture = updatedUser.profilePicture,
            updatedAt = updatedUser.updated
        )
        return ResponseEntity.ok(response)
    }
}
