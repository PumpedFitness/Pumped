package de.pumpedfitness.dumbbell.domain.model.workout

import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.util.*

@Entity
// a concrete, logged workout instance
data class WorkoutSession(
    @Id val id: UUID,
    val userId: UUID,
    val workoutTemplateId: UUID?, // nullable because user might create a session without a template, just picking exercises on the fly
    val name: String,
    val startedAt: Long,
    val endedAt: Long?,
    val notes: String?,
)
