package de.pumpedfitness.dumbbell.infrastructure.web.workout.controller

import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutSessionSetServicePort
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request.LogSetRequest
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response.WorkoutSessionSetResponse
import de.pumpedfitness.dumbbell.infrastructure.web.workout.mapper.WorkoutSessionSetMapper
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
@RequestMapping("/workout-session/{sessionId}/sets")
@Tag(name = "Workout Session Sets", description = "Log and retrieve sets within a workout session")
@SecurityRequirement(name = "bearerAuth")
class WorkoutSessionSetController(
    private val workoutSessionSetServicePort: WorkoutSessionSetServicePort,
    private val workoutSessionSetMapper: WorkoutSessionSetMapper,
) {

    @Operation(summary = "Get all sets", description = "Returns all sets logged in a specific workout session, ordered by set index.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of sets returned"),
        ApiResponse(responseCode = "403", description = "Session belongs to another user"),
        ApiResponse(responseCode = "404", description = "Session not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping
    fun getSetsForSession(
        @Parameter(description = "UUID of the workout session", required = true)
        @PathVariable sessionId: String,
        principal: Principal,
    ): ResponseEntity<List<WorkoutSessionSetResponse>> {
        val sets = workoutSessionSetServicePort.getSetsBySessionId(sessionId, principal.name)
        return ResponseEntity.ok(sets.map { workoutSessionSetMapper.toResponse(it) })
    }

    @Operation(summary = "Log a set", description = "Logs a new set for an exercise within a workout session.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Set logged"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "403", description = "Session belongs to another user"),
        ApiResponse(responseCode = "404", description = "Session not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PostMapping
    fun logSet(
        @PathVariable sessionId: String,
        @Valid @RequestBody request: LogSetRequest,
        principal: Principal,
    ): ResponseEntity<WorkoutSessionSetResponse> {
        val set = workoutSessionSetServicePort.logSet(
            sessionId = sessionId,
            userId = principal.name,
            exerciseId = request.exerciseId,
            setIndex = request.setIndex,
            reps = request.reps,
            weight = request.weight,
            restSeconds = request.restSeconds,
            durationSeconds = request.durationSeconds,
            notes = request.notes,
        )
        return ResponseEntity.ok(workoutSessionSetMapper.toResponse(set))
    }

    @Operation(summary = "Delete a set", description = "Deletes a specific logged set by its UUID.")
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Set deleted"),
        ApiResponse(responseCode = "403", description = "Set belongs to another user's session"),
        ApiResponse(responseCode = "404", description = "Set not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @DeleteMapping("/{setId}")
    fun deleteSet(
        @PathVariable sessionId: String,
        @Parameter(description = "UUID of the set to delete", required = true)
        @PathVariable setId: String,
        principal: Principal,
    ): ResponseEntity<Unit> {
        workoutSessionSetServicePort.deleteSet(setId, principal.name)
        return ResponseEntity.noContent().build()
    }
}
