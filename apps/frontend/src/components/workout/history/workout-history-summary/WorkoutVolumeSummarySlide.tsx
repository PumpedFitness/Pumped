import { Text, View } from 'react-native';
import type { WeightUnit } from '../../../../data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '../../../../hooks/useWorkoutHistory';
import { displayWeight } from '../../../../utils/units';
import { SummarySlideHeader } from './SummarySlideHeader';
import { buildDailyVolume, formatCompact } from './workoutHistorySummaryModel';

type WorkoutVolumeSummarySlideProps = {
  workouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
};

export function WorkoutVolumeSummarySlide({
  workouts,
  weightUnit,
}: WorkoutVolumeSummarySlideProps) {
  const dailyVolume = buildDailyVolume(workouts);
  const totalVolumeKg = dailyVolume.reduce(
    (total, day) => total + day.volumeKg,
    0,
  );
  const maxVolumeKg = Math.max(...dailyVolume.map(day => day.volumeKg), 1);
  const activeDays = dailyVolume.filter(day => day.volumeKg > 0).length;
  const totalDisplayVolume = displayWeight(totalVolumeKg, weightUnit);

  return (
    <View className="flex-1 gap-5 p-5" collapsable={false}>
      <SummarySlideHeader
        eyebrow="Volume trend"
        title={`${formatCompact(totalDisplayVolume)} ${weightUnit}`}
        description={`Lifted across the last 7 days on ${activeDays} active ${
          activeDays === 1 ? 'day' : 'days'
        }.`}
        icon="trend"
      />

      <View className="flex-1 rounded-[22px] border border-border-on-moss bg-white/[0.06] px-4 pb-3 pt-5">
        <View className="h-[170px] flex-row items-end gap-2">
          {dailyVolume.map(day => {
            const height = Math.max(5, (day.volumeKg / maxVolumeKg) * 146);
            return (
              <View key={day.key} className="flex-1 items-center gap-2">
                <View className="h-[146px] w-full justify-end">
                  <View
                    className={`w-full rounded-t-[10px] ${
                      day.volumeKg > 0 ? 'bg-accent' : 'bg-white/10'
                    }`}
                    style={{ height }}
                  />
                </View>
                <Text className="t-eyebrow text-cream-dim">{day.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-border-on-moss pt-3">
        <Text className="t-caption text-cream-dim">Daily average</Text>
        <Text className="t-label tabular-nums text-cream">
          {formatCompact(totalDisplayVolume / 7)} {weightUnit}
        </Text>
      </View>
    </View>
  );
}
