package de.pumpedfitness.dumbbell.infrastructure.web.user.exception

import de.pumpedfitness.dumbbell.application.exception.ApiException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
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

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, String?>> {
        val message = ex.bindingResult.fieldErrors
            .joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        val errorBody = mapOf(
            "message" to message,
            "timestamp" to System.currentTimeMillis().toString(),
            "status" to HttpStatus.BAD_REQUEST.value().toString()
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody)
    }
}