package de.pumpedfitness.dumbbell.application.port.`in`

interface JwtServicePort {

    fun isTokenDenied(token: String): Boolean

    fun denyToken(token: String, expiration: Long)
}