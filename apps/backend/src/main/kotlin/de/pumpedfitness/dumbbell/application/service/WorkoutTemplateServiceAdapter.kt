package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateScheduleDto
import de.pumpedfitness.dumbbell.application.exception.InvalidWorkoutTemplateScheduleException
import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutTemplateDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutTemplateServicePort
import de.pumpedfitness.dumbbell.application.port.out.WorkoutTemplateRepository
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WorkoutTemplateServiceAdapter(
    private val workoutTemplateRepository: WorkoutTemplateRepository,
    private val workoutTemplateDtoMapper: WorkoutTemplateDtoMapper,
) : WorkoutTemplateServicePort {

    override fun createTemplate(
        userId: String,
        name: String,
        description: String?,
        schedule: WorkoutTemplateScheduleDto?,
    ): WorkoutTemplateDto {
        validateSchedule(schedule)
        val now = System.currentTimeMillis()
        val template = WorkoutTemplate(
            id = UUID.randomUUID(),
            userId = UUID.fromString(userId),
            name = name,
            description = description,
            scheduleType = schedule?.type,
            scheduleInterval = schedule?.interval,
            scheduledWeekdays = schedule?.weekdays?.toMutableSet() ?: mutableSetOf(),
            exercises = mutableListOf(),
            createdAt = now,
            updatedAt = now,
        )
        return workoutTemplateDtoMapper.toDto(workoutTemplateRepository.save(template))
    }

    override fun getTemplateById(templateId: String, userId: String): WorkoutTemplateDto {
        val template = workoutTemplateRepository.findById(UUID.fromString(templateId))
            .orElseThrow { ResourceNotFoundException("Workout template not found") }
        if (template.userId != UUID.fromString(userId)) throw UnauthorizedException()
        return workoutTemplateDtoMapper.toDto(template)
    }

    override fun getTemplatesByUserId(userId: String): List<WorkoutTemplateDto> {
        return workoutTemplateRepository
            .findWorkoutTemplateByUserId(UUID.fromString(userId))
            .map { workoutTemplateDtoMapper.toDto(it) }
    }

    override fun updateTemplate(
        templateId: String,
        userId: String,
        name: String,
        description: String?,
        schedule: WorkoutTemplateScheduleDto?,
    ): WorkoutTemplateDto {
        validateSchedule(schedule)
        val existing = workoutTemplateRepository.findById(UUID.fromString(templateId))
            .orElseThrow { ResourceNotFoundException("Workout template not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        val updated = existing.copy(
            name = name,
            description = description,
            scheduleType = schedule?.type,
            scheduleInterval = schedule?.interval,
            scheduledWeekdays = schedule?.weekdays?.toMutableSet() ?: mutableSetOf(),
            updatedAt = System.currentTimeMillis(),
        )
        return workoutTemplateDtoMapper.toDto(workoutTemplateRepository.save(updated))
    }

    override fun deleteTemplate(templateId: String, userId: String) {
        val existing = workoutTemplateRepository.findById(UUID.fromString(templateId))
            .orElseThrow { ResourceNotFoundException("Workout template not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        workoutTemplateRepository.delete(existing)
    }

    private fun validateSchedule(schedule: WorkoutTemplateScheduleDto?) {
        if (schedule == null) {
            return
        }

        if (schedule.interval < 1) {
            throw InvalidWorkoutTemplateScheduleException("Schedule interval must be at least 1")
        }

        when (schedule.type) {
            WorkoutTemplateScheduleType.DAYS -> {
                if (schedule.weekdays.isNotEmpty()) {
                    throw InvalidWorkoutTemplateScheduleException("Daily schedules must not define weekdays")
                }
            }
            WorkoutTemplateScheduleType.WEEKS -> {
                if (schedule.weekdays.isEmpty()) {
                    throw InvalidWorkoutTemplateScheduleException("Weekly schedules must define at least one weekday")
                }
            }
        }
    }
}
