package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.workout.Exercise
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ExerciseRepository : JpaRepository<Exercise, UUID> {
}