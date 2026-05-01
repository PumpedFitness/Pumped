package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutSessionSetDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionRepository
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionSetRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSession
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSessionSet
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import java.util.*

@ExtendWith(MockKExtension::class)
class WorkoutSessionSetServiceTest {

    @MockK
    private lateinit var workoutSessionSetRepository: WorkoutSessionSetRepository

    @MockK
    private lateinit var workoutSessionRepository: WorkoutSessionRepository

    private val workoutSessionSetDtoMapper = WorkoutSessionSetDtoMapper()

    private lateinit var workoutSessionSetService: WorkoutSessionSetServiceAdapter

    @BeforeEach
    fun setUp() {
        workoutSessionSetService = WorkoutSessionSetServiceAdapter(
            workoutSessionSetRepository,
            workoutSessionRepository,
            workoutSessionSetDtoMapper
        )
    }

    @Nested
    inner class LogSetTests {

        @Test
        fun `Should LogSet Successfully When User Owns Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val exerciseId = UUID.randomUUID()
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id, exerciseId = exerciseId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.save(any()) } returns set

            // Act
            val result = workoutSessionSetService.logSet(session.id.toString(), userId.toString(), exerciseId.toString(), 0, 10, 80.0, 90, null, null)

            // Assert
            assertNotNull(result)
            verify(exactly = 1) { workoutSessionSetRepository.save(any()) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Session Does Not Exist`() {
            // Arrange
            val sessionId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findById(sessionId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionSetService.logSet(sessionId.toString(), userId.toString(), UUID.randomUUID().toString(), 0, 10, null, null, null, null)
            }
            verify(exactly = 0) { workoutSessionSetRepository.save(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Session Belongs To Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = ownerUserId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutSessionSetService.logSet(session.id.toString(), requestingUserId.toString(), UUID.randomUUID().toString(), 0, 10, null, null, null, null)
            }
            verify(exactly = 0) { workoutSessionSetRepository.save(any()) }
        }

        @Test
        fun `Should Persist All Fields When Logging Set`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val exerciseId = UUID.randomUUID()
            val savedSlot = slot<WorkoutSessionSet>()
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id, exerciseId = exerciseId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.save(capture(savedSlot)) } returns set

            // Act
            workoutSessionSetService.logSet(session.id.toString(), userId.toString(), exerciseId.toString(), 2, 12, 100.0, 120, 30, "Heavy set")

            // Assert
            val captured = savedSlot.captured
            assertEquals(session.id, captured.workoutSessionId)
            assertEquals(exerciseId, captured.exerciseId)
            assertEquals(2, captured.setIndex)
            assertEquals(12, captured.reps)
            assertEquals(100.0, captured.weight)
            assertEquals(120, captured.restSeconds)
            assertEquals(30, captured.durationSeconds)
            assertEquals("Heavy set", captured.notes)
        }

