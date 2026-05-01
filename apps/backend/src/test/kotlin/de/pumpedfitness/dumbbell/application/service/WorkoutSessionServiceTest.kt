package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutSessionDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.WorkoutSessionRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSession
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
class WorkoutSessionServiceTest {

    @MockK
    private lateinit var workoutSessionRepository: WorkoutSessionRepository

    private val workoutSessionDtoMapper = WorkoutSessionDtoMapper()

    private lateinit var workoutSessionService: WorkoutSessionServiceAdapter

    @BeforeEach
    fun setUp() {
        workoutSessionService = WorkoutSessionServiceAdapter(workoutSessionRepository, workoutSessionDtoMapper)
    }

    @Nested
    inner class StartSessionTests {

        @Test
        fun `Should StartSession Successfully When Called With Valid Data`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId, name = "Monday Push")

            every { workoutSessionRepository.save(any()) } returns session

            // Act
            val result = workoutSessionService.startSession(userId.toString(), "Monday Push", null, null)

            // Assert
            assertNotNull(result)
            verify(exactly = 1) { workoutSessionRepository.save(any()) }
        }

        @Test
        fun `Should Persist UserId When Starting Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutSession>()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.save(capture(savedSlot)) } returns session

            // Act
            workoutSessionService.startSession(userId.toString(), "Monday Push", null, null)

            // Assert
            assertEquals(userId, savedSlot.captured.userId)
        }

        @Test
        fun `Should Persist Name When Starting Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutSession>()
            val session = WorkoutSession.validTestData(userId = userId, name = "Leg Day")

            every { workoutSessionRepository.save(capture(savedSlot)) } returns session

            // Act
            workoutSessionService.startSession(userId.toString(), "Leg Day", null, null)

            // Assert
            assertEquals("Leg Day", savedSlot.captured.name)
        }

        @Test
        fun `Should Persist WorkoutTemplateId When Provided`() {
            // Arrange
            val userId = UUID.randomUUID()
            val templateId = UUID.randomUUID()
            val savedSlot = slot<WorkoutSession>()
            val session = WorkoutSession.validTestData(userId = userId, workoutTemplateId = templateId)

            every { workoutSessionRepository.save(capture(savedSlot)) } returns session

            // Act
            workoutSessionService.startSession(userId.toString(), "Monday Push", templateId.toString(), null)

            // Assert
            assertEquals(templateId, savedSlot.captured.workoutTemplateId)
        }

        @Test
        fun `Should Set EndedAt To Null When Starting Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutSession>()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.save(capture(savedSlot)) } returns session

            // Act
            workoutSessionService.startSession(userId.toString(), "Monday Push", null, null)

            // Assert
            assertNull(savedSlot.captured.endedAt)
        }

        @Test
        fun `Should Return Dto With Correct Fields After Starting Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val templateId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId, workoutTemplateId = templateId, name = "Push Day", notes = "Feeling strong")

            every { workoutSessionRepository.save(any()) } returns session

            // Act
            val result = workoutSessionService.startSession(userId.toString(), "Push Day", templateId.toString(), "Feeling strong")

            // Assert
            assertEquals(session.id.toString(), result.id)
            assertEquals(userId.toString(), result.userId)
            assertEquals(templateId.toString(), result.workoutTemplateId)
            assertEquals("Push Day", result.name)
            assertNull(result.endedAt)
        }
    }

    @Nested
    inner class GetSessionByIdTests {

        @Test
        fun `Should Return Session When Id Exists And User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act
            val result = workoutSessionService.getSessionById(session.id.toString(), userId.toString())

            // Assert
            assertEquals(session.id.toString(), result.id)
            verify(exactly = 1) { workoutSessionRepository.findById(session.id) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Session Id Does Not Exist`() {
            // Arrange
            val sessionId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findById(sessionId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionService.getSessionById(sessionId.toString(), userId.toString())
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
                workoutSessionService.getSessionById(session.id.toString(), requestingUserId.toString())
            }
        }

        @Test
        fun `Should Preserve All Fields When Returning Session By Id`() {
            // Arrange
            val userId = UUID.randomUUID()
            val templateId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId, workoutTemplateId = templateId, name = "Push Day", notes = "Good session")

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act
            val result = workoutSessionService.getSessionById(session.id.toString(), userId.toString())

            // Assert
            assertEquals(session.id.toString(), result.id)
            assertEquals(userId.toString(), result.userId)
            assertEquals(templateId.toString(), result.workoutTemplateId)
            assertEquals("Push Day", result.name)
            assertEquals("Good session", result.notes)
        }

        @Test
        fun `Should Return Session With Null WorkoutTemplateId When No Template Was Used`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId, workoutTemplateId = null)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act
            val result = workoutSessionService.getSessionById(session.id.toString(), userId.toString())

            // Assert
            assertNull(result.workoutTemplateId)
        }
    }

    @Nested
    inner class GetSessionsByUserIdTests {

        @Test
        fun `Should Return All Sessions For Given User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val sessions = listOf(
                WorkoutSession.validTestData(userId = userId, name = "Push Day"),
                WorkoutSession.validTestData(userId = userId, name = "Pull Day"),
            )

            every { workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId) } returns sessions

            // Act
            val result = workoutSessionService.getSessionsByUserId(userId.toString())

            // Assert
            assertEquals(2, result.size)
            verify(exactly = 1) { workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId) }
        }

        @Test
        fun `Should Return Empty List When User Has No Sessions`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId) } returns emptyList()

            // Act
            val result = workoutSessionService.getSessionsByUserId(userId.toString())

            // Assert
            assertTrue(result.isEmpty())
        }

        @Test
        fun `Should Call Repository With Correct UserId`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId) } returns emptyList()

            // Act
            workoutSessionService.getSessionsByUserId(userId.toString())

            // Assert
            verify(exactly = 1) { workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId) }
        }
    }

    @Nested
    inner class FinishSessionTests {

        @Test
        fun `Should FinishSession Successfully When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutSession.validTestData(userId = userId)
            val finished = existing.copy(endedAt = System.currentTimeMillis())

            every { workoutSessionRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutSessionRepository.save(any()) } returns finished

            // Act
            val result = workoutSessionService.finishSession(existing.id.toString(), userId.toString(), null)

            // Assert
            assertNotNull(result.endedAt)
            verify(exactly = 1) { workoutSessionRepository.save(any()) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Finishing Nonexistent Session`() {
            // Arrange
            val sessionId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findById(sessionId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionService.finishSession(sessionId.toString(), userId.toString(), null)
            }
            verify(exactly = 0) { workoutSessionRepository.save(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Finishing Session Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val existing = WorkoutSession.validTestData(userId = ownerUserId)

            every { workoutSessionRepository.findById(existing.id) } returns Optional.of(existing)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutSessionService.finishSession(existing.id.toString(), requestingUserId.toString(), null)
            }
            verify(exactly = 0) { workoutSessionRepository.save(any()) }
        }

        @Test
        fun `Should Set EndedAt When Finishing Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutSession.validTestData(userId = userId)
            val savedSlot = slot<WorkoutSession>()
            val beforeFinish = System.currentTimeMillis()

            every { workoutSessionRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutSessionRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutSessionService.finishSession(existing.id.toString(), userId.toString(), null)

            // Assert
            assertNotNull(savedSlot.captured.endedAt)
            assertTrue(savedSlot.captured.endedAt!! >= beforeFinish)
        }

        @Test
        fun `Should Persist Notes When Finishing Session With Notes`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutSession.validTestData(userId = userId)
            val savedSlot = slot<WorkoutSession>()

            every { workoutSessionRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutSessionRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutSessionService.finishSession(existing.id.toString(), userId.toString(), "Great session")

            // Assert
            assertEquals("Great session", savedSlot.captured.notes)
        }

        @Test
        fun `Should Keep Existing Notes When Finishing Session Without New Notes`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutSession.validTestData(userId = userId, notes = "Original notes")
            val savedSlot = slot<WorkoutSession>()

            every { workoutSessionRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutSessionRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutSessionService.finishSession(existing.id.toString(), userId.toString(), null)

            // Assert
            assertEquals("Original notes", savedSlot.captured.notes)
        }
    }

    @Nested
    inner class DeleteSessionTests {

        @Test
        fun `Should DeleteSession Successfully When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionRepository.delete(session) } returns Unit

            // Act
            workoutSessionService.deleteSession(session.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutSessionRepository.delete(session) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Deleting Nonexistent Session`() {
            // Arrange
            val sessionId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutSessionRepository.findById(sessionId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutSessionService.deleteSession(sessionId.toString(), userId.toString())
            }
            verify(exactly = 0) { workoutSessionRepository.delete(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Deleting Session Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = ownerUserId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutSessionService.deleteSession(session.id.toString(), requestingUserId.toString())
            }
            verify(exactly = 0) { workoutSessionRepository.delete(any()) }
        }

        @Test
        fun `Should Not Call Save When Deleting Session`() {
            // Arrange
            val userId = UUID.randomUUID()
            val session = WorkoutSession.validTestData(userId = userId)

            every { workoutSessionRepository.findById(session.id) } returns Optional.of(session)
            every { workoutSessionRepository.delete(session) } returns Unit

            // Act
            workoutSessionService.deleteSession(session.id.toString(), userId.toString())

            // Assert
            verify(exactly = 0) { workoutSessionRepository.save(any()) }
        }
    }
}
