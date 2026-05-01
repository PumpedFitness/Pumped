package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionSetDto
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutSessionSetDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutSessionSetServicePort
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionRepository
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionSetRepository
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSessionSet
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WorkoutSessionSetServiceAdapter(
    private val workoutSessionSetRepository: WorkoutSessionSetRepository,
    private val workoutSessionRepository: WorkoutSessionRepository,
    private val workoutSessionSetDtoMapper: WorkoutSessionSetDtoMapper,
) : WorkoutSessionSetServicePort {

    private fun assertSessionOwner(sessionId: UUID, userId: String) {
        val session = workoutSessionRepository.findById(sessionId)
            .orElseThrow { ResourceNotFoundException("Workout session not found") }
        if (session.userId != UUID.fromString(userId)) throw UnauthorizedException()
    }

    override fun logSet(
        sessionId: String,
        userId: String,
        exerciseId: String,
        setIndex: Int,
        reps: Int,
        weight: Double?,
        restSeconds: Int?,
        durationSeconds: Int?,
        notes: String?,
    ): WorkoutSessionSetDto {
        val sessionUuid = UUID.fromString(sessionId)
        assertSessionOwner(sessionUuid, userId)
        val set = WorkoutSessionSet(
            id = UUID.randomUUID(),
            workoutSessionId = sessionUuid,
            exerciseId = UUID.fromString(exerciseId),
            setIndex = setIndex,
            reps = reps,
            weight = weight,
            restSeconds = restSeconds,
            durationSeconds = durationSeconds,
            notes = notes,
            performedAt = System.currentTimeMillis(),
        )
        return workoutSessionSetDtoMapper.toDto(workoutSessionSetRepository.save(set))
    }

    override fun getSetsBySessionId(sessionId: String, userId: String): List<WorkoutSessionSetDto> {
        assertSessionOwner(UUID.fromString(sessionId), userId)
        return workoutSessionSetRepository
            .findByWorkoutSessionIdOrderBySetIndex(UUID.fromString(sessionId))
            .map { workoutSessionSetDtoMapper.toDto(it) }
    }

    override fun getSetById(setId: String): WorkoutSessionSetDto? {
        val set = workoutSessionSetRepository.findById(UUID.fromString(setId)).orElse(null)
        return set?.let { workoutSessionSetDtoMapper.toDto(it) }
    }

    override fun deleteSet(setId: String, userId: String) {
        val set = workoutSessionSetRepository.findById(UUID.fromString(setId))
            .orElseThrow { ResourceNotFoundException("Workout set not found") }
        assertSessionOwner(set.workoutSessionId, userId)
        workoutSessionSetRepository.delete(set)
    }
}
