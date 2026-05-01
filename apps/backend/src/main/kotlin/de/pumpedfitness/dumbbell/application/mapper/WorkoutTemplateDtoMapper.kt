package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateExerciseDto
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplateExercise
import org.springframework.stereotype.Component

@Component
class WorkoutTemplateDtoMapper {

    fun toDto(template: WorkoutTemplate): WorkoutTemplateDto {
        return WorkoutTemplateDto(
            id = template.id.toString(),
            userId = template.userId.toString(),
            name = template.name,
            description = template.description,
            exercises = template.exercises.map { toExerciseDto(it) },
            createdAt = template.createdAt,
            updatedAt = template.updatedAt,
        )
    }

    fun toExerciseDto(exercise: WorkoutTemplateExercise): WorkoutTemplateExerciseDto {
        return WorkoutTemplateExerciseDto(
            id = exercise.id.toString(),
            workoutTemplateId = exercise.workoutTemplateId.toString(),
            exerciseId = exercise.exerciseId.toString(),
            orderIndex = exercise.orderIndex,
            sets = exercise.sets,
            targetReps = exercise.targetReps,
            targetWeight = exercise.targetWeight,
            restSeconds = exercise.restSeconds,
            notes = exercise.notes,
            createdAt = exercise.createdAt,
            updatedAt = exercise.updatedAt,
        )
    }

    fun toModel(dto: WorkoutTemplateDto): WorkoutTemplate {
        return WorkoutTemplate(
            id = java.util.UUID.fromString(dto.id),
            userId = java.util.UUID.fromString(dto.userId),
            name = dto.name,
            description = dto.description,
            exercises = dto.exercises.map { toExerciseModel(it) }.toMutableList(),
            createdAt = dto.createdAt,
            updatedAt = dto.updatedAt,
        )
    }

    fun toExerciseModel(dto: WorkoutTemplateExerciseDto): WorkoutTemplateExercise {
        return WorkoutTemplateExercise(
            id = java.util.UUID.fromString(dto.id),
            workoutTemplateId = java.util.UUID.fromString(dto.workoutTemplateId),
            exerciseId = java.util.UUID.fromString(dto.exerciseId),
            orderIndex = dto.orderIndex,
            sets = dto.sets,
            targetReps = dto.targetReps,
            targetWeight = dto.targetWeight,
            restSeconds = dto.restSeconds,
            notes = dto.notes,
            createdAt = dto.createdAt,
            updatedAt = dto.updatedAt,
        )
    }
}
