import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { useSchedules } from '@/hooks/useSchedules';
import { formatScheduleSummary } from '@/components/workout/schedulePresentation';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { Schedule } from '@/types/schedule';
import { ScheduleRow } from './ScheduleRow';

export function ScheduleLibraryTab() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { schedules, setActive } = useSchedules();

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
      createTestID="create_schedule"
      onCreate={createSchedule}
    />
  );
}
