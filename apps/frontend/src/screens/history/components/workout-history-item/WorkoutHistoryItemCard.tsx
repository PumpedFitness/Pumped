import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';

type WorkoutHistoryItemCardProps = {
  workout: WorkoutHistoryItem;
  onPress: () => void;
};
type WorkoutStatProps = { label: string; value: string; testID?: string };

function WorkoutStat({ label, value, testID }: WorkoutStatProps) {
  return (
    <View className="min-w-0 flex-1 gap-0.5">
      <Text
        testID={testID}
        className="text-[16px] font-bold tabular-nums text-foreground"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
      <Text className="text-[11px] font-medium text-muted">{label}</Text>
    </View>
  );
}

export function WorkoutHistoryItemCard({
  workout,
  onPress,
}: WorkoutHistoryItemCardProps) {
  const { t, i18n } = useTranslation();
  const date = new Date(workout.startedAt).toLocaleDateString(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const volume = workout.totalVolumeKg.toLocaleString(i18n.language, {
    maximumFractionDigits: 0,
  });
  const heartRate =
    workout.averageHeartRate === null
      ? '—'
      : Math.round(workout.averageHeartRate).toLocaleString(i18n.language);
  return (
    <Pressable
      testID={`history-workout-${workout.id}`}
      accessibilityRole="button"
      accessibilityLabel={t('history.item.viewA11y', { name: workout.name })}
      className="gap-3 rounded-[24px] bg-surface-card p-3 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2.5">
        <WorkoutAvatar
          picture={workout.picture}
          icon={workout.icon}
          color={workout.color}
          size={36}
          radius={12}
        />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text
            className="text-[16px] font-bold text-foreground"
            numberOfLines={1}
          >
            {workout.name}
          </Text>
          <Text className="text-[11px] font-medium text-muted">{date}</Text>
        </View>
        {workout.recordCount > 0 ? (
          <View
            testID={`workout-records-${workout.id}`}
            className="flex-row items-center gap-1 rounded-full bg-accent-soft px-2 py-1"
          >
            <ClayIcon name="award" size={14} color={colors.accent} />
            <Text className="text-[11px] font-bold text-accent">
              {t('history.item.records', { count: workout.recordCount })}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="flex-row gap-3 border-t border-border-hairline pt-3">
        <WorkoutStat
          label={t('history.item.time')}
          value={t('common.minutesShort', { count: workout.durationMinutes })}
        />
        <WorkoutStat
          testID={`history-volume-${workout.id}`}
          label={t('history.item.volume')}
          value={`${volume} kg`}
        />
        <WorkoutStat
          testID={`history-heart-rate-${workout.id}`}
          label={t('history.item.averageHeartRate')}
          value={`${heartRate} ${t('completedWorkout.heartRate.bpm')}`}
        />
      </View>
    </Pressable>
  );
}
