package de.pumpedfitness.dumbbell.application.port.`in`

import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateDto
import de.pumpedfitness.dumbbell.application.dto.WorkoutTemplateScheduleDto

interface WorkoutTemplateServicePort {
    fun createTemplate(userId: String, name: String, description: String?, schedule: WorkoutTemplateScheduleDto?): WorkoutTemplateDto
    fun getTemplateById(templateId: String, userId: String): WorkoutTemplateDto
    fun getTemplatesByUserId(userId: String): List<WorkoutTemplateDto>
    fun updateTemplate(
        templateId: String,
        userId: String,
        name: String,
        description: String?,
        schedule: WorkoutTemplateScheduleDto?,
    ): WorkoutTemplateDto
    fun deleteTemplate(templateId: String, userId: String)
}
