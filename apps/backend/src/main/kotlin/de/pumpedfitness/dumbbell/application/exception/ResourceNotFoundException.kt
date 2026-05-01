package de.pumpedfitness.dumbbell.application.exception

import org.springframework.http.HttpStatus

class ResourceNotFoundException(override val message: String) : ApiException() {
    override val errorResponseCode: HttpStatus = HttpStatus.NOT_FOUND
}
