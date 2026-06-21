import { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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
  // A plain ScrollView (not a FlatList) — the value lists are tiny, so
  // virtualization is unnecessary and would warn when nested in a ScrollView.
  const listRef = useRef<ScrollView>(null);
  const isUserScrollingRef = useRef(false);
  const userScrolledOffsetRef = useRef<number | null>(null);
  const padCount = Math.floor(visibleCount / 2);
  const paddedItems = [
    ...Array(padCount).fill(''),
    ...items,
    ...Array(padCount).fill(''),
  ];

  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) {
      return;
    }
    // Don't fight an in-progress user scroll; onMomentumEnd reports the
    // user's pick and any external correction re-runs this effect after.
    if (isUserScrollingRef.current) {
      return;
    }
    const targetOffset = selectedIndex * itemHeight;
    // The list already rests at this offset from the user's own scroll.
    if (userScrolledOffsetRef.current === targetOffset) {
      return;
    }
    userScrolledOffsetRef.current = null;
    listRef.current.scrollTo({ y: targetOffset, animated: false });
  }, [selectedIndex, itemHeight]);

  const onScrollBeginDrag = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrollingRef.current = false;
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / itemHeight);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      userScrolledOffsetRef.current = clamped * itemHeight;
      if (clamped !== selectedIndex) {
        onChange(clamped);
      }
    },
    [itemHeight, items.length, selectedIndex, onChange],
  );

  const containerHeight = visibleCount * itemHeight;
  const highlightTop = padCount * itemHeight;

  return (
    <View style={{ width, height: containerHeight }}>
      <View
        className="absolute left-0 right-0 bg-surface-sunk rounded-lg"
        style={{ top: highlightTop, height: itemHeight }}
      />
      <ScrollView
        ref={listRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumEnd}
        nestedScrollEnabled={Platform.OS === 'android'}
        overScrollMode="never"
      >
        {paddedItems.map((item, index) => {
          const realIndex = index - padCount;
          const isSelected = realIndex === selectedIndex;
          return (
            <View
              key={index}
              className="justify-center items-center"
              style={{ height: itemHeight }}
            >
              <Text
                className={`${
                  isSelected
                    ? 'text-lg font-semibold'
                    : 'text-[15px] font-normal'
                } ${
                  item === ''
                    ? 'text-transparent'
                    : isSelected
                    ? 'text-foreground'
                    : 'text-muted'
                }`}
              >
                {item || ' '}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
