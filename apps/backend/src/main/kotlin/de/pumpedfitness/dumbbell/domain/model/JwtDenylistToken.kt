package de.pumpedfitness.dumbbell.domain.model

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.RedisHash
import org.springframework.data.redis.core.TimeToLive
import java.util.concurrent.TimeUnit

@RedisHash("jwtDenylist")
data class JwtDenylistToken(

    @Id
    val token: String,

    @TimeToLive(unit = TimeUnit.MILLISECONDS)
    val timeToLive: Long
)
