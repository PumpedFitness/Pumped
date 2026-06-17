import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { Schedule } from '@/types/schedule';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { EmptyState } from '@/components/clay/EmptyState';
import { formatScheduleSummary } from '@/components/workout/schedulePresentation';

type SchedulesSectionProps = {
  schedules: Schedule[];
  onCreate: () => void;
  onEdit: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule) => void;
};

const emptyStateIcon = (
  <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-accent-soft">
    <ClayIcon name="calendar" size={24} color={colors.accent} />
  </View>
);

export function SchedulesSection({
  schedules,
  onCreate,
  onEdit,
  onToggleActive,
}: SchedulesSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="t-heading">{t('plan.schedules.title')}</Text>
        <Button
          accessibilityLabel={t('plan.schedules.createA11y')}
          className="h-10 rounded-full px-4"
          variant="secondary"
          feedbackVariant="scale"
          onPress={onCreate}
        >
          <Button.Label>{t('plan.schedules.create')}</Button.Label>
        </Button>
      </View>

      {schedules.length > 0 ? (
        schedules.map(schedule => (
          <ScheduleRow
            key={schedule.id}
            schedule={schedule}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        ))
      ) : (
        <EmptyState
          icon={emptyStateIcon}
          className="bg-surface-card"
          titleClassName="text-center"
          bodyClassName="max-w-64"
          title={t('plan.schedules.empty.title')}
          body={t('plan.schedules.empty.body')}
        />
      )}
    </View>
  );
}

type ScheduleRowProps = {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule) => void;
};

function ScheduleRow({ schedule, onEdit, onToggleActive }: ScheduleRowProps) {
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
