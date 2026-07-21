import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { RingGauge } from '@/components/clay/RingGauge';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';

type RecoveryWidgetProps = {
  colSpan: number;
  width: number;
};

export function RecoveryFullWidget(_props: RecoveryWidgetProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { today } = useTodayWorkout();
  const { templates } = useWorkoutTemplates();
  const { lastWorkout, workouts } = useHomeWidgetData();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const templateId =
    today.kind === 'pending' || today.kind === 'skipped'
      ? today.templateId
      : null;
  const template = templates.find(item => item.id === templateId);
  const matchingWorkouts = templateId
    ? workouts.filter(workout => workout.workoutTemplateId === templateId)
    : [];
  const estimatedMinutes = matchingWorkouts.length
    ? Math.round(
        matchingWorkouts.reduce(
          (sum, workout) => sum + workout.durationMinutes,
          0,
        ) / matchingWorkouts.length,
      )
    : 0;
  const recoveryScore = lastWorkout
    ? Math.min(100, Math.round((Date.now() - lastWorkout.endedAt!) / 1_728_000))
    : 100;
  const workoutName = template?.name ?? t('schedule.restDay');

  const startWorkout = () => {
    if (currentWorkout) {
      openCurrentWorkout(navigation);
      return;
    }
    if (!templateId) return;
    startTemplateWorkout(templateId);
    openCurrentWorkout(navigation);
  };

  return (
    <Card variant="raised" radius="2xl" pad={20}>
      <View className="flex-row items-center gap-4">
        <RingGauge value={recoveryScore} size={84} thickness={11}>
          <Text className="text-[21px] font-bold text-cream tracking-[-0.3px]">
            {recoveryScore}
          </Text>
          <Text className="text-[11px] font-bold text-cream-dim uppercase tracking-[1.2px] mt-[-2px]">
            {t('widgets.recovery.ready')}
          </Text>
        </RingGauge>

        <View className="flex-1">
          <Text className="text-[11px] font-bold text-cream-dim uppercase tracking-[1.2px] mb-1">
            {t('widgets.recovery.title')}
          </Text>
          <Text className="text-xl font-bold text-cream leading-[26px]">
            {workoutName}
          </Text>
        </View>
      </View>

      <View className="h-px bg-border-on-moss mt-4 mb-[14px]" />

      <View className="flex-row items-center">
        <View className="flex-1 flex-row gap-5">
          <View>
            <Text className="text-[21px] font-bold text-cream">
              {template?.exercises.length ?? 0}
            </Text>
            <Text className="text-[11px] text-cream-dim mt-[2px]">
              {t('widgets.recovery.movements')}
            </Text>
          </View>
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-[21px] font-bold text-cream">
                {estimatedMinutes || '—'}
              </Text>
              <Text className="text-[12.5px] font-medium text-cream-dim ml-[2px]">
                m
              </Text>
            </View>
            <Text className="text-[11px] text-cream-dim mt-[2px]">
              {t('widgets.recovery.estTime')}
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="sm"
          iconRight={
            <ClayIcon name="play" size={16} color={colors.accentInk} />
          }
          disabled={!templateId && !currentWorkout}
          onPress={startWorkout}
        >
          {t('widgets.recovery.start')}
        </Button>
      </View>
    </Card>
  );
}
