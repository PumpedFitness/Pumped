import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Easing, FadeInDown } from 'react-native-reanimated';
import { Button } from 'heroui-native';
import { AnimatedView } from '@pumped/ui/uniwind';
import { AppView } from '@/components/layout/AppView';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { hapticSuccess } from '@/utils/haptics';
import { CompletionBadge } from './components/CompletionBadge';
import { CompletionStats } from './components/CompletionStats';

type WorkoutCompleteScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkoutComplete'
>;

// One shared entrance — a short rise on an ease-out, staggered by delay.
function enterAt(delay: number) {
  return FadeInDown.delay(delay)
    .duration(380)
    .easing(Easing.out(Easing.cubic))
    .withInitialValues({ transform: [{ translateY: 10 }] });
}

export function WorkoutCompleteScreen({
  navigation,
  route,
}: WorkoutCompleteScreenProps) {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const summary = route.params;

  return (
    <AppView edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-7 px-6">
        <CompletionBadge onReveal={hapticSuccess} />

        <AnimatedView className="items-center gap-2" entering={enterAt(520)}>
          <Text className="t-display text-center">
            {t('workoutComplete.title')}
          </Text>
          <Text className="t-body text-center text-muted" numberOfLines={2}>
            {t('workoutComplete.subtitle', {
              name: summary.name,
              count: summary.exerciseCount,
            })}
          </Text>
        </AnimatedView>

        <View className="self-stretch">
          <CompletionStats
            summary={summary}
            weightUnit={profile.weightUnit}
            delay={640}
          />
        </View>
      </View>

      <AnimatedView className="gap-2 px-5 pb-2 pt-4" entering={enterAt(900)}>
        <Button
          className="rounded-full"
          feedbackVariant="scale"
          onPress={() => navigation.goBack()}
        >
          <Button.Label>{t('workoutComplete.done')}</Button.Label>
        </Button>
        <Button
          className="rounded-full"
          variant="ghost"
          feedbackVariant="scale"
          onPress={() =>
            navigation.replace('CompletedWorkout', {
              workoutId: summary.workoutId,
            })
          }
        >
          <Button.Label>{t('workoutComplete.viewDetails')}</Button.Label>
        </Button>
      </AnimatedView>
    </AppView>
  );
}
