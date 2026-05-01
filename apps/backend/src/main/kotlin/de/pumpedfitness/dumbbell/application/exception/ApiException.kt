package de.pumpedfitness.dumbbell.application.exception

import org.springframework.http.HttpStatus

abstract class ApiException : RuntimeException() {
    abstract val errorResponseCode: HttpStatus
}