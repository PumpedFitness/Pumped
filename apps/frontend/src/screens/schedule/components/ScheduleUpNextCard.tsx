import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';
import type { TomorrowPlan } from './scheduleWeekModel';

const AVATAR_SIZE = 44;

type ScheduleUpNextCardProps = {
  tomorrow: TomorrowPlan;
};

// A glance at tomorrow's plan, so the Active tab answers "what's next?" without
// scanning the week strip. Rest days get a calmer treatment.
export function ScheduleUpNextCard({ tomorrow }: ScheduleUpNextCardProps) {
  const { t } = useTranslation();
  const [first, ...rest] = tomorrow.templates;

  return (
    <View className="gap-3 rounded-[24px] border border-border-hairline bg-surface-card p-4">
      <Text className="t-eyebrow text-muted">{t('schedule.upNext.title')}</Text>

      {tomorrow.isRest || !first ? (
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-surface-sunk">
            <ClayIcon name="rest" size={22} color={colors.muted} />
          </View>
          <View className="flex-1">
            <Text className="t-heading">{t('schedule.upNext.rest')}</Text>
            <Text className="t-caption text-muted">
              {t('schedule.upNext.restBody')}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-3">
          <WorkoutAvatar
            picture={first.picture}
            icon={first.icon}
            color={first.color}
            size={AVATAR_SIZE}
          />
          <View className="flex-1">
            <Text className="t-heading" numberOfLines={1}>
              {first.name}
            </Text>
            <Text className="t-caption text-muted">
              {rest.length > 0
                ? t('schedule.upNext.plusMore', { count: rest.length })
                : t('schedule.upNext.scheduled')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
