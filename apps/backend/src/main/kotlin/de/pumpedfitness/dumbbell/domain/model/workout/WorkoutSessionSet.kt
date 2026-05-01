package de.pumpedfitness.dumbbell.domain.model.workout

import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.util.*

@Entity
data class WorkoutSessionSet(
    @Id val id: UUID,
    val workoutSessionId: UUID,
    val exerciseId: UUID,
    val setIndex: Int,
    val reps: Int,
    val weight: Double?,
    val rpe: Double?,
    val restSeconds: Int?,
    val durationSeconds: Int?,
    val notes: String?,
    val performedAt: Long,
) {
    companion object {}
}
