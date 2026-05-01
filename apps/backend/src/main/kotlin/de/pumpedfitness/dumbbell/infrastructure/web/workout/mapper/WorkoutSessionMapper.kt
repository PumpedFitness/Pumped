package de.pumpedfitness.dumbbell.infrastructure.web.workout.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionDto
import de.pumpedfitness.dumbbell.infrastructure.web.workout.dto.response.WorkoutSessionResponse
import org.springframework.stereotype.Component

@Component
class WorkoutSessionMapper {

    fun toResponse(dto: WorkoutSessionDto): WorkoutSessionResponse {
        return WorkoutSessionResponse(
            id = dto.id,
            workoutTemplateId = dto.workoutTemplateId,
            name = dto.name,
            startedAt = dto.startedAt,
            endedAt = dto.endedAt,
            notes = dto.notes,
        )
    }
}
