import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from 'heroui-native';
import { AppShell } from '../../components/AppShell';
import { SwipeToDelete } from '../../components/clay/SwipeToDelete';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { useRepository } from '../../data/local/useRepository';
import { exercises } from '../../data/local/schema';
import { useExerciseOptions } from '../../hooks/useExerciseOptions';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/AppNavigator';

export function ExerciseLibraryTabScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [, setFocusCount] = useState(0);
  useFocusEffect(useCallback(() => { setFocusCount(c => c + 1); }, []));

  const exerciseOptions = useExerciseOptions();
  const exerciseRepo = useRepository(exercises);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (exerciseId: string) => {
    exerciseRepo.deleteById(exerciseId);
    setFocusCount(c => c + 1);
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return exerciseOptions;
    return exerciseOptions.filter(exercise =>
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
  }, [exerciseOptions, searchQuery]);

  return (
    <AppShell showTabBar>
      <View className="gap-3 px-5 pt-7">
        <View className="flex-row items-center justify-between">
          <Text className="t-heading">Exercise Library</Text>
          <Pressable
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-accent"
            onPress={() => navigation.navigate('CreateExercise')}
          >
            <ClayIcon name="plus" size={20} color={colors.cream} />
          </Pressable>
        </View>

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
        contentContainerClassName="gap-2 px-5 pb-8 pt-4"
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
            <SwipeToDelete
              key={exercise.id}
              onDelete={() => handleDelete(exercise.id)}
              borderRadius={20}
            >
              <Pressable
                accessibilityRole="button"
                className="min-h-20 flex-row items-center gap-3 rounded-[20px] border border-border-hairline bg-surface-card p-4 active:bg-surface-sunk"
                onPress={() =>
                  navigation.navigate('EditExercise', {
                    exerciseId: exercise.id,
                  })
                }
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
                <ClayIcon name="chevron" size={16} color={colors.muted} />
              </Pressable>
            </SwipeToDelete>
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
              onPress={() => navigation.navigate('CreateExercise')}
            >
              <ClayIcon name="plus" size={16} color={colors.cream} />
              <Text className="t-label font-bold text-accent-foreground">
                Create Exercise
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}
