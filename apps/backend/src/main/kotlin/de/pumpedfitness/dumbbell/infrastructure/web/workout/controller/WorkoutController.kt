package de.pumpedfitness.dumbbell.infrastructure.web.workout.controller

import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutServicePort
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/workout")
@Tag(name = "Workout", description = "Workout template and session management")
@SecurityRequirement(name = "bearerAuth")
class WorkoutController(
    private val workoutService: WorkoutServicePort
) {

    @Operation(
        summary = "Get workout templates",
        description = "Returns all workout templates belonging to the currently authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of workout templates returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/auth/template")
    fun getWorkoutTemplates(principal: Principal): ResponseEntity<List<Any>> {
        val workoutTemplates = workoutService.getWorkoutTemplateByUserId(principal.name)
        return ResponseEntity.ok(workoutTemplates)
    }
}
