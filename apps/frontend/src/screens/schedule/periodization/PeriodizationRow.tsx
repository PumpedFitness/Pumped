import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { Periodization } from '@/types/periodization';

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
    <View className="overflow-hidden rounded-[24px] border border-border-hairline bg-surface-card">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center gap-3 p-5 active:bg-surface-sunk"
        onPress={onEdit}
      >
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-accent-soft">
          <ClayIcon name="calendar" size={21} color={colors.accent} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="t-heading" numberOfLines={1}>
              {periodization.name}
            </Text>
            {periodization.isActive ? (
              <View className="rounded-full bg-accent-soft px-2.5 py-1">
                <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-accent">
                  {t('schedule.active')}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="t-caption mt-1">
            {t('schedule.periodization.summary', {
              phases: periodization.phases.length,
              workouts: workoutCount,
            })}
          </Text>
        </View>
        <ClayIcon name="chevron" size={18} color={colors.muted} />
      </Pressable>
      <View className="border-t border-border-soft">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
          onPress={onToggleActive}
        >
          <ClayIcon
            name={periodization.isActive ? 'pause' : 'play'}
            size={17}
            color={colors.ink2}
          />
          <Text className="t-label text-foreground-secondary">
            {periodization.isActive
              ? t('schedule.deactivate')
              : t('schedule.activate')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
