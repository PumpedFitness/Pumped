package de.pumpedfitness.dumbbell.domain.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Lob
import java.util.*

@Entity
data class User(
    @Id val id: UUID,
    @Column(unique = true) val username: String,
    val password: String,
    @Lob val description : String,
    @Lob val profilePicture : String,
    val createdAt: Long,
    val updated: Long,
) {
    companion object {}
}
