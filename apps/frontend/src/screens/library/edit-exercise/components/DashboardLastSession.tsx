import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import type { ExerciseHistoryEntry } from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  formatShortDate,
  formatVolumeValue,
  formatWeightValue,
} from './exerciseFormat';

type DashboardLastSessionProps = {
  entry: ExerciseHistoryEntry;
  weightUnit: WeightUnit;
};

export function DashboardLastSession({
  entry,
  weightUnit,
}: DashboardLastSessionProps) {
  const { t, i18n } = useTranslation();

  const sets = t('exerciseOverview.dashboard.lastSessionSets', {
    count: entry.setCount,
  });
  const meta =
    entry.topWeightKg != null
      ? `${sets} · ${t('exerciseOverview.dashboard.lastSessionTop', {
          weight: formatWeightValue(entry.topWeightKg, weightUnit),
        })}`
      : sets;

  return (
    <View className="flex-row items-center gap-3 rounded-[20px] border border-border-hairline bg-surface-card px-4 py-[14px]">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
        <ClayIcon name="history" size={18} color={colors.accent} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">
          {t('exerciseOverview.dashboard.lastSession')}
        </Text>
        <Text
          className="mt-[2px] text-[13.5px] font-semibold text-foreground"
          numberOfLines={1}
        >
          {entry.workoutName} ·{' '}
          {formatShortDate(entry.startedAt, i18n.language)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[15px] font-bold text-foreground">
          {formatVolumeValue(entry.volumeKg, weightUnit)} {weightUnit}
        </Text>
        <Text className="mt-[1px] text-[11.5px] text-muted">{meta}</Text>
      </View>
    </View>
  );
}
