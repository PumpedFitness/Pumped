package de.pumpedfitness.dumbbell.infrastructure.web.workout.controller

import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutSessionServicePort
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request.FinishWorkoutSessionRequest
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request.StartWorkoutSessionRequest
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response.WorkoutSessionResponse
import de.pumpedfitness.dumbbell.infrastructure.web.workout.mapper.WorkoutSessionMapper
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/workout-session")
@Tag(name = "Workout Session", description = "Start, track and finish workout sessions")
@SecurityRequirement(name = "bearerAuth")
class WorkoutSessionController(
    private val workoutSessionServicePort: WorkoutSessionServicePort,
    private val workoutSessionMapper: WorkoutSessionMapper,
) {

    @Operation(summary = "Get all sessions", description = "Returns all workout sessions for the authenticated user, newest first.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of sessions returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping
    fun getMySessions(principal: Principal): ResponseEntity<List<WorkoutSessionResponse>> {
        val sessions = workoutSessionServicePort.getSessionsByUserId(principal.name)
        return ResponseEntity.ok(sessions.map { workoutSessionMapper.toResponse(it) })
    }

    @Operation(summary = "Get session by ID", description = "Returns a single workout session by its UUID.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Session returned"),
        ApiResponse(responseCode = "404", description = "Session not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/{sessionId}")
    fun getSession(
        @Parameter(description = "UUID of the workout session", required = true)
        @PathVariable sessionId: String,
        principal: Principal
    ): ResponseEntity<WorkoutSessionResponse> {
        val session = workoutSessionServicePort.getSessionById(sessionId, principal.name)
        return ResponseEntity.ok(workoutSessionMapper.toResponse(session))
    }

    @Operation(summary = "Start session", description = "Starts a new workout session for the authenticated user.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Session started"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PostMapping
    fun startSession(
        @Valid @RequestBody request: StartWorkoutSessionRequest,
        principal: Principal
    ): ResponseEntity<WorkoutSessionResponse> {
        val session = workoutSessionServicePort.startSession(
            userId = principal.name,
            name = request.name,
            workoutTemplateId = request.workoutTemplateId,
            notes = request.notes,
        )
        return ResponseEntity.ok(workoutSessionMapper.toResponse(session))
    }

    @Operation(summary = "Finish session", description = "Marks a workout session as finished by setting the end time.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Session finished"),
        ApiResponse(responseCode = "404", description = "Session not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PatchMapping("/{sessionId}/finish")
    fun finishSession(
        @PathVariable sessionId: String,
        @Valid @RequestBody request: FinishWorkoutSessionRequest,
        principal: Principal
    ): ResponseEntity<WorkoutSessionResponse> {
        val session = workoutSessionServicePort.finishSession(
            sessionId = sessionId,
            userId = principal.name,
            notes = request.notes,
        )
        return ResponseEntity.ok(workoutSessionMapper.toResponse(session))
    }

    @Operation(summary = "Delete session", description = "Deletes a workout session owned by the authenticated user.")
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Session deleted"),
        ApiResponse(responseCode = "404", description = "Session not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @DeleteMapping("/{sessionId}")
    fun deleteSession(
        @PathVariable sessionId: String,
        principal: Principal
    ): ResponseEntity<Unit> {
        workoutSessionServicePort.deleteSession(sessionId, principal.name)
        return ResponseEntity.noContent().build()
    }
}
