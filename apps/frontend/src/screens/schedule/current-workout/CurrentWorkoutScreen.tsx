import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { CurrentWorkout } from './components/CurrentWorkout';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';

type CurrentWorkoutScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CurrentWorkout'
>;

export function CurrentWorkoutScreen({
  navigation,
  route,
}: CurrentWorkoutScreenProps) {
  const { t } = useTranslation();

  return (
    <AppView edges={['top', 'bottom']}>
      <View className="flex-row items-center border-b border-border-soft px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.backToPlanA11y')}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-card"
          onPress={() => navigation.goBack()}
        >
          <ClayIcon name="back" size={20} color={colors.ink} />
        </Pressable>
        <Text className="t-heading ml-2">
          {t('currentWorkout.screenTitle')}
        </Text>
      </View>
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
