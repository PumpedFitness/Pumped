package de.pumpedfitness.dumbbell.application.exception

import org.springframework.http.HttpStatus
import java.lang.RuntimeException

class UserAlreadyExistsException(username: String) : ApiException() {
    override val errorResponseCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY
    override val message: String = "User with username: '$username' already exists."
}