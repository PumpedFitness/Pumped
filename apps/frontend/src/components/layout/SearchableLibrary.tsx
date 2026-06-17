import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { Button } from 'heroui-native';
import { EmptyState } from '@/components/clay/EmptyState';
import { SearchInput } from '@/components/forms/SearchInput';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { colors, motion } from '@/theme/tokens';

type SearchableLibraryProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onCreate: () => void;
  /**
   * i18n namespace holding the screen's strings. Resolves, relative to it:
   * `searchPlaceholder`, `searchA11y`, `createA11y`, `empty.{title,body,createCta}`,
   * and `noMatch.{title,body}`.
   */
  namespace: string;
  createTestID?: string;
  /** Icon shown in the default empty / no-match states. */
  emptyIconName?: IconName;
  /** Override the default "no items yet" state. */
  emptyState?: ReactNode;
  /** Override the default "search excluded everything" state. */
  noMatchState?: ReactNode;
  /** Scrolls above the search row (e.g. a hero card or "browse" action). */
  header?: ReactNode;
  /** Keep the search row pinned while only the list scrolls. */
  stickySearch?: boolean;
  /** Vertical spacing between list rows. */
  itemGap?: number;
};

const DEFAULT_ITEM_GAP = 12;

export function SearchableLibrary<T>({
  items,
  keyExtractor,
  getSearchText,
  renderItem,
  onCreate,
  namespace,
  createTestID,
  emptyIconName = 'search',
  emptyState,
  noMatchState,
  header,
  stickySearch = false,
  itemGap = DEFAULT_ITEM_GAP,
}: SearchableLibraryProps<T>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // The namespace is a runtime value, so each composed key is asserted valid.
  const tk = (sub: string): string => t(`${namespace}.${sub}` as never);

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      return items;
    }
    return items.filter(item =>
      getSearchText(item).toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [items, searchQuery, getSearchText]);

  const emptyIcon = (
    <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-accent-soft">
      <ClayIcon name={emptyIconName} size={24} color={colors.accent} />
    </View>
  );

  const defaultEmpty = (
    <EmptyState
      icon={emptyIcon}
      className="bg-surface-card"
      titleClassName="text-center"
      bodyClassName="max-w-64"
      title={tk('empty.title')}
      body={tk('empty.body')}
      action={
        <Button
          className="mt-1 rounded-full"
          variant="secondary"
          feedbackVariant="scale"
          onPress={onCreate}
        >
          <Button.Label>{tk('empty.createCta')}</Button.Label>
        </Button>
      }
    />
  );

  const defaultNoMatch = (
    <EmptyState
      icon={emptyIcon}
      className="bg-surface-card"
      titleClassName="text-center"
      bodyClassName="max-w-64"
      title={tk('noMatch.title')}
      body={tk('noMatch.body')}
    />
  );

  const searchRow = (
    <View className="flex-row gap-2">
      <View className="flex-1">
        <SearchInput
          accessibilityLabel={tk('searchA11y')}
          placeholder={tk('searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <Button
        accessibilityLabel={tk('createA11y')}
        testID={createTestID}
        className="h-[52px] w-[52px] rounded-full bg-accent p-0"
        feedbackVariant="scale"
        onPress={onCreate}
      >
        <ClayIcon name="plus" size={20} color={colors.accentInk} />
      </Button>
    </View>
  );

  const list =
    filtered.length > 0 ? (
      filtered.map(item => (
        // Layout animation: removed rows fade out and siblings slide up
        // smoothly instead of snapping into place.
        <Animated.View
          key={keyExtractor(item)}
          layout={LinearTransition.duration(motion.base)}
          entering={FadeIn.duration(motion.fast)}
          exiting={FadeOut.duration(motion.fast)}
        >
          {renderItem(item)}
        </Animated.View>
      ))
    ) : items.length === 0 ? (
      (emptyState ?? defaultEmpty)
    ) : (
      (noMatchState ?? defaultNoMatch)
    );

  if (stickySearch) {
    return (
      <View className="flex-1">
        {header ? <View className="px-5 pt-4">{header}</View> : null}
        <View className="px-5 pt-4">{searchRow}</View>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: itemGap }}>{list}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 px-5 pb-8 pt-4"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}
      <View style={{ gap: itemGap }}>
        {searchRow}
        {list}
      </View>
    </ScrollView>
  );
}
