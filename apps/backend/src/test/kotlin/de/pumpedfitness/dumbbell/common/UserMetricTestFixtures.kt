package de.pumpedfitness.dumbbell.common

import de.pumpedfitness.dumbbell.domain.model.UserMetric
import de.pumpedfitness.dumbbell.domain.model.enum.Gender
import java.util.*

fun UserMetric.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    userId: UUID = UUID.randomUUID(),
    weight: Double? = 82.5,
    bodyFat: Double? = 15.2,
    height: Double? = 183.0,
    gender: Gender? = Gender.MALE,
    birthdate: Long? = 631152000000L,
    recordedAt: Long = System.currentTimeMillis(),
): UserMetric {
    return UserMetric(
        id = id,
        userId = userId,
        weight = weight,
        bodyFat = bodyFat,
        height = height,
        gender = gender,
        birthdate = birthdate,
        recordedAt = recordedAt,
    )
}
