package de.pumpedfitness.dumbbell.infrastructure.web.workout.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response.WorkoutTemplateResponse
import org.springframework.stereotype.Component

@Component
class WorkoutTemplateMapper {

    fun toResponse(dto: WorkoutTemplateDto): WorkoutTemplateResponse {
        return WorkoutTemplateResponse(
            id = dto.id,
            name = dto.name,
            description = dto.description,
            exercises = dto.exercises,
            createdAt = dto.createdAt,
            updatedAt = dto.updatedAt,
        )
    }
}
