import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { ExerciseRowCard } from '@/components/exercise/ExerciseRowCard';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useUndoToast } from '@/components/feedback/UndoToast';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { useLocalFavorites } from '@/hooks/useLocalFavorites';
import { colors } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { ExerciseOption } from '@/types/exercise';
import { LibrarySwipeRow } from './LibrarySwipeRow';

export function ExerciseLibrary() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exerciseOptions = useExerciseOptions();
  const exerciseRepo = useRepository(exercises);
  const { isFavorite, toggleFavorite } = useLocalFavorites();
  const { showUndo } = useUndoToast();

  // Snapshot the row before removing it so an undo can re-insert it verbatim.
  const deleteExercise = (exercise: ExerciseOption) => {
    const snapshot = exerciseRepo.getById(exercise.id);
    exerciseRepo.deleteById(exercise.id);
    if (snapshot) {
      showUndo({
        message: t('common.deletedNamed', { name: exercise.name }),
        onUndo: () => exerciseRepo.create(snapshot),
      });
    }
  };

  const renderRow = (exercise: ExerciseOption) => {
    const metadata = [...exercise.muscleGroupNames, exercise.typeName]
      .filter(Boolean)
      .join(' · ');

    return (
      <LibrarySwipeRow
        favorited={isFavorite(exercise.id)}
        onToggleFavorite={() => toggleFavorite(exercise.id)}
        onDelete={() => deleteExercise(exercise)}
        borderRadius={20}
      >
        <ExerciseRowCard
          name={exercise.name}
          metadata={metadata}
          pressedClassName="active:bg-surface-sunk"
          trailing={<ClayIcon name="chevron" size={16} color={colors.muted} />}
          onPress={() =>
            navigation.navigate('EditExercise', { exerciseId: exercise.id })
          }
        />
      </LibrarySwipeRow>
    );
  };

  return (
    <SearchableLibrary
      items={exerciseOptions}
      keyExtractor={exercise => exercise.id}
      getSearchText={exercise =>
        [
          exercise.name,
          exercise.description ?? '',
          exercise.typeName ?? '',
          ...exercise.muscleGroupNames,
        ].join(' ')
      }
      renderItem={renderRow}
      namespace="library"
      emptyIconName="search"
      stickySearch
      itemGap={8}
      createTestID="create_exercise"
      onCreate={() => navigation.navigate('CreateExercise')}
    />
  );
}
