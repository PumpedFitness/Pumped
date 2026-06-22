import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { ScheduleTodayHeader } from './components/ScheduleTodayHeader';
import { ScheduleRow } from './components/ScheduleRow';
import { useSchedules } from '@/hooks/useSchedules';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { formatScheduleSummary } from '@/components/workout/schedulePresentation';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import type { Schedule } from '@/types/schedule';

export function ScheduleScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { schedules, activeSchedule, todayTemplateIds, setActive } =
    useSchedules();
  const { templates } = useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  const todayWorkoutName = useMemo(() => {
    const templateId = todayTemplateIds[0];
    if (!templateId) {
      return null;
    }
    return templates.find(template => template.id === templateId)?.name ?? null;
  }, [todayTemplateIds, templates]);

  const startToday = () => {
    const templateId = todayTemplateIds[0];
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

  const createSchedule = () => {
    navigation.navigate('ScheduleEditor', {});
  };

  const openSchedule = (schedule: Schedule) => {
    navigation.navigate('ScheduleEditor', { scheduleId: schedule.id });
  };

  const toggleScheduleActive = (schedule: Schedule) => {
    setActive(schedule.id, !schedule.isActive);
  };

  return (
    <AppShell showTabBar>
      <SearchableLibrary
        items={schedules}
        keyExtractor={schedule => schedule.id}
        getSearchText={schedule =>
          `${schedule.name} ${formatScheduleSummary(t, schedule)}`
        }
        renderItem={schedule => (
          <ScheduleRow
            schedule={schedule}
            onEdit={openSchedule}
            onToggleActive={toggleScheduleActive}
          />
        )}
        namespace="plan.schedules"
        emptyIconName="calendar"
        createTestID="create_schedule"
        onCreate={createSchedule}
        header={
          <ScheduleTodayHeader
            activeSchedule={activeSchedule}
            todayWorkoutName={todayWorkoutName}
            onStart={startToday}
          />
        }
      />
    </AppShell>
  );
}