        @Test
        fun `Should Allow Null Optional Fields When Logging Set`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val savedSlot = slot<WorkoutSessionSet>()
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id, weight = null, restSeconds = null, durationSeconds = null, notes = null)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.save(capture(savedSlot)) } returns set

            // Act
            workoutSessionSetService.logSet(session.id.toString(), userId.toString(), UUID.randomUUID().toString(), 0, 10, null, null, null, null)

            // Assert
            assertNull(savedSlot.captured.weight)
            assertNull(savedSlot.captured.restSeconds)
            assertNull(savedSlot.captured.durationSeconds)
            assertNull(savedSlot.captured.notes)
        }

        @Test
        fun `Should Return Dto With Correct Fields After Logging Set`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val exerciseId = UUID.randomUUID()
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id, exerciseId = exerciseId, reps = 8, weight = 60.0)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.save(any()) } returns set

            // Act
            val result = workoutSessionSetService.logSet(session.id.toString(), userId.toString(), exerciseId.toString(), 0, 8, 60.0, null, null, null)

            // Assert
            assertEquals(set.id.toString(), result.id)
            assertEquals(exerciseId.toString(), result.exerciseId)
            assertEquals(8, result.reps)
            assertEquals(60.0, result.weight)
        }
    }

    @Nested
    inner class GetSetsBySessionIdTests {

        @Test
        fun `Should Return All Sets For Session When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val sets = listOf(
                WorkoutSessionSet.validTestData(workoutSessionId = session.id, setIndex = 0),
                WorkoutSessionSet.validTestData(workoutSessionId = session.id, setIndex = 1),
                WorkoutSessionSet.validTestData(workoutSessionId = session.id, setIndex = 2),
            )

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.findByWorkoutSessionIdOrderBySetIndex(session.id) } returns sets

            // Act
            val result = workoutSessionSetService.getSetsBySessionId(session.id.toString(), userId.toString())

            // Assert
            assertEquals(3, result.size)
            verify(exactly = 1) { workoutSessionSetRepository.findByWorkoutSessionIdOrderBySetIndex(session.id) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Session Does Not Exist`() {
            // Arrange
            val sessionId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findById(sessionId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionSetService.getSetsBySessionId(sessionId.toString(), userId.toString())
            }
        }

        @Test
        fun `Should Throw UnauthorizedException When Session Belongs To Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = ownerUserId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutSessionSetService.getSetsBySessionId(session.id.toString(), requestingUserId.toString())
            }
        }

        @Test
        fun `Should Return Empty List When Session Has No Sets`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.findByWorkoutSessionIdOrderBySetIndex(session.id) } returns emptyList()

            // Act
            val result = workoutSessionSetService.getSetsBySessionId(session.id.toString(), userId.toString())

            // Assert
            assertTrue(result.isEmpty())
        }

        @Test
        fun `Should Call Repository With Correct SessionId`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.findByWorkoutSessionIdOrderBySetIndex(session.id) } returns emptyList()

            // Act
            workoutSessionSetService.getSetsBySessionId(session.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutSessionSetRepository.findByWorkoutSessionIdOrderBySetIndex(session.id) }
        }
    }

    @Nested
    inner class DeleteSetTests {

        @Test
        fun `Should DeleteSet Successfully When User Owns The Parent Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id)

            every { workoutSessionSetRepository.findById(set.id) } returns Optional.of(set)
            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.delete(set) } returns Unit

            // Act
            workoutSessionSetService.deleteSet(set.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutSessionSetRepository.delete(set) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Set Does Not Exist`() {
            // Arrange
            val setId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionSetRepository.findById(setId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionSetService.deleteSet(setId.toString(), userId.toString())
            }
            verify(exactly = 0) { workoutSessionSetRepository.delete(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Set Belongs To Session Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = ownerUserId)
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id)

            every { workoutSessionSetRepository.findById(set.id) } returns Optional.of(set)
            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutSessionSetService.deleteSet(set.id.toString(), requestingUserId.toString())
            }
            verify(exactly = 0) { workoutSessionSetRepository.delete(any()) }
        }

        @Test
        fun `Should Not Call Save When Deleting Set`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id)

            every { workoutSessionSetRepository.findById(set.id) } returns Optional.of(set)
            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.delete(set) } returns Unit

            // Act
            workoutSessionSetService.deleteSet(set.id.toString(), userId.toString())

            // Assert
            verify(exactly = 0) { workoutSessionSetRepository.save(any()) }
        }

        @Test
        fun `Should Verify Parent Session Ownership When Deleting Set`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)
            val set = WorkoutSessionSet.validTestData(workoutSessionId = session.id)

            every { workoutSessionSetRepository.findById(set.id) } returns Optional.of(set)
            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionSetRepository.delete(set) } returns Unit

            // Act
            workoutSessionSetService.deleteSet(set.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutSessionRepository.findById(session.id) }
        }
    }
}
