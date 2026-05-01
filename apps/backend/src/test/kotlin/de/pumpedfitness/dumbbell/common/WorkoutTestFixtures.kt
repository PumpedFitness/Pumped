package de.pumpedfitness.dumbbell.common

import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplate
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutTemplateExercise
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSession
import de.pumpedfitness.dumbbell.domain.model.workout.WorkoutSessionSet
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutTemplateScheduleType
import de.pumpedfitness.dumbbell.domain.model.workout.enum.WorkoutWeekday
import java.util.UUID

fun WorkoutTemplate.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    userId: UUID = UUID.randomUUID(),
    name: String = "Push Day A",
    description: String? = "Chest, shoulders and triceps",
    scheduleType: WorkoutTemplateScheduleType? = null,
    scheduleInterval: Int? = null,
    scheduledWeekdays: MutableSet<WorkoutWeekday> = mutableSetOf(),
    exercises: MutableList<WorkoutTemplateExercise> = mutableListOf(),
): WorkoutTemplate {
    val now = System.currentTimeMillis()
    return WorkoutTemplate(
        id = id,
        userId = userId,
        name = name,
        description = description,
        scheduleType = scheduleType,
        scheduleInterval = scheduleInterval,
        scheduledWeekdays = scheduledWeekdays,
        exercises = exercises,
        createdAt = now,
        updatedAt = now,
    )
}

fun WorkoutTemplateExercise.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    workoutTemplateId: UUID = UUID.randomUUID(),
    exerciseId: UUID = UUID.randomUUID(),
    orderIndex: Int = 0,
    sets: Int = 4,
    targetReps: String = "8-12",
    targetWeight: Double? = 80.0,
    restSeconds: Int? = 90,
    notes: String? = null,
): WorkoutTemplateExercise {
    val now = System.currentTimeMillis()
    return WorkoutTemplateExercise(
        id = id,
        workoutTemplateId = workoutTemplateId,
        exerciseId = exerciseId,
        orderIndex = orderIndex,
        sets = sets,
        targetReps = targetReps,
        targetWeight = targetWeight,
        restSeconds = restSeconds,
        notes = notes,
        createdAt = now,
        updatedAt = now,
    )
}

fun WorkoutSession.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    userId: UUID = UUID.randomUUID(),
    workoutTemplateId: UUID? = null,
    name: String = "Monday Push",
    startedAt: Long = System.currentTimeMillis(),
    endedAt: Long? = null,
    notes: String? = null,
): WorkoutSession {
    return WorkoutSession(
        id = id,
        userId = userId,
        workoutTemplateId = workoutTemplateId,
        name = name,
        startedAt = startedAt,
        endedAt = endedAt,
        notes = notes,
    )
}

fun WorkoutSessionSet.Companion.validTestData(
    id: UUID = UUID.randomUUID(),
    workoutSessionId: UUID = UUID.randomUUID(),
    exerciseId: UUID = UUID.randomUUID(),
    setIndex: Int = 0,
    reps: Int = 10,
    weight: Double? = 80.0,
    rpe: Double? = 8.0,
    restSeconds: Int? = 90,
    durationSeconds: Int? = null,
    notes: String? = null,
    performedAt: Long = System.currentTimeMillis(),
): WorkoutSessionSet {
    return WorkoutSessionSet(
        id = id,
        workoutSessionId = workoutSessionId,
        exerciseId = exerciseId,
        setIndex = setIndex,
        reps = reps,
        weight = weight,
        rpe = rpe,
        restSeconds = restSeconds,
        durationSeconds = durationSeconds,
        notes = notes,
        performedAt = performedAt,
    )
}
