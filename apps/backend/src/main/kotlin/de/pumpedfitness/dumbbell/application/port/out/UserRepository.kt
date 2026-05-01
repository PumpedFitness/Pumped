package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.User
import org.springframework.data.domain.Example
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID> {
    fun save(user: User): User
    fun findByUsername(username: String): User?
}
