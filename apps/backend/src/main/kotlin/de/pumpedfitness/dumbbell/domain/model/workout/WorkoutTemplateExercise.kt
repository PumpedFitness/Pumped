package de.pumpedfitness.dumbbell.domain.model.workout

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.util.*

@Entity
data class WorkoutTemplateExercise(
    @Id val id: UUID,
    @Column(name = "workout_template_id", nullable = false)
    val workoutTemplateId: UUID,
    val exerciseId: UUID,
    val orderIndex: Int,
    val sets: Int,
    val targetReps: String,
    val targetWeight: Double?,
    val restSeconds: Int?,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long,
) {
    companion object {}
}
