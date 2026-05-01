package de.pumpedfitness.dumbbell.domain.model.workout

import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseCategory
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseEquipment
import de.pumpedfitness.dumbbell.domain.model.workout.enum.MuscleGroup
import jakarta.persistence.*
import java.util.*

@Entity
data class Exercise(
    @Id val id: UUID,
    val name: String,
    val description: String?,
    val createdAt: Long,

    @ElementCollection(targetClass = MuscleGroup::class, fetch = FetchType.EAGER)
    @CollectionTable(name = "exercise_muscle_group", joinColumns = [JoinColumn(name = "exercise_id")])
    @Column(name = "muscle_group")
    @Enumerated(EnumType.STRING)
    val muscleGroups: List<MuscleGroup>,

    @Enumerated(EnumType.STRING)
    val exerciseCategory: ExerciseCategory,

    @ElementCollection(targetClass = ExerciseEquipment::class, fetch = FetchType.EAGER)
    @CollectionTable(name = "exercise_equipment", joinColumns = [JoinColumn(name = "exercise_id")])
    @Column(name = "equipment")
    @Enumerated(EnumType.STRING)
    val equipment: List<ExerciseEquipment>
) {
    companion object {}
}
