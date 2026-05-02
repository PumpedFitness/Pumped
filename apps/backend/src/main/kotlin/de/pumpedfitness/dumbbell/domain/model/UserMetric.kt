package de.pumpedfitness.dumbbell.domain.model

import de.pumpedfitness.dumbbell.domain.model.enum.Gender
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import java.util.*

@Entity
data class UserMetric(
    @Id val id: UUID,
    val userId: UUID,
    val weight: Double?,
    val bodyFat: Double?,
    val height: Double?,
    @Enumerated(EnumType.STRING)
    val gender: Gender?,
    val birthdate: Long?,
    val recordedAt: Long,
) {
    companion object {}
}
