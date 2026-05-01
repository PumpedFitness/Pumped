package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutTemplateDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutTemplateServicePort
import de.pumpedfitness.dumbbell.application.port.out.WorkoutTemplateRepository
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WorkoutTemplateServiceAdapter(
    private val workoutTemplateRepository: WorkoutTemplateRepository,
    private val workoutTemplateDtoMapper: WorkoutTemplateDtoMapper,
) : WorkoutTemplateServicePort {

    override fun createTemplate(userId: String, name: String, description: String?): WorkoutTemplateDto {
        val now = System.currentTimeMillis()
        val template = WorkoutTemplate(
            id = UUID.randomUUID(),
            userId = UUID.fromString(userId),
            name = name,
            description = description,
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

    override fun updateTemplate(templateId: String, userId: String, name: String, description: String?): WorkoutTemplateDto {
        val existing = workoutTemplateRepository.findById(UUID.fromString(templateId))
            .orElseThrow { ResourceNotFoundException("Workout template not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        val updated = existing.copy(name = name, description = description, updatedAt = System.currentTimeMillis())
        return workoutTemplateDtoMapper.toDto(workoutTemplateRepository.save(updated))
    }

    override fun deleteTemplate(templateId: String, userId: String) {
        val existing = workoutTemplateRepository.findById(UUID.fromString(templateId))
            .orElseThrow { ResourceNotFoundException("Workout template not found") }
        if (existing.userId != UUID.fromString(userId)) throw UnauthorizedException()
        workoutTemplateRepository.delete(existing)
    }
}
