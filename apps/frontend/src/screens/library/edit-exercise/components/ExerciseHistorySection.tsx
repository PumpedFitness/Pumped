import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { CompletedExerciseHistorySection } from '@/components/exercise/CompletedExerciseHistorySection';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { ExerciseHistoryEntry } from '@/hooks/useExerciseAnalytics';
import { colors } from '@/theme/tokens';

type ExerciseHistorySectionProps = {
  exerciseName: string;
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

export function ExerciseHistorySection({
  exerciseName,
  history,
  weightUnit,
  onOpenWorkout,
}: ExerciseHistorySectionProps) {
  const { t, i18n } = useTranslation();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleWorkoutExpanded = (workoutId: string) => {
    setExpandedWorkoutIds(current => {
      const next = new Set(current);
      if (next.has(workoutId)) {
        next.delete(workoutId);
      } else {
        next.add(workoutId);
      }
      return next;
    });
  };

  return (
    <Card>
      <Text className="t-heading">{t('exerciseOverview.history.title')}</Text>
      <Text className="t-caption mt-1 text-text-secondary">
        {t('exerciseOverview.history.subtitle')}
      </Text>

      <View className="mt-4 -mx-[18px]">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <View
              key={entry.workoutId}
              className={`gap-4 px-[18px] py-5 ${index > 0 ? 'border-t border-border-hairline' : ''}`}
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

              <View className="-mx-[18px]">
                <CompletedExerciseHistorySection
                  edgeToEdge={false}
                  showHeader={false}
                  index={0}
                  name={exerciseName}
                  sets={entry.sets}
                  isCollapsed={!expandedWorkoutIds.has(entry.workoutId)}
                  onToggleCollapsed={() =>
                    toggleWorkoutExpanded(entry.workoutId)
                  }
                  setTypeOptions={setTypeOptions}
                  setTypesById={setTypesById}
                  weightUnit={weightUnit}
                />
              </View>
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
