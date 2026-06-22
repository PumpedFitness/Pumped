import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { CurrentWorkout } from './components/CurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type CurrentWorkoutScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrentWorkout'
>;

export function CurrentWorkoutScreen({
  navigation,
  route,
}: CurrentWorkoutScreenProps) {
  return (
    <AppView edges={['top', 'bottom']}>
      <CurrentWorkout
        navigation={navigation}
        exerciseSelection={route.params?.exerciseSelection}
        onChooseExercises={selectedExerciseIds =>
          navigation.navigate('ExerciseSelection', {
            selectedExerciseIds,
            returnRouteKey: route.key,
          })
        }
      />
    </AppView>
  );
}
