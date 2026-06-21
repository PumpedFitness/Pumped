import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ExerciseSetTable } from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { ExerciseHistoryEntry } from '@/hooks/useExerciseAnalytics';
import { colors } from '@/theme/tokens';
import { displayWeight, formatWeight } from '@/utils/units';

type ExerciseHistorySectionProps = {
  history: ExerciseHistoryEntry[];
  weightUnit: WeightUnit;
  onOpenWorkout: (workoutId: string) => void;
};

function formatDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleDateString(language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const value = displayWeight(volumeKg, weightUnit);
  return `${Math.round(value).toLocaleString()} ${weightUnit}`;
}

type HistoryStatProps = {
  label: string;
  value: string;
};

function HistoryStat({ label, value }: HistoryStatProps) {
  return (
    <View className="flex-1 rounded-[14px] bg-surface-sunk px-3 py-2.5">
      <Text className="t-eyebrow text-muted">{label}</Text>
      <Text className="t-label mt-1" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function ExerciseHistorySection({
  history,
  weightUnit,
  onOpenWorkout,
}: ExerciseHistorySectionProps) {
  const { t, i18n } = useTranslation();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();

  return (
    <Card>
      <Text className="t-heading">{t('exerciseOverview.history.title')}</Text>
      <Text className="t-caption mt-1 text-text-secondary">
        {t('exerciseOverview.history.subtitle')}
      </Text>

      <View className="mt-4 gap-3">
        {history.length > 0 ? (
          history.map(entry => (
            <View
              key={entry.workoutId}
              className="gap-3 rounded-[20px] border border-border-soft p-3"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('exerciseOverview.history.openA11y', {
                  name: entry.workoutName,
                })}
                onPress={() => onOpenWorkout(entry.workoutId)}
                className="flex-row items-center gap-3"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
                  <ClayIcon name="history" size={18} color={colors.accent} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="t-label" numberOfLines={1}>
                    {entry.workoutName}
                  </Text>
                  <Text className="t-caption text-text-secondary">
                    {formatDate(entry.startedAt, i18n.language)}
                  </Text>
                </View>
                <ClayIcon name="chevron" size={16} color={colors.muted} />
              </Pressable>

              <View className="flex-row gap-2">
                <HistoryStat
                  label={t('exerciseOverview.history.sets')}
                  value={`${entry.setCount}`}
                />
                <HistoryStat
                  label={t('exerciseOverview.history.volume')}
                  value={formatVolume(entry.volumeKg, weightUnit)}
                />
                <HistoryStat
                  label={t('exerciseOverview.history.topWeight')}
                  value={
                    entry.topWeightKg == null
                      ? t('common.notAvailable')
                      : formatWeight(entry.topWeightKg, weightUnit)
                  }
                />
              </View>

              <ExerciseSetTable
                readOnly
                sets={entry.sets}
                setTypeOptions={setTypeOptions}
                setTypesById={setTypesById}
                weightUnit={weightUnit}
              />
            </View>
          ))
        ) : (
          <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-6">
            <Text className="t-label text-center">
              {t('exerciseOverview.history.emptyTitle')}
            </Text>
            <Text className="t-caption mt-2 text-center text-text-secondary">
              {t('exerciseOverview.history.emptyBody')}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
