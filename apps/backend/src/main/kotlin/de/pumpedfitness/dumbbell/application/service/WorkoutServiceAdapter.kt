package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.port.`in`.WorkoutServicePort
import de.pumpedfitness.dumbbell.application.port.out.WorkoutTemplateRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class WorkoutServiceAdapter(
    private val workoutTemplateRepository: WorkoutTemplateRepository,
) : WorkoutServicePort {

    override fun getWorkoutTemplateByUserId(userId: String): List<WorkoutDto> {
        val workoutTemplates = workoutTemplateRepository.findWorkoutTemplateByUserId(UUID.fromString(userId))
    }
}