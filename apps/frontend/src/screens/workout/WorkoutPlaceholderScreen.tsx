import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '../../components/AppView';
import { ClayIcon } from '../../components/icons/ClayIcon';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../theme/tokens';

type WorkoutPlaceholderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkoutPlaceholder'
>;

export function WorkoutPlaceholderScreen({
  navigation,
}: WorkoutPlaceholderScreenProps) {
  return (
    <AppView edges={['top', 'bottom']}>
      <View className="flex-row items-center border-b border-border-soft px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to plan"
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
          onPress={() => navigation.goBack()}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>
        <Text className="t-heading ml-2">Premade workouts</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-3 px-8">
        <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={26} color={colors.accent} />
        </View>
        <Text className="t-heading text-center">Premade workouts</Text>
        <Text className="t-caption text-center">
          The premade workout library will be available here.
        </Text>
      </View>
    </AppView>
  );
}
