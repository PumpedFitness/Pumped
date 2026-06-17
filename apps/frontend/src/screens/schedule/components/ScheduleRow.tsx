import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Schedule } from '@/types/schedule';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { formatScheduleSummary } from '@/components/workout/schedulePresentation';

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
    <View className="overflow-hidden rounded-[24px] border border-border-hairline bg-surface-card">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plan.schedules.editA11y', {
          name: schedule.name,
        })}
        className="p-5 active:bg-surface-sunk"
        onPress={() => onEdit(schedule)}
      >
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-accent-soft">
            <ClayIcon name="calendar" size={22} color={colors.accent} />
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="t-heading">{schedule.name}</Text>
              {schedule.isActive && (
                <View className="rounded-full bg-accent-soft px-2.5 py-1">
                  <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-accent">
                    {t('schedule.active')}
                  </Text>
                </View>
              )}
            </View>
            <Text className="t-caption mt-1">
              {formatScheduleSummary(t, schedule)}
            </Text>
          </View>
          <ClayIcon name="chevron" size={18} color={colors.muted} />
        </View>
      </Pressable>

      <View className="flex-row border-t border-border-soft">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 active:bg-surface-sunk"
          onPress={() => onToggleActive(schedule)}
        >
          <ClayIcon
            name={schedule.isActive ? 'pause' : 'play'}
            size={17}
            color={colors.ink2}
          />
          <Text className="t-label text-foreground-secondary">
            {schedule.isActive
              ? t('schedule.deactivate')
              : t('schedule.activate')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
