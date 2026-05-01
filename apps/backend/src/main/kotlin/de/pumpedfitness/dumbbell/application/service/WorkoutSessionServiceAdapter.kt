package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionDto
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutSessionDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutSessionServicePort
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionRepository
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSession
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WorkoutSessionServiceAdapter(
    private val workoutSessionRepository: WorkoutSessionRepository,
    private val workoutSessionDtoMapper: WorkoutSessionDtoMapper,
) : WorkoutSessionServicePort {

    override fun startSession(userId: String, name: String, workoutTemplateId: String?, notes: String?): WorkoutSessionDto {
        val session = WorkoutSession(
            id = UUID.randomUUID(),
            userId = UUID.fromString(userId),
            workoutTemplateId = workoutTemplateId?.let { UUID.fromString(it) },
            name = name,
            startedAt = System.currentTimeMillis(),
            endedAt = null,
            notes = notes,
        )
        return workoutSessionDtoMapper.toDto(workoutSessionRepository.save(session))
    }

    override fun getSessionById(sessionId: String, userId: String): WorkoutSessionDto {
        val session = workoutSessionRepository.findById(UUID.fromString(sessionId))
            .orElseThrow { ResourceNotFoundException("Workout session not found") }
        if (session.userId != UUID.fromString(userId)) throw UnauthorizedException()
        return workoutSessionDtoMapper.toDto(session)
    }

    override fun getSessionsByUserId(userId: String): List<WorkoutSessionDto> {
        return workoutSessionRepository
            .findByUserIdOrderByStartedAtDesc(UUID.fromString(userId))
            .map { workoutSessionDtoMapper.toDto(it) }
    }

    override fun finishSession(sessionId: String, userId: String, notes: String?): WorkoutSessionDto {
        val existing = workoutSessionRepository.findById(UUID.fromString(sessionId))
            .orElseThrow { ResourceNotFoundException("Workout session not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        val finished = existing.copy(endedAt = System.currentTimeMillis(), notes = notes ?: existing.notes)
        return workoutSessionDtoMapper.toDto(workoutSessionRepository.save(finished))
    }

    override fun deleteSession(sessionId: String, userId: String) {
        val existing = workoutSessionRepository.findById(UUID.fromString(sessionId))
            .orElseThrow { ResourceNotFoundException("Workout session not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        workoutSessionRepository.delete(existing)
    }
}
