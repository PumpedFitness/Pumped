import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SearchInput } from '@pumped/ui/forms/SearchInput';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

type ExerciseSelectionHeaderProps = {
  isSuperset: boolean;
  selectedCount: number;
  searchQuery: string;
  /** Absent when the caller does not support grouping (e.g. a live session). */
  onCreateSuperset?: () => void;
  onChangeSearch: (query: string) => void;
  onCancel: () => void;
  onDone: () => void;
  onCreateExercise: () => void;
};

export function ExerciseSelectionHeader({
  isSuperset,
  selectedCount,
  searchQuery,
  onCreateSuperset,
  onChangeSearch,
  onCancel,
  onDone,
  onCreateExercise,
}: ExerciseSelectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <ScreenHeader
        title={t(
          isSuperset
            ? 'exerciseSelection.superset.title'
            : 'exerciseSelection.libraryTitle',
        )}
        subtitle={t(
          isSuperset
            ? 'exerciseSelection.superset.selectedCount'
            : 'exerciseSelection.selectedCount',
          { count: selectedCount },
        )}
        onBack={onCancel}
        actionLabel={t('common.done')}
        onAction={onDone}
      />

      <View className="gap-4 px-5 pb-3 pt-3">
        {isSuperset ? (
          <View className="flex-row gap-2.5 rounded-[16px] bg-accent-soft px-4 py-3">
            <ClayIcon name="bolt" size={16} color={colors.accent} />
            <Text className="t-caption flex-1 text-accent">
              {t('exerciseSelection.superset.hint')}
            </Text>
          </View>
        ) : null}

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <SearchInput
              autoFocus
              accessibilityLabel={t('library.searchA11y')}
              height={54}
              placeholder={t('library.searchPlaceholder')}
              value={searchQuery}
              onChangeText={onChangeSearch}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('library.createA11y')}
            className="h-11 w-11 items-center justify-center rounded-full bg-accent"
            onPress={onCreateExercise}
          >
            <ClayIcon name="plus" size={20} color={colors.cream} />
          </Pressable>
        </View>

        {!isSuperset && onCreateSuperset ? (
          <Pressable
            accessibilityRole="button"
            testID="create_superset"
            className="min-h-11 flex-row items-center justify-center gap-2 self-start rounded-full border border-dashed border-accent px-4"
            onPress={onCreateSuperset}
          >
            <ClayIcon name="plus" size={15} color={colors.accent} />
            <Text className="t-label text-accent">
              {t('exerciseSelection.superset.create')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
