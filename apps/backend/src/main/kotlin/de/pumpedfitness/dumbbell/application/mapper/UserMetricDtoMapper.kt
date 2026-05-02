package de.pumpedfitness.dumbbell.application.mapper

import de.pumpedfitness.dumbbell.application.dto.UserMetricDto
import de.pumpedfitness.dumbbell.domain.model.UserMetric
import org.springframework.stereotype.Component
import java.util.*

@Component
class UserMetricDtoMapper {

    fun toDto(metric: UserMetric): UserMetricDto {
        return UserMetricDto(
            id = metric.id.toString(),
            userId = metric.userId.toString(),
            weight = metric.weight,
            bodyFat = metric.bodyFat,
            height = metric.height,
            gender = metric.gender,
            birthdate = metric.birthdate,
            recordedAt = metric.recordedAt,
        )
    }

    fun toModel(dto: UserMetricDto): UserMetric {
        return UserMetric(
            id = UUID.fromString(dto.id),
            userId = UUID.fromString(dto.userId),
            weight = dto.weight,
            bodyFat = dto.bodyFat,
            height = dto.height,
            gender = dto.gender,
            birthdate = dto.birthdate,
            recordedAt = dto.recordedAt,
        )
    }
}
