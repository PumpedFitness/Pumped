import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppView } from '../../components/AppView';
import { ExerciseLibrary } from '../../components/exercise/ExerciseLibrary';
import { useExerciseOptions } from '../../hooks/useExerciseOptions';
import type { RootStackParamList } from '../../navigation/AppNavigator';

export function ExerciseLibraryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [, setFocusCount] = useState(0);
  useFocusEffect(useCallback(() => { setFocusCount(c => c + 1); }, []));

  const exerciseOptions = useExerciseOptions();

  return (
    <AppView edges={['top']}>
      <ExerciseLibrary
        exercises={exerciseOptions}
        onBack={() => navigation.goBack()}
        onCreateExercise={() => navigation.navigate('CreateExercise')}
      />
    </AppView>
  );
}
