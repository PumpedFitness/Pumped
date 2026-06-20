import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import type { ExerciseToEdit } from '@/components/exercise/useExerciseDraft';

type ExerciseDetailsSectionProps = {
  exercise: ExerciseToEdit & { createdAt?: number };
  historyCount: number;
};

function formatCreatedAt(timestamp: number | undefined, language: string) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ExerciseDetailsSection({
  exercise,
  historyCount,
}: ExerciseDetailsSectionProps) {
  const { t, i18n } = useTranslation();
  const createdAt = formatCreatedAt(exercise.createdAt, i18n.language);

  return (
    <Card>
      <Text className="t-heading">{t('exerciseOverview.details.title')}</Text>
      <Text className="t-body mt-3 text-text-secondary">
        {exercise.description?.trim() ||
          t('exerciseOverview.details.emptyDescription')}
      </Text>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-[14px] bg-surface-sunk px-3 py-2.5">
          <Text className="t-eyebrow text-muted">
            {t('exerciseOverview.details.history')}
          </Text>
          <Text className="t-label mt-1">
            {t('exerciseOverview.details.workouts', { count: historyCount })}
          </Text>
        </View>
        <View className="flex-1 rounded-[14px] bg-surface-sunk px-3 py-2.5">
          <Text className="t-eyebrow text-muted">
            {t('exerciseOverview.details.created')}
          </Text>
          <Text className="t-label mt-1">
            {createdAt ?? t('common.notAvailable')}
          </Text>
        </View>
      </View>
    </Card>
  );
}
