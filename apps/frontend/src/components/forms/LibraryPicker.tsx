import { useMemo, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet, Input, useBottomSheetAwareHandlers } from 'heroui-native';
import { colors } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';

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

type SearchInputProps = {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
};

function SearchInput({ title, value, onChangeText }: SearchInputProps) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <View className="relative">
      <Input
        accessibilityLabel={`Search ${title.toLowerCase()}`}
        className="h-[48px] rounded-full border-border-hairline bg-surface-card pl-11 pr-4 text-foreground"
        placeholder="Search or create..."
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <View
        className="absolute left-3.5 top-0 h-[48px] items-center justify-center"
        pointerEvents="none"
      >
        <ClayIcon name="search" size={17} color={colors.muted} />
      </View>
    </View>
  );
}

function LibraryPickerContent({
  title,
  items,
  selectedIds,
  multiSelect,
  onClose,
  onChange,
  onCreate,
}: Omit<LibraryPickerProps, 'visible'>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return items;
    return items.filter(item =>
      item.name.toLocaleLowerCase().includes(q),
    );
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
          title={title}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-1 px-4 pt-3 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        {filtered.map(item => {
          const selected = selectedIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole={multiSelect ? 'checkbox' : 'radio'}
              accessibilityState={{ selected }}
              className={`min-h-12 flex-row items-center justify-between rounded-[14px] px-4 ${
                selected ? 'bg-accent-soft' : 'bg-surface-card'
              }`}
              onPress={() => toggle(item.id)}
            >
              <Text
                className={`t-label ${
                  selected ? 'text-accent' : 'text-foreground'
                }`}
              >
                {item.name}
              </Text>
              {selected && (
                <ClayIcon name="check" size={18} color={colors.accent} />
              )}
            </Pressable>
          );
        })}

        {filtered.length === 0 && !showCreate && (
          <View className="items-center py-6">
            <Text className="t-caption text-foreground-secondary">
              No results
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
              Add "{trimmed}"
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
              Done ({selectedIds.length})
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
