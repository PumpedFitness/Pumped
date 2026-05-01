package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSessionSet
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface WorkoutSessionSetRepository : JpaRepository<WorkoutSessionSet, UUID> {
    fun findByWorkoutSessionIdOrderBySetIndex(workoutSessionId: UUID): List<WorkoutSessionSet>
    fun deleteByWorkoutSessionId(workoutSessionId: UUID)
}
