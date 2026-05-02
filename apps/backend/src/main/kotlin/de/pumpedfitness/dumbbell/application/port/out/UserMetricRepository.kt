package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.UserMetric
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserMetricRepository : JpaRepository<UserMetric, UUID> {
    fun findByUserIdOrderByRecordedAtDesc(userId: UUID): List<UserMetric>
    fun findFirstByUserIdOrderByRecordedAtDesc(userId: UUID): UserMetric?
}
