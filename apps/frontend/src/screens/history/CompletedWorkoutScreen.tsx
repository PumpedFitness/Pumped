import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '../../components/AppView';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { CompletedWorkoutDetails } from '../../components/workout/history/CompletedWorkoutDetails';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/tokens';

type CompletedWorkoutScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CompletedWorkout'
>;

export function CompletedWorkoutScreen({
  navigation,
  route,
}: CompletedWorkoutScreenProps) {
  const { profile } = useUserProfile();

  return (
    <AppView edges={['top', 'bottom']}>
      <View className="flex-row items-center border-b border-border-soft px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to workout history"
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
          onPress={() => navigation.goBack()}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>
        <Text className="t-heading ml-2">Workout details</Text>
      </View>

      <CompletedWorkoutDetails
        workoutId={route.params.workoutId}
        weightUnit={profile.weightUnit}
      />
    </AppView>
  );
}
