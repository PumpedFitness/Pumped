import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { AppView } from '@/components/layout/AppView';
import { ExerciseSelectionList } from './components/ExerciseSelectionList';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type ExerciseSelectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExerciseSelection'
>;

export function ExerciseSelectionScreen({
  navigation,
  route,
}: ExerciseSelectionScreenProps) {
  const exerciseOptions = useExerciseOptions();

  return (
    <AppView edges={['top', 'bottom']}>
      <ExerciseSelectionList
        exercises={exerciseOptions}
        initialSelectedExerciseIds={route.params.selectedExerciseIds}
        onCancel={() => navigation.goBack()}
        onDone={exerciseIds => {
          // Returns the selection to the calling route (identified by its
          // route key) via setParams — see RootStackParamList.
          navigation.dispatch({
            ...CommonActions.setParams({
              exerciseSelection: {
                id: randomUUID(),
                exerciseIds,
              },
            }),
            source: route.params.returnRouteKey,
          });
          navigation.goBack();
        }}
        onCreateExercise={() => navigation.navigate('CreateExercise')}
      />
    </AppView>
  );
}
