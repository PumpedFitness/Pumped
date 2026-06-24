import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { useUndoToast } from '@/components/feedback/UndoToast';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useLocalFavorites } from '@/hooks/useLocalFavorites';
import type { SaveWorkoutTemplateInput } from '@/data/local/workouts/templates';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import type { WorkoutTemplate } from '@/types/workout';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { LibrarySwipeRow } from './LibrarySwipeRow';

// Flatten a stored template back into the save shape so an undo can re-create
// it (and its exercises + sets) after a cascading delete.
function templateToInput(template: WorkoutTemplate): SaveWorkoutTemplateInput {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    color: template.color,
    exercises: template.exercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      typeId: exercise.typeId,
      goal: exercise.goal,
      notes: exercise.notes,
      sets: exercise.sets.map(set => ({
        setType: set.setType,
        restSeconds: set.restSeconds,
        fieldValues: set.fieldValues,
      })),
    })),
  };
}

export function WorkoutsLibrary() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, exerciseOptions, deleteTemplate, saveTemplate } =
    useWorkoutTemplates();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const { isFavorite, toggleFavorite } = useLocalFavorites();
  const { showUndo } = useUndoToast();

  // Capture the template before the cascading delete so undo can restore it.
  const removeTemplate = (template: WorkoutTemplate) => {
    const snapshot = templateToInput(template);
    deleteTemplate(template.id);
    showUndo({
      message: t('common.deletedNamed', { name: template.name }),
      onUndo: () => saveTemplate(snapshot),
    });
  };

  const exerciseNames = useMemo(
    () =>
      new Map(
        exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
      ),
    [exerciseOptions],
  );

  const openEdit = (template: WorkoutTemplate) => {
    navigation.navigate('WorkoutTemplateEditor', { templateId: template.id });
  };

  const startTemplate = (template: WorkoutTemplate) => {
    if (currentWorkout) {
      Alert.alert(
        t('plan.alerts.inProgressTitle'),
        t('plan.alerts.inProgressBody', { name: currentWorkout.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('plan.alerts.openWorkout'),
            onPress: () => openCurrentWorkout(navigation),
          },
        ],
      );
      return;
    }
    try {
      startTemplateWorkout(template.id);
      openCurrentWorkout(navigation);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  };

  const browseWorkoutsAction = (
    <Button
      className="mt-1 rounded-full"
      variant="secondary"
      feedbackVariant="scale"
      onPress={() => navigation.navigate('WorkoutPlaceholder')}
    >
      <Button.Label>{t('plan.browseWorkouts')}</Button.Label>
    </Button>
  );

  return (
    <SearchableLibrary
      items={templates}
      keyExtractor={template => template.id}
      getSearchText={template =>
        [
          template.name,
          template.description ?? '',
          ...template.exercises.map(
            exercise => exerciseNames.get(exercise.exerciseId) ?? '',
          ),
        ].join(' ')
      }
      renderItem={template => (
        <LibrarySwipeRow
          favorited={isFavorite(template.id)}
          onToggleFavorite={() => toggleFavorite(template.id)}
          onDelete={() => removeTemplate(template)}
          borderRadius={24}
        >
          <WorkoutTemplateCard
            template={template}
            exerciseNames={exerciseNames}
            onEdit={openEdit}
            onStart={startTemplate}
          />
        </LibrarySwipeRow>
      )}
      namespace="plan"
      emptyIconName="dumbbell"
      createTestID="create_workout"
      onCreate={() => navigation.navigate('WorkoutTemplateEditor')}
      noMatchAction={browseWorkoutsAction}
      searchFooter={browseWorkoutsAction}
    />
  );
}
