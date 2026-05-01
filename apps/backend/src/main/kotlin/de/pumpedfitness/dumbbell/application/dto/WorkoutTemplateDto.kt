package de.pumpedfitness.dumbbell.application.dto

data class WorkoutTemplateDto(
    val id: String,
    val userId: String,
    val name: String,
    val description: String?,
    val schedule: WorkoutTemplateScheduleDto?,
    val exercises: List<WorkoutTemplateExerciseDto>,
    val createdAt: Long,
    val updatedAt: Long,
)
