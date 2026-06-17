import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { ExerciseOption } from '@/types/exercise';
import { colors } from '@/theme/tokens';
import { EmptyState } from '@/components/clay/EmptyState';
import { ExerciseRowCard } from '@/components/exercise/ExerciseRowCard';
import { filterExercises } from '@/components/exercise/exerciseFilter';
import { SearchInput } from '@/components/forms/SearchInput';
import { ClayIcon } from '@/components/icons/ClayIcon';

type ExerciseSelectionListProps = {
  exercises: ExerciseOption[];
  initialSelectedExerciseIds: string[];
  onCancel: () => void;
  onDone: (exerciseIds: string[]) => void;
  onCreateExercise: () => void;
};

export function ExerciseSelectionList({
  exercises,
  initialSelectedExerciseIds,
  onCancel,
  onDone,
  onCreateExercise,
}: ExerciseSelectionListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(initialSelectedExerciseIds);
  const filteredExercises = useMemo(
    () => filterExercises(exercises, searchQuery),
    [exercises, searchQuery],
  );

  const toggleExercise = (exerciseId: string) => {
    setSelectedIds(current =>
      current.includes(exerciseId)
        ? current.filter(id => id !== exerciseId)
        : [...current, exerciseId],
    );
  };

  return (
    <>
      <View className="flex-row items-center justify-between border-b border-border-soft px-5 py-3">
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-start justify-center"
          onPress={onCancel}
        >
          <Text className="t-label text-foreground-secondary">
            {t('common.cancel')}
          </Text>
        </Pressable>
        <Text className="t-heading">{t('exerciseSelection.headerTitle')}</Text>
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-end justify-center"
          onPress={() => onDone(selectedIds)}
        >
          <Text className="t-label text-accent">{t('common.done')}</Text>
        </Pressable>
      </View>

      <View className="gap-4 px-5 pb-3 pt-5">
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="t-display">
              {t('exerciseSelection.libraryTitle')}
            </Text>
            <Text className="t-caption mt-1">
              {t('exerciseSelection.selectedCount', {
                count: selectedIds.length,
              })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-accent"
            onPress={onCreateExercise}
          >
            <ClayIcon name="plus" size={20} color={colors.cream} />
          </Pressable>
        </View>
        <SearchInput
          autoFocus
          accessibilityLabel={t('library.searchA11y')}
          height={54}
          placeholder={t('library.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-5 pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredExercises.map(exercise => {
          const selected = selectedIds.includes(exercise.id);
          const metadata = [...exercise.muscleGroupNames, exercise.typeName]
            .filter(Boolean)
            .join(' · ');

          return (
            <ExerciseRowCard
              key={exercise.id}
              name={exercise.name}
              metadata={metadata}
              selected={selected}
              onPress={() => toggleExercise(exercise.id)}
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

      <View className="absolute bottom-0 left-0 right-0 border-t border-border-soft bg-background px-5 pb-5 pt-3">
        <Button
          className="h-14 rounded-full bg-accent"
          feedbackVariant="scale"
          onPress={() => onDone(selectedIds)}
        >
          <Button.Label className="font-bold text-accent-foreground">
            {t('exerciseSelection.useExercises', {
              count: selectedIds.length,
            })}
          </Button.Label>
        </Button>
      </View>
    </>
  );
}
