package de.pumpedfitness.dumbbell.infrastructure.web.workoutsession.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionSetDto
import de.pumpedfitness.dumbbell.infrastructure.web.workoutsession.dto.response.WorkoutSessionSetResponse
import org.springframework.stereotype.Component

@Component
class WorkoutSessionSetMapper {

    fun toResponse(dto: WorkoutSessionSetDto): WorkoutSessionSetResponse {
        return WorkoutSessionSetResponse(
            id = dto.id,
            exerciseId = dto.exerciseId,
            setIndex = dto.setIndex,
            reps = dto.reps,
            weight = dto.weight,
            rpe = dto.rpe,
            restSeconds = dto.restSeconds,
            durationSeconds = dto.durationSeconds,
            notes = dto.notes,
            performedAt = dto.performedAt,
        )
    }
}
