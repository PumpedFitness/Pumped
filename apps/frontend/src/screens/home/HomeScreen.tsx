import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/grid/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { HomeMessage } from './components/HomeMessage';

const AUTO_SCROLL_EDGE = 104;
const MAX_AUTO_SCROLL_SPEED = 14;

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const scrollYRef = useRef(0);
  const contentHeightRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const autoScrollSpeedRef = useRef(0);
  const autoScrollFrameRef = useRef<number | null>(null);
  const layout = useHomescreenStore(s => s.layout);
  const setLayout = useHomescreenStore(s => s.setLayout);
  const removeWidget = useHomescreenStore(s => s.removeWidget);
  const { profile } = useUserProfile();

  const startEditing = useCallback(() => setEditing(true), []);

  const stopAutoScroll = useCallback(() => {
    autoScrollSpeedRef.current = 0;
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const runAutoScroll = useCallback(() => {
    const maxOffset = Math.max(
      0,
      contentHeightRef.current - viewportHeightRef.current,
    );
    const nextOffset = Math.max(
      0,
      Math.min(maxOffset, scrollYRef.current + autoScrollSpeedRef.current),
    );

    if (nextOffset !== scrollYRef.current) {
      scrollYRef.current = nextOffset;
      scrollY.value = nextOffset;
      scrollRef.current?.scrollTo({ y: nextOffset, animated: false });
    }

    if (
      autoScrollSpeedRef.current !== 0 &&
      nextOffset > 0 &&
      nextOffset < maxOffset
    ) {
      autoScrollFrameRef.current = requestAnimationFrame(runAutoScroll);
    } else {
      autoScrollFrameRef.current = null;
    }
  }, [scrollY]);

  const handleDragPosition = useCallback(
    (absoluteY: number) => {
      const distanceFromTop = absoluteY;
      const distanceFromBottom = windowHeight - absoluteY;
      let speed = 0;

      if (distanceFromBottom < AUTO_SCROLL_EDGE) {
        speed =
          ((AUTO_SCROLL_EDGE - Math.max(0, distanceFromBottom)) /
            AUTO_SCROLL_EDGE) *
          MAX_AUTO_SCROLL_SPEED;
      } else if (distanceFromTop < AUTO_SCROLL_EDGE) {
        speed =
          -(
            (AUTO_SCROLL_EDGE - Math.max(0, distanceFromTop)) /
            AUTO_SCROLL_EDGE
          ) * MAX_AUTO_SCROLL_SPEED;
      }

      autoScrollSpeedRef.current = speed;
      if (speed === 0) {
        stopAutoScroll();
      } else if (autoScrollFrameRef.current === null) {
        autoScrollFrameRef.current = requestAnimationFrame(runAutoScroll);
      }
    },
    [runAutoScroll, stopAutoScroll, windowHeight],
  );

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={event => {
          viewportHeightRef.current = event.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, height) => {
          contentHeightRef.current = height;
        }}
        onScroll={event => {
          const offset = event.nativeEvent.contentOffset.y;
          scrollYRef.current = offset;
          scrollY.value = offset;
        }}
        contentContainerClassName="pb-6"
      >
        <View className="px-5 pt-6 pb-5">
          <View className="flex-row items-center gap-4">
            <HomeMessage name={profile.name} />
            <View className="flex-row items-center gap-2">
              <Pressable
                accessibilityLabel={t('home.addWidget')}
                accessibilityRole="button"
                onPress={() => navigation.navigate('WidgetPicker')}
                className="h-12 w-12 items-center justify-center rounded-full border border-border-soft bg-surface-card active:opacity-70"
              >
                <ClayIcon name="plus" size={20} color={colors.ink} />
              </Pressable>
              {editing && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditing(false)}
                  className="h-10 justify-center rounded-full bg-foreground px-4 active:opacity-80"
                >
                  <Text className="text-[13.5px] font-bold text-cream">
                    {t('home.doneEditing')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View className="px-5">
          <WidgetGrid
            layout={layout}
            editing={editing}
            scrollOffset={scrollY}
            onEditStart={startEditing}
            onDragPosition={handleDragPosition}
            onDragEnd={stopAutoScroll}
            onLayoutChange={setLayout}
            onRemove={removeWidget}
          />
        </View>

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
