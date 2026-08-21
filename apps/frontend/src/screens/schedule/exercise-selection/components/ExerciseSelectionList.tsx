import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ExerciseOption, ExerciseSelectionResult } from '@/types/exercise';
import { colors } from '@pumped/ui/theme/tokens';
import { EmptyState } from '@pumped/ui/clay/EmptyState';
import { ExerciseRowCard } from '@/components/exercise/ExerciseRowCard';
import { filterExercises } from '@/components/exercise/exerciseFilter';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { useExerciseSelectionMode } from '../useExerciseSelectionMode';
import { ExerciseSelectionFooter } from './ExerciseSelectionFooter';
import { ExerciseSelectionHeader } from './ExerciseSelectionHeader';

type ExerciseSelectionListProps = {
  exercises: ExerciseOption[];
  initialSelectedExerciseIds: string[];
  /** Whether the caller can act on a superset result. */
  allowSupersets: boolean;
  onCancel: () => void;
  onDone: (result: Omit<ExerciseSelectionResult, 'id'>) => void;
  onCreateExercise: () => void;
};

export function ExerciseSelectionList({
  exercises,
  initialSelectedExerciseIds,
  allowSupersets,
  onCancel,
  onDone,
  onCreateExercise,
}: ExerciseSelectionListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const selection = useExerciseSelectionMode(initialSelectedExerciseIds);
  const filteredExercises = useMemo(
    () => filterExercises(exercises, searchQuery),
    [exercises, searchQuery],
  );

  const confirm = () => {
    if (selection.canConfirm) {
      onDone(selection.buildResult());
    }
  };

  return (
    <>
      <ExerciseSelectionHeader
        isSuperset={selection.isSuperset}
        selectedCount={selection.selectedCount}
        searchQuery={searchQuery}
        onCreateSuperset={allowSupersets ? selection.startSuperset : undefined}
        onChangeSearch={setSearchQuery}
        onCancel={selection.isSuperset ? selection.cancelSuperset : onCancel}
        onDone={confirm}
        onCreateExercise={onCreateExercise}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-5 pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredExercises.map(exercise => {
          const metadata = [...exercise.muscleGroupNames, exercise.typeName]
            .filter(Boolean)
            .join(' · ');

          return (
            <ExerciseRowCard
              key={exercise.id}
              testID={`exercise-card-${exercise.name}`}
              name={exercise.name}
              metadata={metadata}
              selected={selection.activeIds.includes(exercise.id)}
              onPress={() => selection.toggle(exercise.id)}
            />
          );
        })}

        {filteredExercises.length === 0 && (
          <EmptyState
            icon={<ClayIcon name="search" size={24} color={colors.muted} />}
            title={t('library.empty.title')}
            body={t('library.empty.body')}
            action={
              <Pressable
                accessibilityRole="button"
                className="mt-2 h-11 flex-row items-center gap-2 rounded-full bg-accent px-5"
                onPress={onCreateExercise}
              >
                <ClayIcon name="plus" size={16} color={colors.cream} />
                <Text className="t-label font-bold text-accent-foreground">
                  {t('library.empty.createCta')}
                </Text>
              </Pressable>
            }
          />
        )}
      </ScrollView>

      <ExerciseSelectionFooter
        isSuperset={selection.isSuperset}
        selectedCount={selection.selectedCount}
        canConfirm={selection.canConfirm}
        onConfirm={confirm}
        onCancelSuperset={selection.cancelSuperset}
      />
    </>
  );
}
