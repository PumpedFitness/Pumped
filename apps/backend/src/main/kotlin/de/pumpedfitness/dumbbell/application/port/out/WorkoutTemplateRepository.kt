package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface WorkoutTemplateRepository : JpaRepository<WorkoutTemplate, UUID> {
    fun findWorkoutTemplateByUserId(userId: UUID): MutableList<WorkoutTemplate>
}