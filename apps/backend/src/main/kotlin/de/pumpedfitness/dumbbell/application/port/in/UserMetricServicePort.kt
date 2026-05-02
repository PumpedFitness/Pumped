package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.UserMetricDto
import de.pumpedfitness.dumbbell.domain.model.enum.Gender

interface UserMetricServicePort {
    fun logMetric(
        userId: String,
        weight: Double?,
        bodyFat: Double?,
        height: Double?,
        gender: Gender?,
        birthdate: Long?,
    ): UserMetricDto

    fun getLatestMetric(userId: String): UserMetricDto

    fun getMetricHistory(userId: String): List<UserMetricDto>

    fun getMetricById(metricId: String, userId: String): UserMetricDto

    fun deleteMetric(metricId: String, userId: String)
}
