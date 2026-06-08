import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Input } from 'heroui-native';
import type { ExerciseOption } from '../../types/exercise';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

type ExerciseLibraryProps = {
  exercises: ExerciseOption[];
  onBack: () => void;
  onCreateExercise: () => void;
};

export function ExerciseLibrary({
  exercises,
  onBack,
  onCreateExercise,
}: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return exercises;
    return exercises.filter(exercise =>
      [
        exercise.name,
        exercise.description ?? '',
        exercise.typeName ?? '',
        ...exercise.muscleGroupNames,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [exercises, searchQuery]);

  return (
    <>
      <View className="flex-row items-center border-b border-border-soft px-5 py-3">
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-11 items-start justify-center"
          onPress={onBack}
        >
          <ClayIcon name="back" size={22} color={colors.ink} />
        </Pressable>
        <Text className="flex-1 text-center t-heading">Exercise Library</Text>
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-accent"
          onPress={onCreateExercise}
        >
          <ClayIcon name="plus" size={20} color={colors.cream} />
        </Pressable>
      </View>

      <View className="px-5 pb-3 pt-4">
        <View className="relative">
          <Input
            accessibilityLabel="Search exercises"
            className="h-[52px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground"
            placeholder="Search name, muscle, or type"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View
            className="absolute left-4 top-0 h-[52px] items-center justify-center"
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
        {filtered.map(exercise => {
          const metadata = [
            ...exercise.muscleGroupNames,
            exercise.typeName,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <View
              key={exercise.id}
              className="min-h-20 flex-row items-center gap-3 rounded-[20px] border border-border-hairline bg-surface-card p-4"
            >
              <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-surface-sunk">
                <ClayIcon
                  name="dumbbell"
                  size={21}
                  color={colors.ink2}
                  stroke={1.75}
                />
              </View>
              <View className="flex-1">
                <Text className="t-heading">{exercise.name}</Text>
                {metadata ? (
                  <Text className="t-caption mt-1" numberOfLines={2}>
                    {metadata}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View className="items-center gap-3 rounded-[24px] border border-dashed border-border-hairline px-6 py-10">
            <ClayIcon name="search" size={24} color={colors.muted} />
            <Text className="t-heading">No exercises found</Text>
            <Text className="t-caption text-center">
              Try another search, or create a new exercise.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-2 h-11 flex-row items-center gap-2 rounded-full bg-accent px-5"
              onPress={onCreateExercise}
            >
              <ClayIcon name="plus" size={16} color={colors.cream} />
              <Text className="t-label font-bold text-accent-foreground">
                Create Exercise
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}
