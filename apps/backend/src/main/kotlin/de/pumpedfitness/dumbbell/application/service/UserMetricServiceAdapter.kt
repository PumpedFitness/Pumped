package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.UserMetricDto
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.UserMetricDtoMapper
import de.pumpedfitness.dumbbell.application.port.`in`.UserMetricServicePort
import de.pumpedfitness.dumbbell.application.port.out.UserMetricRepository
import de.pumpedfitness.dumbbell.domain.model.UserMetric
import de.pumpedfitness.dumbbell.domain.model.enum.Gender
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserMetricServiceAdapter(
    private val userMetricRepository: UserMetricRepository,
    private val userMetricDtoMapper: UserMetricDtoMapper,
) : UserMetricServicePort {

    override fun logMetric(
        userId: String,
        weight: Double?,
        bodyFat: Double?,
        height: Double?,
        gender: Gender?,
        birthdate: Long?,
    ): UserMetricDto {
        val metric = UserMetric(
            id = UUID.randomUUID(),
            userId = UUID.fromString(userId),
            weight = weight,
            bodyFat = bodyFat,
            height = height,
            gender = gender,
            birthdate = birthdate,
            recordedAt = System.currentTimeMillis(),
        )
        return userMetricDtoMapper.toDto(userMetricRepository.save(metric))
    }

    override fun getLatestMetric(userId: String): UserMetricDto {
        val metric = userMetricRepository.findFirstByUserIdOrderByRecordedAtDesc(UUID.fromString(userId))
            ?: throw ResourceNotFoundException("No metrics found for user")
        return userMetricDtoMapper.toDto(metric)
    }

    override fun getMetricHistory(userId: String): List<UserMetricDto> {
        return userMetricRepository
            .findByUserIdOrderByRecordedAtDesc(UUID.fromString(userId))
            .map { userMetricDtoMapper.toDto(it) }
    }

    override fun getMetricById(metricId: String, userId: String): UserMetricDto {
        val metric = userMetricRepository.findById(UUID.fromString(metricId))
            .orElseThrow { ResourceNotFoundException("Metric not found") }
        if (metric.userId != UUID.fromString(userId)) throw UnauthorizedException()
        return userMetricDtoMapper.toDto(metric)
    }

    override fun deleteMetric(metricId: String, userId: String) {
        val metric = userMetricRepository.findById(UUID.fromString(metricId))
            .orElseThrow { ResourceNotFoundException("Metric not found") }
        if (metric.userId != UUID.fromString(userId)) throw UnauthorizedException()
        userMetricRepository.delete(metric)
    }
}
