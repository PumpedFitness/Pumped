import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { Schedule } from '@/types/schedule';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';

type ScheduleTodayHeaderProps = {
  activeSchedule: Schedule | null;
  todayWorkoutName: string | null;
  onStart: () => void;
};

export function ScheduleTodayHeader({
  activeSchedule,
  todayWorkoutName,
  onStart,
}: ScheduleTodayHeaderProps) {
  const { t } = useTranslation();

  if (!activeSchedule) {
    return (
      <View className="gap-1 rounded-[24px] border border-dashed border-border-soft bg-surface-card p-5">
        <Text className="t-heading">{t('schedule.today.noneTitle')}</Text>
        <Text className="t-caption text-muted">
          {t('schedule.today.noneBody')}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-[24px] bg-moss p-5">
      <View>
        <Text className="t-eyebrow text-cream-dim">
          {t('schedule.today.eyebrow')}
        </Text>
        <Text className="t-heading mt-0.5 text-cream">
          {activeSchedule.name}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <ClayIcon
          name={todayWorkoutName ? 'dumbbell' : 'rest'}
          size={18}
          color={colors.cream}
        />
        <Text className="t-body text-cream">
          {todayWorkoutName
            ? t('schedule.today.todayIs', { name: todayWorkoutName })
            : t('schedule.today.restToday')}
        </Text>
      </View>

      {todayWorkoutName && (
        <Button
          className="h-12 rounded-full bg-accent"
          feedbackVariant="scale"
          onPress={onStart}
        >
          <Button.Label className="text-[15px] font-bold text-accent-foreground">
            {t('schedule.today.start')}
          </Button.Label>
        </Button>
      )}
    </View>
  );
}
