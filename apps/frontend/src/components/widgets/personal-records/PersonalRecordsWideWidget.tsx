import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';

type PersonalRecordsWideWidgetProps = { colSpan: number; width: number };

export function PersonalRecordsWideWidget(
  _props: PersonalRecordsWideWidgetProps,
) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { recentPr, recentPrCount } = useHomeWidgetData();

  return (
    <Pressable
      disabled={!recentPr}
      onPress={() =>
        recentPr &&
        navigation.navigate('EditExercise', { exerciseId: recentPr.exerciseId })
      }
    >
      <Card variant="raised" radius="lg" pad={16}>
        <View className="flex-row items-center gap-3">
          <View className="size-10 items-center justify-center rounded-full bg-white/10">
            <ClayIcon name="award" size={20} color={colors.accentHoney} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="t-caption font-semibold text-cream-dim">
              {t('widgets.personalRecords.title')}
            </Text>
            <Text className="t-heading mt-1 text-cream" numberOfLines={1}>
              {recentPr?.exerciseName ?? t('widgets.personalRecords.empty')}
            </Text>
          </View>
          <View className="items-center rounded-[14px] bg-white/10 px-3 py-2">
            <Text className="text-[22px] font-bold text-cream">
              {recentPrCount}
            </Text>
            <Text className="text-[10px] font-bold uppercase text-cream-dim">
              {t('widgets.personalRecords.prs')}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
