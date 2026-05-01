package de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateScheduleDto
import de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.dto.response.WorkoutTemplateResponse
import de.pumpedfitness.dumbbell.infrastructure.web.workouttemplate.dto.response.WorkoutTemplateScheduleResponse
import org.springframework.stereotype.Component

@Component
class WorkoutTemplateMapper {

    fun toResponse(dto: WorkoutTemplateDto): WorkoutTemplateResponse {
        return WorkoutTemplateResponse(
            id = dto.id,
            name = dto.name,
            description = dto.description,
            schedule = dto.schedule?.let(::toScheduleResponse),
            exercises = dto.exercises,
            createdAt = dto.createdAt,
            updatedAt = dto.updatedAt,
        )
    }

    fun toScheduleResponse(dto: WorkoutTemplateScheduleDto): WorkoutTemplateScheduleResponse {
        return WorkoutTemplateScheduleResponse(
            type = dto.type,
            interval = dto.interval,
            weekdays = dto.weekdays,
        )
    }
}