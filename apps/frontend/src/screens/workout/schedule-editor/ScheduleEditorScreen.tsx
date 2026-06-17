import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScheduleEditor } from './components/ScheduleEditor';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useSchedules } from '@/hooks/useSchedules';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { Schedule } from '@/types/schedule';

type ScheduleEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ScheduleEditor'
>;

export function ScheduleEditorScreen({
  navigation,
  route,
}: ScheduleEditorScreenProps) {
  const { t } = useTranslation();
  const { templates } = useWorkoutTemplates();
  const { schedules, saveSchedule, deleteSchedule } = useSchedules();
  const scheduleId = route.params?.scheduleId;
  const schedule = scheduleId
    ? schedules.find(candidate => candidate.id === scheduleId) ?? null
    : null;

  const requestDelete = (target: Schedule) => {
    Alert.alert(
      t('schedule.alerts.deleteTitle', { name: target.name }),
      t('schedule.alerts.deleteBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            try {
              deleteSchedule(target.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                t('schedule.alerts.deleteFailedTitle'),
                error instanceof Error ? error.message : t('common.tryAgain'),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScheduleEditor
      key={schedule?.id ?? 'new'}
      schedule={schedule}
      templates={templates}
      onSave={saveSchedule}
      onClose={() => navigation.goBack()}
      onRequestDelete={requestDelete}
    />
  );
}
