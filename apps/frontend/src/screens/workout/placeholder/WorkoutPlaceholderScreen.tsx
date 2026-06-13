import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';

type WorkoutPlaceholderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkoutPlaceholder'
>;

export function WorkoutPlaceholderScreen({
  navigation,
}: WorkoutPlaceholderScreenProps) {
  const { t } = useTranslation();

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('workoutPlaceholder.title')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('workoutPlaceholder.backA11y')}
      />

      <View className="flex-1 items-center justify-center gap-3 px-8">
        <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={26} color={colors.accent} />
        </View>
        <Text className="t-heading text-center">
          {t('workoutPlaceholder.title')}
        </Text>
        <Text className="t-caption text-center">
          {t('workoutPlaceholder.body')}
        </Text>
      </View>
    </AppView>
  );
}
