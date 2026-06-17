import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppView } from '@/components/layout/AppView';
import { ConfirmationActions } from '@/components/clay/option-popup/OptionPopupActions';
import { OptionPopupFrame } from '@/components/clay/option-popup/OptionPopupFrame';
import { WorkoutTemplateLibrary } from './components/WorkoutTemplateLibrary';
import type { WorkoutTemplateStatus } from '@/data/local/enums';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { WorkoutTemplate } from '@/types/workout';

type InProgressWorkoutPopupProps = {
  visible: boolean;
  workoutName: string;
  onClose: () => void;
  onOpenWorkout: () => void;
};

function InProgressWorkoutPopup({
  visible,
  workoutName,
  onClose,
  onOpenWorkout,
}: InProgressWorkoutPopupProps) {
  const { t } = useTranslation();

  return (
    <OptionPopupFrame
      visible={visible}
      title={t('plan.alerts.inProgressTitle')}
      text={t('plan.alerts.inProgressBody', { name: workoutName })}
      footer={
        <ConfirmationActions
          confirmLabel={t('plan.alerts.openWorkout')}
          disabled={false}
          onClose={onClose}
          onConfirm={onOpenWorkout}
        />
      }
      onClose={onClose}
    >
      {null}
    </OptionPopupFrame>
  );
}

export function PlanScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, exerciseOptions, updateTemplateStatus } =
    useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const [inProgressPopupVisible, setInProgressPopupVisible] = useState(false);

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
      setInProgressPopupVisible(true);
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
          exerciseOptions={exerciseOptions}
          onCreateTemplate={openCreate}
          onBrowsePremadeWorkouts={browsePremadeWorkouts}
          onStartTemplate={startTemplate}
          onEditTemplate={openEdit}
          onStatusChange={handleStatusChange}
        />
      </ScrollView>
      <InProgressWorkoutPopup
        visible={inProgressPopupVisible}
        workoutName={currentWorkout?.name ?? ''}
        onClose={() => setInProgressPopupVisible(false)}
        onOpenWorkout={() => {
          setInProgressPopupVisible(false);
          navigation.navigate('CurrentWorkout');
        }}
      />
    </AppView>
  );
}
