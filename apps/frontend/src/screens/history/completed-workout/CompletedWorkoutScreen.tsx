import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
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
  const { t } = useTranslation();
  const { profile } = useUserProfile();

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('completedWorkout.title')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('completedWorkout.backA11y')}
      />

      <CompletedWorkoutDetails
        workoutId={route.params.workoutId}
        weightUnit={profile.weightUnit}
      />
    </AppView>
  );
}
