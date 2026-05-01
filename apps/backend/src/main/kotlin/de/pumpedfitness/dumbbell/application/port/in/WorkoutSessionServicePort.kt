package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.WorkoutSessionDto

interface WorkoutSessionServicePort {
    fun startSession(userId: String, name: String, workoutTemplateId: String?, notes: String?): WorkoutSessionDto
    fun getSessionById(sessionId: String, userId: String): WorkoutSessionDto
    fun getSessionsByUserId(userId: String): List<WorkoutSessionDto>
    fun finishSession(sessionId: String, userId: String, notes: String?): WorkoutSessionDto
    fun deleteSession(sessionId: String, userId: String)
}
