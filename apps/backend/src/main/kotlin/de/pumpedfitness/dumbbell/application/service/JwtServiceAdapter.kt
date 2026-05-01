package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.port.`in`.JwtServicePort
import de.pumpedfitness.dumbbell.application.port.out.JwtDenylistRepository
import de.pumpedfitness.dumbbell.domain.model.JwtDenylistToken
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class JwtServiceAdapter(

    @Autowired
    val jwtDenylistRepository: JwtDenylistRepository

) : JwtServicePort {
    override fun isTokenDenied(token: String): Boolean {
        return jwtDenylistRepository.existsById(token)
    }

    override fun denyToken(token: String, expiration: Long) {
        val denylistedToken = JwtDenylistToken(
            token = token,
            timeToLive = expiration
        )
        jwtDenylistRepository.save(denylistedToken)
    }

}