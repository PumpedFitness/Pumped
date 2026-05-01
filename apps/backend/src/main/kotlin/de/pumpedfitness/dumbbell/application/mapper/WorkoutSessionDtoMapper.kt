package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionDto
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSession
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WorkoutSessionDtoMapper {

    fun toDto(session: WorkoutSession): WorkoutSessionDto {
        return WorkoutSessionDto(
            id = session.id.toString(),
            userId = session.userId.toString(),
            workoutTemplateId = session.workoutTemplateId?.toString(),
            name = session.name,
            startedAt = session.startedAt,
            endedAt = session.endedAt,
            notes = session.notes,
        )
    }

    fun toModel(dto: WorkoutSessionDto): WorkoutSession {
        return WorkoutSession(
            id = UUID.fromString(dto.id),
            userId = UUID.fromString(dto.userId),
            workoutTemplateId = dto.workoutTemplateId?.let { UUID.fromString(it) },
            name = dto.name,
            startedAt = dto.startedAt,
            endedAt = dto.endedAt,
            notes = dto.notes,
        )
    }
}
