package de.pumpedfitness.dumbbell.application.port.out

import de.pumpedfitness.dumbbell.domain.model.JwtDenylistToken
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface JwtDenylistRepository : CrudRepository<JwtDenylistToken, String> {
}