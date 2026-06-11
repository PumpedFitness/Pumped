import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../clay/Button';
import { CurrentWorkoutOverlay } from '../workout/current-workout-overlay';

export function WorkoutOverlayTestButton() {
  const [visible, setVisible] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const openCurrentWorkout = () => {
    setVisible(false);
    navigation.navigate('CurrentWorkout');
  };

  return (
    <View className="mb-6">
      <Button
        block
        variant={visible ? 'ghost' : 'primary'}
        onPress={() => setVisible(current => !current)}
      >
        {visible ? 'Hide workout overlay' : 'Test workout overlay'}
      </Button>

      <CurrentWorkoutOverlay
        visible={visible}
        workoutName="Upper body strength"
        completedSets={5}
        totalSets={12}
        elapsedMinutes={34}
        currentExerciseName="Incline dumbbell press"
        onOpenWorkout={openCurrentWorkout}
      />
    </View>
  );
}
