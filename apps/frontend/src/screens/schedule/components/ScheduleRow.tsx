import { useTranslation } from 'react-i18next';
import type { Schedule } from '@/types/schedule';
import { formatScheduleSummary } from '@/components/workout/schedulePresentation';
import { PlanCard } from './PlanCard';

type ScheduleRowProps = {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule) => void;
};

export function ScheduleRow({
  schedule,
  onEdit,
  onToggleActive,
}: ScheduleRowProps) {
  const { t } = useTranslation();
  return (
    <PlanCard
      testID={`schedule-card-${schedule.id}`}
      name={schedule.name}
      summary={formatScheduleSummary(t, schedule)}
      active={schedule.isActive}
      editAccessibilityLabel={t('plan.schedules.editA11y', {
        name: schedule.name,
      })}
      toggleAccessibilityLabel={t(
        schedule.isActive ? 'schedule.deactivateA11y' : 'schedule.activateA11y',
        { name: schedule.name },
      )}
      onEdit={() => onEdit(schedule)}
      onToggleActive={() => onToggleActive(schedule)}
    />
  );
}
