package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplateExercise
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface WorkoutTemplateExerciseRepository : JpaRepository<WorkoutTemplateExercise, UUID> {
    fun findByWorkoutTemplateIdOrderByOrderIndex(workoutTemplateId: UUID): List<WorkoutTemplateExercise>
    fun deleteByWorkoutTemplateId(workoutTemplateId: UUID)
}
