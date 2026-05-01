package de.pumpedfitness.dumbbell.application.dto

import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday

data class WorkoutTemplateScheduleDto(
    val type: WorkoutTemplateScheduleType,
    val interval: Int,
    val weekdays: List<WorkoutWeekday>,
)
