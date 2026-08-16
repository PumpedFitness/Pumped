import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileAvatarButton } from '@/components/layout/ProfileAvatarButton';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/grid/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { HomeEditFooter } from './components/HomeEditFooter';
import { buildPlanStatus, formatDateLabel } from './homePresenter';
import { useHomeAutoScroll } from './useHomeAutoScroll';

/**
 * Home is now a date line and a grid — nothing else.
 *
 * Today's session and the instant actions used to be fixed chrome above the
 * widgets; they are widgets themselves now, so everything on this screen obeys
 * the same rules for moving, removing and re-adding.
 */
export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { height: windowHeight } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const layout = useHomescreenStore(s => s.layout);
  const setLayout = useHomescreenStore(s => s.setLayout);
  const removeWidget = useHomescreenStore(s => s.removeWidget);
  const data = useHomeWidgetData();
  const autoScroll = useHomeAutoScroll(scrollRef, scrollY, windowHeight);

  const dateLabel = useMemo(
    () => formatDateLabel(i18n.language),
    [i18n.language],
  );

  useEffect(() => autoScroll.stop, [autoScroll.stop]);

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={autoScroll.onLayout}
        onContentSizeChange={autoScroll.onContentSizeChange}
        onScroll={autoScroll.onScroll}
        contentContainerClassName="pb-6 px-[18px] pt-4"
      >
        <View className="mb-[14px] mt-[6px] flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[17px] font-[800] tracking-[-0.3px] text-foreground">
              {dateLabel}
            </Text>
            <Text className="t-caption mt-0.5" numberOfLines={1}>
              {buildPlanStatus(t, data)}
            </Text>
          </View>
          <ProfileAvatarButton />
        </View>

        <WidgetGrid
          layout={layout}
          editing={editing}
          scrollOffset={scrollY}
          onEditStart={() => setEditing(true)}
          onDragPosition={autoScroll.onDragPosition}
          onDragEnd={autoScroll.stop}
          onLayoutChange={setLayout}
          onRemove={removeWidget}
        />

        <HomeEditFooter
          editing={editing}
          onToggleEdit={() => setEditing(prev => !prev)}
          onAddWidget={() => navigation.navigate('WidgetPicker')}
          editLabel={t('home.edit.editHome')}
          doneLabel={t('home.edit.donePill')}
          addWidgetLabel={t('home.edit.addWidget')}
        />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
