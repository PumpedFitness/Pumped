package de.pumpedfitness.dumbbell.infrastructure.web.exercise.controller

import de.pumpedfitness.dumbbell.application.dto.ExerciseDto
import de.pumpedfitness.dumbbell.application.port.`in`.ExerciseServicePort
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/exercise", version = "1")
@Tag(name = "Exercise", description = "Browse and retrieve exercises")
@SecurityRequirement(name = "bearerAuth")
class ExerciseController(
    private val exerciseService: ExerciseServicePort
) {
    //TODO: Test this with integrationtests later
    @Operation(summary = "Get all exercises", description = "Returns a list of all available exercises.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of exercises returned"),
        ApiResponse(responseCode = "404", description = "No exercises found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping
    fun getAllExercises(): ResponseEntity<List<ExerciseDto>> {
        val exerciseDtos = exerciseService.getAllExercises()
        if (exerciseDtos.isEmpty()) {
            return ResponseEntity.notFound().build()
        }
        return ResponseEntity.ok(exerciseDtos)
    }

    @Operation(summary = "Get exercise by ID", description = "Returns the details of a single exercise by its UUID.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Exercise returned"),
        ApiResponse(responseCode = "404", description = "Exercise not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/{id}")
    fun getExerciseById(
        @Parameter(description = "UUID of the exercise to retrieve", required = true)
        @PathVariable id: String
    ): ResponseEntity<ExerciseDto> {
        val exerciseDto = exerciseService.getExerciseById(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(exerciseDto)
    }
}
