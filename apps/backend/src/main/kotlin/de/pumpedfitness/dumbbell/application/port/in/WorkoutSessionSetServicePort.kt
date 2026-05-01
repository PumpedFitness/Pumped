package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionSetDto

interface WorkoutSessionSetServicePort {
    fun logSet(
        sessionId: String,
        userId: String,
        exerciseId: String,
        setIndex: Int,
        reps: Int,
        weight: Double?,
        rpe: Double?,
        restSeconds: Int?,
        durationSeconds: Int?,
        notes: String?,
    ): WorkoutSessionSetDto

    fun getSetsBySessionId(sessionId: String, userId: String): List<WorkoutSessionSetDto>
    fun getSetById(setId: String): WorkoutSessionSetDto?
    fun deleteSet(setId: String, userId: String)
}
