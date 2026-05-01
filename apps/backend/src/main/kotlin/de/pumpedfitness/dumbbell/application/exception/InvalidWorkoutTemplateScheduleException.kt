package de.pumpedfitness.dumbbell.application.exception

import org.springframework.http.HttpStatus

class InvalidWorkoutTemplateScheduleException(message: String) : ApiException() {
    override val errorResponseCode: HttpStatus = HttpStatus.BAD_REQUEST

    override val message: String = message
}
