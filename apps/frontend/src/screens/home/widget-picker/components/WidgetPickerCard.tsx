import { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetRegistry } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import type { WidgetType } from '@/types/widget';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_GUTTER = 20;
const PREVIEW_GAP = 12;

// Compute preview width for a given colSpan
function previewWidth(colSpan: number): number {
  const available = SCREEN_WIDTH - 2 * PREVIEW_GUTTER;
  const unit = (available - 2 * PREVIEW_GAP) / 3;
  return colSpan * unit + (colSpan - 1) * PREVIEW_GAP;
}

type WidgetPickerCardProps = {
  type: WidgetType;
  isPlaced: boolean;
};

export function WidgetPickerCard({ type, isPlaced }: WidgetPickerCardProps) {
  const { t } = useTranslation();
  const addWidget = useHomescreenStore(s => s.addWidget);
  const entry = widgetRegistry[type];
  const spans = useMemo(() => entry?.meta.allowedSpans ?? [], [entry]);
  const [selectedSpanIdx, setSelectedSpanIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const selectedSpan = spans[selectedSpanIdx];

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (spans.length <= 1) return;
      const x = e.nativeEvent.contentOffset.x;
      const cardW = SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 40; // approximate card content width
      const page = Math.round(x / cardW);
      if (page !== selectedSpanIdx && page >= 0 && page < spans.length) {
        setSelectedSpanIdx(page);
      }
    },
    [spans, selectedSpanIdx],
  );

  if (!entry) return null;

  const { meta, component: WidgetComponent } = entry;

  return (
    <Card variant="card" radius="2xl" pad={0} className="mb-4">
      {/* Widget info header */}
      <View className="flex-row items-center p-4 pb-3 gap-3">
        <View className="w-10 h-10 rounded-xl bg-accent-soft items-center justify-center">
          <ClayIcon name={meta.icon} size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-bold text-foreground">
            {t(meta.nameKey)}
          </Text>
          <Text className="text-[12.5px] text-muted mt-[1px]">
            {spans.length > 1
              ? t('widgetPicker.sizesAvailable', { count: spans.length })
              : selectedSpan === 3
              ? t('widgetPicker.fullWidth')
              : t('widgetPicker.columnsOf3', { count: selectedSpan })}
          </Text>
        </View>
      </View>

      {/* Live preview(s) */}
      {spans.length === 1 ? (
        // Single size: show centered preview
        <View className="items-center px-4 pb-1">
          <View
            className="scale-[0.85] origin-top"
            style={{
              width: previewWidth(spans[0]),
              maxWidth: SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 32,
            }}
          >
            <WidgetComponent
              colSpan={spans[0]}
              width={previewWidth(spans[0])}
            />
          </View>
        </View>
      ) : (
        // Multiple sizes: horizontal scroll with page dots
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerClassName="px-4 gap-4"
          >
            {spans.map(span => {
              const w = previewWidth(span);
              return (
                <View
                  key={span}
                  className="items-center justify-center"
                  style={{
                    width: SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 32,
                  }}
                >
                  <View
                    className="scale-[0.85] origin-top"
                    style={{
                      width: Math.min(
                        w,
                        SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 48,
                      ),
                    }}
                  >
                    <WidgetComponent
                      colSpan={span}
                      width={Math.min(
                        w,
                        SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 48,
                      )}
                    />
                  </View>
                  <Text className="text-[12.5px] text-muted mt-2">
                    {span === 3
                      ? t('widgetPicker.fullWidth')
                      : t('widgetPicker.columnsOf3', { count: span })}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Page dots */}
          {spans.length > 1 && (
            <View className="flex-row justify-center gap-[6px] pt-2">
              {spans.map((_, idx) => (
                <View
                  key={idx}
                  className={
                    idx === selectedSpanIdx
                      ? 'w-2 h-2 rounded-full bg-foreground'
                      : 'w-[6px] h-[6px] rounded-full bg-muted opacity-40'
                  }
                />
              ))}
            </View>
          )}
        </>
      )}

      {/* Add button */}
      <View className="p-4 pt-3">
        <Button
          variant={isPlaced ? 'ghost' : 'secondary'}
          size="sm"
          block
          disabled={isPlaced}
          icon={
            isPlaced ? undefined : (
              <ClayIcon name="plus" size={16} color={colors.cream} />
            )
          }
          onPress={() => {
            if (!isPlaced) {
              addWidget(type, selectedSpan);
            }
          }}
        >
          {isPlaced
            ? t('widgetPicker.alreadyAdded')
            : t('widgetPicker.addWidget')}
        </Button>
      </View>
    </Card>
  );
}
