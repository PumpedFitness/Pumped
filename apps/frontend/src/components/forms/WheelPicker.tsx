import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItemInfo,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '../../theme/tokens';

type WheelPickerProps = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  visibleCount?: number;
  width?: number;
};

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;

export function WheelPicker({
  items,
  selectedIndex,
  onChange,
  itemHeight = ITEM_HEIGHT,
  visibleCount = VISIBLE_COUNT,
  width = 80,
}: WheelPickerProps) {
  const listRef = useRef<FlatList>(null);
  const padCount = Math.floor(visibleCount / 2);
  const paddedItems = [
    ...Array(padCount).fill(''),
    ...items,
    ...Array(padCount).fill(''),
  ];

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollToOffset({
        offset: selectedIndex * itemHeight,
        animated: false,
      });
    }
  }, []);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / itemHeight);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      if (clamped !== selectedIndex) {
        onChange(clamped);
      }
    },
    [itemHeight, items.length, selectedIndex, onChange],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      const realIndex = index - padCount;
      const isSelected = realIndex === selectedIndex;
      return (
        <View
          style={{
            height: itemHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: isSelected ? 18 : 15,
              fontWeight: isSelected ? '600' : '400',
              color: item === '' ? 'transparent' : isSelected ? colors.ink : colors.muted,
            }}
          >
            {item || ' '}
          </Text>
        </View>
      );
    },
    [selectedIndex, itemHeight, padCount],
  );

  const containerHeight = visibleCount * itemHeight;
  const highlightTop = padCount * itemHeight;

  return (
    <View style={{ width, height: containerHeight }}>
      <View
        style={{
          position: 'absolute',
          top: highlightTop,
          left: 0,
          right: 0,
          height: itemHeight,
          backgroundColor: colors.cardSunk,
          borderRadius: 8,
        }}
      />
      <FlatList
        ref={listRef}
        data={paddedItems}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        nestedScrollEnabled={Platform.OS === 'android'}
        overScrollMode="never"
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </View>
  );
}
