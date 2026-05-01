package de.pumpedfitness.dumbbell.infrastructure.web.workout.controller

import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutTemplateServicePort
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request.CreateWorkoutTemplateRequest
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.request.UpdateWorkoutTemplateRequest
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response.WorkoutTemplateResponse
import de.pumpedfitness.dumbbell.infrastructure.web.workout.mapper.WorkoutTemplateMapper
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
@RequestMapping("/workout-template", version = "1")
@Tag(name = "Workout Template", description = "Create and manage personal workout templates")
@SecurityRequirement(name = "bearerAuth")
class WorkoutTemplateController(
    private val workoutTemplateServicePort: WorkoutTemplateServicePort,
    private val workoutTemplateMapper: WorkoutTemplateMapper,
) {

    @Operation(summary = "Get all templates", description = "Returns all workout templates owned by the authenticated user.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of workout templates returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping
    fun getMyTemplates(principal: Principal): ResponseEntity<List<WorkoutTemplateResponse>> {
        val templates = workoutTemplateServicePort.getTemplatesByUserId(principal.name)
        return ResponseEntity.ok(templates.map { workoutTemplateMapper.toResponse(it) })
    }

    @Operation(summary = "Get template by ID", description = "Returns a single workout template by its UUID.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Workout template returned"),
        ApiResponse(responseCode = "404", description = "Template not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/{templateId}")
    fun getTemplate(
        @Parameter(description = "UUID of the workout template", required = true)
        @PathVariable templateId: String,
        principal: Principal
    ): ResponseEntity<WorkoutTemplateResponse> {
        val template = workoutTemplateServicePort.getTemplateById(templateId, principal.name)
        return ResponseEntity.ok(workoutTemplateMapper.toResponse(template))
    }

    @Operation(summary = "Create template", description = "Creates a new workout template for the authenticated user.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Workout template created"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PostMapping
    fun createTemplate(
        @Valid @RequestBody request: CreateWorkoutTemplateRequest,
        principal: Principal
    ): ResponseEntity<WorkoutTemplateResponse> {
        val template = workoutTemplateServicePort.createTemplate(
            userId = principal.name,
            name = request.name,
            description = request.description,
        )
        return ResponseEntity.ok(workoutTemplateMapper.toResponse(template))
    }

    @Operation(summary = "Update template", description = "Updates the name and description of an existing workout template.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Workout template updated"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "404", description = "Template not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PutMapping("/{templateId}")
    fun updateTemplate(
        @PathVariable templateId: String,
        @Valid @RequestBody request: UpdateWorkoutTemplateRequest,
        principal: Principal
    ): ResponseEntity<WorkoutTemplateResponse> {
        val updated = workoutTemplateServicePort.updateTemplate(
            templateId = templateId,
            userId = principal.name,
            name = request.name,
            description = request.description,
        )
        return ResponseEntity.ok(workoutTemplateMapper.toResponse(updated))
    }

    @Operation(summary = "Delete template", description = "Deletes a workout template owned by the authenticated user.")
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Workout template deleted"),
        ApiResponse(responseCode = "404", description = "Template not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @DeleteMapping("/{templateId}")
    fun deleteTemplate(
        @PathVariable templateId: String,
        principal: Principal
    ): ResponseEntity<Unit> {
        workoutTemplateServicePort.deleteTemplate(templateId, principal.name)
        return ResponseEntity.noContent().build()
    }
}
