package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.ExerciseDto

interface ExerciseServicePort {
    fun getAllExercises(): List<ExerciseDto>
    fun getExerciseById(id: String): ExerciseDto?
}