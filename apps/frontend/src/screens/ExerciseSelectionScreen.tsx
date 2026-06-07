import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '../components/AppView';
import { ExerciseSelectionList } from '../components/exercise/ExerciseSelectionList';
import { useExerciseOptions } from '../hooks/useExerciseOptions';
import type { RootStackParamList } from '../navigation/AppNavigator';

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
          navigation.dispatch({
            ...CommonActions.setParams({
              exerciseSelection: {
                id: `${Date.now()}`,
                exerciseIds,
              },
            }),
            source: route.params.returnRouteKey,
          });
          navigation.goBack();
        }}
      />
    </AppView>
  );
}
