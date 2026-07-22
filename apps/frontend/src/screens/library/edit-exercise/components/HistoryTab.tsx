import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import type { ExerciseHistoryEntry } from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  formatFullDate,
  formatVolumeValue,
  formatWeightValue,
} from './exerciseFormat';

type HistoryTabProps = {
  history: ExerciseHistoryEntry[];
  weightUnit: WeightUnit;
  onOpenWorkout: (workoutId: string) => void;
};

type StatColProps = {
  label: string;
  value: string;
};

function StatCol({ label, value }: StatColProps) {
  return (
    <View className="flex-1">
      <Text className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
        {label}
      </Text>
      <Text className="mt-[2px] text-[14px] font-bold text-foreground">
        {value}
      </Text>
    </View>
  );
}

export function HistoryTab({
  history,
  weightUnit,
  onOpenWorkout,
}: HistoryTabProps) {
  const { t, i18n } = useTranslation();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[10px] px-4 pb-7 pt-1"
      showsVerticalScrollIndicator={false}
    >
      {history.length > 0 ? (
        history.map(entry => (
          <Pressable
            key={entry.workoutId}
            accessibilityRole="button"
            accessibilityLabel={t('exerciseOverview.history.openA11y', {
              name: entry.workoutName,
            })}
            onPress={() => onOpenWorkout(entry.workoutId)}
            className="rounded-[18px] border border-border-hairline bg-surface-card px-4 py-[14px] active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-surface-sunk">
                <ClayIcon name="history" size={18} color={colors.accent} />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  className="text-[13.5px] font-semibold text-foreground"
                  numberOfLines={1}
                >
                  {entry.workoutName}
                </Text>
                <Text className="mt-[1px] text-[11.5px] text-muted">
                  {formatFullDate(entry.startedAt, i18n.language)}
                </Text>
              </View>
              <ClayIcon name="chevron" size={16} color={colors.muted} />
            </View>

            <View className="mt-3 flex-row border-t border-border-soft pt-[11px]">
              <StatCol
                label={t('exerciseOverview.history.sets')}
                value={String(entry.setCount)}
              />
              <StatCol
                label={t('exerciseOverview.history.volume')}
                value={`${formatVolumeValue(
                  entry.volumeKg,
                  weightUnit,
                )} ${weightUnit}`}
              />
              <StatCol
                label={t('exerciseOverview.history.topWeight')}
                value={
                  entry.topWeightKg != null
                    ? `${formatWeightValue(
                        entry.topWeightKg,
                        weightUnit,
                      )} ${weightUnit}`
                    : '—'
                }
              />
            </View>
          </Pressable>
        ))
      ) : (
        <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-6">
          <Text className="text-center text-[13.5px] font-semibold text-foreground">
            {t('exerciseOverview.history.emptyTitle')}
          </Text>
          <Text className="mt-2 text-center text-[12.5px] text-text-secondary">
            {t('exerciseOverview.history.emptyBody')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
