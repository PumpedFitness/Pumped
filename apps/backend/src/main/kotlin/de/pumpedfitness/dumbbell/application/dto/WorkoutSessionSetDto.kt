package de.pumpedfitness.dumbbell.application.dto

data class WorkoutSessionSetDto(
    val id: String,
    val workoutSessionId: String,
    val exerciseId: String,
    val setIndex: Int,
    val reps: Int,
    val weight: Double?,
    val rpe: Double?,
    val restSeconds: Int?,
    val durationSeconds: Int?,
    val notes: String?,
    val performedAt: Long,
)
