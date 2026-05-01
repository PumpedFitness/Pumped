package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateScheduleDto
import de.pumpedfitness.dumbbell.application.exception.InvalidWorkoutTemplateScheduleException
import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.WorkoutTemplateDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.WorkoutTemplateRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday
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
class WorkoutTemplateServiceTest {

    @MockK
    private lateinit var workoutTemplateRepository: WorkoutTemplateRepository

    private val workoutTemplateDtoMapper = WorkoutTemplateDtoMapper()

    private lateinit var workoutTemplateService: WorkoutTemplateServiceAdapter

    private val weeklySchedule = WorkoutTemplateScheduleDto(
        type = WorkoutTemplateScheduleType.WEEKS,
        interval = 2,
        weekdays = listOf(WorkoutWeekday.MONDAY, WorkoutWeekday.THURSDAY),
    )

    @BeforeEach
    fun setUp() {
        workoutTemplateService = WorkoutTemplateServiceAdapter(workoutTemplateRepository, workoutTemplateDtoMapper)
    }

    @Nested
    inner class CreateTemplateTests {

        @Test
        fun `Should CreateTemplate Successfully When Called With Valid Data`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedTemplateSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(userId = userId, name = "Push Day A")

            every { workoutTemplateRepository.save(capture(savedTemplateSlot)) } returns template

            // Act
            val result = workoutTemplateService.createTemplate(userId.toString(), "Push Day A", "Chest day", null)

            // Assert
            assertNotNull(result)
            verify(exactly = 1) { workoutTemplateRepository.save(any()) }
        }

        @Test
        fun `Should Persist UserId When Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(userId = userId)

            every { workoutTemplateRepository.save(capture(savedSlot)) } returns template

            // Act
            workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, null)

            // Assert
            assertEquals(userId, savedSlot.captured.userId)
        }

        @Test
        fun `Should Persist Name And Description When Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(userId = userId, name = "Leg Day", description = "Quads and hamstrings")

            every { workoutTemplateRepository.save(capture(savedSlot)) } returns template

            // Act
            workoutTemplateService.createTemplate(userId.toString(), "Leg Day", "Quads and hamstrings", null)

