package de.pumpedfitness.dumbbell.application.port.`in`

interface WorkoutServicePort {
    fun getWorkoutTemplateByUserId(userId: String): List<WorkoutDto>
}