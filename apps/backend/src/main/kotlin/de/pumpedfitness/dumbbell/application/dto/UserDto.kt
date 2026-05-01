package de.pumpedfitness.dumbbell.application.dto

data class UserDto(
    val username: String,
    val password: String,
    val description : String,
    val profilePicture : String,
    val createdAt: Long,
    val updated: Long,
) {
    companion object {}
}
