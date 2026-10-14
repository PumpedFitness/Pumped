import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { CompletedWorkoutHeader } from './components/CompletedWorkoutHeader';
import { useCompletedWorkoutActions } from './components/useCompletedWorkoutActions';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { CompletedWorkoutDetails } from './components/CompletedWorkoutDetails';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type CompletedWorkoutScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CompletedWorkout'
>;

export function CompletedWorkoutScreen({
  navigation,
  route,
}: CompletedWorkoutScreenProps) {
  const { profile } = useUserProfile();
  const { workouts, deleteWorkout } = useWorkoutHistory();
  const workout =
    workouts.find(item => item.id === route.params.workoutId) ?? null;
  const close = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main');
  const { actions, openOptions } = useCompletedWorkoutActions({
    workout,
    onDelete: () => deleteWorkout(route.params.workoutId),
    onDeleted: close,
  });

  return (
    <AppView edges={['top', 'bottom']}>
      <CompletedWorkoutHeader
        onBack={close}
        onOptions={openOptions}
        showOptions={workout !== null}
      />

      <CompletedWorkoutDetails
        workout={workout}
        allWorkouts={workouts}
        weightUnit={profile.weightUnit}
      />
      {actions}
    </AppView>
  );
}
