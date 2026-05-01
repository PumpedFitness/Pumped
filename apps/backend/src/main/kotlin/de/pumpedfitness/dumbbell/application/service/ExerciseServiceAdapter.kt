package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.ExerciseDto
import de.pumpedfitness.dumbbell.application.mapper.ExerciseDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.ExerciseServicePort
import de.pumpedfitness.dumbbell.application.port.out.ExerciseRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class ExerciseServiceAdapter(
    private val exerciseRepository: ExerciseRepository,
    private val exerciseDtoMapper: ExerciseDtoMapper
) : ExerciseServicePort {

    override fun getAllExercises(): List<ExerciseDto> {
        return exerciseDtoMapper.toDtoList(exerciseRepository.findAll())
    }

    override fun getExerciseById(id: String): ExerciseDto? {
        val exercise = exerciseRepository.findById(UUID.fromString(id)).orElse(null)
        return exercise?.let { exerciseDtoMapper.toDto(it) }
    }
}