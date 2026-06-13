import { Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { AppView } from '@/components/layout/AppView';
import { WorkoutTemplateEditor } from './components/WorkoutTemplateEditor';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type WorkoutTemplateEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkoutTemplateEditor'
>;

export function WorkoutTemplateEditorScreen({
  navigation,
  route,
}: WorkoutTemplateEditorScreenProps) {
  const { t } = useTranslation();
  const { templates, exerciseOptions, saveTemplate, deleteTemplate } =
    useWorkoutTemplates();
  const templateId = route.params?.templateId;
  const template = templateId
    ? templates.find(candidate => candidate.id === templateId) ?? null
    : null;

  if (templateId && !template) {
    return (
      <AppView
        edges={['top', 'bottom']}
        className="items-center justify-center gap-4 px-6"
      >
        <Text className="t-heading text-center">
          {t('templateEditor.notFoundTitle')}
        </Text>
        <Text className="t-caption text-center">
          {t('templateEditor.notFoundBody')}
        </Text>
        <Button
          className="rounded-full"
          variant="secondary"
          feedbackVariant="scale"
          onPress={() => navigation.goBack()}
        >
          <Button.Label>{t('templateEditor.backToPlan')}</Button.Label>
        </Button>
      </AppView>
    );
  }

  const requestDelete = () => {
    if (!template) {
      return;
    }

    Alert.alert(
      t('templateEditor.alerts.deleteTitle', { name: template.name }),
      t('templateEditor.alerts.deleteBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            try {
              deleteTemplate(template.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                t('templateEditor.alerts.deleteFailedTitle'),
                error instanceof Error ? error.message : t('common.tryAgain'),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <WorkoutTemplateEditor
      key={template?.id ?? 'new'}
      template={template}
      exerciseOptions={exerciseOptions}
      exerciseSelection={route.params?.exerciseSelection}
      onClose={() => navigation.goBack()}
      onChooseExercises={selectedExerciseIds =>
        navigation.navigate('ExerciseSelection', {
          selectedExerciseIds,
          returnRouteKey: route.key,
        })
      }
      onSave={saveTemplate}
      onRequestDelete={requestDelete}
    />
  );
}
