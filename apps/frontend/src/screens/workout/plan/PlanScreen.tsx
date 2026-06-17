import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppView } from '@/components/layout/AppView';
import { WorkoutTemplateLibrary } from './components/WorkoutTemplateLibrary';
import { SchedulesSection } from './components/SchedulesSection';
import type { WorkoutTemplateStatus } from '@/data/local/enums';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useSchedules } from '@/hooks/useSchedules';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { WorkoutTemplate } from '@/types/workout';
import type { Schedule } from '@/types/schedule';

export function PlanScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, exerciseOptions, updateTemplateStatus } =
    useWorkoutTemplates();
  const { schedules, advancedSchedules, setActive } = useSchedules();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  const basicSchedules = useMemo(() => {
    const map = new Map<string, Schedule>();
    for (const schedule of schedules) {
      if (schedule.kind === 'BASIC' && schedule.ownerTemplateId) {
        map.set(schedule.ownerTemplateId, schedule);
      }
    }
    return map;
  }, [schedules]);

  const openSchedule = (schedule: Schedule) => {
    navigation.navigate('ScheduleEditor', { scheduleId: schedule.id });
  };

  const createSchedule = () => {
    navigation.navigate('ScheduleEditor', {});
  };

  const toggleScheduleActive = (schedule: Schedule) => {
    setActive(schedule.id, !schedule.isActive);
  };

  const openCreate = () => {
    navigation.navigate('WorkoutTemplateEditor');
  };

  const openEdit = (template: WorkoutTemplate) => {
    navigation.navigate('WorkoutTemplateEditor', {
      templateId: template.id,
    });
  };

  const startTemplate = (template: WorkoutTemplate) => {
    if (currentWorkout) {
      Alert.alert(
        t('plan.alerts.inProgressTitle'),
        t('plan.alerts.inProgressBody', { name: currentWorkout.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('plan.alerts.openWorkout'),
            onPress: () => navigation.navigate('CurrentWorkout'),
          },
        ],
      );
      return;
    }

    try {
      startTemplateWorkout(template.id);
      navigation.navigate('CurrentWorkout');
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  };

  const browsePremadeWorkouts = () => {
    navigation.navigate('WorkoutPlaceholder');
  };

  const handleStatusChange = (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => {
    try {
      updateTemplateStatus(template.id, status);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.updateFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  };

  return (
    <AppView edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-32 pt-7"
        showsVerticalScrollIndicator={false}
      >
        <WorkoutTemplateLibrary
          templates={templates}
          basicSchedules={basicSchedules}
          exerciseOptions={exerciseOptions}
          onCreateTemplate={openCreate}
          onBrowsePremadeWorkouts={browsePremadeWorkouts}
          onStartTemplate={startTemplate}
          onEditTemplate={openEdit}
          onStatusChange={handleStatusChange}
        />
        <SchedulesSection
          schedules={advancedSchedules}
          onCreate={createSchedule}
          onEdit={openSchedule}
          onToggleActive={toggleScheduleActive}
        />
      </ScrollView>
    </AppView>
  );
}
