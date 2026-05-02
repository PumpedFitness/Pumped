package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.exception.ResourceNotFoundException
import de.pumpedfitness.dumbbell.application.exception.UnauthorizedException
import de.pumpedfitness.dumbbell.application.mapper.UserMetricDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.UserMetricRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.UserMetric
import de.pumpedfitness.dumbbell.domain.model.enum.Gender
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
class UserMetricServiceTest {

    @MockK
    private lateinit var userMetricRepository: UserMetricRepository

    private val userMetricDtoMapper = UserMetricDtoMapper()

    private lateinit var userMetricService: UserMetricServiceAdapter

    @BeforeEach
    fun setUp() {
        userMetricService = UserMetricServiceAdapter(userMetricRepository, userMetricDtoMapper)
    }

    @Nested
    inner class LogMetricTests {

        @Test
        fun `Should LogMetric Successfully When Called With Valid Data`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.save(any()) } returns metric

            // Act
            val result = userMetricService.logMetric(userId.toString(), 82.5, 15.2, 183.0, Gender.MALE, 631152000000L)

            // Assert
            assertNotNull(result)
            verify(exactly = 1) { userMetricRepository.save(any()) }
        }

        @Test
        fun `Should Persist UserId When Logging Metric`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<UserMetric>()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.save(capture(savedSlot)) } returns metric

            // Act
            userMetricService.logMetric(userId.toString(), null, null, null, null, null)

            // Assert
            assertEquals(userId, savedSlot.captured.userId)
        }

        @Test
        fun `Should Persist Weight When Logging Metric`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<UserMetric>()
            val metric = UserMetric.validTestData(userId = userId, weight = 90.0)

            every { userMetricRepository.save(capture(savedSlot)) } returns metric

            // Act
            userMetricService.logMetric(userId.toString(), 90.0, null, null, null, null)

            // Assert
            assertEquals(90.0, savedSlot.captured.weight)
        }

        @Test
        fun `Should Persist Gender When Logging Metric`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<UserMetric>()
            val metric = UserMetric.validTestData(userId = userId, gender = Gender.FEMALE)

            every { userMetricRepository.save(capture(savedSlot)) } returns metric

            // Act
            userMetricService.logMetric(userId.toString(), null, null, null, Gender.FEMALE, null)

            // Assert
            assertEquals(Gender.FEMALE, savedSlot.captured.gender)
        }

        @Test
        fun `Should Persist Null Fields When Logging Metric With Only Partial Data`() {
            // Arrange
            val userId = UUID.randomUUID()
            val savedSlot = slot<UserMetric>()
            val metric = UserMetric.validTestData(
                userId = userId,
                weight = 80.0,
                bodyFat = null,
                height = null,
                gender = null,
                birthdate = null
            )

            every { userMetricRepository.save(capture(savedSlot)) } returns metric

            // Act
            userMetricService.logMetric(userId.toString(), 80.0, null, null, null, null)

            // Assert
            assertNull(savedSlot.captured.bodyFat)
            assertNull(savedSlot.captured.height)
            assertNull(savedSlot.captured.gender)
            assertNull(savedSlot.captured.birthdate)
        }

        @Test
        fun `Should Return Dto With Correct Fields After Logging Metric`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(
                userId = userId,
                weight = 82.5,
                bodyFat = 15.2,
                height = 183.0,
                gender = Gender.MALE
            )

            every { userMetricRepository.save(any()) } returns metric

            // Act
            val result = userMetricService.logMetric(userId.toString(), 82.5, 15.2, 183.0, Gender.MALE, null)

            // Assert
            assertEquals(metric.id.toString(), result.id)
            assertEquals(userId.toString(), result.userId)
            assertEquals(82.5, result.weight)
            assertEquals(15.2, result.bodyFat)
            assertEquals(183.0, result.height)
            assertEquals(Gender.MALE, result.gender)
        }
    }

    @Nested
    inner class GetLatestMetricTests {

        @Test
        fun `Should Return Latest Metric When One Exists`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.findFirstByUserIdOrderByRecordedAtDesc(userId) } returns metric

            // Act
            val result = userMetricService.getLatestMetric(userId.toString())

            // Assert
            assertEquals(metric.id.toString(), result.id)
            verify(exactly = 1) { userMetricRepository.findFirstByUserIdOrderByRecordedAtDesc(userId) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When No Metrics Exist`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userMetricRepository.findFirstByUserIdOrderByRecordedAtDesc(userId) } returns null

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                userMetricService.getLatestMetric(userId.toString())
            }
        }
    }

    @Nested
    inner class GetMetricHistoryTests {

        @Test
        fun `Should Return All Metrics For Given User`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metrics = listOf(
                UserMetric.validTestData(userId = userId, weight = 83.0),
                UserMetric.validTestData(userId = userId, weight = 82.5),
            )

            every { userMetricRepository.findByUserIdOrderByRecordedAtDesc(userId) } returns metrics

            // Act
            val result = userMetricService.getMetricHistory(userId.toString())

            // Assert
            assertEquals(2, result.size)
            verify(exactly = 1) { userMetricRepository.findByUserIdOrderByRecordedAtDesc(userId) }
        }

        @Test
        fun `Should Return Empty List When User Has No Metrics`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userMetricRepository.findByUserIdOrderByRecordedAtDesc(userId) } returns emptyList()

            // Act
            val result = userMetricService.getMetricHistory(userId.toString())

            // Assert
            assertTrue(result.isEmpty())
        }

        @Test
        fun `Should Call Repository With Correct UserId`() {
            // Arrange
            val userId = UUID.randomUUID()

            every { userMetricRepository.findByUserIdOrderByRecordedAtDesc(userId) } returns emptyList()

            // Act
            userMetricService.getMetricHistory(userId.toString())

            // Assert
            verify(exactly = 1) { userMetricRepository.findByUserIdOrderByRecordedAtDesc(userId) }
        }
    }

    @Nested
    inner class GetMetricByIdTests {

        @Test
        fun `Should Return Metric When Id Exists And User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)

            // Act
            val result = userMetricService.getMetricById(metric.id.toString(), userId.toString())

            // Assert
            assertEquals(metric.id.toString(), result.id)
            verify(exactly = 1) { userMetricRepository.findById(metric.id) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Metric Id Does Not Exist`() {
            // Arrange
            val metricId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { userMetricRepository.findById(metricId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                userMetricService.getMetricById(metricId.toString(), userId.toString())
            }
        }

        @Test
        fun `Should Throw UnauthorizedException When Metric Belongs To Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = ownerUserId)

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                userMetricService.getMetricById(metric.id.toString(), requestingUserId.toString())
            }
        }

        @Test
        fun `Should Preserve All Fields When Returning Metric By Id`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(
                userId = userId,
                weight = 82.5,
                bodyFat = 15.2,
                height = 183.0,
                gender = Gender.MALE,
                birthdate = 631152000000L,
            )

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)

            // Act
            val result = userMetricService.getMetricById(metric.id.toString(), userId.toString())

            // Assert
            assertEquals(metric.id.toString(), result.id)
            assertEquals(userId.toString(), result.userId)
            assertEquals(82.5, result.weight)
            assertEquals(15.2, result.bodyFat)
            assertEquals(183.0, result.height)
            assertEquals(Gender.MALE, result.gender)
            assertEquals(631152000000L, result.birthdate)
        }
    }

    @Nested
    inner class DeleteMetricTests {

        @Test
        fun `Should DeleteMetric Successfully When User Owns It`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)
            every { userMetricRepository.delete(metric) } returns Unit

            // Act
            userMetricService.deleteMetric(metric.id.toString(), userId.toString())

            // Assert
            verify(exactly = 1) { userMetricRepository.delete(metric) }
        }

        @Test
        fun `Should Throw ResourceNotFoundException When Deleting Nonexistent Metric`() {
            // Arrange
            val metricId = UUID.randomUUID()
            val userId = UUID.randomUUID()

            every { userMetricRepository.findById(metricId) } returns Optional.empty()

            // Act & Assert
            assertThrows<ResourceNotFoundException> {
                userMetricService.deleteMetric(metricId.toString(), userId.toString())
            }
            verify(exactly = 0) { userMetricRepository.delete(any()) }
        }

        @Test
        fun `Should Throw UnauthorizedException When Deleting Metric Of Different User`() {
            // Arrange
            val ownerUserId = UUID.randomUUID()
            val requestingUserId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = ownerUserId)

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)

            // Act & Assert
            assertThrows<UnauthorizedException> {
                userMetricService.deleteMetric(metric.id.toString(), requestingUserId.toString())
            }
            verify(exactly = 0) { userMetricRepository.delete(any()) }
        }

        @Test
        fun `Should Not Call Save When Deleting Metric`() {
            // Arrange
            val userId = UUID.randomUUID()
            val metric = UserMetric.validTestData(userId = userId)

            every { userMetricRepository.findById(metric.id) } returns Optional.of(metric)
            every { userMetricRepository.delete(metric) } returns Unit

            // Act
            userMetricService.deleteMetric(metric.id.toString(), userId.toString())

            // Assert
            verify(exactly = 0) { userMetricRepository.save(any()) }
        }
    }
}
