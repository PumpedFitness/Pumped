package de.pumpedfitness.dumbbell.application.dto

import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseCategory
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseEquipment
import de.pumpedfitness.dumbbell.domain.model.workout.enum.MuscleGroup
import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Details of a single exercise")
data class ExerciseDto(
    @Schema(description = "Unique identifier (UUID) of the exercise", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    val id: String,
    @Schema(description = "Name of the exercise", example = "Barbell Squat")
    val name: String,
    @Schema(description = "Optional description of the exercise", example = "A compound lower-body movement")
    val description: String?,
    @Schema(description = "Muscle groups targeted by this exercise")
    val muscleGroup: List<MuscleGroup>,
    @Schema(description = "Category of the exercise")
    val exerciseCategory: ExerciseCategory,
    @Schema(description = "Equipment required for the exercise")
    val equipment: List<ExerciseEquipment>
)
