package de.pumpedfitness.dumbbell.infrastructure.web.usermetric.mapper

import de.pumpedfitness.dumbbell.application.dto.UserMetricDto
import de.pumpedfitness.dumbbell.infrastructure.web.usermetric.dto.response.UserMetricResponse
import org.springframework.stereotype.Component

@Component
class UserMetricMapper {

    fun toResponse(dto: UserMetricDto): UserMetricResponse {
        return UserMetricResponse(
            id = dto.id,
            weight = dto.weight,
            bodyFat = dto.bodyFat,
            height = dto.height,
            gender = dto.gender,
            birthdate = dto.birthdate,
            recordedAt = dto.recordedAt,
        )
    }
}
