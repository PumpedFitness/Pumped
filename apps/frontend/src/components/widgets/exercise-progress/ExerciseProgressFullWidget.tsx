import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { colors } from '@/theme/tokens';
import { displayWeight } from '@/utils/units';

type ExerciseProgressFullWidgetProps = { colSpan: number; width: number };

export function ExerciseProgressFullWidget(
  _props: ExerciseProgressFullWidgetProps,
) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const progress = useHomeWidgetData().exerciseProgress;
  const weightUnit = useAppSettingsStore(state => state.weightUnit);
  const latest = progress
    ? Math.round(displayWeight(progress.latestEstimateKg, weightUnit))
    : 0;
  const change =
    progress?.changeKg == null
      ? null
      : Math.round(displayWeight(progress.changeKg, weightUnit));

  return (
    <Pressable
      disabled={!progress}
      onPress={() =>
        progress &&
        navigation.navigate('EditExercise', { exerciseId: progress.exerciseId })
      }
    >
      <Card radius="xl" pad={18}>
        <View className="flex-row items-center gap-3">
          <View className="size-11 items-center justify-center rounded-[14px] bg-accent-soft">
            <ClayIcon name="trend" size={21} color={colors.accent} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="t-eyebrow text-muted">
              {t('widgets.exerciseProgress.title')}
            </Text>
            <Text className="t-heading mt-1" numberOfLines={1}>
              {progress?.name ?? t('widgets.exerciseProgress.empty')}
            </Text>
          </View>
          {progress ? (
            <View className="items-end">
              <Text className="text-[26px] font-bold text-foreground">
                {latest}{' '}
                <Text className="t-caption text-muted">{weightUnit}</Text>
              </Text>
              <Text
                className={`t-caption font-semibold ${change != null && change > 0 ? 'text-sage' : 'text-muted'}`}
              >
                {change == null
                  ? t('widgets.exerciseProgress.first')
                  : t('widgets.exerciseProgress.change', {
                      value: `${change > 0 ? '+' : ''}${change}`,
                      unit: weightUnit,
                    })}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-surface-sunk">
          <View className="h-full w-4/5 rounded-full bg-accent" />
        </View>
        <Text className="t-caption mt-2 text-text-secondary">
          {t('widgets.exerciseProgress.caption')}
        </Text>
      </Card>
    </Pressable>
  );
}
