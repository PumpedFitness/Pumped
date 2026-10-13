import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';
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
      <View className="h-[52px] flex-row items-center justify-between px-5">
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-start justify-center"
          onPress={onCancel}
        >
          <Text className="t-label text-foreground-secondary">
            {t('common.cancel')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="h-11 min-w-16 items-end justify-center"
          onPress={onDone}
        >
          <Text className="t-label text-accent">{t('common.done')}</Text>
        </Pressable>
      </View>

      <View className="gap-4 px-5 pb-3 pt-4">
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
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('library.createA11y')}
              className="h-10 w-10 items-center justify-center rounded-full bg-accent"
              onPress={onCreateExercise}
            >
              <ClayIcon name="plus" size={20} color={colors.cream} />
            </Pressable>
          }
        />

        {isSuperset ? (
          <View className="flex-row gap-2.5 rounded-[16px] bg-accent-soft px-4 py-3">
            <ClayIcon name="bolt" size={16} color={colors.accent} />
            <Text className="t-caption flex-1 text-accent">
              {t('exerciseSelection.superset.hint')}
            </Text>
          </View>
        ) : null}

        <SearchInput
          autoFocus
          accessibilityLabel={t('library.searchA11y')}
          height={54}
          placeholder={t('library.searchPlaceholder')}
          value={searchQuery}
          onChangeText={onChangeSearch}
        />

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
