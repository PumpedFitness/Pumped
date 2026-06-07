import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Input } from 'heroui-native';
import type { ExerciseOption } from '../../types/exercise';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type ExerciseSelectionListProps = {
  exercises: ExerciseOption[];
  initialSelectedExerciseIds: string[];
  onCancel: () => void;
  onDone: (exerciseIds: string[]) => void;
};

function formatLabel(value: string): string {
  return value
    .toLocaleLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, character => character.toLocaleUpperCase());
}

export function ExerciseSelectionList({
  exercises,
  initialSelectedExerciseIds,
  onCancel,
  onDone,
}: ExerciseSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(initialSelectedExerciseIds);
  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) {
      return exercises;
    }

    return exercises.filter(exercise =>
      [
        exercise.name,
        exercise.description ?? '',
        exercise.exerciseCategory,
        ...exercise.muscleGroups,
        ...exercise.equipment,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [exercises, searchQuery]);

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
          <Text className="t-label text-foreground-secondary">Cancel</Text>
        </Pressable>
        <Text className="t-heading">Choose exercises</Text>
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-end justify-center"
          onPress={() => onDone(selectedIds)}
        >
          <Text className="t-label text-accent">Done</Text>
        </Pressable>
      </View>

      <View className="gap-4 px-5 pb-3 pt-5">
        <View>
          <Text className="t-display">Exercise library</Text>
          <Text className="t-caption mt-1">{selectedIds.length} selected</Text>
        </View>
        <View className="relative">
          <Input
            autoFocus
            accessibilityLabel="Search exercises"
            className="h-[54px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground"
            placeholder="Search name, muscle, or equipment"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View
            className="absolute left-4 top-0 h-[54px] items-center justify-center"
            pointerEvents="none"
          >
            <ClayIcon name="search" size={19} color={colors.muted} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-5 pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredExercises.map(exercise => {
          const selected = selectedIds.includes(exercise.id);
          const metadata = [
            ...exercise.muscleGroups.map(formatLabel),
            ...exercise.equipment.map(formatLabel),
          ].join(' · ');

          return (
            <Pressable
              key={exercise.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              className={`min-h-20 flex-row items-center gap-3 rounded-[20px] border p-4 ${
                selected
                  ? 'border-accent bg-accent-soft'
                  : 'border-border-hairline bg-surface-card'
              }`}
              onPress={() => toggleExercise(exercise.id)}
            >
              <View
                className={`h-11 w-11 items-center justify-center rounded-[14px] ${
                  selected ? 'bg-accent' : 'bg-surface-sunk'
                }`}
              >
                <ClayIcon
                  name={selected ? 'check' : 'dumbbell'}
                  size={21}
                  color={selected ? colors.accentInk : colors.ink2}
                  stroke={selected ? 2.4 : 1.75}
                />
              </View>
              <View className="flex-1">
                <Text className="t-heading">{exercise.name}</Text>
                <Text className="t-caption mt-1" numberOfLines={2}>
                  {metadata || formatLabel(exercise.exerciseCategory)}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {filteredExercises.length === 0 && (
          <View className="items-center gap-3 rounded-[24px] border border-dashed border-border-hairline px-6 py-10">
            <ClayIcon name="search" size={24} color={colors.muted} />
            <Text className="t-heading">No exercises found</Text>
            <Text className="t-caption text-center">
              Try another name, muscle group, or equipment type.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border-soft bg-background px-5 pb-5 pt-3">
        <Button
          className="h-14 rounded-full bg-accent"
          feedbackVariant="scale"
          onPress={() => onDone(selectedIds)}
        >
          <Button.Label className="font-bold text-accent-foreground">
            Use {selectedIds.length}{' '}
            {selectedIds.length === 1 ? 'exercise' : 'exercises'}
          </Button.Label>
        </Button>
      </View>
    </>
  );
}
