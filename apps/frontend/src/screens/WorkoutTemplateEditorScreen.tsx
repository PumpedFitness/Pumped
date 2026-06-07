import { Alert, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'heroui-native';
import { AppView } from '../components/AppView';
import { WorkoutTemplateEditor } from '../components/workout/WorkoutTemplateEditor';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import type { RootStackParamList } from '../navigation/AppNavigator';

type WorkoutTemplateEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WorkoutTemplateEditor'
>;

export function WorkoutTemplateEditorScreen({
  navigation,
  route,
}: WorkoutTemplateEditorScreenProps) {
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
        <Text className="t-heading text-center">Template not found</Text>
        <Text className="t-caption text-center">
          This workout template may have been deleted.
        </Text>
        <Button
          className="rounded-full"
          variant="secondary"
          feedbackVariant="scale"
          onPress={() => navigation.goBack()}
        >
          <Button.Label>Back to plan</Button.Label>
        </Button>
      </AppView>
    );
  }

  const requestDelete = () => {
    if (!template) {
      return;
    }

    Alert.alert(
      `Delete ${template.name}?`,
      'This removes the template and its planned exercises. Completed workouts stay in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deleteTemplate(template.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Could not delete template',
                error instanceof Error ? error.message : 'Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <WorkoutTemplateEditor
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
