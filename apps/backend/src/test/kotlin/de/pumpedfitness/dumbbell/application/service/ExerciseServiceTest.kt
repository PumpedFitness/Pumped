package de.pumpedfitness.dumbbell.application.service

import de.pumpedfitness.dumbbell.application.mapper.ExerciseDtoMapper
import de.pumpedfitness.dumbbell.application.port.out.ExerciseRepository
import de.pumpedfitness.dumbbell.common.validTestData
import de.pumpedfitness.dumbbell.domain.model.workout.Exercise
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseCategory
import de.pumpedfitness.dumbbell.domain.model.workout.enum.ExerciseEquipment
import de.pumpedfitness.dumbbell.domain.model.workout.enum.MuscleGroup
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import java.util.*

@ExtendWith(MockKExtension::class)
class ExerciseServiceTest {

    @MockK
    private lateinit var exerciseRepository: ExerciseRepository

    private val exerciseDtoMapper = ExerciseDtoMapper()

    private lateinit var exerciseService: ExerciseServiceAdapter

    @BeforeEach
    fun setUp() {
        // I'm doing this because I get annoyed when IntelliJ warns me about unused variables when using inject mocks.
        exerciseService = ExerciseServiceAdapter(exerciseRepository, exerciseDtoMapper)
    }

    @Nested
    inner class GetAllExercisesTests {

        @Test
        fun `Should Return All Exercises When Repository Has Entries`() {
            // Arrange
            val exercises = listOf(
                Exercise.validTestData(name = "Bench Press"),
                Exercise.validTestData(name = "Squat"),
                Exercise.validTestData(name = "Deadlift"),
            )

            every { exerciseRepository.findAll() } returns exercises

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            
            assertEquals(3, result.size)
            verify(exactly = 1) { exerciseRepository.findAll() }
        }

        @Test
        fun `Should Return Empty List When Repository Has No Entries`() {
            // Arrange
            every { exerciseRepository.findAll() } returns emptyList()

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            assertTrue(result.isEmpty())
            verify(exactly = 1) { exerciseRepository.findAll() }
        }

        @Test
        fun `Should Return Single Exercise When Repository Has One Entry`() {
            // Arrange
            val exercise = Exercise.validTestData(name = "Pull Up")
            every { exerciseRepository.findAll() } returns listOf(exercise)

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            assertEquals(1, result.size)
            
        }

        @Test
        fun `Should Preserve Exercise Fields When Returning All Exercises`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(
                id = exerciseId,
                name = "Overhead Press",
                description = "Standing barbell press",
                muscleGroups = listOf(MuscleGroup.SHOULDERS, MuscleGroup.ARMS),
                exerciseCategory = ExerciseCategory.STRENGTH,
                equipment = listOf(ExerciseEquipment.BARBELL),
            )

            every { exerciseRepository.findAll() } returns listOf(exercise)

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            val returned = result.first()
            assertEquals(exerciseId.toString(), returned.id)
            assertEquals("Overhead Press", returned.name)
            assertEquals("Standing barbell press", returned.description)
            assertEquals(listOf(MuscleGroup.SHOULDERS, MuscleGroup.ARMS), returned.muscleGroup)
            assertEquals(ExerciseCategory.STRENGTH, returned.exerciseCategory)
            assertEquals(listOf(ExerciseEquipment.BARBELL), returned.equipment)
        }

        @Test
        fun `Should Return Exercises With Null Description When Description Is Null`() {
            // Arrange
            val exercise = Exercise.validTestData(description = null)
            every { exerciseRepository.findAll() } returns listOf(exercise)

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            assertNull(result.first().description)
        }

        @Test
        fun `Should Return Exercises With Multiple MuscleGroups`() {
            // Arrange
            val exercise = Exercise.validTestData(
                muscleGroups = listOf(MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.ARMS)
            )
            every { exerciseRepository.findAll() } returns listOf(exercise)

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            assertEquals(3, result.first().muscleGroup.size)
            assertTrue(
                result.first().muscleGroup.containsAll(
                    listOf(
                        MuscleGroup.CHEST,
                        MuscleGroup.SHOULDERS,
                        MuscleGroup.ARMS
                    )
                )
            )
        }

