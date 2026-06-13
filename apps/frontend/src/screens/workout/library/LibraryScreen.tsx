import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/clay/EmptyState';
import { SwipeToDelete } from '@/components/clay/SwipeToDelete';
import { ExerciseRowCard } from '@/components/exercise/ExerciseRowCard';
import { filterExercises } from '@/components/exercise/exerciseFilter';
import { SearchInput } from '@/components/forms/SearchInput';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { colors } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';

export function LibraryScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exerciseOptions = useExerciseOptions();
  const exerciseRepo = useRepository(exercises);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (exerciseId: string) => {
    exerciseRepo.deleteById(exerciseId);
  };

  const filtered = useMemo(
    () => filterExercises(exerciseOptions, searchQuery),
    [exerciseOptions, searchQuery],
  );

  return (
    <AppShell showTabBar>
      <View className="gap-3 px-5 pt-7">
        <View className="flex-row items-center justify-between">
          <Text className="t-heading">{t('library.title')}</Text>
          <Pressable
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-accent"
            onPress={() => navigation.navigate('CreateExercise')}
            aria-label="Create new excercise"
            testID="create_workout"
          >
            <ClayIcon name="plus" size={20} color={colors.cream} />
          </Pressable>
        </View>

        <SearchInput
          accessibilityLabel={t('library.searchA11y')}
          placeholder={t('library.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2 px-5 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(exercise => {
          const metadata = [...exercise.muscleGroupNames, exercise.typeName]
            .filter(Boolean)
            .join(' · ');

          return (
            <SwipeToDelete
              key={exercise.id}
              onDelete={() => handleDelete(exercise.id)}
              borderRadius={20}
            >
              <ExerciseRowCard
                name={exercise.name}
                metadata={metadata}
                pressedClassName="active:bg-surface-sunk"
                trailing={
                  <ClayIcon name="chevron" size={16} color={colors.muted} />
                }
                onPress={() =>
                  navigation.navigate('EditExercise', {
                    exerciseId: exercise.id,
                  })
                }
              />
            </SwipeToDelete>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            icon={<ClayIcon name="search" size={24} color={colors.muted} />}
            title={t('library.empty.title')}
            body={t('library.empty.body')}
            action={
              <Pressable
                accessibilityRole="button"
                className="mt-2 h-11 flex-row items-center gap-2 rounded-full bg-accent px-5"
                onPress={() => navigation.navigate('CreateExercise')}
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
    </AppShell>
  );
}
