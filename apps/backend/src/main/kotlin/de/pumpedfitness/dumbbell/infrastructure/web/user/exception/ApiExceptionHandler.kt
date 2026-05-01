package de.pumpedfitness.dumbbell.infrastructure.web.user.exception

import de.pumpedfitness.dumbbell.application.exception.ApiException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<Map<String, String?>> {
        val errorBody = mapOf(
            "message" to ex.message,
            "timestamp" to System.currentTimeMillis().toString(),
            "status" to ex.errorResponseCode.value().toString()
        )
        return ResponseEntity.status(ex.errorResponseCode).body(errorBody)
    }
}