        @Test
        fun `Should Return Exercises With Multiple Equipment`() {
            // Arrange
            val exercise = Exercise.validTestData(
                equipment = listOf(ExerciseEquipment.DUMBBELL, ExerciseEquipment.CABLE)
            )
            every { exerciseRepository.findAll() } returns listOf(exercise)

            // Act
            val result = exerciseService.getAllExercises()

            // Assert
            assertEquals(2, result.first().equipment.size)
            assertTrue(
                result.first().equipment.containsAll(
                    listOf(
                        ExerciseEquipment.DUMBBELL,
                        ExerciseEquipment.CABLE
                    )
                )
            )
        }

        @Test
        fun `Should Call Repository Exactly Once When Getting All Exercises`() {
            // Arrange
            every { exerciseRepository.findAll() } returns emptyList()

            // Act
            exerciseService.getAllExercises()

            // Assert
            verify(exactly = 1) { exerciseRepository.findAll() }
        }
    }

    @Nested
    inner class GetExerciseByIdTests {

        @Test
        fun `Should Return Exercise When Id Exists`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(id = exerciseId)

            every { exerciseRepository.findById(exerciseId) } returns Optional.of(exercise)

            // Act
            exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            
            verify(exactly = 1) { exerciseRepository.findById(exerciseId) }
        }

        @Test
        fun `Should Return Null When Id Does Not Exist`() {
            // Arrange
            val exerciseId = UUID.randomUUID()

            every { exerciseRepository.findById(exerciseId) } returns Optional.empty()

            // Act
            val result = exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            assertNull(result)
            verify(exactly = 1) { exerciseRepository.findById(exerciseId) }
        }

        @Test
        fun `Should Preserve All Fields When Returning Exercise By Id`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(
                id = exerciseId,
                name = "Romanian Deadlift",
                description = "Hip-hinge movement targeting hamstrings",
                muscleGroups = listOf(MuscleGroup.LEGS, MuscleGroup.BACK),
                exerciseCategory = ExerciseCategory.STRENGTH,
                equipment = listOf(ExerciseEquipment.BARBELL),
            )

            every { exerciseRepository.findById(exerciseId) } returns Optional.of(exercise)

            // Act
            val result = exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            assertNotNull(result)
            assertEquals(exerciseId.toString(), result!!.id)
            assertEquals("Romanian Deadlift", result.name)
            assertEquals("Hip-hinge movement targeting hamstrings", result.description)
            assertEquals(listOf(MuscleGroup.LEGS, MuscleGroup.BACK), result.muscleGroup)
            assertEquals(ExerciseCategory.STRENGTH, result.exerciseCategory)
        }

        @Test
        fun `Should Return Exercise With Null Description When Description Is Null`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(id = exerciseId, description = null)

            every { exerciseRepository.findById(exerciseId) } returns Optional.of(exercise)

            // Act
            val result = exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            assertNotNull(result)
            assertNull(result!!.description)
        }

        @Test
        fun `Should Return Exercise With Cardio Category`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(
                id = exerciseId,
                exerciseCategory = ExerciseCategory.CARDIO,
                equipment = listOf(ExerciseEquipment.BODYWEIGHT),
            )

            every { exerciseRepository.findById(exerciseId) } returns Optional.of(exercise)

            // Act
            val result = exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            assertEquals(ExerciseCategory.CARDIO, result!!.exerciseCategory)
        }

        @Test
        fun `Should Return Exercise With Bodyweight Equipment`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            val exercise = Exercise.validTestData(
                id = exerciseId,
                equipment = listOf(ExerciseEquipment.BODYWEIGHT),
            )

            every { exerciseRepository.findById(exerciseId) } returns Optional.of(exercise)

            // Act
            val result = exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            assertEquals(listOf(ExerciseEquipment.BODYWEIGHT), result!!.equipment)
        }

        @Test
        fun `Should Call Repository With Correct UUID When Getting Exercise By Id`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            every { exerciseRepository.findById(exerciseId) } returns Optional.empty()

            // Act
            exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            verify(exactly = 1) { exerciseRepository.findById(exerciseId) }
        }

        @Test
        fun `Should Not Call FindAll When Getting Exercise By Id`() {
            // Arrange
            val exerciseId = UUID.randomUUID()
            every { exerciseRepository.findById(exerciseId) } returns Optional.empty()

            // Act
            exerciseService.getExerciseById(exerciseId.toString())

            // Assert
            verify(exactly = 0) { exerciseRepository.findAll() }
        }
    }
}

