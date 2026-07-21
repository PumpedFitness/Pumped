import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/clay/Button';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import { colors } from '@/theme/tokens';

type QuickStartWideWidgetProps = { colSpan: number; width: number };

export function QuickStartWideWidget(_props: QuickStartWideWidgetProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, sessions } = useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const latestTemplateId = sessions.find(
    session => session.workoutTemplateId,
  )?.workoutTemplateId;
  const template =
    templates.find(item => item.id === latestTemplateId) ?? templates[0];
  const start = () => {
    if (!currentWorkout && template) startTemplateWorkout(template.id);
    openCurrentWorkout(navigation);
  };

  return (
    <Card variant="raised" radius="lg" pad={15}>
      <View className="flex-row items-center gap-3">
        <View className="size-10 items-center justify-center rounded-[13px] bg-white/10">
          <ClayIcon
            name={template?.icon ?? 'dumbbell'}
            size={20}
            color={colors.cream}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="t-caption font-semibold text-cream-dim">
            {t('widgets.quickStart.title')}
          </Text>
          <Text className="t-heading mt-1 text-cream" numberOfLines={1}>
            {currentWorkout?.name ??
              template?.name ??
              t('widgets.quickStart.empty')}
          </Text>
        </View>
        <Button
          variant="primary"
          size="sm"
          disabled={!currentWorkout && !template}
          onPress={start}
        >
          {currentWorkout
            ? t('widgets.quickStart.resume')
            : t('widgets.quickStart.start')}
        </Button>
      </View>
    </Card>
  );
}