            // Assert
            assertEquals("Leg Day", savedSlot.captured.name)
            assertEquals("Quads and hamstrings", savedSlot.captured.description)
        }

        @Test
        fun `Should Allow Null Description When Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(userId = userId, description = null)

            every { workoutTemplateRepository.save(capture(savedSlot)) } returns template

            // Act
            workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, null)

            // Assert
            assertNull(savedSlot.captured.description)
        }

        @Test
        fun `Should Return Dto From Mapper After Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = userId, name = "Push Day A")

            every { workoutTemplateRepository.save(any()) } returns template

            // Act
            val result = workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, null)

            // Assert
            assertEquals(template.id.toString(), result.id)
            assertEquals(template.name, result.name)
            assertEquals(userId.toString(), result.userId)
        }

        @Test
        fun `Should Generate New UUID When Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(userId = userId)

            every { workoutTemplateRepository.save(capture(savedSlot)) } returns template

            // Act
            workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, null)

            // Assert
            assertNotNull(savedSlot.captured.id)
            assertDoesNotThrow { UUID.fromString(savedSlot.captured.id.toString()) }
        }

        @Test
        fun `Should Persist Weekly Schedule When Creating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<WorkoutTemplate>()
            val template = WorkoutTemplate.validTestData(
                userId = userId,
                scheduleType = weeklySchedule.type,
                scheduleInterval = weeklySchedule.interval,
                scheduledWeekdays = weeklySchedule.weekdays.toMutableSet(),
            )

            every { workoutTemplateRepository.save(capture(savedSlot)) } returns template

            // Act
            val result = workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, weeklySchedule)

            // Assert
            assertEquals(weeklySchedule.type, savedSlot.captured.scheduleType)
            assertEquals(weeklySchedule.interval, savedSlot.captured.scheduleInterval)
            assertEquals(weeklySchedule.weekdays.toSet(), savedSlot.captured.scheduledWeekdays)
            assertEquals(weeklySchedule.type, result.schedule?.type)
            assertEquals(weeklySchedule.interval, result.schedule?.interval)
            assertEquals(weeklySchedule.weekdays, result.schedule?.weekdays)
        }

        @Test
        fun `Should Throw InvalidWorkoutTemplateScheduleException When Daily Schedule Defines Weekdays`() {
            // Arrange
            val userId = UUID.randomUUID()
            val invalidSchedule = WorkoutTemplateScheduleDto(
                type = WorkoutTemplateScheduleType.DAYS,
                interval = 3,
                weekdays = listOf(WorkoutWeekday.MONDAY),
            )

            // Act & Assert
            assertThrows<InvalidWorkoutTemplateScheduleException> {
                workoutTemplateService.createTemplate(userId.toString(), "Push Day A", null, invalidSchedule)
            }
            verify(exactly = 0) { workoutTemplateRepository.save(any()) }
        }
    }

    @Nested
    inner class GetTemplateByIdTests {

        @Test
        fun `Should Return Template When Id Exists And User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = userId)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)

            // Act
            val result = workoutTemplateService.getTemplateById(template.id.toString(), userId.toString())

            // Assert
            assertEquals(template.id.toString(), result.id)
            verify(exactly = 1) { workoutTemplateRepository.findById(template.id) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Template Id Does Not Exist`() {
            // Arrange
            val templateId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutTemplateRepository.findById(templateId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutTemplateService.getTemplateById(templateId.toString(), userId.toString())
            }
        }

        @Test
        fun `Should Throw UnauthorizedException When Template Belongs To Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = ownerUserId)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutTemplateService.getTemplateById(template.id.toString(), requestingUserId.toString())
            }
        }

        @Test
        fun `Should Preserve All Fields When Returning Template By Id`() {
            // Arrange
            val userId = UUID.randomUUID()
            val templateId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(id = templateId, userId = userId, name = "Pull Day", description = "Back and biceps")

            every { workoutTemplateRepository.findById(templateId) } returns Optional.of(template)

            // Act
            val result = workoutTemplateService.getTemplateById(templateId.toString(), userId.toString())

            // Assert
            assertEquals(templateId.toString(), result.id)
            assertEquals("Pull Day", result.name)
            assertEquals("Back and biceps", result.description)
            assertEquals(userId.toString(), result.userId)
        }

        @Test
        fun `Should Return Template With Null Description When Description Is Null`() {
            // Arrange
            val userId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = userId, description = null)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)

            // Act
            val result = workoutTemplateService.getTemplateById(template.id.toString(), userId.toString())

            // Assert
            assertNull(result.description)
        }
    }

    @Nested
    inner class GetTemplatesByUserIdTests {

        @Test
        fun `Should Return All Templates For Given User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val templates = mutableListOf(
                WorkoutTemplate.validTestData(userId = userId, name = "Push Day"),
                WorkoutTemplate.validTestData(userId = userId, name = "Pull Day"),
                WorkoutTemplate.validTestData(userId = userId, name = "Leg Day"),
            )

            every { workoutTemplateRepository.findWorkoutTemplateByUserId(userId) } returns templates

            // Act
            val result = workoutTemplateService.getTemplatesByUserId(userId.toString())

            // Assert
            assertEquals(3, result.size)
            verify(exactly = 1) { workoutTemplateRepository.findWorkoutTemplateByUserId(userId) }
        }

        @Test
        fun `Should Return Empty List When User Has No Templates`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { workoutTemplateRepository.findWorkoutTemplateByUserId(userId) } returns mutableListOf()

            // Act
            val result = workoutTemplateService.getTemplatesByUserId(userId.toString())

            // Assert
            assertTrue(result.isEmpty())
        }

        @Test
        fun `Should Call Repository With Correct UserId`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { workoutTemplateRepository.findWorkoutTemplateByUserId(userId) } returns mutableListOf()

            // Act
            workoutTemplateService.getTemplatesByUserId(userId.toString())

            // Assert
            verify(exactly = 1) { workoutTemplateRepository.findWorkoutTemplateByUserId(userId) }
        }
    }

    @Nested
    inner class UpdateTemplateTests {

        @Test
        fun `Should UpdateTemplate Successfully When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = userId, name = "Old Name")
            val updated = existing.copy(name = "New Name", description = "New desc")

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(any()) } returns updated

            // Act
            val result = workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", "New desc", null)

            // Assert
            assertEquals("New Name", result.name)
            assertEquals("New desc", result.description)
            verify(exactly = 1) { workoutTemplateRepository.save(any()) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Updating Nonexistent Template`() {
            // Arrange
            val templateId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutTemplateRepository.findById(templateId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutTemplateService.updateTemplate(templateId.toString(), userId.toString(), "New Name", null, null)
            }
            verify(exactly = 0) { workoutTemplateRepository.save(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Updating Template Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = ownerUserId)

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutTemplateService.updateTemplate(existing.id.toString(), requestingUserId.toString(), "New Name", null, null)
            }
            verify(exactly = 0) { workoutTemplateRepository.save(any()) }
        }

        @Test
        fun `Should Persist Updated Name And Description When Updating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = userId, name = "Old Name", description = "Old desc")
            val savedSlot = slot<WorkoutTemplate>()

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", "New desc", null)

            // Assert
            assertEquals("New Name", savedSlot.captured.name)
            assertEquals("New desc", savedSlot.captured.description)
        }

        @Test
        fun `Should Preserve Id And UserId When Updating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = userId)
            val savedSlot = slot<WorkoutTemplate>()

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", null, null)

            // Assert
            assertEquals(existing.id, savedSlot.captured.id)
            assertEquals(userId, savedSlot.captured.userId)
        }

        @Test
        fun `Should Update Timestamp When Updating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = userId)
            val savedSlot = slot<WorkoutTemplate>()
            val beforeUpdate = System.currentTimeMillis()

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", null, null)

            // Assert
            assertTrue(savedSlot.captured.updatedAt >= beforeUpdate)
        }

        @Test
        fun `Should Replace Schedule When Updating Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(userId = userId)
            val savedSlot = slot<WorkoutTemplate>()

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", null, weeklySchedule)

            // Assert
            assertEquals(weeklySchedule.type, savedSlot.captured.scheduleType)
            assertEquals(weeklySchedule.interval, savedSlot.captured.scheduleInterval)
            assertEquals(weeklySchedule.weekdays.toSet(), savedSlot.captured.scheduledWeekdays)
        }

        @Test
        fun `Should Remove Schedule When Updating Template With Null Schedule`() {
            // Arrange
            val userId = UUID.randomUUID()
            val existing = WorkoutTemplate.validTestData(
                userId = userId,
                scheduleType = WorkoutTemplateScheduleType.WEEKS,
                scheduleInterval = 1,
                scheduledWeekdays = mutableSetOf(WorkoutWeekday.MONDAY, WorkoutWeekday.WEDNESDAY),
            )
            val savedSlot = slot<WorkoutTemplate>()

            every { workoutTemplateRepository.findById(existing.id) } returns Optional.of(existing)
            every { workoutTemplateRepository.save(capture(savedSlot)) } answers { firstArg() }

            // Act
            workoutTemplateService.updateTemplate(existing.id.toString(), userId.toString(), "New Name", null, null)

            // Assert
            assertNull(savedSlot.captured.scheduleType)
            assertNull(savedSlot.captured.scheduleInterval)
            assertTrue(savedSlot.captured.scheduledWeekdays.isEmpty())
        }
    }

    @Nested
    inner class DeleteTemplateTests {

        @Test
        fun `Should DeleteTemplate Successfully When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = userId)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)
            every { workoutTemplateRepository.delete(template) } returns Unit

            // Act
            workoutTemplateService.deleteTemplate(template.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutTemplateRepository.delete(template) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Deleting Nonexistent Template`() {
            // Arrange
            val templateId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { workoutTemplateRepository.findById(templateId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                workoutTemplateService.deleteTemplate(templateId.toString(), userId.toString())
            }
            verify(exactly = 0) { workoutTemplateRepository.delete(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Deleting Template Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = ownerUserId)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                workoutTemplateService.deleteTemplate(template.id.toString(), requestingUserId.toString())
            }
            verify(exactly = 0) { workoutTemplateRepository.delete(any()) }
        }

        @Test
        fun `Should Call Repository Delete With Correct Template`() {
            // Arrange
            val userId = UUID.randomUUID()
            val template = WorkoutTemplate.validTestData(userId = userId)

            every { workoutTemplateRepository.findById(template.id) } returns Optional.of(template)
            every { workoutTemplateRepository.delete(template) } returns Unit

            // Act
            workoutTemplateService.deleteTemplate(template.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { workoutTemplateRepository.delete(template) }
            verify(exactly = 0) { workoutTemplateRepository.save(any()) }
        }
    }
}
