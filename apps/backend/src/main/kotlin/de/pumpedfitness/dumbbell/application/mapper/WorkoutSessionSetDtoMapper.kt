package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionSetDto
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSessionSet
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WorkoutSessionSetDtoMapper {

    fun toDto(set: WorkoutSessionSet): WorkoutSessionSetDto {
        return WorkoutSessionSetDto(
            id = set.id.toString(),
            workoutSessionId = set.workoutSessionId.toString(),
            exerciseId = set.exerciseId.toString(),
            setIndex = set.setIndex,
            reps = set.reps,
            weight = set.weight,
            restSeconds = set.restSeconds,
            durationSeconds = set.durationSeconds,
            notes = set.notes,
            performedAt = set.performedAt,
        )
    }

    fun toModel(dto: WorkoutSessionSetDto): WorkoutSessionSet {
        return WorkoutSessionSet(
            id = UUID.fromString(dto.id),
            workoutSessionId = UUID.fromString(dto.workoutSessionId),
            exerciseId = UUID.fromString(dto.exerciseId),
            setIndex = dto.setIndex,
            reps = dto.reps,
            weight = dto.weight,
            restSeconds = dto.restSeconds,
            durationSeconds = dto.durationSeconds,
            notes = dto.notes,
            performedAt = dto.performedAt,
        )
    }
}
