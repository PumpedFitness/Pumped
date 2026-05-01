package de.pumpedfitness.dumbbell.common

import de.pumpedfitness.dumbbell.domain.model.workout.Exercise
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseCategory
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseEquipment
import de.pumpedfitness.dumbbell.domain.model.workout.enum.MuscleGroup
import java.util.*

fun Exercise.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    name: String = "Bench Press",
    description: String? = "Flat barbell bench press",
    muscleGroups: List<MuscleGroup> = listOf(MuscleGroup.CHEST),
    exerciseCategory: ExerciseCategory = ExerciseCategory.STRENGTH,
    equipment: List<ExerciseEquipment> = listOf(ExerciseEquipment.BARBELL),
): Exercise {
    return Exercise(
        id = id,
        name = name,
        description = description,
        createdAt = System.currentTimeMillis(),
        muscleGroups = muscleGroups,
        exerciseCategory = exerciseCategory,
        equipment = equipment,
    )
}

