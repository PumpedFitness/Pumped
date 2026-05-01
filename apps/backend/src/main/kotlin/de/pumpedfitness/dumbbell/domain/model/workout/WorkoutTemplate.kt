package de.pumpedfitness.dumbbell.domain.model.workout

import jakarta.persistence.*
import java.util.*

@Entity
data class WorkoutTemplate(
    @Id val id: UUID,
    val userId: UUID,
    val name: String,
    val description: String?,

    @OneToMany(
        mappedBy = "workoutTemplateId",
        cascade = [CascadeType.ALL],
        fetch = FetchType.LAZY,
        orphanRemoval = true
    )
    val exercises: MutableList<WorkoutTemplateExercise>, // joint entity between workout template and exercise

    val createdAt: Long,
    val updatedAt: Long
) {
    companion object {}
}
