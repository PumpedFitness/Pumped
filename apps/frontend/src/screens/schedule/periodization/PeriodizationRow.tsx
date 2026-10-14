import { useTranslation } from 'react-i18next';
import type { Periodization } from '@/types/periodization';
import { PlanCard } from '@/screens/schedule/components/PlanCard';

type PeriodizationRowProps = {
  periodization: Periodization;
  onEdit: () => void;
  onToggleActive: () => void;
};

export function PeriodizationRow({
  periodization,
  onEdit,
  onToggleActive,
}: PeriodizationRowProps) {
  const { t } = useTranslation();
  const workoutCount = periodization.phases.reduce(
    (sum, phase) => sum + phase.workouts.length,
    0,
  );
  return (
    <PlanCard
      testID={`periodization-card-${periodization.id}`}
      name={periodization.name}
      summary={t('schedule.periodization.summary', {
        phases: periodization.phases.length,
        workouts: workoutCount,
      })}
      active={periodization.isActive}
      editAccessibilityLabel={t('plan.schedules.editA11y', {
        name: periodization.name,
      })}
      toggleAccessibilityLabel={t(
        periodization.isActive
          ? 'schedule.deactivateA11y'
          : 'schedule.activateA11y',
        { name: periodization.name },
      )}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
    />
  );
}
