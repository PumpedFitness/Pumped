import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/grid/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import { IdentityRow } from './components/IdentityRow';
import { DisplayHeadline } from './components/DisplayHeadline';
import { NextSessionCard } from './components/NextSessionCard';
import { QuickActions } from './components/QuickActions';
import { SummaryHeader } from './components/SummaryHeader';
import { HomeEditFooter } from './components/HomeEditFooter';
import { useQuickActions } from './useQuickActions';
import {
  buildFocusLine,
  buildHeadline,
  buildPlanStatus,
  buildSessionMeta,
  buildWeekCount,
  formatDateLabel,
  initialsFromName,
} from './homePresenter';
import { useHomeAutoScroll } from './useHomeAutoScroll';

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
  const { profile } = useUserProfile();
  const data = useHomeWidgetData();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const autoScroll = useHomeAutoScroll(scrollRef, scrollY, windowHeight);

  const startSession = useCallback(() => {
    if (currentWorkout) {
      openCurrentWorkout(navigation);
      return;
    }
    const templateId = data.nextSession?.templateId;
    if (!templateId) {
      navigation.dispatch(
        CommonActions.navigate({ name: 'Main', params: { screen: 'Library' } }),
      );
      return;
    }
    try {
      setEditing(false);
      startTemplateWorkout(templateId);
      openCurrentWorkout(navigation);
    } catch (error) {
      Alert.alert(
        t('plan.alerts.startFailedTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
      );
    }
  }, [currentWorkout, data.nextSession, navigation, startTemplateWorkout, t]);

  const headline = buildHeadline(t, data.nextSession);
  const dateLabel = useMemo(
    () => formatDateLabel(i18n.language),
    [i18n.language],
  );
  const quick = useQuickActions(startSession);

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
        <IdentityRow
          initials={initialsFromName(profile.name)}
          dateLabel={dateLabel}
          blockStatus={buildPlanStatus(t, data)}
        />

        <View className="mt-[22px]">
          <DisplayHeadline lead={headline.lead} subject={headline.subject} />
        </View>

        {data.nextSession ? (
          /* Hugs the headline — the two read as one unit now that the card
             no longer repeats the session name. */
          <View className="mt-[14px]">
            <NextSessionCard
              focusLine={buildFocusLine(data.nextSession)}
              metaLine={buildSessionMeta(t, data.nextSession)}
              progressLabel={t('home.hero.weekProgress')}
              progressCount={buildWeekCount(t, data.weekProgress)}
              progressPercent={data.weekProgress?.percent ?? 0}
              startA11y={t('home.hero.startA11y', {
                name: data.nextSession.name,
              })}
              onStart={startSession}
            />
          </View>
        ) : null}

        {quick.actions.length > 0 || editing ? (
          <View className="mt-[22px]">
            <QuickActions
              actions={quick.actions}
              available={quick.available}
              editing={editing}
              onAdd={quick.add}
              onRemove={quick.remove}
              addLabel={label => t('home.quick.addA11y', { label })}
              removeLabel={label => t('home.quick.removeA11y', { label })}
            />
          </View>
        ) : null}

        <View className="mt-[22px] mb-[16px]">
          <SummaryHeader title={t('home.summary.title')} />
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
