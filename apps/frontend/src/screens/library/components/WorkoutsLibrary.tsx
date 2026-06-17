import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useLocalFavorites } from '@/hooks/useLocalFavorites';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { WorkoutTemplate } from '@/types/workout';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';
import { LibrarySwipeRow } from './LibrarySwipeRow';

export function WorkoutsLibrary() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { templates, exerciseOptions, deleteTemplate } = useWorkoutTemplates();
  const { isFavorite, toggleFavorite } = useLocalFavorites();

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

  const header = (
    <View className="flex-row items-center justify-end">
      <Button
        className="h-10 rounded-full px-4"
        variant="ghost"
        feedbackVariant="scale"
        onPress={() => navigation.navigate('WorkoutPlaceholder')}
      >
        <Button.Label>{t('plan.browseWorkouts')}</Button.Label>
      </Button>
    </View>
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
          onDelete={() => deleteTemplate(template.id)}
          borderRadius={24}
        >
          <WorkoutTemplateCard
            template={template}
            exerciseNames={exerciseNames}
            onEdit={openEdit}
          />
        </LibrarySwipeRow>
      )}
      namespace="plan"
      emptyIconName="dumbbell"
      createTestID="create_workout"
      onCreate={() => navigation.navigate('WorkoutTemplateEditor')}
      header={header}
    />
  );
}
