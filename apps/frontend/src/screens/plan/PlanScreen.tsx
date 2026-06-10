import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView } from 'react-native';
import { AppView } from '../../components/AppView';
import { WorkoutTemplateLibrary } from '../../components/workout/WorkoutTemplateLibrary';
import type { WorkoutTemplateStatus } from '../../data/local/enums';
import { useWorkoutTemplates } from '../../hooks/useWorkoutTemplates';
import { useCurrentWorkout } from '../../hooks/useCurrentWorkout';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { WorkoutTemplate } from '../../types/workout';

export function PlanScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, exerciseOptions, updateTemplateStatus, refresh } =
    useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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
        'Workout already in progress',
        `Finish or discard ${currentWorkout.name} before starting another workout.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open workout',
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
        'Could not start workout',
        error instanceof Error ? error.message : 'Please try again.',
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
        'Could not update template',
        error instanceof Error ? error.message : 'Please try again.',
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
    </AppView>
  );
}
