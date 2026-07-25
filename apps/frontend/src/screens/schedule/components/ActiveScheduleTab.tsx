import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { useScheduleWeek } from '@/hooks/useScheduleWeek';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ScheduleTodayHeader } from './ScheduleTodayHeader';
import { ScheduleUpNextCard } from './ScheduleUpNextCard';
import { ScheduleWeekStrip } from './ScheduleWeekStrip';

type ActiveScheduleTabProps = {
  onGoToLibrary: () => void;
};

export function ActiveScheduleTab({ onGoToLibrary }: ActiveScheduleTabProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { today, skip, unskip } = useTodayWorkout();
  const { days, tomorrow, hasActiveSchedule, scheduleName } = useScheduleWeek();
  const { profile } = useUserProfile();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  const startToday = () => {
    const templateId =
      today.kind === 'pending' || today.kind === 'skipped'
        ? today.templateId
        : null;
    if (!templateId) {
      return;
    }
    if (currentWorkout) {
      Alert.alert(
        t('plan.alerts.inProgressTitle'),
        t('plan.alerts.inProgressBody', { name: currentWorkout.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('plan.alerts.openWorkout'),
            onPress: () => openCurrentWorkout(navigation),
          },
        ],
      );
      return;
    }
    try {
      startTemplateWorkout(templateId);
      openCurrentWorkout(navigation);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  };

  const startAnyway = () => {
    unskip();
    startToday();
  };

  const viewWorkout = (workoutId: string) => {
    navigation.navigate('CompletedWorkout', { workoutId });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-4 px-5 pt-4 pb-6"
    >
      <ScheduleTodayHeader
        state={today}
        scheduleName={scheduleName}
        weightUnit={profile.weightUnit}
        onStart={startToday}
        onSkip={skip}
        onStartAnyway={startAnyway}
        onViewWorkout={viewWorkout}
      />

      {hasActiveSchedule ? (
        <>
          <ScheduleUpNextCard tomorrow={tomorrow} />
          <ScheduleWeekStrip days={days} />
        </>
      ) : (
        <Button
          variant="secondary"
          feedbackVariant="scale"
          onPress={onGoToLibrary}
        >
          <Button.Label>{t('schedule.browseLibrary')}</Button.Label>
        </Button>
      )}

      <TabBarInsetSpacer />
    </ScrollView>
  );
}
