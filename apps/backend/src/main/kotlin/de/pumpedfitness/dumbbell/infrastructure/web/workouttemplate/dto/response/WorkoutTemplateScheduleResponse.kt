package de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.dto.response

import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday
import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Recurring schedule configured for a workout template")
data class WorkoutTemplateScheduleResponse(
    @Schema(description = "Recurring schedule type", example = "WEEKS")
    val type: WorkoutTemplateScheduleType,
    @Schema(description = "Repeat interval for the selected schedule type", example = "2")
    val interval: Int,
    @Schema(description = "Weekdays used when type is WEEKS")
    val weekdays: List<WorkoutWeekday>,
)
