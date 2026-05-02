package de.pumpedfitness.dumbbell.infrastructure.web.usermetric.controller

import de.pumpedfitness.dumbbell.application.port.`in`.UserMetricServicePort
import de.pumpedfitness.dumbbell.infrastructure.web.usermetric.dto.request.LogUserMetricRequest
import de.pumpedfitness.dumbbell.infrastructure.web.usermetric.dto.response.UserMetricResponse
import de.pumpedfitness.dumbbell.infrastructure.web.usermetric.mapper.UserMetricMapper
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
@RequestMapping("/user/me/metrics", version = "1")
@Tag(name = "User Metrics", description = "Log and retrieve historical user body metrics")
@SecurityRequirement(name = "bearerAuth")
class UserMetricController(
    private val userMetricServicePort: UserMetricServicePort,
    private val userMetricMapper: UserMetricMapper,
) {

    @Operation(
        summary = "Log a metric snapshot",
        description = "Records a new body metric snapshot for the authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Metric logged"),
        ApiResponse(responseCode = "400", description = "Invalid request body"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @PostMapping
    fun logMetric(
        @Valid @RequestBody request: LogUserMetricRequest,
        principal: Principal,
    ): ResponseEntity<UserMetricResponse> {
        val metric = userMetricServicePort.logMetric(
            userId = principal.name,
            weight = request.weight,
            bodyFat = request.bodyFat,
            height = request.height,
            gender = request.gender,
            birthdate = request.birthdate,
        )
        return ResponseEntity.ok(userMetricMapper.toResponse(metric))
    }

    @Operation(
        summary = "Get latest metric",
        description = "Returns the most recent body metric snapshot for the authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Latest metric returned"),
        ApiResponse(responseCode = "404", description = "No metrics found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/latest")
    fun getLatestMetric(principal: Principal): ResponseEntity<UserMetricResponse> {
        val metric = userMetricServicePort.getLatestMetric(principal.name)
        return ResponseEntity.ok(userMetricMapper.toResponse(metric))
    }

    @Operation(
        summary = "Get metric history",
        description = "Returns all body metric snapshots for the authenticated user, newest first."
    )
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Metric history returned"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping
    fun getMetricHistory(principal: Principal): ResponseEntity<List<UserMetricResponse>> {
        val metrics = userMetricServicePort.getMetricHistory(principal.name)
        return ResponseEntity.ok(metrics.map { userMetricMapper.toResponse(it) })
    }

    @Operation(summary = "Get metric by ID", description = "Returns a single body metric snapshot by its UUID.")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Metric returned"),
        ApiResponse(responseCode = "404", description = "Metric not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @GetMapping("/{metricId}")
    fun getMetricById(
        @Parameter(description = "UUID of the metric entry", required = true)
        @PathVariable metricId: String,
        principal: Principal,
    ): ResponseEntity<UserMetricResponse> {
        val metric = userMetricServicePort.getMetricById(metricId, principal.name)
        return ResponseEntity.ok(userMetricMapper.toResponse(metric))
    }

    @Operation(
        summary = "Delete metric",
        description = "Deletes a body metric snapshot owned by the authenticated user."
    )
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Metric deleted"),
        ApiResponse(responseCode = "404", description = "Metric not found"),
        ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
    )
    @DeleteMapping("/{metricId}")
    fun deleteMetric(
        @PathVariable metricId: String,
        principal: Principal,
    ): ResponseEntity<Unit> {
        userMetricServicePort.deleteMetric(metricId, principal.name)
        return ResponseEntity.noContent().build()
    }
}
