package de.pumpedfitness.dumbbell.application.exception

import org.springframework.http.HttpStatus

class UnauthorizedException(override val message: String = "Access denied") : ApiException() {
    override val errorResponseCode: HttpStatus = HttpStatus.FORBIDDEN
}
