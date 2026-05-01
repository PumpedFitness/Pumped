package de.pumpedfitness.dumbbell.domain.model.workout

import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday
import jakarta.persistence.*
import java.util.*

@Entity
data class WorkoutTemplate(
    @Id val id: UUID,
    val userId: UUID,
    val name: String,
    val description: String?,
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type")
    val scheduleType: WorkoutTemplateScheduleType?,
    @Column(name = "schedule_interval")
    val scheduleInterval: Int?,
    @ElementCollection(targetClass = WorkoutWeekday::class, fetch = FetchType.LAZY)
    @CollectionTable(
        name = "workout_template_schedule_weekday",
        joinColumns = [JoinColumn(name = "workout_template_id")]
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "weekday")
    val scheduledWeekdays: MutableSet<WorkoutWeekday>,

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
