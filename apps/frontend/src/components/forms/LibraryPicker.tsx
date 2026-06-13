import { useMemo, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from 'heroui-native';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SearchInput } from './SearchInput';
import { SelectableRow } from './SelectableRow';

type LibraryItem = {
  id: string;
  name: string;
};

type LibraryPickerProps = {
  visible: boolean;
  title: string;
  items: LibraryItem[];
  selectedIds: string[];
  multiSelect?: boolean;
  onClose: () => void;
  onChange: (selectedIds: string[]) => void;
  onCreate: (name: string) => string;
};

function LibraryPickerContent({
  title,
  items,
  selectedIds,
  multiSelect,
  onClose,
  onChange,
  onCreate,
}: Omit<LibraryPickerProps, 'visible'>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return items;
    return items.filter(item => item.name.toLocaleLowerCase().includes(q));
  }, [items, search]);

  const trimmed = search.trim();
  const exactMatch = items.some(
    item => item.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const toggle = (id: string) => {
    if (multiSelect) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter(s => s !== id)
        : [...selectedIds, id];
      onChange(next);
    } else {
      Keyboard.dismiss();
      onChange([id]);
      onClose();
    }
  };

  const handleCreate = () => {
    const newId = onCreate(trimmed);
    if (multiSelect) {
      onChange([...selectedIds, newId]);
    } else {
      Keyboard.dismiss();
      onChange([newId]);
      onClose();
    }
    setSearch('');
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSearch('');
    onClose();
  };

  const snapPoints = useMemo(() => ['50%', '80%'], []);

  return (
    <BottomSheet.Content
      backgroundClassName="bg-background"
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableOverDrag={false}
      contentContainerClassName="h-full pt-16 pb-2"
      keyboardBehavior="extend"
    >
      <View className="absolute top-0 left-0 right-0 px-4 pt-3 z-10">
        <SearchInput
          accessibilityLabel={t('exerciseForm.pickers.searchA11y', { title })}
          placeholder={t('exerciseForm.pickers.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          height={48}
          sheetAware
        />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-1 px-4 pt-3 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        {filtered.map(item => (
          <SelectableRow
            key={item.id}
            label={item.name}
            selected={selectedIds.includes(item.id)}
            accessibilityRole={multiSelect ? 'checkbox' : 'radio'}
            className="min-h-12 rounded-[14px]"
            onPress={() => toggle(item.id)}
          />
        ))}

        {filtered.length === 0 && !showCreate && (
          <View className="items-center py-6">
            <Text className="t-caption text-foreground-secondary">
              {t('common.noResults')}
            </Text>
          </View>
        )}

        {showCreate && (
          <Pressable
            accessibilityRole="button"
            className="mt-1 min-h-12 flex-row items-center gap-2.5 rounded-[14px] border border-dashed border-accent bg-accent-soft/50 px-4"
            onPress={handleCreate}
          >
            <ClayIcon name="plus" size={16} color={colors.accent} />
            <Text className="t-label text-accent">
              {t('exerciseForm.pickers.addNew', { name: trimmed })}
            </Text>
          </Pressable>
        )}
      </BottomSheetScrollView>

      {multiSelect && (
        <View className="px-4 pb-2">
          <Pressable
            accessibilityRole="button"
            className="h-12 items-center justify-center rounded-full bg-accent"
            onPress={handleClose}
          >
            <Text className="t-label font-bold text-accent-foreground">
              {t('exerciseForm.pickers.doneCount', {
                count: selectedIds.length,
              })}
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet.Content>
  );
}

export function LibraryPicker({
  visible,
  ...contentProps
}: LibraryPickerProps) {
  const handleClose = () => {
    contentProps.onClose();
  };

  return (
    <BottomSheet
      isOpen={visible}
      onOpenChange={open => {
        if (!open) handleClose();
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <LibraryPickerContent {...contentProps} />
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
