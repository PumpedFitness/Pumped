import { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/clay/Card';
import { Button } from '../../components/clay/Button';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { widgetRegistry } from '../../components/widgets/registry';
import { useHomescreenStore } from '../../stores/homescreenStore';
import { colors, typography } from '../../theme/tokens';
import type { WidgetType } from '../../types/widget';

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

function WidgetPickerCard({ type, isPlaced }: WidgetPickerCardProps) {
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
    <Card variant="card" radius="2xl" pad={0} style={{ marginBottom: 16 }}>
      {/* Widget info header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClayIcon name={meta.icon} size={20} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: typography.heading,
              fontWeight: '700',
              color: colors.ink,
            }}
          >
            {meta.displayName}
          </Text>
          <Text
            style={{
              fontSize: typography.caption,
              color: colors.muted,
              marginTop: 1,
            }}
          >
            {spans.length > 1
              ? `${spans.length} sizes available`
              : selectedSpan === 3
              ? 'Full width'
              : `${selectedSpan} of 3 columns`}
          </Text>
        </View>
      </View>

      {/* Live preview(s) */}
      {spans.length === 1 ? (
        // Single size: show centered preview
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 4,
          }}
        >
          <View
            style={{
              width: previewWidth(spans[0]),
              maxWidth: SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 32,
              transform: [{ scale: 0.85 }],
              transformOrigin: 'center top',
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
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 16,
            }}
          >
            {spans.map(span => {
              const w = previewWidth(span);
              return (
                <View
                  key={span}
                  style={{
                    width: SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: Math.min(
                        w,
                        SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 48,
                      ),
                      transform: [{ scale: 0.85 }],
                      transformOrigin: 'center top',
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
                  <Text
                    style={{
                      fontSize: typography.caption,
                      color: colors.muted,
                      marginTop: 8,
                    }}
                  >
                    {span === 3 ? 'Full width' : `${span} of 3 columns`}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Page dots */}
          {spans.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                paddingTop: 8,
              }}
            >
              {spans.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: idx === selectedSpanIdx ? 8 : 6,
                    height: idx === selectedSpanIdx ? 8 : 6,
                    borderRadius: 999,
                    backgroundColor:
                      idx === selectedSpanIdx ? colors.ink : colors.muted,
                    opacity: idx === selectedSpanIdx ? 1 : 0.4,
                  }}
                />
              ))}
            </View>
          )}
        </>
      )}

      {/* Add button */}
      <View style={{ padding: 16, paddingTop: 12 }}>
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
          {isPlaced ? 'Already added' : 'Add Widget'}
        </Button>
      </View>
    </Card>
  );
}

export function WidgetPickerScreen() {
  const navigation = useNavigation();
  const layout = useHomescreenStore(s => s.layout);
  const placedTypes = new Set(layout.map(w => w.type));

  const allTypes = Object.keys(widgetRegistry) as WidgetType[];

  return (
    <AppShell showTabBar={false} padTop padHorizontal={0}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 16,
          paddingTop: 8,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ClayIcon name="x" size={22} color={colors.ink} />
        </Pressable>
        <Text
          style={{
            fontSize: typography.heading,
            fontWeight: '700',
            color: colors.ink,
          }}
        >
          Add Widgets
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: typography.body,
          color: colors.muted,
          textAlign: 'center',
          paddingHorizontal: 40,
          marginBottom: 20,
        }}
      >
        Browse widgets and tap to add them to your homescreen.
      </Text>

      {/* Widget gallery */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {allTypes.map(type => (
          <WidgetPickerCard
            key={type}
            type={type}
            isPlaced={placedTypes.has(type)}
          />
        ))}
      </ScrollView>
    </AppShell>
  );
}
