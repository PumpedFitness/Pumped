package de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.dto.request

import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Min

@Schema(description = "Optional workout template schedule")
data class WorkoutTemplateScheduleRequest(
    @Schema(description = "Recurring schedule type", example = "WEEKS")
    val type: WorkoutTemplateScheduleType,

    @field:Min(value = 1, message = "Interval must be at least 1")
    @Schema(description = "Repeat interval for the selected schedule type", example = "2")
    val interval: Int,

    @Schema(description = "Weekdays used when type is WEEKS")
    val weekdays: Set<WorkoutWeekday>?,
)
