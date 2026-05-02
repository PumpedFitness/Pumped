package de.pumpedfitness.dumbbell.application.dto

import de.pumpedfitness.dumbbell.domain.model.enum.Gender

data class UserMetricDto(
    val id: String,
    val userId: String,
    val weight: Double?,
    val bodyFat: Double?,
    val height: Double?,
    val gender: Gender?,
    val birthdate: Long?,
    val recordedAt: Long,
)
