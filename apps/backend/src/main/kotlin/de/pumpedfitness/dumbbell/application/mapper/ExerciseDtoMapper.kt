package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.ExerciseDto
import de.pumpedfitness.dumbbell.domain.model.workout.Exercise
import org.springframework.stereotype.Component

@Component
class ExerciseDtoMapper {

    fun toDtoList(exercises: List<Exercise>): List<ExerciseDto> {
        return exercises.map { toDto(it) }
    }

    fun toDto(exercise: Exercise): ExerciseDto {
        return ExerciseDto(
            id = exercise.id.toString(),
            name = exercise.name,
            description = exercise.description,
            muscleGroup = exercise.muscleGroups,
            exerciseCategory = exercise.exerciseCategory,
            equipment = exercise.equipment
        )
    }
}